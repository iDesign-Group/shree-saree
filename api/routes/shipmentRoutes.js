const router = require('express').Router();
const {
    createShipment,
    updateShipment
} = require('../controllers/shipmentController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

router.post('/', verifyToken, allowRoles('admin'), createShipment);
router.put('/:id', verifyToken, allowRoles('admin'), updateShipment);

module.exports = router;
