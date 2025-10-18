const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  consent: { type: Map, of: Boolean, default: {} },
});

module.exports = mongoose.model('Pair', pairSchema);