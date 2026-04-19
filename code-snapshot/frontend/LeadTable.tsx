// apps/cms-next/components/leads/LeadTable.tsx
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useCustomQuery } from '@deassists/react-query';
import StatusBadge from './StatusBadge';
import { crmTokens } from '../../styles/crmTokens';
import dayjs from 'dayjs';

interface Lead {
  _id: string;
  lead_id: string;
  date: string;
  full_name: string;
  whatsapp: string;
  email: string;
  service: string;
  source: string;
  status: string;
  queue: string;
  assigned_to: string;
}

interface LeadTableProps {
  queue: string | null;
  status: string | null;
  search: string;
  selectedLeadId: string | null;
  onSelectLead: (lead: Lead) => void;
}

const LeadTable = ({
  queue,
  status,
  search,
  selectedLeadId,
  onSelectLead,
}: LeadTableProps) => {
  const { data, isLoading } = useCustomQuery<Lead[]>(
    ['leads', queue, status, search],
    '/v1/leads',
    {},
    {
      params: {
        ...(queue && { queue }),
        ...(status && { status }),
        ...(search && { search }),
      },
    },
  );

  const leads: Lead[] = data?.data ?? [];

  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      {/* Table content */}
      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            p: 4,
            backgroundColor: crmTokens.wh,
            flex: 1,
          }}
        >
          <CircularProgress size={28} sx={{ color: crmTokens.g }} />
        </Box>
      ) : leads.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: crmTokens.wh,
            flex: 1,
          }}
        >
          <Typography
            sx={{
              fontSize: '13px',
              color: crmTokens.t3,
              fontFamily: crmTokens.fontBody,
            }}
          >
            No leads found in this queue.
          </Typography>
        </Box>
      ) : (
        <TableContainer
          sx={{
            flex: 1,
            overflowY: 'auto',
            backgroundColor: crmTokens.wh,
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  'Lead ID',
                  'Date',
                  'Name',
                  'WhatsApp',
                  'Service',
                  'Source',
                  'Status',
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      backgroundColor: crmTokens.cr,
                      borderBottom: `2px solid ${crmTokens.bd}`,
                      py: '9px',
                      px: '12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: crmTokens.t3,
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                      fontFamily: crmTokens.fontBody,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(Array.isArray(leads) ? leads : []).map((lead) => {
                const isSelected = selectedLeadId === lead._id;
                return (
                  <TableRow
                    key={lead._id}
                    onClick={() => onSelectLead(lead)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? crmTokens.gx
                        : 'transparent',
                      borderBottom: `1px solid ${crmTokens.bd}`,
                      transition: 'background 0.08s',
                      '&:hover': {
                        backgroundColor: isSelected
                          ? crmTokens.gx
                          : crmTokens.cr,
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontFamily: "'Courier New', monospace",
                        fontSize: '11px',
                        color: crmTokens.t3,
                        fontWeight: 600,
                      }}
                    >
                      {lead.lead_id}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontSize: '12px',
                        color: crmTokens.t3,
                        fontFamily: crmTokens.fontBody,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {dayjs(lead.date).format('MMM D, YYYY')}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: crmTokens.t1,
                        fontFamily: crmTokens.fontBody,
                      }}
                    >
                      {lead.full_name}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontSize: '13px',
                        color: crmTokens.t1,
                        fontFamily: crmTokens.fontBody,
                      }}
                    >
                      {lead.whatsapp}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontSize: '12px',
                        color: crmTokens.t2,
                        fontFamily: crmTokens.fontBody,
                      }}
                    >
                      {lead.service}
                    </TableCell>
                    <TableCell
                      sx={{
                        py: '10px',
                        px: '12px',
                        fontSize: '12px',
                        color: crmTokens.t2,
                        fontFamily: crmTokens.fontBody,
                      }}
                    >
                      {lead.source}
                    </TableCell>
                    <TableCell sx={{ py: '10px', px: '12px' }}>
                      <StatusBadge status={lead.status} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LeadTable;
export type { Lead };
