import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './entities/lead.entity';
import { LeadIdService } from './lead-id.service';
import { LeadsRoutingService } from './leads-routing.service';

const ROUTING_FIELDS = [
  'service',
  'status',
  'assigned_to',
  'source',
  'source_detail',
];
const PAGE_SIZE = 50;

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name)
    private readonly leadModel: Model<LeadDocument>,
    private readonly leadIdService: LeadIdService,
    private readonly routingService: LeadsRoutingService,
  ) {}

  async create(dto: any): Promise<LeadDocument> {
    const existing = await this.leadModel.findOne({
      whatsapp: dto.whatsapp,
      is_archived: { $ne: true },
    });
    if (existing) {
      throw new ConflictException({
        message: 'A lead with this WhatsApp number already exists',
        lead_id: existing.lead_id,
        full_name: existing.full_name,
      });
    }

    const creationDate = dto.date ? new Date(dto.date) : new Date();
    const lead_id = await this.leadIdService.generate(creationDate);
    const queue = this.routingService.route(dto);

    const lead = await this.leadModel.create({
      ...dto,
      lead_id,
      queue,
      is_archived: false,
    });
    return lead;
  }

  async list(
    query: any,
  ): Promise<{ data: LeadDocument[]; total: number; page: number }> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Number(query.limit) || PAGE_SIZE;
    const filter: any = { is_archived: { $ne: true } };

    if (query.queue) filter.queue = query.queue;
    if (query.status) filter.status = query.status;
    if (query.service) filter.service = query.service;
    if (query.search) {
      const rx = new RegExp(query.search, 'i');
      filter.$or = [{ full_name: rx }, { whatsapp: rx }];
    }

    const [data, total] = await Promise.all([
      this.leadModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.leadModel.countDocuments(filter),
    ]);

    return { data, total, page };
  }

  async getOne(id: string): Promise<LeadDocument> {
    const lead = await this.leadModel.findById(id);
    if (!lead) throw new NotFoundException(`Lead ${id} not found`);
    return lead;
  }

  async update(id: string, dto: any): Promise<LeadDocument> {
    const { lead_id, comments, ...fields } = dto;

    const current = await this.leadModel.findById(id).lean();
    if (!current) throw new NotFoundException(`Lead ${id} not found`);

    const needsReroute = ROUTING_FIELDS.some(
      (f) => f in fields && fields[f] !== current[f],
    );

    if (needsReroute) {
      const merged = { ...current, ...fields };
      fields.queue = this.routingService.route(merged);
    }

    const updated = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: fields },
      { new: true, runValidators: true },
    );
    if (!updated) throw new NotFoundException(`Lead ${id} not found`);
    return updated;
  }

  async addComment(
    id: string,
    body: { text: string; author?: string },
  ): Promise<LeadDocument> {
    const comment = {
      text: body.text,
      author: body.author ?? 'Unknown',
      timestamp: new Date(),
    };

    const updated = await this.leadModel.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true },
    );
    if (!updated) throw new NotFoundException(`Lead ${id} not found`);
    return updated;
  }

  async getQueueCounts(): Promise<Record<string, number>> {
    const queues = [
      '369_CALL_CENTER',
      '369_CALL_CENTER_FU',
      'BCBT_CALL_CENTER',
      'BCBT_FOLLOW_UP',
      'DON',
      'ACCOMMODATION',
      'SAJIR',
      'UNROUTED',
    ];

    const results = await this.leadModel.aggregate([
      { $match: { is_archived: { $ne: true }, status: { $ne: 'Completed' } } },
      { $group: { _id: '$queue', count: { $sum: 1 } } },
    ]);

    const counts: Record<string, number> = Object.fromEntries(
      queues.map((q) => [q, 0]),
    );
    for (const r of results) {
      if (r._id in counts) counts[r._id] = r.count;
    }
    return counts;
  }

  async getStats(): Promise<{
    total_active: number;
    by_status: Record<string, number>;
    by_queue: Record<string, number>;
  }> {
    const baseMatch = { is_archived: { $ne: true } };

    const [totalActive, byStatus, byQueue] = await Promise.all([
      this.leadModel.countDocuments({
        ...baseMatch,
        status: { $ne: 'Completed' },
      }),
      this.leadModel.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.leadModel.aggregate([
        { $match: { ...baseMatch, status: { $ne: 'Completed' } } },
        { $group: { _id: '$queue', count: { $sum: 1 } } },
      ]),
    ]);

    return {
      total_active: totalActive,
      by_status: Object.fromEntries(
        byStatus.map((r) => [r._id ?? 'Unknown', r.count]),
      ),
      by_queue: Object.fromEntries(
        byQueue.map((r) => [r._id ?? 'Unknown', r.count]),
      ),
    };
  }

  async exportLeads(query: any): Promise<LeadDocument[]> {
    const filter: any = { is_archived: { $ne: true } };

    if (query.queue) filter.queue = query.queue;
    if (query.status) filter.status = query.status;
    if (query.service) filter.service = query.service;
    if (query.search) {
      const rx = new RegExp(query.search, 'i');
      filter.$or = [{ full_name: rx }, { whatsapp: rx }];
    }

    return this.leadModel.find(filter).sort({ createdAt: -1 });
  }

  async convert(id: string): Promise<LeadDocument> {
    const updated = await this.leadModel.findByIdAndUpdate(
      id,
      { $set: { status: 'Completed', is_archived: true } },
      { new: true },
    );
    if (!updated) throw new NotFoundException(`Lead ${id} not found`);
    return updated;
  }

  async logCall(
    id: string,
    body: {
      outcome: string;
      callback_at?: string;
      callback_note?: string;
    },
  ): Promise<LeadDocument> {
    const lead = await this.leadModel.findById(id);
    if (!lead) throw new NotFoundException('Lead not found');

    // Increment attempts and set last called
    lead.call_attempts = (lead.call_attempts || 0) + 1;
    lead.last_called_at = new Date();
    lead.last_outcome = body.outcome;

    // Set callback fields if provided
    if (body.callback_at) lead.callback_at = new Date(body.callback_at);
    if (body.callback_note) lead.callback_note = body.callback_note;

    // Auto-update status based on outcome
    const attempts = lead.call_attempts;
    switch (body.outcome) {
      case 'no_answer':
        if (attempts === 1) lead.status = 'Called 1';
        else if (attempts === 2) lead.status = 'Called 2';
        else if (attempts >= 3) lead.status = 'Called 3';
        break;
      case 'interested':
      case 'not_now':
        lead.status = 'Follow Up';
        break;
      case 'converted':
        lead.status = 'Converted';
        lead.is_archived = true;
        break;
      case 'lost':
        lead.status = 'Lost';
        lead.is_archived = true;
        break;
      case 'wrong_lead':
        // Keep status, just log it
        break;
    }

    return lead.save();
  }
}
