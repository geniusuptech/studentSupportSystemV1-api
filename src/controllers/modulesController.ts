import { Request, Response } from 'express';
import databaseService from '../config/database';

interface ModuleAssignment {
    studentId: number;
    moduleId: number;
    assignedDate?: Date;
    completionStatus?: string;
}

interface Module {
    ModuleID: number;
    ModuleName: string;
    ModuleCode: string;
    ProgramID: number;
    Description?: string;
    Credits: number;
    YearLevel: number;
    Semester: number;
    Prerequisites?: string;
    IsActive: boolean;
}

interface StudentRecord {
    StudentID: number;
    StudentName: string;
    StudentNumber: string;
    ProgramID: number;
    ProgramName: string;
    ProgramCode?: string;
    YearOfStudy: number;
}

interface StudentModuleRecord {
    StudentModuleID: number;
    StudentID: number;
    ModuleID: number;
    ModuleName: string;
    ModuleCode: string;
    Credits: number;
    YearLevel: number;
    Semester: number;
    CompletionStatus: string;
    Grade?: string;
    GradePoints?: number;
    AssignedDate: Date;
}

/**
 * @swagger
 * /api/modules/programs/{programId}:
 *   get:
 *     summary: Get available modules for a specific program
 *     description: Retrieve all available modules for a given academic program
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The program ID
 *     responses:
 *       200:
 *         description: Successfully retrieved program modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     programId:
 *                       type: integer
 *                     programName:
 *                       type: string
 *                     availableModules:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalModules:
 *                       type: integer
 *       404:
 *         description: Program not found
 *       400:
 *         description: Invalid program ID
 */
export const getAvailableModules = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { programId } = req.params;
        
        if (!programId) {
            return res.status(400).json({
                success: false,
                message: 'Program ID is required'
            });
        }
        
        const programIdNumber = parseInt(programId, 10);

        if (!programIdNumber || isNaN(programIdNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid program ID'
            });
        }

        // Get program info and modules from database
        const programQuery = `
            SELECT ProgramID, ProgramName, ProgramCode 
            FROM Programs 
            WHERE ProgramID = ? AND IsActive = 1
        `;

        const modulesQuery = `
            SELECT 
                ModuleID,
                ModuleName,
                ModuleCode,
                Description,
                Credits,
                YearLevel,
                Semester,
                Prerequisites
            FROM Modules 
            WHERE ProgramID = ? AND IsActive = 1
            ORDER BY YearLevel ASC, Semester ASC, ModuleName ASC
        `;

        const [programs, modules] = await Promise.all([
            databaseService.executeQuery(programQuery, [programIdNumber]),
            databaseService.executeQuery(modulesQuery, [programIdNumber])
        ]);

        if (programs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        const program = programs[0];
        
        return res.json({
            success: true,
            data: {
                programId: program.ProgramID,
                programName: program.ProgramName,
                programCode: program.ProgramCode,
                availableModules: modules,
                totalModules: modules.length
            }
        });

    } catch (error) {
        console.error('Error fetching available modules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch available modules'
        });
    }
};

/**
 * @swagger
 * /api/modules/programs:
 *   get:
 *     summary: Get all programs with their available modules
 *     description: Retrieve all academic programs and their associated modules
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: Successfully retrieved all programs with modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       programId:
 *                         type: integer
 *                       programName:
 *                         type: string
 *                       modules:
 *                         type: array
 *                         items:
 *                           type: string
 *       500:
 *         description: Server error
 */
