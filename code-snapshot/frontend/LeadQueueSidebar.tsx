// apps/cms-next/components/leads/LeadQueueSidebar.tsx
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
} from '@mui/material';
import { useCustomQuery } from '@deassists/react-query';
import { queueLabels } from './QueueBadge';
import { crmTokens } from '../../styles/crmTokens';

interface QueueCount {
  queue: string;
  count: number;
}

interface LeadQueueSidebarProps {
  selectedQueue: string | null;
  onSelectQueue: (queue: string) => void;
  allowedQueues?: string[];
}

const LeadQueueSidebar = ({
  selectedQueue,
  onSelectQueue,
  allowedQueues,
}: LeadQueueSidebarProps) => {
  const { data, isLoading } = useCustomQuery<QueueCount[]>(
    ['leadQueueCounts'],
    '/v1/leads/queues',
    { refetchInterval: 30000 },
  );

  const rawData = data?.data;
  const queues: QueueCount[] = Array.isArray(rawData) ? rawData : [];

  const filteredQueues = allowedQueues
    ? queues.filter((q) => allowedQueues.includes(q.queue))
    : queues;

  return (
    <Box
      sx={{
        width: crmTokens.sidebar,
        minWidth: crmTokens.sidebar,
        flexShrink: 0,
        backgroundColor: crmTokens.wh,
        borderRight: `1px solid ${crmTokens.bd}`,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Section label */}
      <Box sx={{ py: 1, borderBottom: `1px solid ${crmTokens.bd}` }}>
        <Typography
          sx={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.8px',
            color: crmTokens.t4,
            px: '14px',
            py: '6px',
            textTransform: 'uppercase',
            fontFamily: crmTokens.fontBody,
          }}
        >
          Queues
        </Typography>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={24} sx={{ color: crmTokens.g }} />
        </Box>
      ) : (
        <List disablePadding>
          {filteredQueues.map((q) => {
            const isSelected = selectedQueue === q.queue;
            return (
              <ListItemButton
                key={q.queue}
                selected={isSelected}
                onClick={() => onSelectQueue(q.queue)}
                sx={{
                  px: '14px',
                  py: '8px',
                  borderLeft: '3px solid',
                  borderLeftColor: isSelected ? crmTokens.g : 'transparent',
                  backgroundColor: isSelected ? crmTokens.gx : 'transparent',
                  '&:hover': {
                    backgroundColor: isSelected ? crmTokens.gx : crmTokens.cr,
                  },
                  '&.Mui-selected': {
                    backgroundColor: crmTokens.gx,
                    '&:hover': {
                      backgroundColor: crmTokens.gx,
                    },
                  },
                }}
              >
                <ListItemText
                  primary={queueLabels[q.queue] || q.queue}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '13px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? crmTokens.g : crmTokens.t2,
                      fontFamily: crmTokens.fontBody,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
                {/* Count badge */}
                <Box
                  sx={{
                    minWidth: '20px',
                    px: '6px',
                    py: '1px',
                    borderRadius: '10px',
                    backgroundColor: isSelected
                      ? 'rgba(29,122,69,.15)'
                      : crmTokens.cd,
                    color: isSelected ? crmTokens.g : crmTokens.t2,
                    fontSize: '11px',
                    fontWeight: 700,
                    textAlign: 'center',
                    fontFamily: crmTokens.fontBody,
                  }}
                >
                  {q.count}
                </Box>
              </ListItemButton>
            );
          })}
          {filteredQueues.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography
                sx={{
                  fontSize: '13px',
                  color: crmTokens.t3,
                  fontFamily: crmTokens.fontBody,
                }}
              >
                No queues available.
              </Typography>
            </Box>
          )}
        </List>
      )}
    </Box>
  );
};

export default LeadQueueSidebar;
