const router = require('express').Router();
const auth = require('../middleware/auth');
const { createPair, getPairedUser} = require('../controllers/pairController');

router.post('/create', auth, createPair);
router.get('/:userId', auth, getPairedUser);

module.exports = router;