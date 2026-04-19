// apps/cms-next/components/leads/LeadDetailPanel.tsx
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from 'react';
import { useCustomMutationV2 } from '@deassists/react-query';
import { useQueryClient } from '@tanstack/react-query';
import StatusBadge from './StatusBadge';
import QueueBadge from './QueueBadge';
import CommentThread from './CommentThread';
import type { Lead } from './LeadTable';
import { crmTokens } from '../../styles/crmTokens';
import dayjs from 'dayjs';

const STATUS_OPTIONS = [
  'Active',
  'Follow Up',
  'Called 1',
  'Called 2',
  'Called 3',
  'Hold',
  'Completed',
  'Lost',
];

const QUEUE_OPTIONS = [
  '369_CALL_CENTER',
  '369_CALL_CENTER_FU',
  'BCBT_CALL_CENTER',
  'BCBT_FOLLOW_UP',
  'DON',
  'SAJIR',
  'ACCOMMODATION',
  'UNROUTED',
];

interface LeadDetailPanelProps {
  lead: Lead | null;
  onClose: () => void;
}

// Shared input styles matching prototype
const inputSx = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: crmTokens.cr,
    borderRadius: crmTokens.r1,
    fontSize: '13px',
    fontFamily: crmTokens.fontBody,
    '& fieldset': {
      borderWidth: '1.5px',
      borderColor: crmTokens.bd,
    },
    '&:hover fieldset': {
      borderColor: crmTokens.bdd,
    },
    '&.Mui-focused fieldset': {
      borderColor: crmTokens.g,
    },
    '&.Mui-focused': {
      backgroundColor: crmTokens.wh,
    },
  },
  '& .MuiInputLabel-root': {
    fontSize: '11px',
    fontWeight: 700,
    color: crmTokens.t3,
    letterSpacing: '0.3px',
    fontFamily: crmTokens.fontBody,
  },
  '& .MuiInputBase-input': {
    padding: '8px 10px',
  },
};

