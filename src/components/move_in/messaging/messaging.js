import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MessageSquare, Send, RefreshCw, ArrowLeft } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import {
  getMoveInConversationsURL,
  getMoveInMessagesURL,
  sendMoveInMessageURL,
} from '../../../utils/urls';
import Breadcrumb from '../../common/Breadcrumb';
import { notifyError } from '../../../utils/toast';

function Avatar({ name, size = 40, fontSize = 16 }) {
  const initials = (name || 'L').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'var(--mi-button)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--mi-brand)', fontWeight: 700, fontSize, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ConversationList({ conversations, selectedId, onSelect, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 12 }}>
        {[1, 2, 3].map(n => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 8px', marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--mi-line)', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 13, borderRadius: 4, background: 'var(--mi-line)', width: '60%', marginBottom: 6 }} />
              <div style={{ height: 11, borderRadius: 4, background: 'var(--mi-line)', width: '80%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!conversations.length) {
    return (
      <div style={{ padding: '48px 16px', textAlign: 'center' }}>
        <MessageSquare size={32} strokeWidth={1.4} style={{ color: 'var(--mi-line)', marginBottom: 10 }} />
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>No conversations yet</p>
        <p style={{ color: 'var(--mi-muted)', margin: '4px 0 0', fontSize: 12 }}>Start one from a listing.</p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conv) => {
        const isSelected = selectedId === conv._id;
        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 16px', cursor: 'pointer',
              background: isSelected ? 'var(--mi-brand-light)' : 'transparent',
              borderLeft: `3px solid ${isSelected ? 'var(--mi-brand)' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
          >
            <Avatar name={conv.landlordName} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--mi-ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {conv.landlordName || 'Landlord'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mi-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                {conv.unitName || conv.unitId || 'Unit'}
              </div>
              {conv.lastMessage && (
                <div style={{ fontSize: 11, color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                  {conv.lastMessage}
                </div>
              )}
            </div>
            {conv.tenantUnread > 0 && (
              <span style={{
                minWidth: 20, height: 20, borderRadius: 10, background: 'var(--mi-brand)',
                color: '#fff', fontSize: 10, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {conv.tenantUnread}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function MessageThread({ conversation, onBack }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [text, setText]         = useState('');
  const [sending, setSending]   = useState(false);
  const bottomRef               = useRef(null);

  const fetchMessages = useCallback(async () => {
    if (!conversation?._id) return;
    const res = await makeRequest2(`${getMoveInMessagesURL}/${conversation._id}/messages`, 'GET');
    if (res.success && res.data) {
      const list = res.data.data || res.data;
      setMessages(Array.isArray(list) ? list : []);
    }
    setLoading(false);
  }, [conversation]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    setSending(true);
    const res = await makeRequest2(`${sendMoveInMessageURL}/${conversation._id}/messages`, 'POST', { body: trimmed, type: 'text' });
    if (res.success) {
      setText('');
      await fetchMessages();
    } else {
      notifyError(res.error || 'Failed to send message.');
    }
    setSending(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      {/* Thread header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mi-line)', display: 'flex', alignItems: 'center', gap: 10, background: '#fff' }}>
        <button
          className="d-md-none"
          onClick={onBack}
          style={{ border: 'none', background: 'transparent', padding: '4px 8px', cursor: 'pointer', display: 'flex' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--mi-ink)' }} />
        </button>
        <Avatar name={conversation.landlordName} size={36} fontSize={14} />
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--mi-ink)' }}>{conversation.landlordName || 'Landlord'}</div>
          <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{conversation.unitName || 'Unit'}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, background: '#f7f8fb' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--mi-muted)', fontSize: 13, padding: '24px 0' }}>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageSquare size={28} strokeWidth={1.4} style={{ color: 'var(--mi-line)' }} />
            <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 13 }}>No messages yet — say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderType === 'tenant';
            return (
              <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '72%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: isMe ? 'var(--mi-button)' : '#fff',
                  color: isMe ? '#fff' : 'var(--mi-ink)',
                  fontSize: 13, lineHeight: 1.5,
                  boxShadow: '0 1px 4px rgba(17,24,39,0.08)',
                }}>
                  {msg.body}
                  <div style={{ fontSize: 10, marginTop: 4, opacity: 0.6, textAlign: isMe ? 'right' : 'left' }}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: '12px 16px', borderTop: '1px solid var(--mi-line)', display: 'flex', gap: 10, background: '#fff', alignItems: 'center' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          disabled={sending}
          style={{
            flex: 1, padding: '10px 16px', borderRadius: 24,
            border: '1px solid var(--mi-line)', background: '#f7f8fb',
            fontSize: 13, color: 'var(--mi-ink)', outline: 'none',
          }}
          onFocus={e => e.target.style.borderColor = 'var(--mi-brand)'}
          onBlur={e => e.target.style.borderColor = 'var(--mi-line)'}
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
            background: sending || !text.trim() ? 'var(--mi-line)' : 'var(--mi-brand)',
            color: sending || !text.trim() ? 'var(--mi-muted)' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: sending || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.15s',
          }}
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function Messaging() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [selected, setSelected]           = useState(null);
  const [showThread, setShowThread]       = useState(false);

  const fetchConversations = useCallback(async () => {
    const res = await makeRequest2(getMoveInConversationsURL, 'GET');
    if (res.success && res.data) {
      const list = res.data.data || res.data;
      const arr = Array.isArray(list) ? list : [];
      setConversations(arr);
      if (arr.length && !selected) setSelected(arr[0]);
    } else {
      setError(res.error || 'Failed to load conversations.');
    }
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  const handleSelect = (conv) => {
    setSelected(conv);
    setShowThread(true);
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Messages' }]} />
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Messages</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Chat with landlords about properties</p>
      </div>

      {error && (
        <div className="d-flex align-items-center gap-3 p-3 mb-3"
          style={{ border: '1px solid #fca5a5', borderRadius: 14, background: '#fff5f5', color: '#b91c1c' }}>
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button className="btn btn-sm"
            style={{ border: '1px solid #b91c1c', color: '#b91c1c', borderRadius: 8, background: 'transparent' }}
            onClick={fetchConversations}>Retry</button>
        </div>
      )}

      <div className="mi-message-shell" style={{
        background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)',
        overflow: 'hidden', height: '72vh', display: 'flex',
        boxShadow: '0 2px 12px rgba(17,24,39,0.06)',
      }}>
        {/* Sidebar */}
        <div
          className={`mi-message-sidebar ${showThread ? 'd-none d-md-block' : 'd-block'}`}
          style={{
            width: 280, minWidth: 280, borderRight: '1px solid var(--mi-line)',
            overflowY: 'auto', background: '#fff',
          }}
        >
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--mi-line)' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--mi-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Conversations
            </div>
          </div>
          <ConversationList
            conversations={conversations}
            selectedId={selected?._id}
            onSelect={handleSelect}
            loading={loading}
          />
        </div>

        {/* Thread panel */}
        <div className={`flex-grow-1 ${!showThread && !selected ? 'd-none d-md-flex' : 'd-flex'} flex-column`} style={{ minWidth: 0, overflow: 'hidden' }}>
          {selected ? (
            <MessageThread conversation={selected} onBack={() => setShowThread(false)} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: '#f7f8fb' }}>
              <MessageSquare size={40} strokeWidth={1.3} style={{ color: 'var(--mi-line)' }} />
              <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messaging;
