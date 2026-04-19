import { Injectable } from '@nestjs/common';

@Injectable()
export class LeadsRoutingService {
  route(lead: {
    service?: string;
    source?: string;
    source_detail?: string;
  }): string {
    // Rule 1: Accommodation service → Accommodation queue
    if (lead.service === 'Accommodation') {
      return 'ACCOMMODATION';
    }

    // Rule 2: BCBT partner source → BCBT queue
    if (lead.source === 'Partner' && lead.source_detail === 'BCBT') {
      return 'BCBT';
    }

    // Rule 3: All other leads → 369 Main queue
    // Manager assigns to Don/Sajir via assigned_to field
    return '369_MAIN';
  }
}
