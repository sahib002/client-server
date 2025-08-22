import OpenAI from 'openai';
import { tools, runTool } from './tools.js';

// Minimal server-side conversation memory (in-memory per convo)
// Map<conversationId, { history: Array<{role:string, content:string}>, userEmail: string }>
const SESSIONS = new Map();

function getSession(conversationId, userEmail) {
  let sess = SESSIONS.get(conversationId);
  if (!sess) {
    sess = { history: [], userEmail };
    SESSIONS.set(conversationId, sess);
    return sess;
  }
  if (sess.userEmail !== userEmail) {
    // Identity changed: reset history to avoid cross-user leakage and old prompts
    sess = { history: [], userEmail };
    SESSIONS.set(conversationId, sess);
  }
  return sess;
}

function scrubEmailAsk(text) {
  const t = (text || '').toString();
  const lower = t.toLowerCase();
  const emailAsk = (lower.includes('your email') || /\bemail\b/.test(lower)) && (lower.includes('what is') || lower.includes('provide') || lower.includes('share') || lower.includes('tell'));
  if (emailAsk) {
    return 'No need for your email; I already know who you are. What would you like to do with your tasks?';
  }
  return t;
}

function isEmailAsk(text) {
  const t = (text || '').toString().toLowerCase();
  return (t.includes('your email') || /\bemail\b/.test(t)) && (t.includes('what is') || t.includes('provide') || t.includes('share') || t.includes('tell'));
}

function sanitize(str = '') {
  return String(str).slice(0, 2000);
}

// offline heuristic removed to restore previous behavior

export async function handleLLMMessage(req, res) {
  try {
  const { conversationId, message } = req.body || {};
  // Derive user email from request context; never ask the user for it
  const headerEmail = req.get('x-user-email');
  const bodyEmail = req.body?.userEmail;
  const email = headerEmail || bodyEmail || 'temp-user';
  if (!conversationId || !message) return res.status(400).json({ success: false, message: 'conversationId and message are required' });
  const sess = getSession(conversationId, email);
  const history = sess.history;

  const system = `You are a helpful task assistant. Use tools to add, update, delete, and list tasks for the user.\n
Rules:\n- The server provides the user identity; NEVER ask the user for email or identity.\n- Always scope actions to that server-provided user.\n- Ask for missing required info (title for add; id for update/delete).\n- Confirm destructive actions (delete) before calling the tool.\n- If user asks to delete without confirming, ask: "Are you sure?"`;

    // If OpenAI isn't configured, use offline fallback to ensure no errors are shown to the user
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ success: false, message: 'LLM unavailable: missing OPENAI_API_KEY' });
    }

    const client = new OpenAI({ apiKey });

    const messages = [
      { role: 'system', content: system },
      ...history,
      { role: 'user', content: message },
    ];

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      tools,
      tool_choice: 'auto',
      temperature: 0.2,
    });

    const first = response.choices?.[0]?.message;

    // If the model decided to call a tool
    if (first?.tool_calls?.length) {
      // Guard: if the content asks for email, override with guidance
      if (isEmailAsk(first?.content)) {
        const guidance = 'No need for your email; I already know who you are. Tell me what to do with your tasks (e.g., "Add task \"Pay bill\" high priority tomorrow").';
        const newHistory = [...history, { role: 'user', content: message }, { role: 'assistant', content: guidance }];
        sess.history = newHistory;
        SESSIONS.set(conversationId, sess);
        return res.json({ success: true, reply: guidance, conversationId });
      }
      const toolCall = first.tool_calls[0];
      const { name, arguments: argsStr } = toolCall.function;
      let args = {};
      try { args = JSON.parse(argsStr || '{}'); } catch { args = {}; }
      // Ensure user scoping
  // Inject user scoping on the server side, without requiring the model to pass it
  args.userEmail = email;

      // Simple confirmation flow for delete
      if (name === 'deleteTask' && !/\byes\b|\bconfirm\b|\bok\b/i.test(message)) {
        const confirmMsg = { role: 'assistant', content: `Are you sure you want to delete this task? Reply "yes" to confirm.` };
        const newHistory = [...history, { role: 'user', content: message }, confirmMsg];
        // Preserve session shape when updating history
        sess.history = newHistory;
        SESSIONS.set(conversationId, sess);
        return res.json({ success: true, reply: confirmMsg.content, conversationId });
      }

  const toolResult = await runTool(name, args);

      // Provide tool result back to the model for a final user-facing message
    const followup = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          ...history,
          { role: 'user', content: message },
      // Include the assistant tool-call message so tool_call_id can be resolved
      first,
          {
            role: 'tool',
            tool_call_id: toolCall.id,
            name,
            content: JSON.stringify(toolResult),
          },
        ],
        temperature: 0.2,
      });

  const finalMsg = followup.choices?.[0]?.message?.content || 'Done.';
  const safeReply = scrubEmailAsk(finalMsg);
  const newHistory = [...history, { role: 'user', content: message }, { role: 'assistant', content: safeReply }];
  sess.history = newHistory;
  SESSIONS.set(conversationId, sess);
  return res.json({ success: true, reply: safeReply, toolResult, conversationId });
    }

    // No tool call: if the model asks for email, handle locally instead
    if (isEmailAsk(first?.content)) {
      const guidance = 'No need for your email; I already know who you are. Tell me what to do with your tasks (e.g., "Add task \"Pay bill\" high priority tomorrow").';
      const newHistory = [...history, { role: 'user', content: message }, { role: 'assistant', content: guidance }];
      sess.history = newHistory;
      SESSIONS.set(conversationId, sess);
      return res.json({ success: true, reply: guidance, conversationId });
    }
    const reply = first?.content || 'I can add, update, delete, and list tasks; tell me what to do.';
    const safeReply = scrubEmailAsk(reply);
    const newHistory = [...history, { role: 'user', content: message }, { role: 'assistant', content: safeReply }];
    sess.history = newHistory;
    SESSIONS.set(conversationId, sess);
    return res.json({ success: true, reply: safeReply, conversationId });
  } catch (err) {
    console.error('LLM Agent error:', err);
    return res.status(502).json({ success: false, message: err.message });
  }
}