export const getAllProgramsWithModules = async (req: Request, res: Response): Promise<Response> => {
    try {
        const query = `
            SELECT 
                p.ProgramID,
                p.ProgramName,
                p.ProgramCode,
                p.Department,
                COUNT(m.ModuleID) as ModuleCount,
                STRING_AGG(m.ModuleName, ', ') as ModuleNames
            FROM Programs p
            LEFT JOIN Modules m ON p.ProgramID = m.ProgramID AND m.IsActive = 1
            WHERE p.IsActive = 1
            GROUP BY p.ProgramID, p.ProgramName, p.ProgramCode, p.Department
            ORDER BY p.ProgramID
        `;

        const programs = await databaseService.executeQuery(query, []);

        // Get detailed modules for each program
        const programsWithModules = await Promise.all(
            programs.map(async (program) => {
                const modulesQuery = `
                    SELECT 
                        ModuleID,
                        ModuleName,
                        ModuleCode,
                        Description,
                        Credits,
                        YearLevel,
                        Semester
                    FROM Modules 
                    WHERE ProgramID = ? AND IsActive = 1
                    ORDER BY YearLevel ASC, Semester ASC, ModuleName ASC
                `;
                
                const modules = await databaseService.executeQuery(modulesQuery, [program.ProgramID]);
                
                return {
                    programId: program.ProgramID,
                    programName: program.ProgramName,
                    programCode: program.ProgramCode,
                    department: program.Department,
                    moduleCount: program.ModuleCount || 0,
                    modules: modules
                };
            })
        );

        return res.json({
            success: true,
            data: programsWithModules
        });

    } catch (error) {
        console.error('Error fetching all programs with modules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch programs and modules'
        });
    }
};

/**
 * @swagger
 * /api/modules/students/{studentId}:
 *   get:
 *     summary: Get student's current modules
 *     description: Retrieve the modules currently assigned to a specific student
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Successfully retrieved student modules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                     studentName:
 *                       type: string
 *                     studentNumber:
 *                       type: string
 *                     program:
 *                       type: string
 *                     programCode:
 *                       type: string
 *                     yearOfStudy:
 *                       type: integer
 *                     currentModules:
 *                       type: array
 *                       items:
 *                         type: string
 *                     moduleDetails:
 *                       type: object
 *                       properties:
 *                         module1:
 *                           type: string
 *                         module2:
 *                           type: string
 *                         module3:
 *                           type: string
 *                         module4:
 *                           type: string
 *       404:
 *         description: Student not found
 *       400:
 *         description: Invalid student ID
 */
export const getStudentModules = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        
        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }

        // Get student information with their assigned modules
        const studentQuery = `
            SELECT 
                s.StudentID,
                s.StudentName,
                s.StudentNumber,
                p.ProgramName,
                p.ProgramCode,
                s.YearOfStudy,
                s.GPA,
                s.RiskLevel
            FROM Students s
            INNER JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.StudentID = ? AND s.IsActive = 1
        `;

        const modulesQuery = `
            SELECT 
                sm.StudentModuleID,
                sm.ModuleID,
                m.ModuleName,
                m.ModuleCode,
                m.Description,
                m.Credits,
                m.YearLevel,
                m.Semester,
                sm.CompletionStatus,
                sm.Grade,
                sm.GradePoints,
                sm.AssignedDate
            FROM StudentModules sm
            INNER JOIN Modules m ON sm.ModuleID = m.ModuleID
            WHERE sm.StudentID = ? AND sm.IsActive = 1
            ORDER BY m.YearLevel ASC, m.Semester ASC, m.ModuleName ASC
        `;

        const [students, modules] = await Promise.all([
            databaseService.executeQuery(studentQuery, [studentId]),
            databaseService.executeQuery(modulesQuery, [studentId])
        ]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];
        
        return res.json({
            success: true,
            data: {
                studentId: student.StudentID,
                studentName: student.StudentName,
                studentNumber: student.StudentNumber,
                program: student.ProgramName,
                programCode: student.ProgramCode,
                yearOfStudy: student.YearOfStudy,
                gpa: student.GPA,
                riskLevel: student.RiskLevel,
                totalModules: modules.length,
                modules: modules,
                modulesByStatus: {
                    enrolled: modules.filter(m => m.CompletionStatus === 'Enrolled'),
                    inProgress: modules.filter(m => m.CompletionStatus === 'In Progress'),
                    completed: modules.filter(m => m.CompletionStatus === 'Completed')
                }
            }
        });

    } catch (error) {
        console.error('Error fetching student modules:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch student modules'
        });
    }
};

/**
 * Get random modules from a program's available modules in the database
 */
async function getRandomModuleIds(programId: number, count: number = 4): Promise<number[]> {
    try {
        const query = `
            SELECT TOP(${count}) ModuleID 
            FROM Modules 
            WHERE ProgramID = ? AND IsActive = 1
            ORDER BY NEWID()
        `;
        
        const modules = await databaseService.executeQuery(query, [programId]);
        return modules.map(m => m.ModuleID);
    } catch (error) {
        console.error('Error getting random modules:', error);
        return [];
    }
}

