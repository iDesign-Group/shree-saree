shree-sarees-backend/
├── config/
│   ├── db.js               # MySQL connection
│   └── email.js            # Nodemailer SMTP config
├── middleware/
│   ├── auth.js             # JWT verification
│   └── roleCheck.js        # Role-based access
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── stockRoutes.js
│   ├── orderRoutes.js
│   ├── shipmentRoutes.js
│   └── userRoutes.js
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── stockController.js
│   ├── orderController.js
│   ├── shipmentController.js
│   └── userController.js
├── uploads/                # Product images stored here
├── .env
├── package.json
└── server.js
