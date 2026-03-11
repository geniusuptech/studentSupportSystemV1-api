/**
 * Module Assignment Demo Script
 * Demonstrates how the module assignment system works without requiring database connectivity
 */

// Sample program modules (same as defined in the controller)
const PROGRAM_MODULES = {
    1: { // Computer Science
        programId: 1,
        programName: 'Computer Science',
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
        programId: 2,
        programName: 'Business Administration',
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
        programId: 3,
        programName: 'Engineering',
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
        programId: 4,
        programName: 'Medicine',
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
        programId: 5,
        programName: 'Psychology',
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
        programId: 6,
        programName: 'Law',
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

// Sample student data
const SAMPLE_STUDENTS = [
    { studentId: 1, studentName: 'Aisha Patel', programId: 1, yearOfStudy: 3 },
    { studentId: 2, studentName: 'Marcus Thompson', programId: 2, yearOfStudy: 3 },
    { studentId: 3, studentName: 'Zara Mohamed', programId: 3, yearOfStudy: 4 },
    { studentId: 4, studentName: 'Connor Williams', programId: 1, yearOfStudy: 2 },
    { studentId: 5, studentName: 'Nombulelo Mthembu', programId: 4, yearOfStudy: 3 },
    { studentId: 6, studentName: 'David Chen', programId: 1, yearOfStudy: 1 },
    { studentId: 7, studentName: 'Amara Okafor', programId: 5, yearOfStudy: 2 },
    { studentId: 8, studentName: 'Michael van der Merwe', programId: 6, yearOfStudy: 4 },
    { studentId: 9, studentName: 'Fatima Al-Zahra', programId: 2, yearOfStudy: 3 },
    { studentId: 10, studentName: 'James Rodriguez', programId: 3, yearOfStudy: 2 }
];

/**
 * Randomly select modules from a program's available modules
 */
function selectRandomModules(programId, count = 4) {
    const program = PROGRAM_MODULES[programId];
    if (!program) {
        console.warn(`Unknown program ID: ${programId}`);
        return [];
    }

    const availableModules = [...program.modules];
    const selectedModules = [];

    // Select random modules without replacement
    for (let i = 0; i < count && availableModules.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * availableModules.length);
        selectedModules.push(availableModules.splice(randomIndex, 1)[0]);
    }

    return selectedModules;
}

/**
 * Generate module assignments for all sample students
 */
function demonstrateModuleAssignment() {
    console.log('🎓 STUDENT MODULE ASSIGNMENT DEMONSTRATION');
    console.log('=' .repeat(80));
    console.log();

    // Display available programs
    console.log('📚 AVAILABLE PROGRAMS AND MODULES:');
    console.log('-'.repeat(40));
    Object.values(PROGRAM_MODULES).forEach(program => {
        console.log(`\n${program.programId}. ${program.programName}`);
        program.modules.forEach((module, index) => {
            console.log(`   ${index + 1}. ${module}`);
        });
    });

    console.log('\n' + '='.repeat(80));
    console.log('👥 STUDENT MODULE ASSIGNMENTS:');
    console.log('='.repeat(80));

    // Assign modules to each sample student
    const assignments = [];
    SAMPLE_STUDENTS.forEach(student => {
        const program = PROGRAM_MODULES[student.programId];
        const selectedModules = selectRandomModules(student.programId, 4);
        
        assignments.push({
            ...student,
            programName: program.programName,
            assignedModules: selectedModules
        });

        console.log(`\n📋 ${student.studentName} (ID: ${student.studentId})`);
        console.log(`   Program: ${program.programName}`);
        console.log(`   Year: ${student.yearOfStudy}`);
        console.log('   Assigned Modules:');
        selectedModules.forEach((module, index) => {
            console.log(`   ${index + 1}. ${module}`);
        });
    });

    // Generate statistics
    console.log('\n' + '='.repeat(80));
    console.log('📊 ASSIGNMENT STATISTICS:');
    console.log('='.repeat(80));

    const programStats = {};
    assignments.forEach(assignment => {
        if (!programStats[assignment.programName]) {
            programStats[assignment.programName] = {
                count: 0,
                students: []
            };
        }
        programStats[assignment.programName].count++;
        programStats[assignment.programName].students.push(assignment.studentName);
    });

    Object.entries(programStats).forEach(([program, stats]) => {
        console.log(`\n${program}: ${stats.count} students`);
        stats.students.forEach(student => {
            console.log(`  • ${student}`);
        });
    });

    // Module distribution analysis
    console.log('\n' + '='.repeat(80));
    console.log('🔍 MODULE DISTRIBUTION ANALYSIS:');
    console.log('='.repeat(80));

    const moduleUsage = {};
    assignments.forEach(assignment => {
        assignment.assignedModules.forEach(module => {
            if (!moduleUsage[module]) {
                moduleUsage[module] = 0;
            }
            moduleUsage[module]++;
        });
    });

    // Sort modules by usage frequency
    const sortedModules = Object.entries(moduleUsage)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10); // Top 10 most assigned modules

    console.log('\nTop 10 Most Assigned Modules:');
    sortedModules.forEach(([module, count], index) => {
        console.log(`${index + 1}. ${module} (${count} students)`);
    });

    console.log('\n' + '='.repeat(80));
    console.log('✅ MODULE ASSIGNMENT DEMONSTRATION COMPLETED');
    console.log('='.repeat(80));

    return {
        totalStudents: assignments.length,
        programDistribution: programStats,
        moduleUsage: moduleUsage,
        assignments: assignments
    };
}

