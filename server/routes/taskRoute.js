import express from "express";
import { createTask, getTasks, deleteTask, getTaskById, updateTask } from '../controllers/taskController.js';

const taskRouter = express.Router();

taskRouter.route('/')
    .get(getTasks)
    .post(createTask);

taskRouter.route('/:id')
    .get(getTaskById)
    .put(updateTask)
    .delete(deleteTask);

export default taskRouter;