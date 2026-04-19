'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { Icon } from '@iconify/react';
import { getCookie } from 'cookies-next';
import PageTemplate from '../../templates/PageTemplate';
import { useAuth } from '@deassists/shared-ui/hooks/useAuth';
import { UserTypes } from '@constants/user.types';
import { crmTokens } from '../../styles/crmTokens';

const ALLOWED_ROLES = [
  UserTypes.SUPER_ADMIN,
  UserTypes.ORG_ADMIN,
  UserTypes.MANAGER,
  UserTypes.LEAD_CRM,
  UserTypes.SALES_SETUP,
  UserTypes.STAFF,
  UserTypes.AGENT,
];

const STATUS_COLORS: Record<string, string> = {
  New: crmTokens.g,
  'Follow Up': crmTokens.am,
  'Called 1': crmTokens.blu,
  'Called 2': crmTokens.blu,
  'Called 3': crmTokens.blu,
  Converted: crmTokens.g,
  Lost: crmTokens.t3,
};

const STATUS_ORDER = [
  'New',
  'Follow Up',
  'Called 1',
  'Called 2',
  'Called 3',
  'Converted',
  'Lost',
];

const QUEUE_LABELS: Record<string, string> = {
  '369_MAIN': '369 Main',
  BCBT: 'BCBT',
  ACCOMMODATION: 'Accommodation',
  UNROUTED: 'Unrouted',
};

const QUEUE_COLORS: Record<string, string> = {
  '369_MAIN': crmTokens.g,
  BCBT: crmTokens.blu,
  ACCOMMODATION: crmTokens.t1,
  UNROUTED: crmTokens.t3,
};

const QUEUE_ORDER = ['369_MAIN', 'BCBT', 'ACCOMMODATION', 'UNROUTED'];

interface StatsResponse {
  total_active: number;
  by_status: Record<string, number>;
  by_queue: Record<string, number>;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const userType = user?.type as string;

  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const StatCard = ({
    label,
    value,
    color,
  }: {
    label: string;
    value: number;
    color: string;
  }) => (
    <Box
      sx={{
        backgroundColor: crmTokens.wh,
        border: `1px solid ${crmTokens.bd}`,
        borderRadius: crmTokens.r2,
        p: '14px 16px',
        boxShadow: crmTokens.s1,
      }}
    >
      <Typography sx={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: crmTokens.t3,
          mt: 0.75,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        }}
      >
        {label}
      </Typography>
    </Box>
  );

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getCookie('token');
      const res = await fetch('/api/v1/leads/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to fetch stats');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ALLOWED_ROLES.includes(userType as UserTypes)) {
      fetchStats();
    }
  }, [userType]);

  // Role guard
  if (!ALLOWED_ROLES.includes(userType as UserTypes)) {
    return (
      <PageTemplate>
        <Box
          sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: crmTokens.cr,
            minHeight: '100vh',
          }}
        >
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: crmTokens.red,
              fontFamily: crmTokens.fontDisplay,
            }}
          >
            Access Denied
          </Typography>
          <Typography
            sx={{
              fontSize: 13,
              color: crmTokens.t3,
              fontFamily: crmTokens.fontBody,
              mt: 1,
            }}
          >
            You do not have permission to view this page.
          </Typography>
        </Box>
      </PageTemplate>
    );
  }

  return (
    <PageTemplate>
      <Box
        sx={{
          backgroundColor: crmTokens.cr,
          minHeight: 'calc(100vh - 64px)',
          p: 3,
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 2.5 }}>
          <Typography
            sx={{
              fontFamily: crmTokens.fontDisplay,
              fontSize: 28,
              fontWeight: 700,
              color: crmTokens.dk,
            }}
          >
            Sales Dashboard
          </Typography>
          <Typography sx={{ fontSize: 14, color: crmTokens.t3, mt: '4px' }}>
            Overview
          </Typography>
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress sx={{ color: crmTokens.g }} />
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Box
            sx={{
              mb: 2,
              p: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: crmTokens.r2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: 13, color: crmTokens.red }}>
              {error}
            </Typography>
            <Box
              component="button"
              onClick={fetchStats}
              sx={{
                fontSize: 12,
                fontWeight: 700,
                color: crmTokens.red,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                ml: 2,
              }}
            >
              Retry
            </Box>
          </Box>
        )}

        {/* Stats content */}
        {stats && !loading && (
          <>
            {/* Total Active Card */}
            <Box
              sx={{
                backgroundColor: crmTokens.wh,
                borderRadius: crmTokens.r3,
                boxShadow: crmTokens.s1,
                padding: '32px',
                mb: '32px',
                display: 'flex',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  backgroundColor: crmTokens.gx,
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  icon="mdi:chart-bar"
                  style={{ fontSize: 32, color: crmTokens.g }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: crmTokens.t3,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    mb: '4px',
                  }}
                >
                  Total Active Leads
                </Typography>
                <Typography
                  sx={{
                    fontFamily: crmTokens.fontDisplay,
                    fontSize: 56,
                    fontWeight: 700,
                    color: crmTokens.dk,
                    lineHeight: 1,
                  }}
                >
                  {stats.total_active}
                </Typography>
              </Box>
            </Box>

            {/* By Status Section */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  color: crmTokens.t3,
                  mb: 1.25,
                }}
              >
                By Status
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1.25,
                }}
              >
                {STATUS_ORDER.map((status) => (
                  <StatCard
                    key={status}
                    label={status}
                    value={stats.by_status[status] ?? 0}
                    color={STATUS_COLORS[status] ?? crmTokens.t1}
                  />
                ))}
              </Box>
            </Box>

            {/* By Queue Section */}
            <Box sx={{ mb: 2.5 }}>
              <Typography
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  color: crmTokens.t3,
                  mb: 1.25,
                }}
              >
                By Queue
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 1.25,
                }}
              >
                {QUEUE_ORDER.map((queue) => (
                  <StatCard
                    key={queue}
                    label={QUEUE_LABELS[queue] ?? queue}
                    value={stats.by_queue[queue] ?? 0}
                    color={QUEUE_COLORS[queue] ?? crmTokens.t1}
                  />
                ))}
              </Box>
            </Box>

            {/* Phase 1 Note */}
            <Box
              sx={{
                backgroundColor: crmTokens.cr,
                border: `1px solid ${crmTokens.bd}`,
                borderRadius: crmTokens.r2,
                p: '10px 14px',
                fontSize: 12,
                color: crmTokens.t3,
                textAlign: 'center',
                mt: 2,
              }}
            >
              Phase 1 base dashboard — numbers only. Charts, filters, date
              ranges and performance tracking are Phase 2 additions.
            </Box>
          </>
        )}
      </Box>
    </PageTemplate>
  );
};

DashboardPage.auth = true;
export default DashboardPage;
