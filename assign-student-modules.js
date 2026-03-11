// Database connection using mssql directly since we're using JS instead of TS
const sql = require('mssql');

// Database configuration
const dbConfig = {
    server: process.env.DB_SERVER || 'localhost\\SQLEXPRESS',
    database: process.env.DB_NAME || 'StudentWellness',
    options: {
        trustedConnection: true,
        encrypt: false,
        enableArithAbort: true
    }
};

// Database service functions
const databaseService = {
    async executeQuery(query, params = []) {
        let pool;
        try {
            pool = await sql.connect(dbConfig);
            const request = pool.request();
            
            // Add parameters if provided
            if (params && params.length > 0) {
                params.forEach((param, index) => {
                    request.input(`param${index}`, param);
                });
                // Replace ? with @param0, @param1, etc.
                let parameterizedQuery = query;
                let paramIndex = 0;
                parameterizedQuery = parameterizedQuery.replace(/\?/g, () => `@param${paramIndex++}`);
                query = parameterizedQuery;
            }
            
            const result = await request.query(query);
            return result.recordset || [];
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }
};

/**
 * Module Assignment Script
 * This script assigns modules to students based on their program of study
 */

// Define modules for each program
const PROGRAM_MODULES = {
    1: { // Computer Science
        name: 'Computer Science',
        modules: [
            'Data Structures and Algorithms',
            'Object-Oriented Programming', 
            'Database Management Systems',
            'Software Engineering',
            'Computer Networks',
            'Operating Systems',
            'Web Development',
            'Artificial Intelligence'
        ]
    },
    2: { // Business Administration
        name: 'Business Administration',
        modules: [
            'Business Management',
            'Financial Accounting',
            'Marketing Principles',
            'Human Resource Management',
            'Operations Management',
            'Strategic Management',
            'Business Statistics',
            'Entrepreneurship'
        ]
    },
    3: { // Engineering
        name: 'Engineering',
        modules: [
            'Engineering Mathematics',
            'Physics for Engineers',
            'Engineering Design',
            'Materials Science',
            'Thermodynamics',
            'Fluid Mechanics',
            'Engineering Ethics',
            'Project Management'
        ]
    },
    4: { // Medicine
        name: 'Medicine',
        modules: [
            'Human Anatomy',
            'Physiology',
            'Biochemistry',
            'Pathology',
            'Pharmacology',
            'Clinical Medicine',
            'Medical Ethics',
            'Public Health'
        ]
    },
    5: { // Psychology
        name: 'Psychology',
        modules: [
            'Introduction to Psychology',
            'Cognitive Psychology',
            'Social Psychology',
            'Developmental Psychology',
            'Research Methods',
            'Statistics for Psychology',
            'Abnormal Psychology',
            'Counseling Psychology'
        ]
    },
    6: { // Law
        name: 'Law',
        modules: [
            'Constitutional Law',
            'Criminal Law',
            'Contract Law',
            'Commercial Law',
            'International Law',
            'Human Rights Law',
            'Legal Research',
            'Legal Ethics'
        ]
    }
};

/**
 * Randomly select 4 modules for a student from their program's available modules
 */
function selectModulesForStudent(programId, yearOfStudy) {
    const programModules = PROGRAM_MODULES[programId];
    if (!programModules) {
        console.warn(`Unknown program ID: ${programId}`);
        return [null, null, null, null];
    }

    const availableModules = [...programModules.modules];
    const selectedModules = [];

    // Select 4 random modules (without replacement)
    for (let i = 0; i < 4 && availableModules.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableModules.length);
        selectedModules.push(availableModules.splice(randomIndex, 1)[0]);
    }

    // Fill remaining slots with null if fewer than 4 modules available
    while (selectedModules.length < 4) {
        selectedModules.push(null);
    }

    return selectedModules;
}

/**
 * Update all students with modules based on their programs
 */
