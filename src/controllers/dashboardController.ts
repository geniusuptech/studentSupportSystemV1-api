import { Context } from 'hono';
import { dashboardService } from '../services/dashboardService';

export class DashboardController {
  // GET /api/dashboard/summary
  getSummary = async (c: Context) => {
    try {
      const summary = await dashboardService.getSummary();
      return c.json({
        success: true,
        data: {
          totalStudents: summary.totalStudents,
          criticalStudents: summary.criticalStudents,
          averageGPA: Math.round(summary.averageGPA * 100) / 100,
          activeInterventions: summary.activeInterventions
        }
      });
    } catch (error: any) {
      console.error('Error fetching dashboard summary:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/dashboard/risk-distribution
  getRiskDistribution = async (c: Context) => {
    try {
      const distribution = await dashboardService.getRiskDistribution();
      return c.json({
        success: true,
        data: {
          totalStudents: distribution.totalStudents,
          categories: {
            safe: { count: distribution.safe.count, percentage: distribution.safe.percentage, label: 'Safe', description: 'Healthy Progress' },
            atRisk: { count: distribution.atRisk.count, percentage: distribution.atRisk.percentage, label: 'At Risk', description: 'Under Observation' },
            critical: { count: distribution.critical.count, percentage: distribution.critical.percentage, label: 'Critical', description: 'Immediate Action' }
          }
        }
      });
    } catch (error: any) {
      console.error('Error fetching risk distribution:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/universities
  getUniversities = async (c: Context) => {
    try {
      const universities = await dashboardService.getAllUniversities();
      return c.json({ success: true, count: universities.length, data: universities });
    } catch (error: any) {
      console.error('Error fetching universities:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/programs
  getPrograms = async (c: Context) => {
    try {
      const programs = await dashboardService.getAllPrograms();
      return c.json({ success: true, count: programs.length, data: programs });
    } catch (error: any) {
      console.error('Error fetching programs:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/risk-levels
  getRiskLevels = async (c: Context) => {
    try {
      const riskLevels = dashboardService.getRiskLevels();
      return c.json({ success: true, count: riskLevels.length, data: riskLevels });
    } catch (error: any) {
      console.error('Error fetching risk levels:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/interventions/active
  getActiveInterventions = async (c: Context) => {
    try {
      const interventions = await dashboardService.getActiveInterventions();
      return c.json({ success: true, count: interventions.length, data: interventions });
    } catch (error: any) {
      console.error('Error fetching active interventions:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // POST /api/interventions
  createIntervention = async (c: Context) => {
    try {
      const body = await c.req.json();
      if (!body.studentId || !body.type) {
        return c.json({ success: false, error: 'Validation Error', message: 'studentId and type are required' }, 400);
      }
      const intervention = await dashboardService.createIntervention(body);
      return c.json({ success: true, message: 'Intervention created successfully', data: intervention }, 201);
    } catch (error: any) {
      console.error('Error creating intervention:', error);
      if (error.message.includes('Invalid')) {
        return c.json({ error: 'Validation Error', message: error.message }, 400);
      }
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/reports/students/export
  exportStudents = async (c: Context) => {
    try {
      const students = await dashboardService.getStudentsForExport();
      const format = (c.req.query('format') || 'json').toLowerCase();
      
      if (format === 'csv') {
        const csv = dashboardService.generateCSV(students);
        c.header('Content-Type', 'text/csv');
        c.header('Content-Disposition', `attachment; filename=students_export_${new Date().toISOString().split('T')[0]}.csv`);
        return c.text(csv);
      } else {
        return c.json({ success: true, count: students.length, exportedAt: new Date().toISOString(), data: students });
      }
    } catch (error: any) {
      console.error('Error exporting students:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };
}

export const dashboardController = new DashboardController();
