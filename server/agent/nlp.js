import * as chrono from 'chrono-node';

// Very light rule-based intent + slot extraction
export function parseUserMessage(text) {
  const s = text.toLowerCase();
  let intent = null;
  if (/\b(add|create|new)\b.*\btask\b/.test(s)) intent = 'add_task';
  else if (/\b(update|edit|change)\b.*\btask\b/.test(s)) intent = 'update_task';
  else if (/\b(delete|remove)\b.*\btask\b/.test(s)) intent = 'delete_task';
  else if (/\b(list|show)\b.*\btasks\b/.test(s)) intent = 'list_tasks';

  const slots = {};
  // Title after keywords like 'called', 'named', or quoted
  const mQuoted = text.match(/"([^"]+)"|'([^']+)'/);
  if (mQuoted) slots.title = mQuoted[1] || mQuoted[2];
  const mCalled = text.match(/(?:called|named)\s+([\w\s-]{3,})/i);
  if (mCalled) slots.title = mCalled[1].trim();

  // Priority
  const mPr = s.match(/\b(high|medium|low)\b\s*priority/);
  if (mPr) slots.priority = mPr[1];

  // Completed
  if (/\bcompleted\b|\bdone\b/.test(s)) slots.completed = true;

  // Extract times/dates
  const results = chrono.parse(text);
  if (results.length > 0) {
    const r = results[0];
    const date = r.start?.date();
    if (date) {
      // If time present use startTime, otherwise treat as dueDate
      if (r.start.isCertain('hour')) {
        slots.startTime = date.toISOString();
        // duration if mentioned, else optional end time via range
        if (r.end?.date()) slots.endTime = r.end.date().toISOString();
      } else {
        slots.dueDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString();
      }
    }
  }

  // Try to parse HH:MM
  const mTime = s.match(/\b(\d{1,2}:\d{2})\b/);
  if (mTime && !slots.startTime && slots.dueDate) {
    const hhmm = mTime[1];
    const date = new Date(slots.dueDate);
    const [h,m] = hhmm.split(':').map(Number);
    date.setUTCHours(h, m, 0, 0);
    slots.startTime = date.toISOString();
  }

  // Capture id in brackets or explicit 'id'
  const mId = text.match(/\b(id)\s*[:#]?\s*([a-f0-9]{8,24})/i) || text.match(/\[([a-f0-9]{8,24})\]/i);
  if (mId) slots.id = mId[2] || mId[1];

  return { intent, slots };
}

export function slotsMissing(slots, required) {
  return required.filter(k => !slots || slots[k] === undefined || slots[k] === null || slots[k] === '');
}

export function fillSlotsFromText(slots, text, expect) {
  const { slots: newSlots } = parseUserMessage(text);
  const out = { ...slots };
  if (expect in (newSlots || {})) out[expect] = newSlots[expect];

  // Fallback: accept raw value for common fields
  if (!out[expect]) {
    const raw = text.trim();
    if (expect === 'completed') out.completed = /^y(es)?$/i.test(raw);
    else if (expect === 'priority') out.priority = raw.toLowerCase();
    else if (expect === 'title') out.title = raw;
    else if (expect === 'id') out.id = raw;
    else if (expect === 'dueDate') out.dueDate = chrono.parseDate(raw)?.toISOString() || raw;
    else if (expect === 'startTime' || expect === 'endTime') out[expect] = chrono.parseDate(raw)?.toISOString() || raw;
  }
  return out;
}
