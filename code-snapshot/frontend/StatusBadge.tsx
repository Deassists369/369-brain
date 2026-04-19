// apps/cms-next/components/leads/StatusBadge.tsx
import Box from '@mui/material/Box';
import { statusBadgeColors, crmTokens } from '../../styles/crmTokens';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors = statusBadgeColors[status] || {
    bg: '#f5f5f5',
    color: '#616161',
  };

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: crmTokens.r4, // 20px pill
        backgroundColor: colors.bg,
        color: colors.color,
        fontSize: '11px',
        fontWeight: 700,
        fontFamily: crmTokens.fontBody,
        letterSpacing: '0.3px',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Box>
  );
};

export default StatusBadge;
