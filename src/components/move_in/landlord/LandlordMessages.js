import React, { useEffect, useState, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { makeRequest2 } from '../../../utils/makeRequest';
import { getLandlordConversationsURL, getLandlordMessagesURL, sendLandlordMessageURL } from '../../../utils/urls';
import { notifyError } from '../../../utils/toast';
import Breadcrumb from '../../common/Breadcrumb';

function Avatar({ name, size = 36 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2.5,
      background: 'var(--mi-brand-light)', color: 'var(--mi-brand)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function LandlordMessages() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [body, setBody]                   = useState('');
  const [sending, setSending]             = useState(false);
  const [loading, setLoading]             = useState(true);
  const bottomRef                         = useRef(null);

  useEffect(() => {
    makeRequest2(getLandlordConversationsURL, 'GET').then(res => {
      if (res.success) {
        const list = res.data?.data || res.data;
        setConversations(Array.isArray(list) ? list : []);
      }
      setLoading(false);
    });
  }, []);

  const openConversation = async (conv) => {
    setSelected(conv);
    const res = await makeRequest2(`${getLandlordMessagesURL}/${conv._id}/messages`, 'GET');
    if (res.success) {
      const list = res.data?.data || res.data;
      setMessages(Array.isArray(list) ? list : []);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const sendMsg = async (e) => {
    e.preventDefault();
    if (!body.trim() || !selected) return;
    setSending(true);
    const res = await makeRequest2(`${sendLandlordMessageURL}/${selected._id}/messages`, 'POST', { body });
    setSending(false);
    if (res.success) {
      const newMsg = res.data?.data || res.data;
      if (newMsg) setMessages(p => [...p, newMsg]);
      setBody('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } else {
      notifyError(res.error || 'Failed to send message.');
    }
  };

  return (
    <div>
      <Breadcrumb items={[{ label: 'Messages' }]} />

      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--mi-ink)', marginBottom: 4 }}>Messages</h2>
        <p style={{ color: 'var(--mi-muted)', margin: 0, fontSize: 14 }}>Conversations with your tenants</p>
      </div>

      <div className="mi-message-shell" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--mi-line)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(17,24,39,0.05)', display: 'flex', height: 520 }}>

        {/* Sidebar */}
        <div className="mi-message-sidebar" style={{ width: 260, borderRight: '1px solid var(--mi-line)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--mi-line)', fontWeight: 600, fontSize: 13, color: 'var(--mi-ink)' }}>
            Conversations
            {conversations.length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--mi-line)', borderRadius: 20, padding: '1px 8px', fontSize: 11, color: 'var(--mi-muted)', fontWeight: 500 }}>
                {conversations.length}
              </span>
            )}
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 12 }}>
                {[1,2,3].map(n => <div key={n} style={{ height: 56, borderRadius: 10, background: 'var(--mi-line)', marginBottom: 8 }} />)}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--mi-muted)', fontSize: 13 }}>
                No conversations yet.
              </div>
            ) : conversations.map(c => {
              const isActive = selected?._id === c._id;
              return (
                <div key={c._id}
                  onClick={() => openConversation(c)}
                  style={{
                    padding: '12px 14px', cursor: 'pointer',
                    background: isActive ? 'var(--mi-brand-light)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--mi-brand)' : '3px solid transparent',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={c.tenantName || c.unitName} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--mi-ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.tenantName || c.unitName || 'Tenant'}
                        </div>
                        {c.landlordUnread > 0 && (
                          <span style={{ background: 'var(--mi-brand)', color: '#fff', borderRadius: 20, fontSize: 10, padding: '1px 6px', fontWeight: 700, flexShrink: 0 }}>
                            {c.landlordUnread}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--mi-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.unitName || c.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--mi-muted)', gap: 10 }}>
              <MessageSquare size={36} style={{ color: 'var(--mi-line)' }} />
              <div style={{ fontSize: 14, fontWeight: 500 }}>Select a conversation</div>
              <div style={{ fontSize: 12 }}>Choose a tenant conversation from the left</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--mi-line)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar name={selected.tenantName || selected.unitName} size={36} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-ink)' }}>{selected.tenantName || 'Tenant'}</div>
                  <div style={{ fontSize: 12, color: 'var(--mi-muted)' }}>{selected.unitName || '—'}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mi-muted)', fontSize: 13 }}>
                    No messages yet. Start the conversation!
                  </div>
                ) : messages.map(m => {
                  const isMine = m.senderType === 'landlord';
                  return (
                    <div key={m._id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '68%', padding: '9px 14px', borderRadius: isMine ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        background: isMine ? 'var(--mi-button)' : 'var(--mi-line)',
                        color: isMine ? '#fff' : 'var(--mi-ink)',
                        fontSize: 13, lineHeight: 1.45,
                      }}>
                        {m.body}
                        {m.createdAt && (
                          <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: isMine ? 'right' : 'left' }}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMsg} style={{ padding: '12px 16px', borderTop: '1px solid var(--mi-line)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Type a message…"
                  style={{ flex: 1, padding: '9px 16px', border: '1px solid var(--mi-line)', borderRadius: 24, fontSize: 13, outline: 'none', color: 'var(--mi-ink)' }}
                />
                <button
                  type="submit"
                  disabled={sending || !body.trim()}
                  style={{ width: 38, height: 38, borderRadius: 19, border: 'none', background: body.trim() ? 'var(--mi-button)' : 'var(--mi-line)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: body.trim() ? 'pointer' : 'default', flexShrink: 0, transition: 'background 0.15s' }}>
                  <Send size={15} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandlordMessages;
