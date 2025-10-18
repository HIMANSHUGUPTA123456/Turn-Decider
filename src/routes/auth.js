const router = require('express').Router();
const { register, login, listUsers } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/users', listUsers);

module.exports = router;