import Task from '../models/taskModel.js';

export const tools = [
  {
    type: 'function',
    function: {
      name: 'createTask',
      description: 'Create a new task. title is required. Optional: description, priority (low|medium|high), dueDate, startTime, endTime, completed.',
      parameters: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string', description: 'ISO date' },
          startTime: { type: 'string', description: 'ISO datetime' },
          endTime: { type: 'string', description: 'ISO datetime' },
          completed: { type: 'boolean' }
        },
        required: ['title']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'updateTask',
      description: 'Update a task by id. Provide desired fields to change.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          dueDate: { type: 'string' },
          startTime: { type: 'string' },
          endTime: { type: 'string' },
          completed: { type: 'boolean' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'deleteTask',
      description: 'Delete a task by id.',
      parameters: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'listTasks',
      description: 'List tasks for a user. Optional filters: priority, completed.',
      parameters: {
        type: 'object',
        properties: {
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          completed: { type: 'boolean' }
        },
        required: []
      }
    }
  }
];

export async function runTool(name, args) {
  switch (name) {
    case 'createTask':
      return await createTask(args);
    case 'updateTask':
      return await updateTask(args);
    case 'deleteTask':
      return await deleteTask(args);
    case 'listTasks':
      return await listTasks(args);
    default:
      return { success: false, message: `Unknown tool ${name}` };
  }
}

async function createTask({ title, description, priority, dueDate, startTime, endTime, completed, userEmail }) {
  try {
    const t = await Task.create({
      title,
      description: description || '',
      priority: (priority || 'low').toLowerCase(),
      dueDate: dueDate || undefined,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      completed: !!completed,
      owner: userEmail || 'temp-user'
    });
    return { success: true, task: t };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

async function updateTask({ id, title, description, priority, dueDate, startTime, endTime, completed, userEmail }) {
  try {
    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (priority !== undefined) update.priority = priority.toLowerCase();
    if (dueDate !== undefined) update.dueDate = dueDate;
    if (startTime !== undefined) update.startTime = startTime;
    if (endTime !== undefined) update.endTime = endTime;
    if (completed !== undefined) update.completed = !!completed;
    const t = await Task.findOneAndUpdate({ _id: id, owner: userEmail || 'temp-user' }, update, { new: true });
    if (!t) return { success: false, message: 'Task not found' };
    return { success: true, task: t };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

async function deleteTask({ id, userEmail }) {
  try {
    const t = await Task.findOneAndDelete({ _id: id, owner: userEmail || 'temp-user' });
    if (!t) return { success: false, message: 'Task not found' };
  return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

async function listTasks({ priority, completed, userEmail }) {
  try {
    const filter = { owner: userEmail || 'temp-user' };
    if (priority) filter.priority = priority.toLowerCase();
    if (completed !== undefined) filter.completed = !!completed;
    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return { success: true, tasks };
  } catch (e) {
    return { success: false, message: e.message };
  }
}
