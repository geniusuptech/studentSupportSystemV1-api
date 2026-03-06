export interface Partners {
    PartnerID: number;
    PartnerName: string;
    totalPartners: number;
    availablePartners: number;
    welnesHubs: number;
    averageRating: number;
    totalSessions: number;
    filters: {
        partnerType: Array<{
            allPartnerTypes: Array<{
                partnerType: string;
                count: number;
            }>;
            academicPartners: Array<{
                partnerType: string;
                count: number;     
           }>;
            wellnessPartners: Array<{
                partnerType: string;
                count: number;
            }>;
            technicalPartners: Array<{
                partnerType: string;
                count: number;
            }>;
            financialPartners: Array<{
                partnerType: string;
                count: number;
            }>;
        }>;
        specialization: Array<{
            allSpecializations: Array<{
                specialization: string;
                count: number;
            }>;
        }>;
    }
    type: Array<{
        partnerType: string;
        count: number;
    }>;
    status: Array<{
        isAvailable: boolean;
        isOffline: boolean;
        count: number;
    }>;
}

    export interface PartnerDashboardResponse {
  partnerId: number;
  partnerName: string;
  assignedRequests: Array<{
    requestId: number;
    studentName: string;
    category: string;
    status: string;
    createdAt: string;
  }>;
  workloadStats: {
    totalAssigned: number;
    open: number;
    closed: number;
    pending: number;
  };
  recentSessions: Array<{
    sessionId: number;
    studentName: string;
    date: string;
    notes: string;
  }>;
}
    