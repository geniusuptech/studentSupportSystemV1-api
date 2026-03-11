import { coordinatorsRepository } from '../repository/coordinatorsRepository';

interface CoordinatorDashboard {
  totalStudents: number;
  atRiskStudents: number;
  averageGPA: number;
  activeInterventions: number;
  riskDistribution: {
    safe: number;
    atRisk: number;
    critical: number;
  };
  recentActivity: any[];
  notifications: any[];
}

interface CoordinatorStatistics {
  timeframe: string;
  studentStats: {
    totalEnrolled: number;
    newEnrollments: number;
    graduations: number;
    withdrawals: number;
  };
  academicStats: {
    averageGPA: number;
    gpaImprovement: number;
    courseCompletionRate: number;
  };
  supportStats: {
    totalRequests: number;
    resolvedRequests: number;
    averageResolutionTime: number;
    satisfactionRating: number;
  };
  riskTrends: any[];
}

export class CoordinatorService {
  
  async getDashboardData(coordinatorID: number): Promise<CoordinatorDashboard> {
    try {
      const dashboard = await coordinatorsRepository.getDashboardData(coordinatorID);
      return dashboard;
    } catch (error) {
      console.error('Error getting coordinator dashboard:', error);
      throw new Error('Failed to retrieve dashboard data');
    }
  }

  async getCoordinatorProfile(coordinatorID: number): Promise<any> {
    try {
      const profile = await coordinatorsRepository.getCoordinatorById(coordinatorID);
      return profile;
    } catch (error) {
      console.error('Error getting coordinator profile:', error);
      throw new Error('Failed to retrieve coordinator profile');
    }
  }

  async updateCoordinatorProfile(coordinatorID: number, updateData: any): Promise<any> {
    try {
      const updatedProfile = await coordinatorsRepository.updateCoordinator(coordinatorID, updateData);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating coordinator profile:', error);
      throw new Error('Failed to update coordinator profile');
    }
  }

  async getStudents(coordinatorID: number, filters: any): Promise<any[]> {
    try {
      const students = await coordinatorsRepository.getStudentsByCoordinator(coordinatorID, filters);
      return students;
    } catch (error) {
      console.error('Error getting coordinator students:', error);
      throw new Error('Failed to retrieve students');
    }
  }

  async getStatistics(coordinatorID: number, timeframe: string): Promise<CoordinatorStatistics> {
    try {
      const statistics = await coordinatorsRepository.getCoordinatorStatistics(coordinatorID, timeframe);
      return statistics;
    } catch (error) {
      console.error('Error getting coordinator statistics:', error);
      throw new Error('Failed to retrieve statistics');
    }
  }

  async getSupportRequests(coordinatorID: number, filters: any): Promise<any[]> {
    try {
      const requests = await coordinatorsRepository.getSupportRequestsByCoordinator(coordinatorID, filters);
      return requests;
    } catch (error) {
      console.error('Error getting coordinator support requests:', error);
      throw new Error('Failed to retrieve support requests');
    }
  }

  async assignPartnerToStudent(
    coordinatorID: number, 
    studentID: number, 
    partnerID: number, 
    requestType: string,
    priority?: string,
    description?: string
  ): Promise<any> {
    try {
      const assignment = await coordinatorsRepository.assignPartnerToStudent(
        coordinatorID,
        studentID,
        partnerID,
        requestType,
        priority || 'Medium',
        description || `${requestType} support assigned by coordinator`
      );
      return assignment;
    } catch (error) {
      console.error('Error assigning partner to student:', error);
      throw new Error('Failed to assign partner to student');
    }
  }
}

export const coordinatorService = new CoordinatorService();