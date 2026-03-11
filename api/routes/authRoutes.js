const router = require('express').Router();
const { login, register, changePassword } = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/login', login);
router.post('/register', verifyToken, allowRoles('admin'), register);
router.post('/change-password', verifyToken, changePassword);

module.exports = router;
