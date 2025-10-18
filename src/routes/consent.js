const router = require('express').Router();
const auth = require('../middleware/auth');
const { giveConsent, getConsentStatus } = require('../controllers/consentController');

router.post('/give/:pairId', auth, giveConsent);
router.get('/status/:pairId', auth, getConsentStatus);

module.exports = router;