/**
 * @swagger
 * /api/modules/students/{studentId}/assign:
 *   post:
 *     summary: Assign modules to a specific student
 *     description: Assign modules to a student either automatically based on their program or manually with specific modules
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The student ID
 *     requestBody:
 *       description: Optional specific modules to assign
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               modules:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of specific modules to assign (optional)
 *     responses:
 *       200:
 *         description: Modules successfully assigned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                     studentName:
 *                       type: string
 *                     program:
 *                       type: string
 *                     assignedModules:
 *                       type: array
 *                       items:
 *                         type: string
 *       404:
 *         description: Student not found
 *       400:
 *         description: Invalid modules or student ID
 */
export const assignModulesToStudent = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { studentId } = req.params;
        const { moduleIds } = req.body; // Changed from modules to moduleIds

        if (!studentId) {
            return res.status(400).json({
                success: false,
                message: 'Student ID is required'
            });
        }

        // Get student's program information
        const studentQuery = `
            SELECT s.StudentID, s.StudentName, s.ProgramID, s.YearOfStudy, p.ProgramName, p.ProgramCode
            FROM Students s
            INNER JOIN Programs p ON s.ProgramID = p.ProgramID
            WHERE s.StudentID = ? AND s.IsActive = 1
        `;

        const students = await databaseService.executeQuery(studentQuery, [studentId]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Student not found'
            });
        }

        const student = students[0];
        let selectedModuleIds: number[] = [];

        if (moduleIds && Array.isArray(moduleIds) && moduleIds.length > 0) {
            // Validate provided module IDs belong to student's program
            const moduleValidationQuery = `
                SELECT ModuleID FROM Modules 
                WHERE ModuleID IN (${moduleIds.map(() => '?').join(',')}) 
                AND ProgramID = ? AND IsActive = 1
            `;
            
            const validModules = await databaseService.executeQuery(
                moduleValidationQuery, 
                [...moduleIds, student.ProgramID]
            );
            
            if (validModules.length !== moduleIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Some module IDs are invalid or not available for this program'
                });
            }
            
            selectedModuleIds = moduleIds;
        } else {
            // Auto-assign random modules based on program
            selectedModuleIds = await getRandomModuleIds(student.ProgramID, 4);
        }

        if (selectedModuleIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No modules available for this program'
            });
        }

        // Check for existing assignments to avoid duplicates
        const existingQuery = `
            SELECT ModuleID FROM StudentModules 
            WHERE StudentID = ? AND IsActive = 1
        `;
        
        const existingAssignments = await databaseService.executeQuery(existingQuery, [studentId]);
        const existingModuleIds = existingAssignments.map(a => a.ModuleID);
        
        // Filter out already assigned modules
        const newModuleIds = selectedModuleIds.filter(id => !existingModuleIds.includes(id));
        
        if (newModuleIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All selected modules are already assigned to this student'
            });
        }

        // Insert new module assignments
        const insertQuery = `
            INSERT INTO StudentModules (StudentID, ModuleID, CompletionStatus, AssignedDate)
            VALUES ${newModuleIds.map(() => '(?, ?, ?, GETDATE())').join(', ')}
        `;

        const insertValues = newModuleIds.flatMap(moduleId => [
            studentId,
            moduleId,
            'Enrolled'
        ]);

        await databaseService.executeQuery(insertQuery, insertValues);

        // Get the assigned module details
        const assignedModulesQuery = `
            SELECT m.ModuleID, m.ModuleName, m.ModuleCode, m.Credits
            FROM Modules m
            WHERE m.ModuleID IN (${newModuleIds.map(() => '?').join(',')})
        `;
        
        const assignedModules = await databaseService.executeQuery(assignedModulesQuery, newModuleIds);

        return res.status(201).json({
            success: true,
            message: `Successfully assigned ${newModuleIds.length} modules to ${student.StudentName}`,
            data: {
                studentId: student.StudentID,
                studentName: student.StudentName,
                program: student.ProgramName,
                programCode: student.ProgramCode,
                assignedModules: assignedModules,
                newlyAssigned: newModuleIds.length,
                alreadyAssigned: existingModuleIds.length
            }
        });

    } catch (error) {
        console.error('Error assigning modules to student:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign modules to student'
        });
    }
};

