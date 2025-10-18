const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
  pairId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pair' },
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  loser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('History', historySchema);