const Pair = require('../models/Pair');
const User = require('../models/User');
const History = require('../models/History');
const { sendPush } = require('../services/notifications');

async function giveConsent(req, res) {
  try {
    const { pairId } = req.params;
    const userId = req.userId;

    const pair = await Pair.findById(pairId).populate('users');
    if (!pair) return res.status(404).json({ error: 'Pair not found' });

    const isMember = pair.users.some((u) => String(u._id) === String(userId));
    if (!isMember) return res.status(403).json({ error: 'Requester is not a member of this pair' });

    pair.consent.set(String(userId), true);
    if (typeof pair.markModified === 'function') pair.markModified('consent');
    await pair.save();

    const [userA, userB] = pair.users;
    const other = String(userA._id) === String(userId) ? userB : userA;

    const aConsented = pair.consent.get(String(userA._id)) === true;
    const bConsented = pair.consent.get(String(userB._id)) === true;

    if (aConsented && bConsented) {
      const winner = Math.random() < 0.5 ? userA : userB;
      const loser = String(winner._id) === String(userA._id) ? userB : userA;

      await History.create({ pairId: pair._id, winner: winner._id, loser: loser._id });

      // Filter out invalid/empty tokens
      const tokens = [userA.fcmToken, userB.fcmToken].filter(t => typeof t === 'string' && t.trim().length > 0);
      if (tokens.length > 0) {
        await sendPush(tokens, 'Turn Decision', `${winner.name} goes first!`, {
          pairId: String(pair._id),
          winnerId: String(winner._id),
          loserId: String(loser._id),
          type: 'decision',
        });
      }

      pair.consent = new Map();
      pair.consent.set(userA._id, false);
      pair.consent.set(userB._id, false);
      if (typeof pair.markModified === 'function') pair.markModified('consent');
      await pair.save();

      return res.json({ status: 'decided', winner: { id: winner._id, name: winner.name } });
    } else {
      const self = pair.users.find(u => String(u._id) === String(userId));
      if (other.fcmToken && typeof other.fcmToken === 'string' && other.fcmToken.trim().length > 0) {
        await sendPush([other.fcmToken], 'Consent Needed', `${self.name} has given consent. It's your turn!`, {
          pairId: String(pair._id),
          type: 'consent_request',
        });
      }
      return res.json({ status: 'waiting', message: 'Waiting for other user' });
    }
  } catch (e) {
    console.error('giveConsent error', e);
    return res.status(500).json({ error: e?.message || 'Consent failed' });
  }
}

async function getConsentStatus(req, res) {
  try {
    const { pairId } = req.params;
    const userId = req.userId;

    const pair = await Pair.findById(pairId).populate('users');
    if (!pair) return res.status(404).json({ error: 'Pair not found' });

    const isMember = pair.users.some(u => String(u._id) === String(userId));
    if (!isMember) return res.status(403).json({ error: 'Requester is not a member of this pair' });

    const [userA, userB] = pair.users;
    const partner = String(userA._id) === String(userId) ? userB : userA;

    const myConsent = pair.consent.get(String(userId)) === true;
    const partnerConsent = pair.consent.get(String(partner._id)) === true;

    return res.json({ myConsent, partnerConsent });
  } catch (e) {
    console.error('getConsentStatus error', e);
    return res.status(500).json({ error: 'Failed to fetch consent status' });
  }
}

module.exports = { giveConsent, getConsentStatus };
