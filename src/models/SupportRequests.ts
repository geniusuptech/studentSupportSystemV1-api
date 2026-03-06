export interface SupportRequests {
    requestId: number;
    totalRequests: number;
    openRequests: number;
    inProgressRequests: number;
    completedRequests: number;
    urgentAlerts: number;
    filters: {
        status: Array<{
            status: 'Open' | 'In Progress' | 'Completed';
            count: number;
        }>;
        priority: Array<{
            priority: 'Low' | 'Medium' | 'High';
            count: number;
        }>;
        type: Array<{
            type: 'Academic' | 'Welness' | 'Technical' | 'Financial';
            count: number;
        }>;
    }
}