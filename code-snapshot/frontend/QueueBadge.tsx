import Box from '@mui/material/Box';
import { crmTokens } from '../../styles/crmTokens';

const queueLabels: Record<string, string> = {
  '369_CALL_CENTER': '369 Call Center',
  '369_CALL_CENTER_FU': '369 Follow Up',
  BCBT_CALL_CENTER: 'BCBT Call Center',
  BCBT_FOLLOW_UP: 'BCBT Follow Up',
  DON: 'DON',
  SAJIR: 'Sajir',
  ACCOMMODATION: 'Accommodation',
  UNROUTED: 'Unrouted',
};

interface QueueBadgeProps {
  queue: string;
}

const QueueBadge = ({ queue }: QueueBadgeProps) => {
  const label = queueLabels[queue] || queue;

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        borderRadius: crmTokens.r1, // 6px
        backgroundColor: crmTokens.gx,
        border: `1px solid ${crmTokens.gxx}`,
        color: crmTokens.g,
        fontSize: '12px',
        fontWeight: 600,
        fontFamily: crmTokens.fontBody,
      }}
    >
      {label}
    </Box>
  );
};

export default QueueBadge;
export { queueLabels };
