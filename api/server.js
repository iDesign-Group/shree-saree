const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/products',  require('./routes/productRoutes'));
app.use('/api/stock',     require('./routes/stockRoutes'));
app.use('/api/orders',    require('./routes/orderRoutes'));
app.use('/api/shipments', require('./routes/shipmentRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));

// Health check
app.get('/', (req, res) => res.json({
    success: true,
    message: 'Shree Sarees API is running 🚀'
}));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Server running on port ${PORT} 🚀`));