const LeadDetailPanel = ({ lead, onClose }: LeadDetailPanelProps) => {
  const queryClient = useQueryClient();
  const { mutate, isLoading: isSaving } = useCustomMutationV2(
    `/v1/leads/${lead?._id}`,
    'PUT',
  );

  const [form, setForm] = useState({
    status: '',
    queue: '',
    assigned_to: '',
    service: '',
    university_interest: '',
    intake: '',
  });

  useEffect(() => {
    if (lead) {
      setForm({
        status: lead.status || '',
        queue: lead.queue || '',
        assigned_to: lead.assigned_to || '',
        service: lead.service || '',
        university_interest: (lead as any).university_interest || '',
        intake: (lead as any).intake || '',
      });
    }
  }, [lead]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!lead) return;
    mutate(form, {
      onSuccess: () => {
        queryClient.invalidateQueries(['leads']);
        queryClient.invalidateQueries(['leadQueueCounts']);
      },
    });
  };

  // Empty state
  if (!lead) {
    return (
      <Box
        sx={{
          width: crmTokens.panel,
          minWidth: crmTokens.panel,
          flexShrink: 0,
          backgroundColor: crmTokens.wh,
          borderLeft: `1px solid ${crmTokens.bd}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          p: '40px 20px',
          color: crmTokens.t3,
          textAlign: 'center',
        }}
      >
        <Box sx={{ fontSize: '44px', opacity: 0.4 }}>📋</Box>
        <Typography
          sx={{
            fontSize: '14px',
            fontWeight: 600,
            color: crmTokens.t2,
            fontFamily: crmTokens.fontBody,
          }}
        >
          No Lead Selected
        </Typography>
        <Typography
          sx={{
            fontSize: '13px',
            color: crmTokens.t3,
            fontFamily: crmTokens.fontBody,
          }}
        >
          Select a lead from the table to view details.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: crmTokens.panel,
        minWidth: crmTokens.panel,
        flexShrink: 0,
        backgroundColor: crmTokens.wh,
        borderLeft: `1px solid ${crmTokens.bd}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Dark header */}
      <Box
        sx={{
          backgroundColor: crmTokens.dk,
          px: 2,
          py: '14px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
          flexShrink: 0,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Lead ID in amber monospace */}
          <Typography
            sx={{
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: crmTokens.am,
              letterSpacing: '0.4px',
            }}
          >
            {lead.lead_id}
          </Typography>
          {/* Name in Fraunces */}
          <Typography
            sx={{
              fontSize: '16px',
              fontWeight: 700,
              color: '#fff',
              fontFamily: crmTokens.fontDisplay,
              mt: '2px',
            }}
          >
            {lead.full_name}
          </Typography>
          {/* Subtitle */}
          <Typography
            sx={{
              fontSize: '12px',
              color: 'rgba(255,255,255,0.5)',
              fontFamily: crmTokens.fontBody,
              mt: '3px',
            }}
          >
            {lead.service} • {lead.source}
          </Typography>
        </Box>
        {/* Close button */}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: 'rgba(255,255,255,0.35)',
            width: 26,
            height: 26,
            borderRadius: crmTokens.r1,
            flexShrink: 0,
            transition: 'all 0.12s',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        >
          <CloseIcon sx={{ fontSize: '18px' }} />
        </IconButton>
      </Box>

      {/* Tabs placeholder - cream background */}
      <Box
        sx={{
          display: 'flex',
          borderBottom: `1px solid ${crmTokens.bd}`,
          backgroundColor: crmTokens.cr,
          flexShrink: 0,
        }}
      >
        {['Details', 'Comments'].map((tab, i) => (
          <Box
            key={tab}
            sx={{
              flex: 1,
              py: '9px',
              px: '6px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: crmTokens.fontBody,
              color: i === 0 ? crmTokens.g : crmTokens.t3,
              borderBottom:
                i === 0 ? `2px solid ${crmTokens.g}` : '2px solid transparent',
              backgroundColor: i === 0 ? crmTokens.wh : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.14s',
            }}
          >
            {tab}
          </Box>
        ))}
      </Box>

      {/* Panel body - scrollable */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: '14px 16px',
        }}
      >
        {/* Badges row */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <StatusBadge status={lead.status} />
          <QueueBadge queue={lead.queue} />
        </Box>

        {/* Read-only info */}
        <Typography
          sx={{
            fontSize: '13px',
            color: crmTokens.t2,
            fontFamily: crmTokens.fontBody,
            mb: 0.5,
          }}
        >
          Date: {dayjs(lead.date).format('MMM D, YYYY')}
        </Typography>
        <Typography
          sx={{
            fontSize: '13px',
            color: crmTokens.t2,
            fontFamily: crmTokens.fontBody,
            mb: 0.5,
          }}
        >
          WhatsApp: {lead.whatsapp}
        </Typography>
        {lead.email && (
          <Typography
            sx={{
              fontSize: '13px',
              color: crmTokens.t2,
              fontFamily: crmTokens.fontBody,
              mb: 0.5,
            }}
          >
            Email: {lead.email}
          </Typography>
        )}

        {/* Section divider */}
        <Typography
          sx={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.7px',
            textTransform: 'uppercase',
            color: crmTokens.t3,
            fontFamily: crmTokens.fontBody,
            py: '12px',
            borderTop: `1px solid ${crmTokens.bd}`,
            mt: 2,
          }}
        >
          Update Lead
        </Typography>

        {/* Editable fields */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <TextField
            select
            label="Status"
            size="small"
            value={form.status}
            onChange={(e) => handleChange('status', e.target.value)}
            fullWidth
            sx={inputSx}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Queue"
            size="small"
            value={form.queue}
            onChange={(e) => handleChange('queue', e.target.value)}
            fullWidth
            sx={inputSx}
          >
            {QUEUE_OPTIONS.map((q) => (
              <MenuItem key={q} value={q}>
                {q}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Assigned To"
            size="small"
            value={form.assigned_to}
            onChange={(e) => handleChange('assigned_to', e.target.value)}
            fullWidth
            sx={inputSx}
          />

          <TextField
            label="Service"
            size="small"
            value={form.service}
            onChange={(e) => handleChange('service', e.target.value)}
            fullWidth
            sx={inputSx}
          />

          <TextField
            label="University Interest"
            size="small"
            value={form.university_interest}
            onChange={(e) =>
              handleChange('university_interest', e.target.value)
            }
            fullWidth
            sx={inputSx}
          />

          <TextField
            label="Intake"
            size="small"
            value={form.intake}
            onChange={(e) => handleChange('intake', e.target.value)}
            fullWidth
            sx={inputSx}
          />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: '10px 16px',
          borderTop: `1px solid ${crmTokens.bd}`,
          backgroundColor: crmTokens.cr,
          display: 'flex',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          fullWidth
          sx={{
            backgroundColor: crmTokens.g,
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: crmTokens.fontBody,
            borderRadius: crmTokens.r2,
            py: '7px',
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: crmTokens.gl,
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: crmTokens.bd,
              color: crmTokens.t3,
            },
          }}
          startIcon={
            isSaving ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>

      {/* Comments section */}
      <Box
        sx={{
          borderTop: `1px solid ${crmTokens.bd}`,
          p: 2,
          flexShrink: 0,
          maxHeight: 300,
          overflowY: 'auto',
        }}
      >
        <CommentThread leadId={lead._id} />
      </Box>
    </Box>
  );
};

export default LeadDetailPanel;
