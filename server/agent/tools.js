import Task from '../models/taskModel.js';

export async function createTaskTool(input) {
  const { title, description, priority, dueDate, startTime, endTime, userEmail } = input;
  if (!title) return { success: false, message: 'title is required' };
  try {
    const t = await Task.create({
      title,
      description: description || '',
      priority: (priority || 'low').toLowerCase(),
      dueDate: dueDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      owner: userEmail || 'temp-user'
    });
    return { success: true, task: t };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export async function updateTaskTool(input) {
  const { id, title, description, priority, dueDate, startTime, endTime, completed, userEmail } = input;
  if (!id) return { success: false, message: 'id is required' };
  try {
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (priority !== undefined) update.priority = priority.toLowerCase();
    if (dueDate !== undefined) update.dueDate = dueDate;
    if (startTime !== undefined) update.startTime = startTime;
    if (endTime !== undefined) update.endTime = endTime;
    if (completed !== undefined) update.completed = completed === true || /yes|true|done/i.test(String(completed));

    const t = await Task.findOneAndUpdate({ _id: id, owner: userEmail || 'temp-user' }, update, { new: true });
    if (!t) return { success: false, message: 'Task not found' };
    return { success: true, task: t };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export async function deleteTaskTool(input) {
  const { id, title, userEmail } = input;
  try {
    if (id) {
      const t = await Task.findOneAndDelete({ _id: id, owner: userEmail || 'temp-user' });
      if (!t) return { success: false, message: 'Task not found' };
      return { success: true };
    }
    // fallback: match by title and delete first
    if (title) {
      const t = await Task.findOneAndDelete({ title: new RegExp(`^${escapeRegex(title)}$`, 'i'), owner: userEmail || 'temp-user' });
      if (!t) return { success: false, message: 'Task not found' };
      return { success: true };
    }
    return { success: false, message: 'id or title required'};
  } catch (e) {
    return { success: false, message: e.message };
  }
}

export async function getTasksTool(input) {
  const { userEmail, priority, completed } = input;
  const filter = { owner: userEmail || 'temp-user' };
  if (priority) filter.priority = priority.toLowerCase();
  if (completed !== undefined) filter.completed = completed === true || /yes|true|done/i.test(String(completed));
  try {
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return { success: true, tasks };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