/**
 * @swagger
 * /api/modules/programs/{programId}/assign:
 *   post:
 *     summary: Assign modules to all students in a program
 *     description: Automatically assign modules to all students enrolled in a specific program
 *     tags: [Modules]
 *     parameters:
 *       - in: path
 *         name: programId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The program ID
 *     responses:
 *       200:
 *         description: Modules successfully assigned to all students in program
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     programId:
 *                       type: integer
 *                     programName:
 *                       type: string
 *                     totalStudents:
 *                       type: integer
 *                     updatedCount:
 *                       type: integer
 *                     sampleAssignments:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: Program not found
 */
export const assignModulesToProgram = async (req: Request, res: Response): Promise<Response> => {
    try {
        const { programId } = req.params;
        
        if (!programId) {
            return res.status(400).json({
                success: false,
                message: 'Program ID is required'
            });
        }
        
        const programIdNumber = parseInt(programId, 10);

        if (!programIdNumber || isNaN(programIdNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid program ID'
            });
        }

        // Check if program exists
        const programQuery = `
            SELECT ProgramID, ProgramName, ProgramCode 
            FROM Programs 
            WHERE ProgramID = ? AND IsActive = 1
        `;

        const programs = await databaseService.executeQuery(programQuery, [programIdNumber]);
        
        if (programs.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Program not found'
            });
        }

        const program = programs[0];

        // Get all students in this program
        const studentsQuery = `
            SELECT StudentID, StudentName, YearOfStudy
            FROM Students 
            WHERE ProgramID = ? AND IsActive = 1
        `;

        const students = await databaseService.executeQuery(studentsQuery, [programIdNumber]);

        if (students.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active students found in this program'
            });
        }

        // Use stored procedure to assign modules to all students in the program
        const assignQuery = `EXEC sp_AssignModulesToStudents @ProgramID = ?`;
        
        await databaseService.executeQuery(assignQuery, [programIdNumber]);

        // Get assignment summary
        const summaryQuery = `
            SELECT 
                COUNT(DISTINCT sm.StudentID) as StudentsAssigned,
                COUNT(sm.StudentModuleID) as TotalAssignments,
                AVG(CAST(moduleCount.ModuleCount as FLOAT)) as AvgModulesPerStudent
            FROM StudentModules sm
            INNER JOIN Students s ON sm.StudentID = s.StudentID
            INNER JOIN (
                SELECT 
                    sm2.StudentID,
                    COUNT(sm2.ModuleID) as ModuleCount
                FROM StudentModules sm2
                WHERE sm2.IsActive = 1
                GROUP BY sm2.StudentID
            ) moduleCount ON s.StudentID = moduleCount.StudentID
            WHERE s.ProgramID = ? AND sm.IsActive = 1
        `;

        const summary = await databaseService.executeQuery(summaryQuery, [programIdNumber]);
        
        // Get sample assignments for response
        const sampleQuery = `
            SELECT TOP 5
                s.StudentID,
                s.StudentName,
                COUNT(sm.ModuleID) as ModuleCount
            FROM Students s
            LEFT JOIN StudentModules sm ON s.StudentID = sm.StudentID AND sm.IsActive = 1
            WHERE s.ProgramID = ? AND s.IsActive = 1
            GROUP BY s.StudentID, s.StudentName
            ORDER BY s.StudentID
        `;

        const sampleAssignments = await databaseService.executeQuery(sampleQuery, [programIdNumber]);

        return res.status(201).json({
            success: true,
            message: `Successfully assigned modules to all students in program ${program.ProgramName}`,
            data: {
                programId: program.ProgramID,
                programName: program.ProgramName,
                programCode: program.ProgramCode,
                totalStudents: students.length,
                assignmentSummary: summary[0] || {
                    StudentsAssigned: 0,
                    TotalAssignments: 0,
                    AvgModulesPerStudent: 0
                },
                sampleAssignments: sampleAssignments
            }
        });

    } catch (error) {
        console.error('Error assigning modules to program:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign modules to program students'
        });
    }
};

