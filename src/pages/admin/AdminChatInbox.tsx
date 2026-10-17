import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { useApp } from '../../context/AppContext';
import { Loader2, MessageSquare, Send, X } from 'lucide-react';
import {
  AdminChatMessage,
  AdminChatThread,
  fetchAdminChatThreads,
  fetchAdminThreadMessages,
  formatDateTime,
  isAdminMessage,
} from '../../lib/adminInbox';

/**
 * Admin Chat Inbox — Thread list + conversation view for Page25.
 * Threads: GET /api/chat/threads. Open thread: GET /api/chat/threads/:profileId
 * (polled every 10s). Send: POST /api/chat/messages { body, thread_profile_id }.
 * Bubbles: member left, admin right.
 */

const POLL_INTERVAL_MS = 10_000;

const timeLabel = (iso?: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
};

export const AdminChatInbox: React.FC<{ onThreadsRefreshed?: (threads: AdminChatThread[]) => void }> = ({
  onThreadsRefreshed,
}) => {
  const { showToast } = useApp();
  const [threads, setThreads] = useState<AdminChatThread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<AdminChatThread | null>(null);
  const [messages, setMessages] = useState<AdminChatMessage[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const activeProfileIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
  }, []);

  const loadThreads = useCallback(
    async (initial: boolean) => {
      if (initial) setThreadsLoading(true);
      try {
        const list = await fetchAdminChatThreads(api);
        setThreads(list);
        onThreadsRefreshed?.(list);
      } catch {
        /* keep last known threads on transient failure */
      } finally {
        if (initial) setThreadsLoading(false);
      }
    },
    [onThreadsRefreshed]
  );

  useEffect(() => {
    loadThreads(true);
  }, [loadThreads]);

  const loadMessages = useCallback(async (profileId: string, initial: boolean) => {
    if (initial) setThreadLoading(true);
    try {
      const list = await fetchAdminThreadMessages(api, profileId);
      // Ignore stale responses after switching threads quickly.
      if (activeProfileIdRef.current === profileId) {
        setMessages(list);
      }
    } catch {
      /* keep last known messages on transient poll failure */
    } finally {
      if (initial) setThreadLoading(false);
      scrollToBottom();
    }
  }, [scrollToBottom]);

  const openThread = useCallback((thread: AdminChatThread) => {
    activeProfileIdRef.current = thread.profileId;
    setActiveThread(thread);
    setMessages([]);
    loadMessages(thread.profileId, true);
    // Optimistically clear the unread badge for this thread.
    setThreads((prev) =>
      prev.map((t) => (t.profileId === thread.profileId ? { ...t, unreadCount: 0 } : t))
    );
  }, [loadMessages]);

  // Poll the open conversation every 10s.
  useEffect(() => {
    if (!activeThread) return;
    const interval = setInterval(() => {
      loadMessages(activeThread.profileId, false);
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [activeThread, loadMessages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = input.trim();
    if (!body || !activeThread || sending) return;
    setSending(true);
    try {
      await api.post('/chat/messages', { body, thread_profile_id: activeThread.profileId });
      setInput('');
      await loadMessages(activeThread.profileId, false);
      loadThreads(false);
    } catch {
      showToast('Pesan gagal terkirim. Coba lagi.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
      {/* Thread list */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-kiri-dark-700 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">
              Inbox Chat Member
            </h3>
            <p className="text-[10px] text-gray-400">
              {threads.filter((t) => t.unreadCount > 0).length} thread belum dibaca
            </p>
          </div>
          <MessageSquare className="w-4 h-4 text-kiri-gold-600" />
        </div>
        <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-100 dark:divide-kiri-dark-700">
          {threadsLoading ? (
            <div className="p-8 flex justify-center text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin text-kiri-gold-500" />
            </div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Belum ada percakapan dari member.
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.profileId}
                onClick={() => openThread(t)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  activeThread?.profileId === t.profileId
                    ? 'bg-kiri-gold-500/10'
                    : 'hover:bg-gray-50 dark:hover:bg-kiri-dark-750'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-kiri-green-950 dark:text-white truncate">
                    {t.name}
                  </p>
                  {t.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[20px] h-5 px-1.5 rounded-full bg-kiri-gold-500 text-kiri-dark-950 text-[10px] font-bold flex items-center justify-center">
                      {t.unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 truncate">{t.email}</p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-1">
                  {t.lastMessage || '—'}
                </p>
                {t.updatedAt && (
                  <p className="text-[9px] text-gray-400 text-right mt-1">
                    {formatDateTime(t.updatedAt)}
                  </p>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <div className="bg-white dark:bg-kiri-dark-800 rounded-3xl border border-gray-200 dark:border-kiri-dark-700 overflow-hidden shadow-subtle flex flex-col h-[560px]">
        {activeThread ? (
          <>
            <div className="px-5 py-4 border-b border-gray-100 dark:border-kiri-dark-700 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-kiri-green-950 dark:text-white">
                  {activeThread.name}
                </h3>
                <p className="text-[10px] text-gray-400">{activeThread.email}</p>
              </div>
              <button
                onClick={() => {
                  activeProfileIdRef.current = null;
                  setActiveThread(null);
                  setMessages([]);
                }}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                aria-label="Tutup percakapan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-gray-50/50 dark:bg-kiri-dark-850/40">
              {threadLoading ? (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-kiri-gold-500" />
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Belum ada pesan pada thread ini.
                </div>
              ) : (
                messages.map((m) => {
                  const admin = isAdminMessage(m);
                  return (
                    <div
                      key={String(m.id)}
                      className={`flex ${admin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                          admin
                            ? 'bg-kiri-gold-500 text-kiri-dark-950 font-medium rounded-br-md'
                            : 'bg-gray-200/70 dark:bg-kiri-dark-700 text-gray-800 dark:text-gray-100 rounded-bl-md'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        {m.createdAt && (
                          <p
                            className={`text-[9px] mt-1 text-right ${
                              admin ? 'text-kiri-dark-950/60' : 'text-gray-400'
                            }`}
                          >
                            {timeLabel(m.createdAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={listEndRef} />
            </div>

            <form
              onSubmit={send}
              className="border-t border-gray-100 dark:border-kiri-dark-700 p-3 sm:p-4 flex items-center gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Balas ${activeThread.name.split(' ')[0]}…`}
                className="flex-1 px-4 py-2.5 text-xs rounded-full border border-gray-200 dark:border-kiri-dark-700 bg-gray-50 dark:bg-kiri-dark-850 text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-kiri-gold-500 transition-colors"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="w-10 h-10 shrink-0 rounded-full bg-kiri-green-900 dark:bg-kiri-gold-500 text-white dark:text-kiri-dark-950 disabled:opacity-40 flex items-center justify-center transition-opacity hover:opacity-90"
                aria-label="Kirim balasan"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <MessageSquare className="w-8 h-8 text-kiri-gold-500/40" />
            <p className="text-xs">Pilih sebuah thread untuk membuka percakapan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
