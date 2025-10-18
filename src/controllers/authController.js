const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function register(req, res) {
  try {
    const { name, email, password, fcmToken } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email in use' });
    const passwordHash = await bcrypt.hash(password || 'password', 10);
    const user = await User.create({ name, email, passwordHash, fcmToken });
    return res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Registration failed' });
  }
}

async function login(req, res) {
  try {
    const { email, password, fcmToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password || 'password', user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'changeme', { expiresIn: '7d' });
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    return res.status(500).json({ error: 'Login failed' });
  }
}

module.exports = { register, login };

// List users for pairing (MVP convenience)
async function listUsers(req, res) {
  try {
    const users = await User.find({}, { name: 1, email: 1 }).sort({ name: 1 });
    return res.json({ users: users.map(u => ({ id: u._id, name: u.name, email: u.email })) });
  } catch (e) {
    return res.status(500).json({ error: 'List users failed' });
  }
}

module.exports.listUsers = listUsers;