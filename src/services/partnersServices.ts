import { partnersRepository } from '../repository/partnersRepository';
import { Partner } from '../models/Partner';

export class PartnersService {
  async getAllPartners(filters: any): Promise<(Partner & { ActiveRequestCount: number })[]> {
    return partnersRepository.getAllPartners(filters);
  }

  async getPartnerById(id: number): Promise<Partner | undefined> {
    const partner = await partnersRepository.getPartnerById(id);
    if (!partner.length) throw new Error('Partner not found');
    return partner[0];
  }

  // Add other service methods as needed
}

export const partnersService = new PartnersService();