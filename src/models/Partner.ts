export interface Partner {
  id: string;
  name: string;
  type: 'Individual' | 'Organization';
  role: string;
  specialization: string;
  status: string;
  rating: number;
  ratingCount: number;
  activeClients: number;
  defaultRate: number;
  email: string;
  phone?: string;
  website?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}