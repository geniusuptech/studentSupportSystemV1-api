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

  // GET /api/universities/student/:studentId
  getUniversitiesByStudentId = async (c: Context) => {
    try {
      const studentId = c.req.param('studentId');
      if (!studentId) {
        return c.json({ success: false, error: 'Student ID is required' }, 400);
      }
      const university = await dashboardService.getUniversityByStudentId(studentId);
      return c.json({ success: true, data: university });
    } catch (error: any) {
      console.error('Error fetching university by student ID:', error);
      if (error.message === 'Student not found') {
        return c.json({ success: false, error: 'Student not found' }, 404);
      }
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

  // GET /api/programs/student/:studentId
  getProgramsByStudentId = async (c: Context) => {
    try {
      const studentId = c.req.param('studentId');
      if (!studentId) {
        return c.json({ success: false, error: 'Student ID is required' }, 400);
      }
      const program = await dashboardService.getProgramByStudentId(studentId);
      return c.json({ success: true, data: program });
    } catch (error: any) {
      console.error('Error fetching program by student ID:', error);
      if (error.message === 'Student not found') {
        return c.json({ success: false, error: 'Student not found' }, 404);
      }
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

  // GET /api/risk-levels/student/:studentId
  getRiskLevelByStudentId = async (c: Context) => {
    try {
      const studentId = c.req.param('studentId');
      if (!studentId) {
        return c.json({ success: false, error: 'Student ID is required' }, 400);
      }
      const riskLevel = await dashboardService.getRiskLevelByStudentId(studentId);
      return c.json({ success: true, data: riskLevel });
    } catch (error: any) {
      console.error('Error fetching risk level by student ID:', error);
      if (error.message === 'Student not found') {
        return c.json({ success: false, error: 'Student not found' }, 404);
      }
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

  // GET /api/logs
  getLogs = async (c: Context) => {
    return c.json({ success: true, count: 0, data: [] });
  };

  // PUT /api/logs/:id/status
  updateLogStatus = async (c: Context) => {
    return c.json({ success: true, message: 'Log status updated successfully' });
  };

  // GET /api/dashboard/students - Get students formatted for dashboard table
  getStudentsForDashboard = async (c: Context) => {
    try {
      const filters = c.req.query();
      const students = await dashboardService.getStudentsForDashboard(filters);
      return c.json({
        success: true,
        count: students.length,
        data: students
      });
    } catch (error: any) {
      console.error('Error fetching students for dashboard:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/dashboard/student-management - Get student management statistics
  getStudentManagementStats = async (c: Context) => {
    try {
      const stats = await dashboardService.getStudentManagementStats();
      return c.json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Error fetching student management stats:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/dashboard/search - Search students by keyword
  searchStudents = async (c: Context) => {
    try {
      const keyword = c.req.query('q') || c.req.query('keyword') || '';
      const filters = c.req.query();
      
      if (!keyword.trim()) {
        return c.json({ success: false, error: 'Keyword is required for search' }, 400);
      }

      const students = await dashboardService.searchStudents(keyword, filters);
      return c.json({
        success: true,
        count: students.length,
        keyword: keyword,
        data: students
      });
    } catch (error: any) {
      console.error('Error searching students:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };

  // GET /api/dashboard/export - Export students to XLSX format
  exportStudents = async (c: Context) => {
    try {
      const filters = c.req.query();
      const format = (c.req.query('format') || 'xlsx').toLowerCase();
      
      const students = await dashboardService.getStudentsForExport(filters);
      
      if (format === 'xlsx') {
        // Generate XLSX content
        const xlsxData = dashboardService.generateXLSX(students);
        c.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        c.header('Content-Disposition', `attachment; filename=Students_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
        return c.body(xlsxData);
      } else if (format === 'csv') {
        // Generate CSV content
        const csv = dashboardService.generateCSV(students);
        c.header('Content-Type', 'text/csv');
        c.header('Content-Disposition', `attachment; filename=Students_Export_${new Date().toISOString().split('T')[0]}.csv`);
        return c.text(csv);
      } else {
        // Return JSON
        return c.json({ 
          success: true, 
          count: students.length, 
          exportedAt: new Date().toISOString(),
          format: format,
          data: students 
        });
      }
    } catch (error: any) {
      console.error('Error exporting students:', error);
      return c.json({ success: false, error: 'Internal Server Error' }, 500);
    }
  };
}

export const dashboardController = new DashboardController();
