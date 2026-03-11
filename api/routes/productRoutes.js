const router = require('express').Router();
const path = require('path');
const multer = require('multer');
const {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct
} = require('../controllers/productController');
const { verifyToken } = require('../middleware/auth');
const { allowRoles } = require('../middleware/roleCheck');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, './uploads'),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const isValid = allowed.test(
        path.extname(file.originalname).toLowerCase());
    isValid ? cb(null, true)
            : cb(new Error('Only JPEG, JPG, PNG, WEBP allowed!'));
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, allowRoles('admin'),
    upload.single('image'), createProduct);
router.put('/:id', verifyToken, allowRoles('admin'),
    upload.single('image'), updateProduct);

module.exports = router;
