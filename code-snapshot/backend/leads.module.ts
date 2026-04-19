import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Lead, LeadSchema } from './entities/lead.entity';
import { LeadIdService } from './lead-id.service';
import { LeadsRoutingService } from './leads-routing.service';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { CommonModule } from '../modules/common-module/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lead.name, schema: LeadSchema }]),
    CommonModule,
  ],
  controllers: [LeadsController],
  providers: [LeadIdService, LeadsRoutingService, LeadsService],
  exports: [LeadsService],
})
export class LeadsModule {}
