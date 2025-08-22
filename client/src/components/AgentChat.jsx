import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/authContext';

const API_BASE = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_AGENT_URL)
  ? process.env.REACT_APP_AGENT_URL
  : '/api/agent/messages';

function uuid() {
  return (crypto?.randomUUID && crypto.randomUUID()) || Math.random().toString(36).slice(2);
}

export default function AgentChat() {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || currentUser?.displayName || 'temp-user';

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const convoIdRef = useRef(localStorage.getItem('agent:conversationId') || uuid());

  useEffect(() => {
    localStorage.setItem('agent:conversationId', convoIdRef.current);
  }, []);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const resp = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-email': userEmail || 'temp-user' },
        body: JSON.stringify({ conversationId: convoIdRef.current, message: text }),
      });
      const ct = (resp.headers.get('content-type') || '').toLowerCase();
      let data;
      if (ct.includes('application/json')) {
        data = await resp.json();
      } else {
        const raw = await resp.text();
        data = { success: false, message: `Non-JSON response (${resp.status}): ${raw.slice(0, 200)}` };
      }
  if (!resp.ok || !data.success) throw new Error(data.message || 'Agent failed');
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        aria-label="Open Assistant"
        onClick={() => setOpen(v => !v)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl"
      >
        {open ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
      </button>

      {open && (
        <div className="fixed bottom-20 right-4 z-50 w-80 sm:w-96 bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-800 rounded-xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-3 border-b border-purple-100 dark:border-gray-800 text-sm font-semibold text-gray-700 dark:text-gray-100">
            Task Assistant
          </div>
          <div className="p-3 space-y-2 h-72 overflow-y-auto text-sm">
            {messages.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 text-xs">
                Try: "Add task 'Pay electricity bill' tomorrow 9:00 high priority"
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                <div className={
                  'inline-block px-3 py-2 rounded-lg ' +
                  (m.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100')
                }>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-gray-400">Assistant is typing…</div>}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
            className="p-2 border-t border-purple-100 dark:border-gray-800 flex gap-2"
          >
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-lg text-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
