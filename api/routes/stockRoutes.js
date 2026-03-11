const router = require('express').Router();
const {
    stockInward,
    getStockByProduct,
    getStockByGodown
} = require('../controllers/stockController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/inward', verifyToken, allowRoles('admin'), stockInward);
router.get('/product/:product_id', verifyToken, getStockByProduct);
router.get('/godown/:godown_id', verifyToken,
    allowRoles('admin'), getStockByGodown);

module.exports = router;
