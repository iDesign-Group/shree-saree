const nodemailer = require('nodemailer');
require('dotenv').config();

// ============================================
// Nodemailer v8.x — Transporter Setup
// ============================================
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT == 465 ? true : false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// ============================================
// Order Confirmation Email
// ============================================
const sendOrderConfirmationEmail = async (toEmail, orderData) => {
    try {
        const transporter = createTransporter();

        const {
            order_number, shop_name, total_bundles,
            total_sarees, total_amount, payment_due_date
        } = orderData;

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: toEmail,
            subject: `Order Confirmed – ${order_number} | Shree Sarees`,
            html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;
                        margin:auto;border:1px solid #eee;
                        padding:30px;border-radius:8px;">
                <div style="background:#8B1A1A;padding:20px;
                            border-radius:6px 6px 0 0;text-align:center;">
                    <h2 style="color:#fff;margin:0;">Shree Sarees</h2>
                </div>
                <div style="padding:20px;">
                    <h3 style="color:#8B1A1A;">
                        ✅ Your Order is Confirmed!</h3>
                    <p>Dear <strong>${shop_name}</strong>,</p>
                    <p>Thank you for your order. We have received it 
                       successfully and will inform you about 
                       shipment shortly.</p>

                    <table style="width:100%;border-collapse:collapse;
                                  margin-top:20px;">
                        <tr style="background:#f9f9f9;">
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Order Number</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ${order_number}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Total Bundles</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ${total_bundles}</td>
                        </tr>
                        <tr style="background:#f9f9f9;">
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Total Sarees</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ${total_sarees}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Total Amount</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ₹${total_amount}</td>
                        </tr>
                        <tr style="background:#f9f9f9;">
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Payment Due Date</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       color:#cc0000;">
                                ${payment_due_date}</td>
                        </tr>
                    </table>

                    <p style="margin-top:20px;color:#666;font-size:13px;">
                        Payment is due within 
                        <strong>60 days</strong> of order date.
                    </p>
                    <hr style="border:none;border-top:1px solid #eee;
                               margin:20px 0;">
                    <p style="color:#8B1A1A;margin:0;">
                        <strong>Shree Sarees Team</strong>
                    </p>
                </div>
            </div>`
        });

        console.log('Order email sent:', info.messageId);
        return true;
    } catch (err) {
        console.error('Order email error:', err.message);
        return false;
    }
};

// ============================================
// Shipment Update Email
// ============================================
const sendShipmentEmail = async (toEmail, shipmentData) => {
    try {
        const transporter = createTransporter();

        const {
            order_number, shop_name, courier_name,
            tracking_number, dispatch_date, expected_delivery
        } = shipmentData;

        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: toEmail,
            subject: `Order ${order_number} Shipped! | Shree Sarees`,
            html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;
                        margin:auto;border:1px solid #eee;
                        padding:30px;border-radius:8px;">
                <div style="background:#8B1A1A;padding:20px;
                            border-radius:6px 6px 0 0;text-align:center;">
                    <h2 style="color:#fff;margin:0;">Shree Sarees</h2>
                </div>
                <div style="padding:20px;">
                    <h3 style="color:#8B1A1A;">
                        🚚 Your Order is On Its Way!</h3>
                    <p>Dear <strong>${shop_name}</strong>,</p>
                    <p>Your order <strong>${order_number}</strong> 
                       has been dispatched successfully.</p>

                    <table style="width:100%;border-collapse:collapse;
                                  margin-top:20px;">
                        <tr style="background:#f9f9f9;">
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Courier</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ${courier_name}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Tracking Number</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                <strong>${tracking_number}</strong></td>
                        </tr>
                        <tr style="background:#f9f9f9;">
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Dispatch Date</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;">
                                ${dispatch_date}</td>
                        </tr>
                        <tr>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       font-weight:bold;">
                                Expected Delivery</td>
                            <td style="padding:10px;
                                       border:1px solid #ddd;
                                       color:#007700;">
                                ${expected_delivery}</td>
                        </tr>
                    </table>

                    <hr style="border:none;border-top:1px solid #eee;
                               margin:20px 0;">
                    <p style="color:#8B1A1A;margin:0;">
                        <strong>Shree Sarees Team</strong>
                    </p>
                </div>
            </div>`
        });

        console.log('Shipment email sent:', info.messageId);
        return true;
    } catch (err) {
        console.error('Shipment email error:', err.message);
        return false;
    }
};

// ============================================
// Test SMTP Connection
// ============================================
const testEmailConnection = async () => {
    try {
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ SMTP connection verified successfully.');
        return true;
    } catch (err) {
        console.error('❌ SMTP connection failed:', err.message);
        return false;
    }
};

module.exports = {
    sendOrderConfirmationEmail,
    sendShipmentEmail,
    testEmailConnection
};
