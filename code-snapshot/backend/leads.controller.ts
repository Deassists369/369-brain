import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LeadsService } from './leads.service';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles/roles.guard';
import { Roles } from '../guards/roles/roles.decorator';
import { UserTypes } from '@constants/user.types';

@Controller('v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  // ── Static routes BEFORE /:id ──────────────────────────────────────────────

  @Get('queues')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  getQueueCounts() {
    return this.leadsService.getQueueCounts();
  }

  @Get('stats')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
    UserTypes.AGENT,
  )
  getStats() {
    return this.leadsService.getStats();
  }

  @Get('export')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
  )
  exportLeads(@Query() query: any) {
    return this.leadsService.exportLeads(query);
  }

  // ── Collection routes ──────────────────────────────────────────────────────

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  create(@Body() body: any) {
    return this.leadsService.create(body);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  list(@Query() query: any) {
    return this.leadsService.list(query);
  }

  // ── Dynamic :id routes AFTER static routes ─────────────────────────────────

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  getOne(@Param('id') id: string) {
    return this.leadsService.getOne(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  update(@Param('id') id: string, @Body() body: any) {
    return this.leadsService.update(id, body);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  addComment(@Param('id') id: string, @Body() body: any) {
    return this.leadsService.addComment(id, body);
  }

  @Post(':id/call-log')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.AGENT,
  )
  logCall(@Param('id') id: string, @Body() body: any) {
    return this.leadsService.logCall(id, body);
  }

  @Post(':id/convert')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(
    UserTypes.SUPER_ADMIN,
    UserTypes.ORG_ADMIN,
    UserTypes.MANAGER,
    UserTypes.LEAD_CRM,
    UserTypes.STAFF,
  )
  convert(@Param('id') id: string) {
    return this.leadsService.convert(id);
  }
}
