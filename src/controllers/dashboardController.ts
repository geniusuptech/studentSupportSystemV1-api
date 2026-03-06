import { Request, Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboardService';

export class DashboardController {
  /**
   * Get Dashboard Summary (stat cards)
   * GET /api/dashboard/summary
   */
  getSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching dashboard summary...');
      const summary = await dashboardService.getSummary();
      
      res.json({
        success: true,
        data: {
          totalStudents: summary.totalStudents,
          criticalStudents: summary.criticalStudents,
          averageGPA: Math.round(summary.averageGPA * 100) / 100, // Round to 2 decimal places
          activeInterventions: summary.activeInterventions
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      next(error);
    }
  };

  /**
   * Get Risk Distribution
   * GET /api/dashboard/risk-distribution
   */
  getRiskDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching risk distribution...');
      const distribution = await dashboardService.getRiskDistribution();
      
      res.json({
        success: true,
        data: {
          totalStudents: distribution.totalStudents,
          categories: {
            safe: {
              count: distribution.safe.count,
              percentage: distribution.safe.percentage,
              label: 'Safe',
              description: 'Healthy Progress'
            },
            atRisk: {
              count: distribution.atRisk.count,
              percentage: distribution.atRisk.percentage,
              label: 'At Risk',
              description: 'Under Observation'
            },
            critical: {
              count: distribution.critical.count,
              percentage: distribution.critical.percentage,
              label: 'Critical',
              description: 'Immediate Action'
            }
          }
        }
      });
    } catch (error) {
      console.error('Error fetching risk distribution:', error);
      next(error);
    }
  };

  /**
   * Get All Universities
   * GET /api/universities
   */
  getUniversities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching universities...');
      const universities = await dashboardService.getAllUniversities();
      
      res.json({
        success: true,
        count: universities.length,
        data: universities
      });
    } catch (error) {
      console.error('Error fetching universities:', error);
      next(error);
    }
  };

  /**
   * Get All Programs
   * GET /api/programs
   */
  getPrograms = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching programs...');
      const programs = await dashboardService.getAllPrograms();
      
      res.json({
        success: true,
        count: programs.length,
        data: programs
      });
    } catch (error) {
      console.error('Error fetching programs:', error);
      next(error);
    }
  };

  /**
   * Get Risk Levels
   * GET /api/risk-levels
   */
  getRiskLevels = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const riskLevels = dashboardService.getRiskLevels();
      
      res.json({
        success: true,
        count: riskLevels.length,
        data: riskLevels
      });
    } catch (error) {
      console.error('Error fetching risk levels:', error);
      next(error);
    }
  };

  /**
   * Get Active Interventions
   * GET /api/interventions/active
   */
  getActiveInterventions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Fetching active interventions...');
      const interventions = await dashboardService.getActiveInterventions();
      
      res.json({
        success: true,
        count: interventions.length,
        data: interventions
      });
    } catch (error) {
      console.error('Error fetching active interventions:', error);
      next(error);
    }
  };

  /**
   * Create Intervention
   * POST /api/interventions
   */
  createIntervention = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { studentId, interventionType, description, priority, assignedTo, notes } = req.body;

      if (!studentId || !interventionType) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: 'studentId and interventionType are required'
        });
        return;
      }

      console.log(`Creating intervention for student ${studentId}...`);
      
      const intervention = await dashboardService.createIntervention({
        studentId,
        interventionType,
        description,
        priority,
        assignedTo,
        notes
      });

      res.status(201).json({
        success: true,
        message: 'Intervention created successfully',
        data: intervention
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid')) {
        res.status(400).json({
          success: false,
          error: 'Validation Error',
          message: error.message
        });
        return;
      }
      console.error('Error creating intervention:', error);
      next(error);
    }
  };

  /**
   * Export Students Report
   * GET /api/reports/students/export
   */
  exportStudents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('Exporting students report...');
      const students = await dashboardService.getStudentsForExport();
      
      const format = (req.query.format as string)?.toLowerCase() || 'json';
      
      if (format === 'csv') {
        const csv = dashboardService.generateCSV(students);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=students_export_${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
      } else {
        res.json({
          success: true,
          count: students.length,
          exportedAt: new Date().toISOString(),
          data: students
        });
      }
    } catch (error) {
      console.error('Error exporting students:', error);
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
