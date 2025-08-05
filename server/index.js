import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import taskRouter from './routes/taskRoute.js';

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/taskfast')
  .then(() => {
    console.log("MongoDB Connected to taskfast database");
  }).catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.get('/', (req, res) => {
  res.send('Task Fast Server is running!');
});

// Routes
app.use("/api/tasks", taskRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
