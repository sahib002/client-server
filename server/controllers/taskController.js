import Task from "../models/taskModel.js";

export const createTask = async (req, res) => {
    try {
        const { title, description, priority, dueDate, startTime, endTime, completed, userEmail } = req.body;
        
        console.log('📥 Creating task with data:', {
            title,
            startTime,
            endTime,
            dueDate,
            startTimeType: typeof startTime,
            endTimeType: typeof endTime
        });
        
        // Use userEmail from request, fallback to temp-user for backward compatibility
        const owner = userEmail || "temp-user";
        
        const task = new Task({
            title,
            description,
            priority: priority ? priority.toLowerCase() : "low",
            dueDate,
            startTime,
            endTime,
            completed: completed === "yes" || completed === true,
            owner: owner
        });
        const saved = await task.save();
        
        console.log('💾 Task saved:', {
            title: saved.title,
            startTime: saved.startTime,
            endTime: saved.endTime
        });
        
        res.status(201).json({ success: true, task: saved });
    } catch (err) {
        console.error('❌ Error creating task:', err);
        res.status(400).json({ success: false, message: err.message });
    }
};

export const getTasks = async (req, res) => {
    try {
        // Get userEmail from query parameter
        const { userEmail } = req.query;
        
        // Create filter object
        const filter = userEmail ? { owner: userEmail } : {};
        
        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        
        console.log('📤 Returning tasks from database:', tasks.map(t => ({
            title: t.title,
            startTime: t.startTime,
            endTime: t.endTime,
            dueDate: t.dueDate
        })));
        
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
        const { title, description, priority, dueDate, startTime, endTime, completed, userEmail } = req.body;
        
        // Create filter to ensure user can only update their own tasks
        const filter = { _id: req.params.id };
        if (userEmail) {
            filter.owner = userEmail;
        }
        
        const task = await Task.findOneAndUpdate(
            filter,
            {
                title,
                description,
                priority: priority ? priority.toLowerCase() : undefined,
                dueDate,
                startTime,
                endTime,
                completed: completed === "yes" || completed === true
            },
            { new: true, runValidators: true }
        );
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or you don't have permission to update it"
            });
        }
        
        res.json({ success: true, task });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

export const deleteTask = async (req, res) => {
    try {
        // Get userEmail from query parameter or body
        const userEmail = req.query.userEmail || req.body.userEmail;
        
        // Create filter to ensure user can only delete their own tasks
        const filter = { _id: req.params.id };
        if (userEmail) {
            filter.owner = userEmail;
        }
        
        const task = await Task.findOneAndDelete(filter);
        
        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found or you don't have permission to delete it"
            });
        }
        
        res.json({ success: true, message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};