async function assignModulesToStudents() {
    try {
        console.log('Starting module assignment process...\n');

        // Get all students with their program information
        const studentsQuery = `
            SELECT s.StudentID, s.StudentName, s.ProgramID, s.YearOfStudy, p.ProgramName
            FROM Students s
            INNER JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.IsActive = 1
            ORDER BY s.StudentID
        `;

        const students = await databaseService.executeQuery(studentsQuery);
        console.log(`Found ${students.length} active students to process\n`);

        let updateCount = 0;
        const updates = [];

        for (const student of students) {
            const [module1, module2, module3, module4] = selectModulesForStudent(
                student.ProgramID, 
                student.YearOfStudy
            );

            const updateQuery = `
                UPDATE Students 
                SET Module1 = ?, Module2 = ?, Module3 = ?, Module4 = ?, UpdatedAt = GETDATE()
                WHERE StudentID = ?
            `;

            try {
                await databaseService.executeQuery(updateQuery, [
                    module1, module2, module3, module4, student.StudentID
                ]);

                updates.push({
                    studentId: student.StudentID,
                    studentName: student.StudentName,
                    program: student.ProgramName,
                    modules: [module1, module2, module3, module4].filter(m => m !== null)
                });

                updateCount++;
                
                if (updateCount % 10 === 0) {
                    console.log(`Processed ${updateCount} students...`);
                }

            } catch (error) {
                console.error(`Error updating student ${student.StudentID} (${student.StudentName}):`, error.message);
            }
        }

        console.log(`\n✅ Successfully assigned modules to ${updateCount} students\n`);

        // Display summary by program
        console.log('📊 ASSIGNMENT SUMMARY BY PROGRAM:');
        console.log('='.repeat(80));

        const programSummary = {};
        updates.forEach(update => {
            if (!programSummary[update.program]) {
                programSummary[update.program] = 0;
            }
            programSummary[update.program]++;
        });

        Object.entries(programSummary).forEach(([program, count]) => {
            console.log(`${program}: ${count} students`);
        });

        // Display sample assignments
        console.log('\n📝 SAMPLE MODULE ASSIGNMENTS:');
        console.log('='.repeat(80));

        const samplesByProgram = {};
        updates.forEach(update => {
            if (!samplesByProgram[update.program]) {
                samplesByProgram[update.program] = [];
            }
            if (samplesByProgram[update.program].length < 2) {
                samplesByProgram[update.program].push(update);
            }
        });

        Object.entries(samplesByProgram).forEach(([program, samples]) => {
            console.log(`\n${program}:`);
            samples.forEach(sample => {
                console.log(`  • ${sample.studentName} (ID: ${sample.studentId})`);
                sample.modules.forEach((module, index) => {
                    console.log(`    ${index + 1}. ${module}`);
                });
            });
        });

        console.log('\n' + '='.repeat(80));
        console.log('✅ Module assignment completed successfully!');

        return {
            totalStudents: students.length,
            updatedStudents: updateCount,
            programSummary,
            sampleAssignments: updates.slice(0, 5)
        };

    } catch (error) {
        console.error('❌ Error in module assignment process:', error);
        throw error;
    }
}

/**
 * Function to get modules for a specific program (useful for new student registration)
 */
function getAvailableModulesForProgram(programId) {
    const program = PROGRAM_MODULES[programId];
    return program ? program.modules : [];
}

/**
 * Function to assign modules to a single new student
 */
async function assignModulesToNewStudent(studentId) {
    try {
        // Get student's program information
        const studentQuery = `
            SELECT s.StudentID, s.StudentName, s.ProgramID, s.YearOfStudy, p.ProgramName
            FROM Students s
            INNER JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.StudentID = ? AND s.IsActive = 1
        `;

        const students = await databaseService.executeQuery(studentQuery, [studentId]);
        
        if (students.length === 0) {
            throw new Error(`Student with ID ${studentId} not found or inactive`);
        }

        const student = students[0];
        const [module1, module2, module3, module4] = selectModulesForStudent(
            student.ProgramID, 
            student.YearOfStudy
        );

        const updateQuery = `
            UPDATE Students 
            SET Module1 = ?, Module2 = ?, Module3 = ?, Module4 = ?, UpdatedAt = GETDATE()
            WHERE StudentID = ?
        `;

        await databaseService.executeQuery(updateQuery, [
            module1, module2, module3, module4, studentId
        ]);

        console.log(`✅ Modules assigned to ${student.StudentName}:`);
        [module1, module2, module3, module4].filter(m => m !== null).forEach((module, index) => {
            console.log(`  ${index + 1}. ${module}`);
        });

        return {
            studentId,
            studentName: student.StudentName,
            program: student.ProgramName,
            modules: [module1, module2, module3, module4].filter(m => m !== null)
        };

    } catch (error) {
        console.error(`❌ Error assigning modules to student ${studentId}:`, error.message);
        throw error;
    }
}

// Export functions for use in other modules
module.exports = {
    assignModulesToStudents,
    assignModulesToNewStudent,
    getAvailableModulesForProgram,
    PROGRAM_MODULES
};

// Run the assignment if this script is executed directly
if (require.main === module) {
    assignModulesToStudents()
        .then(result => {
            console.log('\n🎉 Module assignment process completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Failed to assign modules:', error.message);
            process.exit(1);
        });
}