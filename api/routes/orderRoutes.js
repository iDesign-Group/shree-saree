const router = require('express').Router();
const {
    placeOrder,
    getAllOrders,
    getOrderById
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, allowRoles('admin', 'broker'), getAllOrders);
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
