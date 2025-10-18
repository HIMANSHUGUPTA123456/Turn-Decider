const Pair = require('../models/Pair');
const User = require('../models/User');

// Create a pair if it doesn't exist
async function createPair(req, res) {
  try {
    const { userAId, userBId } = req.body;
    if (!userAId || !userBId) return res.status(400).json({ error: 'Missing user IDs' });

    // Ensure both users exist
    const users = await User.find({ _id: { $in: [userAId, userBId] } });
    if (users.length !== 2) return res.status(404).json({ error: 'Users not found' });

    // Check if pair already exists
    let pair = await Pair.findOne({ users: { $all: [userAId, userBId] } });
    if (!pair) {
      // Create new pair and initialize consent to false for both users
      pair = await Pair.create({ 
        users: [userAId, userBId], 
        consent: { [userAId]: false, [userBId]: false } 
      });
    } 
    return res.json({ pair });
  } catch (e) {
    console.error('createPair error', e);
    return res.status(500).json({ error: 'Pair creation failed' });
  }
}

// Get paired user for a given user
async function getPairedUser(req, res) {
  try {
    const { userAId, userBId } = req.params;

    if (!userAId || !userBId) return res.status(400).json({ error: 'Missing user IDs' });

    // Find the pair containing both users
    const pair = await Pair.findOne({ users: { $all: [userAId, userBId] } }).populate('users');

    if (!pair) return res.json({ pairedUser: null, pair: null });

    // Determine the paired user relative to userAId (or userBId)
    const pairedUser = pair.users.find(u => String(u._id) !== String(userAId));

    return res.json({
      pairedUser: pairedUser ? { id: pairedUser._id, name: pairedUser.name, email: pairedUser.email } : null,
      pair
    });
  } catch (e) {
    console.error('getPairedUser error', e);
    return res.status(500).json({ error: 'Fetch pair failed' });
  }
}

module.exports = { createPair, getPairedUser };
