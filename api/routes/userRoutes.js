const router = require('express').Router();
const {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    resetPassword,
    getBrokersList,
    getShopsList,
    getMyProfile
} = require('../controllers/userController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.get('/profile/me', verifyToken, getMyProfile);
router.get('/brokers/list', verifyToken, allowRoles('admin'), getBrokersList);
router.get('/shops/list', verifyToken,
    allowRoles('admin', 'broker'), getShopsList);
router.get('/', verifyToken, allowRoles('admin'), getAllUsers);
router.get('/:id', verifyToken, allowRoles('admin'), getUserById);
router.post('/', verifyToken, allowRoles('admin'), createUser);
router.put('/:id', verifyToken, allowRoles('admin'), updateUser);
router.put('/:id/toggle-status', verifyToken,
    allowRoles('admin'), toggleUserStatus);
router.put('/:id/reset-password', verifyToken,
    allowRoles('admin'), resetPassword);

module.exports = router;