/**
 * @swagger
 * /api/modules/assign-all:
 *   post:
 *     summary: Assign modules to all students across all programs
 *     description: Automatically assign modules to all active students based on their respective programs
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: Modules successfully assigned to all students
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                     updatedCount:
 *                       type: integer
 *                     programSummary:
 *                       type: object
 *                     sampleAssignments:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Server error
 */
export const assignModulesToAllStudents = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Get all active programs first
        const programsQuery = `
            SELECT ProgramID, ProgramName FROM Programs 
            WHERE IsActive = 1
        `;
        
        const programs = await databaseService.executeQuery(programsQuery, []);

        if (programs.length === 0) {
            return res.json({
                success: true,
                message: 'No active programs found',
                data: { updatedCount: 0 }
            });
        }

        let totalAssignments = 0;
        const programSummary: { [key: string]: number } = {};
        const sampleAssignments = [];

        // Process each program using the stored procedure
        for (const program of programs) {
            try {
                // Use stored procedure to assign modules to all students in this program
                const assignQuery = `EXEC sp_AssignModulesToStudents @ProgramID = ?`;
                
                await databaseService.executeQuery(assignQuery, [program.ProgramID]);

                // Get count of students assigned in this program
                const countQuery = `
                    SELECT COUNT(DISTINCT sm.StudentID) as AssignedCount
                    FROM StudentModules sm
                    INNER JOIN Students s ON sm.StudentID = s.StudentID
                    WHERE s.ProgramID = ? AND sm.IsActive = 1
                `;
                
                const result = await databaseService.executeQuery(countQuery, [program.ProgramID]);
                const assignedCount = result[0]?.AssignedCount || 0;
                
                programSummary[program.ProgramName] = assignedCount;
                totalAssignments += assignedCount;

                // Get sample assignments for this program (limit to avoid overflow)
                if (sampleAssignments.length < 10) {
                    const sampleQuery = `
                        SELECT TOP 2
                            s.StudentID,
                            s.StudentName,
                            COUNT(sm.ModuleID) as ModuleCount
                        FROM Students s
                        LEFT JOIN StudentModules sm ON s.StudentID = sm.StudentID AND sm.IsActive = 1
                        WHERE s.ProgramID = ? AND s.IsActive = 1
                        GROUP BY s.StudentID, s.StudentName
                        ORDER BY s.StudentID
                    `;
                    
                    const programSamples = await databaseService.executeQuery(sampleQuery, [program.ProgramID]);
                    sampleAssignments.push(...programSamples.map(sample => ({
                        ...sample,
                        programName: program.ProgramName
                    })));
                }

            } catch (error) {
                console.error(`Error processing program ${program.ProgramID}:`, error);
                programSummary[program.ProgramName] = 0;
            }
        }

        return res.json({
            success: true,
            message: `Modules assigned across ${programs.length} programs`,
            data: {
                totalPrograms: programs.length,
                totalStudentsAssigned: totalAssignments,
                programSummary: programSummary,
                sampleAssignments: sampleAssignments.slice(0, 10)
            }
        });

    } catch (error) {
        console.error('Error assigning modules to all students:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to assign modules to all students'
        });
    }
};

/**
 * @swagger
 * /api/modules/statistics:
 *   get:
 *     summary: Get module assignment statistics
 *     description: Retrieve comprehensive statistics about module assignments across all programs
 *     tags: [Modules]
 *     responses:
 *       200:
 *         description: Successfully retrieved module assignment statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     assignmentStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ProgramID:
 *                             type: integer
 *                           ProgramName:
 *                             type: string
 *                           TotalStudents:
 *                             type: integer
 *                           StudentsWithModules:
 *                             type: integer
 *                           StudentsWithoutModules:
 *                             type: integer
 *                     programModuleDefinitions:
 *                       type: array
 *                       items:
 *                         type: object
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalPrograms:
 *                           type: integer
 *                         totalStudents:
 *                           type: integer
 *                         studentsWithModules:
 *                           type: integer
 *                         studentsWithoutModules:
 *                           type: integer
 *       500:
 *         description: Server error
 */
