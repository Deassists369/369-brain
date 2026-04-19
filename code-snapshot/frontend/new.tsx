'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  CircularProgress,
  SelectChangeEvent,
  Tooltip,
  Divider,
  Button,
} from '@mui/material';
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
  UserTypes.AGENT,
];

const SOURCE_OPTIONS = [
  'Partner',
  'Portal',
  'WhatsApp',
  'Instagram',
  'Phone',
  'Other',
];

const SOURCE_DETAIL_PLACEHOLDERS: Record<string, string> = {
  Partner: 'e.g. BCBT, SRH Partner, Manipal, referrer name',
  Portal: 'e.g. Campaign Form, Main Website Form',
  Instagram: 'e.g. October Campaign, Instagram Ad Form',
  WhatsApp: 'e.g. WATI, Broadcast Reply, Direct Message',
  Phone: 'e.g. referrer name or leave blank',
  Other: 'e.g. referrer name or leave blank',
};

const SERVICE_OPTIONS = [
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
];

const COUNTRY_CODES = [
  '+91',
  '+49',
  '+971',
  '+974',
  '+880',
  '+94',
  '+1',
  '+44',
];
const ASSIGNED_TO_OPTIONS = ['DON', 'Riya', 'Meena', 'Stalin'];

interface FormState {
  full_name: string;
  whatsapp: string;
  country_code: string;
  email: string;
  source: string;
  source_detail: string;
  service: string;
  place: string;
  university_interest: string;
  intake: string;
  assigned_to: string;
  initial_comment: string;
}

interface DuplicateInfo {
  lead_id: string;
  full_name: string;
  whatsapp: string;
}

interface SuccessInfo {
  lead_id: string;
  full_name: string;
  queue: string;
}

const EMPTY_FORM: FormState = {
  full_name: '',
  whatsapp: '',
  country_code: '',
  email: '',
  source: '',
  source_detail: '',
  service: '',
  place: '',
  university_interest: '',
  intake: '',
  assigned_to: '',
  initial_comment: '',
};

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: crmTokens.r1,
    backgroundColor: crmTokens.wh,
    fontFamily: crmTokens.fontBody,
    fontSize: 13,
    '& fieldset': { borderColor: crmTokens.bd },
    '&:hover fieldset': { borderColor: crmTokens.gxx },
    '&.Mui-focused fieldset': { borderColor: crmTokens.g, borderWidth: 1.5 },
  },
  '& .MuiInputBase-input': {
    fontFamily: crmTokens.fontBody,
    fontSize: 13,
    color: crmTokens.t1,
    padding: '8px 12px',
  },
  '& .MuiInputBase-input::placeholder': { color: crmTokens.t4, opacity: 1 },
};

const selectSx = {
  borderRadius: crmTokens.r1,
  backgroundColor: crmTokens.wh,
  fontFamily: crmTokens.fontBody,
  fontSize: 13,
  color: crmTokens.t1,
  height: 36,
  '& fieldset': { borderColor: crmTokens.bd },
  '&:hover fieldset': { borderColor: crmTokens.gxx },
  '&.Mui-focused fieldset': { borderColor: crmTokens.g, borderWidth: 1.5 },
  '& .MuiSelect-select': {
    padding: '7px 12px',
    fontFamily: crmTokens.fontBody,
    fontSize: 13,
  },
};

const labelSx = {
  fontFamily: crmTokens.fontBody,
  fontSize: 13,
  fontWeight: 500,
  color: crmTokens.t2,
  mb: 0.75,
  display: 'block',
};

const helperSx = {
  fontFamily: crmTokens.fontBody,
  fontSize: 11,
  color: crmTokens.t3,
  mt: 0.5,
};

// ─── SECTION HEADER COMPONENT ────────────────────────────────────────────────
const SectionHeader = ({
  icon,
  label,
  badge,
}: {
  icon: string;
  label: string;
  badge?: React.ReactNode;
}) => (
  <Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4, mb: 1 }}>
      <Icon icon={icon} style={{ fontSize: 16, color: crmTokens.g }} />
      <Typography
        sx={{
          fontFamily: crmTokens.fontBody,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: crmTokens.t3,
        }}
      >
        {label}
      </Typography>
      {badge}
    </Box>
    <Divider sx={{ mb: 3, borderColor: crmTokens.bd }} />
  </Box>
);

