import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadIdService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leadModel: Model<Lead>,
  ) {}

  async generate(creationDate: Date): Promise<string> {
    const yyyy = creationDate.getFullYear();
    const mm = String(creationDate.getMonth() + 1).padStart(2, '0');
    const prefix = `DA-${yyyy}-${mm}-`;

    let count: number;
    try {
      count = await this.leadModel.countDocuments({
        lead_id: { $regex: new RegExp(`^${prefix}`) },
      });
    } catch (err) {
      throw new InternalServerErrorException(
        `Failed to generate lead ID: could not query existing leads — ${err.message}`,
      );
    }

    const sequence = String(count + 1).padStart(3, '0');
    return `${prefix}${sequence}`;
  }
}