export const getModuleStatistics = async (req: Request, res: Response): Promise<Response> => {
    try {
        // Get statistics from the new database structure
        const statsQuery = `
            SELECT 
                p.ProgramID,
                p.ProgramName,
                p.ProgramCode,
                COUNT(DISTINCT s.StudentID) as TotalStudents,
                COUNT(DISTINCT CASE WHEN sm.StudentID IS NOT NULL THEN s.StudentID END) as StudentsWithModules,
                COUNT(DISTINCT CASE WHEN sm.StudentID IS NULL THEN s.StudentID END) as StudentsWithoutModules,
                COUNT(sm.StudentModuleID) as TotalModuleAssignments,
                AVG(CAST(moduleCount.ModuleCount as FLOAT)) as AvgModulesPerStudent
            FROM Programs p
            LEFT JOIN Students s ON p.ProgramID = s.ProgramID AND s.IsActive = 1
            LEFT JOIN StudentModules sm ON s.StudentID = sm.StudentID AND sm.IsActive = 1
            LEFT JOIN (
                SELECT 
                    sm2.StudentID,
                    COUNT(sm2.ModuleID) as ModuleCount
                FROM StudentModules sm2
                WHERE sm2.IsActive = 1
                GROUP BY sm2.StudentID
            ) moduleCount ON s.StudentID = moduleCount.StudentID
            WHERE p.IsActive = 1
            GROUP BY p.ProgramID, p.ProgramName, p.ProgramCode
            ORDER BY p.ProgramID
        `;

        const statistics = await databaseService.executeQuery(statsQuery, []);

        // Get program module definitions from database
        const moduleDefsQuery = `
            SELECT 
                p.ProgramID,
                p.ProgramName,
                p.ProgramCode,
                COUNT(m.ModuleID) as AvailableModules
            FROM Programs p
            LEFT JOIN Modules m ON p.ProgramID = m.ProgramID AND m.IsActive = 1
            WHERE p.IsActive = 1
            GROUP BY p.ProgramID, p.ProgramName, p.ProgramCode
            ORDER BY p.ProgramID
        `;

        const programModuleDefinitions = await databaseService.executeQuery(moduleDefsQuery, []);

        // Get detailed module breakdown by program
        const detailedModulesQuery = `
            SELECT 
                p.ProgramID,
                p.ProgramName,
                m.ModuleID,
                m.ModuleName,
                m.ModuleCode,
                m.Credits,
                m.YearLevel,
                m.Semester
            FROM Programs p
            LEFT JOIN Modules m ON p.ProgramID = m.ProgramID AND m.IsActive = 1
            WHERE p.IsActive = 1
            ORDER BY p.ProgramID, m.YearLevel, m.Semester, m.ModuleName
        `;

        const detailedModules = await databaseService.executeQuery(detailedModulesQuery, []);

        // Group modules by program for detailed response
        const modulesByProgram = detailedModules.reduce((acc, module) => {
            const programId = module.ProgramID;
            if (!acc[programId]) {
                acc[programId] = {
                    programId: module.ProgramID,
                    programName: module.ProgramName,
                    modules: []
                };
            }
            
            if (module.ModuleID) {
                acc[programId].modules.push({
                    moduleId: module.ModuleID,
                    moduleName: module.ModuleName,
                    moduleCode: module.ModuleCode,
                    credits: module.Credits,
                    yearLevel: module.YearLevel,
                    semester: module.Semester
                });
            }
            
            return acc;
        }, {});

        const totalPrograms = statistics.length;
        const totalStudents = statistics.reduce((sum, stat) => sum + (stat.TotalStudents || 0), 0);
        const studentsWithModules = statistics.reduce((sum, stat) => sum + (stat.StudentsWithModules || 0), 0);
        const studentsWithoutModules = statistics.reduce((sum, stat) => sum + (stat.StudentsWithoutModules || 0), 0);

        return res.json({
            success: true,
            data: {
                assignmentStatistics: statistics,
                programModuleDefinitions: programModuleDefinitions,
                detailedModulesByProgram: Object.values(modulesByProgram),
                summary: {
                    totalPrograms: totalPrograms,
                    totalStudents: totalStudents,
                    studentsWithModules: studentsWithModules,
                    studentsWithoutModules: studentsWithoutModules,
                    assignmentCoverage: totalStudents > 0 ? Math.round((studentsWithModules / totalStudents) * 100) : 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching module statistics:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch module statistics'
        });
    }
};