/**
 * Demonstrate API endpoint responses
 */
function demonstrateAPIResponses() {
    console.log('\n🔌 API ENDPOINT RESPONSE EXAMPLES:');
    console.log('='.repeat(80));

    // Example 1: Get all programs with modules
    console.log('\n1. GET /api/modules/programs');
    console.log('Response:');
    console.log(JSON.stringify({
        success: true,
        data: Object.values(PROGRAM_MODULES).map(p => ({
            programId: p.programId,
            programName: p.programName,
            modules: p.modules.slice(0, 3), // Show first 3 modules
            totalModules: p.modules.length
        }))
    }, null, 2));

    // Example 2: Get specific program modules
    console.log('\n2. GET /api/modules/programs/1');
    console.log('Response:');
    console.log(JSON.stringify({
        success: true,
        data: {
            programId: 1,
            programName: 'Computer Science',
            availableModules: PROGRAM_MODULES[1].modules,
            totalModules: PROGRAM_MODULES[1].modules.length
        }
    }, null, 2));

    // Example 3: Student module assignment
    const sampleStudent = SAMPLE_STUDENTS[0];
    const sampleModules = selectRandomModules(sampleStudent.programId, 4);
    
    console.log('\n3. GET /api/modules/students/1');
    console.log('Response:');
    console.log(JSON.stringify({
        success: true,
        data: {
            studentId: sampleStudent.studentId,
            studentName: sampleStudent.studentName,
            program: PROGRAM_MODULES[sampleStudent.programId].programName,
            yearOfStudy: sampleStudent.yearOfStudy,
            currentModules: sampleModules,
            moduleDetails: {
                module1: sampleModules[0],
                module2: sampleModules[1],
                module3: sampleModules[2],
                module4: sampleModules[3]
            }
        }
    }, null, 2));

    console.log('\n' + '='.repeat(80));
}

/**
 * Show usage instructions
 */
function showUsageInstructions() {
    console.log('\n📖 USAGE INSTRUCTIONS:');
    console.log('='.repeat(80));
    console.log(`
To implement this module assignment system:

1. DATABASE SETUP:
   Run the database scripts in this order:
   • sqlcmd -S localhost\\SQLEXPRESS -E -i database/student_wellness_database.sql
   • sqlcmd -S localhost\\SQLEXPRESS -E -i database/remaining_students_data.sql
   • sqlcmd -S localhost\\SQLEXPRESS -E -i assign-student-modules.sql

2. NODE.JS ASSIGNMENT:
   • node assign-student-modules.js

3. API USAGE:
   Start the server and use these endpoints:
   • GET  /api/modules/programs                    - All programs and modules
   • GET  /api/modules/programs/:id               - Specific program modules  
   • GET  /api/modules/students/:id               - Student's current modules
   • POST /api/modules/students/:id/assign        - Assign modules to student
   • POST /api/modules/programs/:id/assign        - Assign to all in program
   • POST /api/modules/assign-all                 - Assign to all students
   • GET  /api/modules/statistics                 - Assignment statistics

4. TESTING:
   Use curl, Postman, or your frontend to test the endpoints:
   
   curl http://localhost:3001/api/modules/programs
   curl -X POST http://localhost:3001/api/modules/students/1/assign
   curl -X POST http://localhost:3001/api/modules/assign-all

For detailed documentation, see MODULE_ASSIGNMENT_GUIDE.md
    `);
    console.log('='.repeat(80));
}

// Run the demonstration
if (require.main === module) {
    const results = demonstrateModuleAssignment();
    demonstrateAPIResponses();
    showUsageInstructions();
    
    console.log('\n🎉 Demonstration completed successfully!');
    console.log(`📈 Generated assignments for ${results.totalStudents} students across ${Object.keys(results.programDistribution).length} programs.`);
}