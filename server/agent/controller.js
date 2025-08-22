import { parseUserMessage, slotsMissing, fillSlotsFromText } from './nlp.js';
import { createTaskTool, updateTaskTool, deleteTaskTool, getTasksTool } from './tools.js';
import { getSession, saveSession } from './sessionStore.js';

// Simple orchestrator with slot-filling loop per conversationId
export async function handleMessage(req, res) {
  try {
    const { conversationId, message, userEmail } = req.body || {};
    if (!conversationId) return res.status(400).json({ success: false, message: 'conversationId is required' });
    if (!message || typeof message !== 'string') return res.status(400).json({ success: false, message: 'message is required' });

    const email = userEmail || 'temp-user';

    // Load or init session state
    const session = await getSession(conversationId) || {
      conversationId,
      intent: null,
      slots: {},
      pendingSlot: null,
      lastToolResult: null
    };

    // If we were waiting for a specific slot, try to fill from the reply text first
    if (session.pendingSlot) {
      const updatedSlots = fillSlotsFromText(session.slots, message, session.pendingSlot);
      session.slots = updatedSlots;
      session.pendingSlot = null;
    } else {
      // Fresh parse
      const { intent, slots } = parseUserMessage(message);
      session.intent = intent || session.intent;
      session.slots = { ...session.slots, ...slots };
    }

    // Always include owner
    session.slots.userEmail = email;

    // Determine required slots per intent
    const required = requiredSlots(session.intent);
    const missing = slotsMissing(session.slots, required);

    if (missing.length > 0) {
      const question = askForSlot(session.intent, missing[0]);
      session.pendingSlot = missing[0];
      await saveSession(session);
      return res.json({ success: true, reply: question, conversationId });
    }

    // Execute tool based on intent
    let toolResult;
    switch (session.intent) {
      case 'add_task':
        toolResult = await createTaskTool(session.slots);
        break;
      case 'update_task':
        toolResult = await updateTaskTool(session.slots);
        break;
      case 'delete_task':
        // If id is missing, attempt fuzzy by title and ask confirm
        toolResult = await deleteTaskTool(session.slots);
        break;
      case 'list_tasks':
        toolResult = await getTasksTool(session.slots);
        break;
      default:
        await saveSession(session);
        return res.json({ success: true, reply: "I can help with tasks. Try: 'add task', 'update task', 'delete task', or 'list tasks'.", conversationId });
    }

    session.lastToolResult = toolResult;
    await saveSession(session);

    const reply = renderReply(session.intent, toolResult);
    return res.json({ success: true, reply, toolResult, conversationId });
  } catch (err) {
    console.error('Agent error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

function requiredSlots(intent) {
  switch (intent) {
    case 'add_task':
      return ['title']; // dueDate/time/priority optional
    case 'update_task':
      return ['id'];
    case 'delete_task':
      return ['id'];
    case 'list_tasks':
      return []; // optional filters
    default:
      return [];
  }
}

function askForSlot(intent, slot) {
  const prompts = {
    title: 'What is the task title?',
    id: 'Which task should I target? Send the task ID.',
    dueDate: 'What date? (YYYY-MM-DD)',
    startTime: 'Start time? (e.g., 09:30)',
    endTime: 'End time? (e.g., 10:30)',
    priority: 'Priority? (low/medium/high)',
    completed: 'Is it completed? (yes/no)'
  };
  return prompts[slot] || `Please provide ${slot}.`;
}

function renderReply(intent, toolResult) {
  if (!toolResult?.success) return toolResult?.message || 'Something went wrong.';
  switch (intent) {
    case 'add_task':
      return `Added: ${toolResult.task.title}`;
    case 'update_task':
      return `Updated: ${toolResult.task.title}`;
    case 'delete_task':
      return `Deleted.`;
    case 'list_tasks':
      if (!toolResult.tasks?.length) return 'No tasks found.';
      return toolResult.tasks.slice(0, 5).map(t => {
        const date = t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'no date';
        return `• ${t.title} (${t.priority || 'low'}) - ${date} [${t._id}]`;
      }).join('\n');
    default:
      return 'Done.';
  }
}
