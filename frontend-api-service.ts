// =============================================================================
// API Service for Student Wellness Dashboard
// =============================================================================
// Copy this file to your React project: src/services/api.ts
// 
// Environment variable needed in your React app:
//   REACT_APP_API_URL=http://localhost:3001/api
// =============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// =============================================================================
// Types
// =============================================================================

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  student?: {
    studentId: number;
    studentName: string;
    studentNumber: string;
    email: string;
    universityId: number;
    universityName: string;
    programId: number;
    programName: string;
    riskLevel: string;
  };
}

export interface Student {
  StudentID: number;
  StudentName: string;
  StudentNumber: string;
  UniversityID: number;
  UniversityName?: string;
  ProgramID: number;
  ProgramName?: string;
  YearOfStudy: number;
  GPA: number;
  RiskLevel: 'Safe' | 'At Risk' | 'Critical';
  ContactEmail: string;
  ContactPhone?: string;
  Module1?: string;
  Module2?: string;
  Module3?: string;
  Module4?: string;
  IsActive: boolean;
}

export interface SupportRequest {
  RequestID: number;
  StudentID: number;
  StudentName?: string;
  CategoryID: number;
  CategoryName?: string;
  Title: string;
  Description: string;
  Priority: 'Low' | 'Medium' | 'High' | 'Critical';
  Status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  AssignedPartnerID?: number;
  PartnerName?: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface Partner {
  PartnerID: number;
  PartnerName: string;
  PartnerType: string;
  Specialization?: string;
  ContactEmail: string;
  ContactPhone?: string;
  IsAvailable: boolean;
  MaxCapacity: number;
  CurrentWorkload: number;
  Rating: number;
}

export interface DashboardSummary {
  totalStudents: number;
  activeStudents: number;
  criticalRisk: number;
  atRisk: number;
  safe: number;
  openRequests: number;
  resolvedRequests: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

const getAuthHeaders = (token?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  if (!response.ok) {
    return {
      success: false,
      error: data.message || data.error || 'An error occurred',
    };
  }
  return {
    success: true,
    data,
  };
};

// =============================================================================
// Authentication API
// =============================================================================

export const authApi = {
  /**
   * Student login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE_URL}/student-auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  /**
   * Coordinator/Admin login
   */
  async coordinatorLogin(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },

  /**
   * Change password
   */
  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    return response.json();
  },

  /**
   * Logout
   */
  async logout(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
    });
    return response.json();
  },
};

// =============================================================================
// Students API
// =============================================================================

export const studentsApi = {
  /**
   * Get all students
   */
  async getAll(token?: string): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/students`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get student by ID
   */
  async getById(id: number, token?: string): Promise<Student> {
    const response = await fetch(`${API_BASE_URL}/students/${id}`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get students by risk level
   */
  async getByRiskLevel(level: 'Safe' | 'At Risk' | 'Critical', token?: string): Promise<Student[]> {
    const response = await fetch(`${API_BASE_URL}/students/risk/${encodeURIComponent(level)}`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get student statistics
   */
  async getStatistics(token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/students/statistics`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },

  /**
   * Update student risk level
   */
  async updateRiskLevel(studentId: number, riskLevel: string, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/students/${studentId}/risk`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ riskLevel }),
    });
    return response.json();
  },
};

// =============================================================================
// Support Requests API
// =============================================================================

export const supportRequestsApi = {
  /**
   * Get all support requests
   */
  async getAll(token?: string): Promise<SupportRequest[]> {
    const response = await fetch(`${API_BASE_URL}/support-requests`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get support request by ID
   */
  async getById(id: number, token?: string): Promise<SupportRequest> {
    const response = await fetch(`${API_BASE_URL}/support-requests/${id}`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Create a new support request
   */
  async create(request: {
    studentId: number;
    categoryId: number;
    title: string;
    description: string;
    priority?: string;
  }, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/support-requests`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    });
    return response.json();
  },

  /**
   * Assign partner to support request
   */
  async assignPartner(requestId: number, partnerId: number, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/support-requests/${requestId}/assign`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ partnerId }),
    });
    return response.json();
  },

  /**
   * Update support request status
   */
  async updateStatus(requestId: number, status: string, notes?: string, token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/support-requests/${requestId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(token),
      body: JSON.stringify({ status, notes }),
    });
    return response.json();
  },

  /**
   * Get support request statistics
   */
  async getStatistics(token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/support-requests/statistics`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },
};

// =============================================================================
// Partners API
// =============================================================================

export const partnersApi = {
  /**
   * Get all partners
   */
  async getAll(type?: string, token?: string): Promise<Partner[]> {
    const url = type 
      ? `${API_BASE_URL}/partners?type=${encodeURIComponent(type)}`
      : `${API_BASE_URL}/partners`;
    const response = await fetch(url, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get partner by ID
   */
  async getById(id: number, token?: string): Promise<Partner> {
    const response = await fetch(`${API_BASE_URL}/partners/${id}`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get available partners
   */
  async getAvailable(token?: string): Promise<Partner[]> {
    const response = await fetch(`${API_BASE_URL}/partners/available`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get partner workload statistics
   */
  async getWorkload(token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/partners/workload`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },

  /**
   * Get partner statistics
   */
  async getStatistics(token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/partners/statistics`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },

  /**
   * Get partner types
   */
  async getTypes(token?: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/partners/types`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },
};

// =============================================================================
// Dashboard API
// =============================================================================

export const dashboardApi = {
  /**
   * Get dashboard summary
   */
  async getSummary(token?: string): Promise<DashboardSummary> {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get risk distribution
   */
  async getRiskDistribution(token?: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/dashboard/risk-distribution`, {
      headers: getAuthHeaders(token),
    });
    return response.json();
  },
};

// =============================================================================
// Interventions API
// =============================================================================

export const interventionsApi = {
  /**
   * Get active interventions
   */
  async getActive(token?: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/interventions/active`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Create an intervention
   */
  async create(intervention: {
    studentId: number;
    type: string;
    description: string;
    priority?: string;
  }, token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/interventions`, {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(intervention),
    });
    return response.json();
  },
};

// =============================================================================
// Reference Data API
// =============================================================================

export const referenceApi = {
  /**
   * Get all universities
   */
  async getUniversities(token?: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/universities`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get all programs
   */
  async getPrograms(token?: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/programs`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },

  /**
   * Get risk levels
   */
  async getRiskLevels(token?: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/risk-levels`, {
      headers: getAuthHeaders(token),
    });
    const data = await response.json();
    return data.data || data;
  },
};

// =============================================================================
// Reports API
// =============================================================================

export const reportsApi = {
  /**
   * Export students data
   */
  async exportStudents(token: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/students/export`, {
      headers: getAuthHeaders(token),
    });
    return response.blob();
  },
};

// =============================================================================
// Combined API object for convenience
// =============================================================================

export const api = {
  auth: authApi,
  students: studentsApi,
  supportRequests: supportRequestsApi,
  partners: partnersApi,
  dashboard: dashboardApi,
  interventions: interventionsApi,
  reference: referenceApi,
  reports: reportsApi,
};

export default api;