// ─── FIELD WRAPPER COMPONENT ─────────────────────────────────────────────────
const FieldWrap = ({
  label,
  required,
  helper,
  children,
}: {
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) => (
  <Box sx={{ display: 'flex', flexDirection: 'column' }}>
    <Typography sx={labelSx}>
      {label}
      {required && (
        <span style={{ color: crmTokens.red, marginLeft: 2 }}>*</span>
      )}
    </Typography>
    {children}
    {helper && <Typography sx={helperSx}>{helper}</Typography>}
  </Box>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
const NewLeadPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [duplicateModal, setDuplicateModal] = useState<DuplicateInfo | null>(
    null,
  );
  const [successInfo, setSuccessInfo] = useState<SuccessInfo | null>(null);

  const userType = user?.type as string;

  const showToast = (message: string, severity: 'success' | 'error') =>
    setToast({ open: true, message, severity });

  const handleText = useCallback(
    (field: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((p) => ({ ...p, [field]: e.target.value })),
    [],
  );

  const handleSelect = useCallback(
    (field: keyof FormState) => (e: SelectChangeEvent) =>
      setForm((p) => ({ ...p, [field]: e.target.value })),
    [],
  );

  const handleSubmit = async () => {
    if (!form.full_name.trim()) {
      showToast('Full name is required.', 'error');
      return;
    }
    if (!form.whatsapp.trim()) {
      showToast('WhatsApp number is required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, string> = {
        full_name: form.full_name.trim(),
        whatsapp: form.whatsapp.trim(),
      };
      if (form.country_code) payload.country_code = form.country_code;
      if (form.email.trim()) payload.email = form.email.trim();
      if (form.source) payload.source = form.source;
      if (form.source_detail.trim())
        payload.source_detail = form.source_detail.trim();
      if (form.service) payload.service = form.service;
      if (form.place.trim()) payload.place = form.place.trim();
      if (form.university_interest.trim())
        payload.university_interest = form.university_interest.trim();
      if (form.intake.trim()) payload.intake = form.intake.trim();
      if (form.assigned_to) payload.assigned_to = form.assigned_to;
      if (form.initial_comment.trim())
        payload.initial_comment = form.initial_comment.trim();
      const token = getCookie('token');
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409) {
        setDuplicateModal({
          lead_id: data.lead_id,
          full_name: data.full_name,
          whatsapp: form.whatsapp.trim(),
        });
        return;
      }
      if (!res.ok) {
        const errMsg = data?.message || 'Failed to create lead.';
        showToast(Array.isArray(errMsg) ? errMsg.join(', ') : errMsg, 'error');
        return;
      }
      setSuccessInfo({
        lead_id: data.lead_id,
        full_name: data.full_name,
        queue: data.queue,
      });
      setTimeout(() => router.push('/leads'), 2500);
    } catch {
      showToast('Network error. Check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!ALLOWED_ROLES.includes(userType as UserTypes)) {
    return (
      <PageTemplate>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 700,
              color: crmTokens.red,
              fontFamily: crmTokens.fontBody,
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
          minHeight: '100vh',
          px: 4,
          pt: 4,
          pb: 6,
        }}
      >
        {/* Breadcrumb */}
        <Typography
          sx={{
            fontFamily: crmTokens.fontBody,
            fontSize: 12,
            color: crmTokens.t3,
            mb: 1.5,
          }}
        >
          <span
            onClick={() => router.push('/leads')}
            style={{ color: crmTokens.g, cursor: 'pointer' }}
          >
            Leads
          </span>
          {' › New Lead'}
        </Typography>

        {/* Page Title */}
        <Typography
          sx={{
            fontFamily: crmTokens.fontDisplay,
            fontSize: 28,
            fontWeight: 700,
            color: crmTokens.dk,
            mb: 0.5,
          }}
        >
          Enter New Lead
        </Typography>
        <Typography
          sx={{
            fontFamily: crmTokens.fontBody,
            fontSize: 13,
            color: crmTokens.t3,
            mb: 3,
          }}
        >
          Fill in what you have. Lead ID and queue are assigned automatically. *
          fields are required.
        </Typography>

        {/* Form Container */}
        <Box
          sx={{
            backgroundColor: crmTokens.wh,
            borderRadius: crmTokens.r3,
            border: `1px solid ${crmTokens.bd}`,
            p: { xs: 3, md: 5 },
          }}
        >
          {/* ── REQUIRED INFORMATION ── */}
          <SectionHeader
            icon="mdi:account-outline"
            label="Required Information"
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap label="Full Name" required>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Rahul Sharma"
                value={form.full_name}
                onChange={handleText('full_name')}
                sx={inputSx}
              />
            </FieldWrap>
            <FieldWrap label="WhatsApp Number" required>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. 9876543210"
                value={form.whatsapp}
                onChange={handleText('whatsapp')}
                sx={inputSx}
              />
            </FieldWrap>
          </Box>

          {/* ── CONTACT DETAILS ── */}
          <SectionHeader icon="mdi:phone-outline" label="Contact Details" />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap label="Country Code">
              <FormControl fullWidth size="small">
                <Select
                  value={form.country_code}
                  onChange={handleSelect('country_code')}
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="">
                    <em style={{ color: crmTokens.t4, fontStyle: 'normal' }}>
                      Select
                    </em>
                  </MenuItem>
                  {COUNTRY_CODES.map((c) => (
                    <MenuItem
                      key={c}
                      value={c}
                      sx={{ fontFamily: crmTokens.fontBody, fontSize: 13 }}
                    >
                      {c}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldWrap>
            <FieldWrap label="Email Address">
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. rahul@email.com"
                type="email"
                value={form.email}
                onChange={handleText('email')}
                sx={inputSx}
              />
            </FieldWrap>
          </Box>

          {/* ── LEAD CLASSIFICATION ── */}
          <SectionHeader
            icon="mdi:tag-outline"
            label="Lead Classification"
            badge={
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  backgroundColor: crmTokens.gx,
                  border: `1px solid ${crmTokens.gxx}`,
                  borderRadius: '4px',
                  px: 1,
                  py: 0.25,
                  ml: 1,
                }}
              >
                <Icon
                  icon="mdi:auto-fix"
                  style={{ fontSize: 10, color: crmTokens.g }}
                />
                <Typography
                  sx={{
                    fontFamily: crmTokens.fontBody,
                    fontSize: 11,
                    color: crmTokens.g,
                    fontWeight: 500,
                  }}
                >
                  Queue auto-assigned
                </Typography>
              </Box>
            }
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap label="Source">
              <FormControl fullWidth size="small">
                <Select
                  value={form.source}
                  onChange={handleSelect('source')}
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="">
                    <em style={{ color: crmTokens.t4, fontStyle: 'normal' }}>
                      Select source
                    </em>
                  </MenuItem>
                  {SOURCE_OPTIONS.map((s) => (
                    <MenuItem
                      key={s}
                      value={s}
                      sx={{ fontFamily: crmTokens.fontBody, fontSize: 13 }}
                    >
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldWrap>
            <FieldWrap
              label="Source Detail"
              helper="Exact origin — partner name, campaign, form name, referrer"
            >
              <TextField
                fullWidth
                size="small"
                placeholder={
                  SOURCE_DETAIL_PLACEHOLDERS[form.source] ||
                  'e.g. BCBT, campaign name'
                }
                value={form.source_detail}
                onChange={handleText('source_detail')}
                sx={inputSx}
              />
            </FieldWrap>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap label="Service Requested">
              <FormControl fullWidth size="small">
                <Select
                  value={form.service}
                  onChange={handleSelect('service')}
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="">
                    <em style={{ color: crmTokens.t4, fontStyle: 'normal' }}>
                      Select service
                    </em>
                  </MenuItem>
                  {SERVICE_OPTIONS.map((s) => (
                    <MenuItem
                      key={s}
                      value={s}
                      sx={{ fontFamily: crmTokens.fontBody, fontSize: 13 }}
                    >
                      {s}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldWrap>
            <FieldWrap
              label="Current Residence / Country"
              helper="Where the lead is currently based"
            >
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. India, UAE, Germany"
                value={form.place}
                onChange={handleText('place')}
                sx={inputSx}
              />
            </FieldWrap>
          </Box>

          {/* ── ADDITIONAL DETAILS ── */}
          <SectionHeader
            icon="mdi:note-text-outline"
            label="Additional Details"
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap
              label="University Interest"
              helper="Free text — does not affect routing"
            >
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. SRH, IU, Berlin University"
                value={form.university_interest}
                onChange={handleText('university_interest')}
                sx={inputSx}
              />
            </FieldWrap>
            <FieldWrap label="Intake">
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Winter 2025, Summer 2026"
                value={form.intake}
                onChange={handleText('intake')}
                sx={inputSx}
              />
            </FieldWrap>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 3,
              mb: 3,
            }}
          >
            <FieldWrap label="Assigned To">
              <FormControl fullWidth size="small">
                <Select
                  value={form.assigned_to}
                  onChange={handleSelect('assigned_to')}
                  displayEmpty
                  sx={selectSx}
                >
                  <MenuItem value="">
                    <em style={{ color: crmTokens.t4, fontStyle: 'normal' }}>
                      Assign to agent (optional)
                    </em>
                  </MenuItem>
                  {ASSIGNED_TO_OPTIONS.map((a) => (
                    <MenuItem
                      key={a}
                      value={a}
                      sx={{ fontFamily: crmTokens.fontBody, fontSize: 13 }}
                    >
                      {a}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FieldWrap>
          </Box>
          <FieldWrap label="Initial Notes">
            <TextField
              fullWidth
              multiline
              minRows={3}
              placeholder="Any initial context — what they said, how they found us, specific concerns..."
              value={form.initial_comment}
              onChange={handleText('initial_comment')}
              sx={{
                ...inputSx,
                '& .MuiInputBase-input': {
                  fontFamily: crmTokens.fontBody,
                  fontSize: 13,
                  color: crmTokens.t1,
                  padding: '10px 12px',
                },
              }}
            />
          </FieldWrap>

          {/* ── ACTIONS ── */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 1.5,
              mt: 4,
              pt: 3,
              borderTop: `1px solid ${crmTokens.bd}`,
            }}
          >
            <Button
              onClick={() => router.push('/leads')}
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 13,
                fontWeight: 500,
                color: crmTokens.t2,
                textTransform: 'none',
                border: `1px solid ${crmTokens.bd}`,
                borderRadius: crmTokens.r2,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: crmTokens.cr,
                  borderColor: crmTokens.bdd,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 13,
                fontWeight: 600,
                color: crmTokens.wh,
                textTransform: 'none',
                backgroundColor: crmTokens.g,
                borderRadius: crmTokens.r2,
                px: 3,
                py: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { backgroundColor: crmTokens.gl },
                '&:disabled': { backgroundColor: crmTokens.t4 },
              }}
            >
              {loading ? (
                <CircularProgress size={14} sx={{ color: '#fff' }} />
              ) : (
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: crmTokens.wh,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon
                    icon="mdi:check"
                    style={{ fontSize: 12, color: crmTokens.g }}
                  />
                </Box>
              )}
              Save Lead
            </Button>
          </Box>
        </Box>
      </Box>

      {/* ── DUPLICATE MODAL ── */}
      {duplicateModal && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              backgroundColor: crmTokens.wh,
              borderRadius: crmTokens.r3,
              p: 4,
              maxWidth: 440,
              width: '90%',
              boxShadow: crmTokens.s3,
            }}
          >
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}
            >
              <Icon
                icon="mdi:alert-circle-outline"
                style={{ fontSize: 22, color: crmTokens.am }}
              />
              <Typography
                sx={{
                  fontFamily: crmTokens.fontDisplay,
                  fontSize: 18,
                  fontWeight: 700,
                  color: crmTokens.dk,
                }}
              >
                Duplicate Lead Found
              </Typography>
            </Box>
            <Typography
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 13,
                color: crmTokens.t2,
                mb: 2,
              }}
            >
              A lead with WhatsApp <strong>{duplicateModal.whatsapp}</strong>{' '}
              already exists in the system.
            </Typography>
            <Box
              sx={{
                backgroundColor: crmTokens.cr,
                borderRadius: crmTokens.r1,
                p: 2,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 12,
                  color: crmTokens.t3,
                }}
              >
                Lead ID:{' '}
                <strong style={{ color: crmTokens.t1 }}>
                  {duplicateModal.lead_id}
                </strong>
              </Typography>
              <Typography
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 12,
                  color: crmTokens.t3,
                }}
              >
                Name:{' '}
                <strong style={{ color: crmTokens.t1 }}>
                  {duplicateModal.full_name}
                </strong>
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setDuplicateModal(null)}
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 13,
                  textTransform: 'none',
                  color: crmTokens.t2,
                  border: `1px solid ${crmTokens.bd}`,
                  borderRadius: crmTokens.r2,
                  px: 2.5,
                }}
              >
                Go Back
              </Button>
              <Button
                onClick={() => router.push('/leads')}
                sx={{
                  fontFamily: crmTokens.fontBody,
                  fontSize: 13,
                  textTransform: 'none',
                  backgroundColor: crmTokens.g,
                  color: crmTokens.wh,
                  borderRadius: crmTokens.r2,
                  px: 2.5,
                  '&:hover': { backgroundColor: crmTokens.gl },
                }}
              >
                View Existing Lead
              </Button>
            </Box>
          </Box>
        </Box>
      )}

      {/* ── SUCCESS MODAL ── */}
      {successInfo && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1300,
          }}
        >
          <Box
            sx={{
              backgroundColor: crmTokens.wh,
              borderRadius: crmTokens.r3,
              p: 4,
              maxWidth: 400,
              width: '90%',
              textAlign: 'center',
              boxShadow: crmTokens.s3,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                backgroundColor: crmTokens.gx,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Icon
                icon="mdi:check-circle-outline"
                style={{ fontSize: 28, color: crmTokens.g }}
              />
            </Box>
            <Typography
              sx={{
                fontFamily: crmTokens.fontDisplay,
                fontSize: 20,
                fontWeight: 700,
                color: crmTokens.dk,
                mb: 1,
              }}
            >
              Lead Created
            </Typography>
            <Typography
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 13,
                color: crmTokens.t2,
                mb: 0.5,
              }}
            >
              {successInfo.full_name}
            </Typography>
            <Typography
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 12,
                color: crmTokens.t3,
                mb: 0.5,
              }}
            >
              ID: {successInfo.lead_id}
            </Typography>
            <Typography
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 12,
                color: crmTokens.g,
                fontWeight: 500,
              }}
            >
              → {successInfo.queue}
            </Typography>
            <Typography
              sx={{
                fontFamily: crmTokens.fontBody,
                fontSize: 12,
                color: crmTokens.t4,
                mt: 2,
              }}
            >
              Redirecting to leads...
            </Typography>
          </Box>
        </Box>
      )}

      {/* ── TOAST ── */}
      {toast.open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor:
              toast.severity === 'error' ? crmTokens.red : crmTokens.g,
            color: crmTokens.wh,
            borderRadius: crmTokens.r2,
            px: 3,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            zIndex: 1400,
            boxShadow: crmTokens.s2,
            minWidth: 280,
          }}
        >
          <Icon
            icon={
              toast.severity === 'error'
                ? 'mdi:alert-circle-outline'
                : 'mdi:check-circle-outline'
            }
            style={{ fontSize: 18, color: '#fff' }}
          />
          <Typography
            sx={{
              fontFamily: crmTokens.fontBody,
              fontSize: 13,
              color: '#fff',
              flex: 1,
            }}
          >
            {toast.message}
          </Typography>
          <Icon
            icon="mdi:close"
            onClick={() => setToast((p) => ({ ...p, open: false }))}
            style={{
              fontSize: 16,
              color: '#fff',
              cursor: 'pointer',
              opacity: 0.8,
            }}
          />
        </Box>
      )}
    </PageTemplate>
  );
};

NewLeadPage.auth = true;
export default NewLeadPage;
