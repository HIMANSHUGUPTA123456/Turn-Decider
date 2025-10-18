const mongoose = require('mongoose');
const History = require('../models/History');

async function getHistory(req, res) {
  try {
    const { userA, userB } = req.query; // expecting ?userA=<id>&userB=<id>

    // Validate input
    if (!userA || !userB) {
      return res.status(400).json({ error: 'Both userA and userB are required' });
    }

    // Ensure valid ObjectIds
    if (!mongoose.isValidObjectId(userA) || !mongoose.isValidObjectId(userB)) {
      return res.status(400).json({ error: 'Invalid user ID(s)' });
    }

    // Ensure database connection is ready
    if (mongoose.connection.readyState === 0) {
      console.warn('⚠️ Mongoose not connected, attempting reconnect...');
      await mongoose.connect(process.env.MONGO_URI);
    }

    const userAId = new mongoose.Types.ObjectId(userA);
    const userBId = new mongoose.Types.ObjectId(userB);

    // Use $or to fetch history involving both users in any order
    const records = await History.find({
      $or: [
        { winner: userAId, loser: userBId },
        { winner: userBId, loser: userAId },
      ],
    })
      .populate('winner loser pairId')
      .sort({ timestamp: -1 })
      .catch(err => {
        console.error('❌ Mongoose query failed:', err.message);
        throw new Error('Database query error');
      });

    // Map results safely
    const history = records.map(r => ({
      id: r._id.toString(),
      winner: r.winner ? { id: r.winner._id.toString(), name: r.winner.name } : null,
      loser: r.loser ? { id: r.loser._id.toString(), name: r.loser.name } : null,
      pairId: r.pairId ? r.pairId._id.toString() : null,
      timestamp: r.timestamp,
    }));

    // Optional: tiny delay to stabilize async completion in serverless environments
    // await new Promise(resolve => setTimeout(resolve, 5));

    return res.status(200).json({ history });
  } catch (e) {
    console.error('🔥 getHistory critical error:', e);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Fetch history failed' });
    }
  }
}

module.exports = { getHistory };
