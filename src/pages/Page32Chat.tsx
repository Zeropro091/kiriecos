import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { Loader2, Send, MessageSquare } from 'lucide-react';

/**
 * Page32 — Member <-> Admin chat.
 * Polls GET /api/chat/messages every 5s; POST { body } to send.
 * Bubbles: left = admin, right = member (current user).
 */

interface ChatMessage {
  id: number | string;
  body: string;
  sender_role?: string;
  role?: string;
  sender_name?: string;
  created_at?: string;
}

const isAdminMessage = (m: ChatMessage): boolean => {
  const role = (m.sender_role || m.role || '').toString().toLowerCase();
  return role.includes('admin');
};

const timeLabel = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const Page32Chat: React.FC = () => {
  const { currentUser, showToast } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const fetchMessages = useCallback(async (showInitialSpinner: boolean) => {
    if (showInitialSpinner) setLoading(true);
    try {
      const res = await api.get<ChatMessage[] | { messages?: ChatMessage[] }>('/chat/messages');
      const list = Array.isArray(res) ? res : res?.messages || [];
      setMessages(list);
    } catch {
      /* keep last known messages on transient poll failure */
    } finally {
      if (showInitialSpinner) setLoading(false);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  useEffect(() => {
    fetchMessages(true);
    const interval = setInterval(() => fetchMessages(false), 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      await api.post('/chat/messages', { body });
      setInput('');
      await fetchMessages(false);
    } catch {
      showToast('Pesan gagal terkirim. Coba lagi.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#001710] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] rounded-full bg-kiri-gold-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-kiri-green-500/10 blur-[100px] pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Chat dengan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-kiri-gold-300 via-kiri-gold-400 to-amber-200">
              Admin KIRI
            </span>
          </h1>
          <p className="text-gray-400 text-xs">
            Tanya seputar keanggotaan, pembayaran, atau program. Admin membalas pada jam kerja.
          </p>
        </div>

        {/* Chat window */}
        <div className="rounded-[2rem] p-1.5 bg-white/10 backdrop-blur-xl border border-white/15">
          <div className="rounded-[calc(2rem-0.375rem)] bg-[#001f15] flex flex-col h-[62vh] min-h-[420px]">
            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-3">
              {loading ? (
                <div className="h-full flex items-center justify-center text-gray-500">
                  <Loader2 className="w-6 h-6 animate-spin text-kiri-gold-400" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-3 text-gray-500">
                  <MessageSquare className="w-8 h-8 text-kiri-gold-400/50" />
                  <p className="text-xs">Belum ada pesan. Mulai percakapan di bawah.</p>
                </div>
              ) : (
                messages.map((m) => {
                  const admin = isAdminMessage(m);
                  return (
                    <div
                      key={m.id ?? `${m.created_at}-${m.body?.slice(0, 12)}`}
                      className={`flex ${admin ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-subtle ${
                          admin
                            ? 'bg-white/10 text-gray-100 rounded-bl-md'
                            : 'bg-kiri-gold-500 text-kiri-dark-950 font-medium rounded-br-md'
                        }`}
                      >
                        {admin && (
                          <p className="text-[10px] font-bold uppercase tracking-wider text-kiri-gold-300 mb-1">
                            {m.sender_name || 'Admin KIRI'}
                          </p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        {m.created_at && (
                          <p className={`text-[9px] mt-1 ${admin ? 'text-gray-500' : 'text-kiri-dark-950/60'} text-right`}>
                            {timeLabel(m.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={listEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={send} className="border-t border-white/10 p-3 sm:p-4 flex items-center gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  currentUser?.name
                    ? `Halo ${currentUser.name.split(' ')[0]}, tulis pesan…`
                    : 'Tulis pesan…'
                }
                className="flex-1 bg-[#001710] border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-kiri-gold-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-11 h-11 shrink-0 rounded-full bg-kiri-gold-500 hover:bg-kiri-gold-400 disabled:opacity-40 text-kiri-dark-950 flex items-center justify-center transition-colors shadow-[0_4px_16px_rgba(216,174,90,0.3)]"
                aria-label="Kirim pesan"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
