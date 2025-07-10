const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const PORT = 3000;
const bcrypt = require('bcryptjs');

// Replace with your MongoDB connection string
const MONGO_URI = 'mongodb+srv://gantavya:es9bq2bdBUvs02Fv@internship-website.rmfjbrn.mongodb.net/?retryWrites=true&w=majority&appName=internship-website';

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Mongoose User Model
const User = mongoose.model('User', new mongoose.Schema({
  company: String,
  email: { type: String, unique: true },
  password: String
}));

// Signup route
app.post('/signup', async (req, res) => {
  const { company, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*]{8,}$/;

    if(!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid Email. Please enter a valid email.' });
    }

    if(!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long and include at least 1 letter and 1 number.' });
    }

    if (!company || company.trim().length < 2) {
      return res.status(400).json({ message: 'Company name is too short' });
    }

  try {
    const hashedPassword = await bcrypt.hash(password,10);
    const user = new User({ company, email, hashedPassword });
    await user.save();
    res.status(201).json({ message: 'You have successfully registered!' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ message: 'This email already exists. Please use another one' });
    } else {
      res.status(500).json({ message: 'Internal server error. Try again later' });
    }
  }
});

// Login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'Username is incorrect or unregistered. Please recheck' });
  }
  
  const isMatch = await bcrypt.compare(password, user.password);
  if(!isMatch) {
    return res.status(401).json({ message: 'Password is incorrect for entered username. Please recheck' });
  }

  res.status(200).json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
