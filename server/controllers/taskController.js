import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, completed } = req.body;
        const task = new Task({
            title,
            description,
            priority: priority ? priority.toLowerCase() : "low",
            dueDate,
            completed: completed === "yes" || completed === true,
            owner: "temp-user" // Temporary owner for now
        });
        const saved = await task.save();
        res.status(201).json({ success: true, task: saved });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        const tasks = await Task.find().sort({ createdAt: -1 });
        res.json({ success: true, tasks });
    } catch (err) {
        console.error('Error in getTasks:', err.message);
        res.status(500).json({ success: false, message: err.message });
    }
};

export const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        res.json({ success: true, task });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, completed } = req.body;
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                priority: priority ? priority.toLowerCase() : undefined,
                dueDate,
                completed: completed === "yes" || completed === true
            },
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        
        res.json({ success: true, task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }
        
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



