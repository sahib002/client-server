const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/mern', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"));

app.get('/', (req, res) => {
  res.send('Hello from server!');
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

