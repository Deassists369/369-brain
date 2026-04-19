import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Prop } from '../../types/mongoose.types';
import { CollectionNames } from '@constants/collections';
import { FieldTypes } from '@deassists/shared/interfaces/field.interface';
import { FieldGroups } from '@constants/field.groups';

export type LeadDocument = Lead & Document;

@Schema({
  timestamps: true,
  collection: CollectionNames.Leads,
})
export class Lead {
  @Prop({
    required: true,
    unique: true,
    field: FieldTypes.Text,
    defaultColumn: true,
    editable: false,
    group: FieldGroups.Basic,
    label: 'Lead ID',
  })
  lead_id: string;

  @Prop({
    required: true,
    type: Date,
    field: FieldTypes.DatePicker,
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Date',
  })
  date: Date;

  @Prop({
    required: false,
    field: FieldTypes.Select,
    enum: ['Partner', 'Portal', 'WhatsApp', 'Instagram', 'Phone', 'Other'],
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Source',
  })
  source: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Source Detail',
  })
  source_detail: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Agent Name',
  })
  agent_name: string;

  @Prop({
    required: true,
    field: FieldTypes.Text,
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Full Name',
  })
  full_name: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Place',
  })
  place: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Country Code',
  })
  country_code: string;

  @Prop({
    required: true,
    field: FieldTypes.Text,
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'WhatsApp',
  })
  whatsapp: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Email',
  })
  email: string;

  @Prop({
    required: false,
    field: FieldTypes.Select,
    enum: [
      'Private University',
      'Public University',
      'Accommodation',
      'Blocked Account',
      'Visa Services',
      'Insurance',
      'Spouse Visa',
      'Opportunity Card',
      'FSJ',
      'Au Pair',
      'Ausbildung',
      'Full Time Job',
      'Part Time Job',
      'Document Translation',
      'Other',
    ],
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Service',
  })
  service: string;

  @Prop({
    required: false,
    field: FieldTypes.Select,
    // Populate with CRM agent names
    enum: [],
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Assigned To',
  })
  assigned_to: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.AdditionalData,
    label: 'University Interest',
  })
  university_interest: string;

  @Prop({
    required: false,
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.AdditionalData,
    label: 'Intake',
  })
  intake: string;

  @Prop({
    required: false,
    default: [],
    field: FieldTypes.Comments,
    type: [
      {
        text: String,
        author: String,
        timestamp: Date,
      },
    ],
    group: FieldGroups.Comments,
    label: 'Comments',
  })
  comments: { text: string; author: string; timestamp: Date }[];

  @Prop({
    required: false,
    field: FieldTypes.Select,
    enum: [
      'New',
      'Follow Up',
      'Called 1',
      'Called 2',
      'Called 3',
      'Converted',
      'Lost',
    ],
    default: 'New',
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Status',
  })
  status: string;

  @Prop({
    required: false,
    field: FieldTypes.Select,
    enum: ['369_MAIN', 'BCBT', 'ACCOMMODATION', 'UNROUTED'],
    defaultColumn: true,
    group: FieldGroups.Basic,
    label: 'Queue',
  })
  queue: string;

  @Prop({
    required: false,
    default: false,
    field: FieldTypes.Boolean,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Archived',
  })
  is_archived: boolean;

  @Prop({
    required: false,
    default: 0,
    field: FieldTypes.Number,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Call Attempts',
  })
  call_attempts: number;

  @Prop({
    required: false,
    default: null,
    type: Date,
    field: FieldTypes.DatePicker,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Last Called At',
  })
  last_called_at: Date | null;

  @Prop({
    required: false,
    default: null,
    field: FieldTypes.Select,
    enum: [
      'no_answer',
      'interested',
      'not_now',
      'wrong_lead',
      'converted',
      'lost',
    ],
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Last Outcome',
  })
  last_outcome: string | null;

  @Prop({
    required: false,
    default: null,
    type: Date,
    field: FieldTypes.DatePicker,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Callback At',
  })
  callback_at: Date | null;

  @Prop({
    required: false,
    default: '',
    field: FieldTypes.Text,
    defaultColumn: false,
    group: FieldGroups.Basic,
    label: 'Callback Note',
  })
  callback_note: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
