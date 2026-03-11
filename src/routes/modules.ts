
import express, { Router } from 'express';
import {
    getAvailableModules,
    getAllProgramsWithModules,
    getStudentModules,
    assignModulesToStudent,
    assignModulesToProgram,
    assignModulesToAllStudents,
    getModuleStatistics
} from '../controllers/modulesController';

const router: Router = express.Router();

/**
 * @route GET /api/modules/programs
 * @desc Get all programs with their available modules
 * @access Public
 */
router.get('/programs', getAllProgramsWithModules);

/**
 * @route GET /api/modules/programs/:programId
 * @desc Get available modules for a specific program
 * @access Public
 */
router.get('/programs/:programId', getAvailableModules);

/**
 * @route GET /api/modules/students/:studentId
 * @desc Get current modules for a specific student
 * @access Public
 */
router.get('/students/:studentId', getStudentModules);

/**
 * @route POST /api/modules/students/:studentId/assign
 * @desc Assign modules to a specific student
 * @body { modules?: string[] } - Optional array of specific modules to assign
 * @access Public
 */
router.post('/students/:studentId/assign', assignModulesToStudent);

/**
 * @route POST /api/modules/programs/:programId/assign
 * @desc Assign modules to all students in a specific program
 * @access Public
 */
router.post('/programs/:programId/assign', assignModulesToProgram);

/**
 * @route POST /api/modules/assign-all
 * @desc Assign modules to all students across all programs
 * @access Public
 */
router.post('/assign-all', assignModulesToAllStudents);

/**
 * @route GET /api/modules/statistics
 * @desc Get module assignment statistics and program definitions
 * @access Public
 */
router.get('/statistics', getModuleStatistics);

export default router;