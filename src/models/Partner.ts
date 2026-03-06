export interface Partner {
  PartnerID: number;
  PartnerName: string;
  PartnerType: string;
  Specialization: string;
  ContactEmail: string;
  ContactPhone?: string;
  IsAvailable: boolean;
  MaxCapacity: number;
  CurrentWorkload: number;
  Rating: number;
  YearsOfExperience: number;
  HourlyRate?: number;
  Location?: string;
  CreatedAt: string;
  UpdatedAt: string;
}