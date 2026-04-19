import { Box, Typography, IconButton, InputBase } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';
import { useCustomQuery, useCustomMutationV2 } from '@deassists/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@deassists/shared-ui/hooks/useAuth';
import { crmTokens } from '../../styles/crmTokens';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface Comment {
  text: string;
  author: string;
  timestamp: string;
}

interface CommentThreadProps {
  leadId: string;
}

// Get initials from name
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const CommentThread = ({ leadId }: CommentThreadProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');

  const { data } = useCustomQuery<any>(
    ['lead', leadId],
    `/v1/leads/${leadId}`,
    { enabled: !!leadId },
  );

  const leadData = data?.data;
  const commentList: Comment[] = leadData?.comments ?? [];

  const { mutate, isLoading: isSending } = useCustomMutationV2(
    `/v1/leads/${leadId}/comments`,
    'POST',
  );

  const handleSend = () => {
    const text = newComment.trim();
    if (!text) return;

    mutate(
      { text, author: user?.fullName || user?.email || 'Unknown' },
      {
        onSuccess: () => {
          setNewComment('');
          queryClient.invalidateQueries(['lead', leadId]);
          queryClient.invalidateQueries(['leads']);
        },
      },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Section title */}
      <Typography
        sx={{
          fontSize: '10px',
          fontWeight: 700,
          letterSpacing: '0.7px',
          textTransform: 'uppercase',
          color: crmTokens.t3,
          fontFamily: crmTokens.fontBody,
          mb: 1.5,
        }}
      >
        Comments
      </Typography>

      {/* Comment list */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          maxHeight: 200,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          mb: 1.5,
        }}
      >
        {commentList.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: '13px',
                color: crmTokens.t3,
                fontFamily: crmTokens.fontBody,
              }}
            >
              No comments yet.
            </Typography>
          </Box>
        ) : (
          commentList.map((comment, index) => (
            <Box key={index} sx={{ display: 'flex', gap: '9px' }}>
              {/* Avatar */}
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: crmTokens.g,
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  mt: '1px',
                  fontFamily: crmTokens.fontBody,
                }}
              >
                {getInitials(comment.author)}
              </Box>
              {/* Comment body */}
              <Box sx={{ flex: 1 }}>
                {/* Meta row */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 1,
                    mb: '4px',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '12px',
                      fontWeight: 700,
                      color: crmTokens.t1,
                      fontFamily: crmTokens.fontBody,
                    }}
                  >
                    {comment.author}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '11px',
                      color: crmTokens.t3,
                      fontFamily: crmTokens.fontBody,
                    }}
                  >
                    {dayjs(comment.timestamp).fromNow()}
                  </Typography>
                </Box>
                {/* Text bubble */}
                <Box
                  sx={{
                    fontSize: '13px',
                    color: crmTokens.t1,
                    fontFamily: crmTokens.fontBody,
                    backgroundColor: crmTokens.cr,
                    border: `1px solid ${crmTokens.bd}`,
                    borderRadius: crmTokens.r2,
                    padding: '9px 11px',
                    lineHeight: 1.5,
                  }}
                >
                  {comment.text}
                </Box>
              </Box>
            </Box>
          ))
        )}
      </Box>

      {/* Divider */}
      <Box
        sx={{
          height: '1px',
          backgroundColor: crmTokens.bd,
          mb: 1.5,
        }}
      />

      {/* Input area */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          alignItems: 'flex-end',
        }}
      >
        <Box
          sx={{
            flex: 1,
            border: `1.5px solid ${crmTokens.bd}`,
            borderRadius: crmTokens.r2,
            backgroundColor: crmTokens.cr,
            transition: 'border-color 0.14s, background-color 0.14s',
            '&:focus-within': {
              borderColor: crmTokens.g,
              backgroundColor: crmTokens.wh,
            },
          }}
        >
          <InputBase
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            multiline
            maxRows={3}
            sx={{
              width: '100%',
              p: '9px 11px',
              fontSize: '13px',
              fontFamily: crmTokens.fontBody,
              color: crmTokens.t1,
              lineHeight: 1.5,
              '& textarea::placeholder': {
                color: crmTokens.t3,
                opacity: 1,
              },
            }}
          />
        </Box>
        <IconButton
          onClick={handleSend}
          disabled={!newComment.trim() || isSending}
          size="small"
          sx={{
            backgroundColor: crmTokens.g,
            color: '#fff',
            borderRadius: crmTokens.r2,
            width: 36,
            height: 36,
            '&:hover': {
              backgroundColor: crmTokens.gl,
            },
            '&.Mui-disabled': {
              backgroundColor: crmTokens.bd,
              color: crmTokens.t3,
            },
          }}
        >
          <SendIcon sx={{ fontSize: '16px' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default CommentThread;
