import { partnersRepository } from '../repository/partnersRepository';
import { Partner } from '../models/Partner';

export class PartnersService {
  async getAllPartners(filters: any): Promise<(Partner & { ActiveRequestCount: number })[]> {
    return partnersRepository.getAllPartners(filters);
  }

  async getPartnerById(id: string): Promise<Partner | undefined> {
    const partner = await partnersRepository.getPartnerById(id);
    if (!partner) throw new Error('Partner not found');
    return partner;
  }

  // Add other service methods as needed
}

export const partnersService = new PartnersService();