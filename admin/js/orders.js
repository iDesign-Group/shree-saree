document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

const loadOrders = async () => {
    const status = document.getElementById('filterStatus').value;
    const tbody = document.getElementById('ordersTable');
    tbody.innerHTML =
        '<tr><td colspan="10" class="text-center">Loading...</td></tr>';

    const data = await apiCall(
        `/orders?limit=100${status ? '&status=' + status : ''}`);
    if (!data.success) return;

    tbody.innerHTML = data.data.length ? data.data.map(o => `
        <tr>
            <td><strong>${o.order_number}</strong></td>
            <td>${o.shop_name || '—'}</td>
            <td>${o.broker_code || '—'}</td>
            <td>${o.total_bundles}</td>
            <td>${o.total_sarees}</td>
            <td>₹${parseFloat(o.total_amount)
                .toLocaleString('en-IN')}</td>
            <td class="${isDueSoon(o.payment_due_date)
                ? 'text-danger' : ''}">
                ${new Date(o.payment_due_date)
                    .toLocaleDateString('en-IN')}</td>
            <td><span class="badge badge-${o.payment_status}">
                ${o.payment_status}</span></td>
            <td><span class="badge badge-${o.order_status}">
                ${o.order_status}</span></td>
            <td class="action-btns">
                <button class="btn-edit"
                    onclick="viewOrder(${o.id})">View</button>
                <button class="btn-sm"
                    onclick="shipOrder(${o.id},
                    '${o.order_number}')">Ship</button>
            </td>
        </tr>`).join('')
        : '<tr><td colspan="10" class="text-center">No orders found</td></tr>';
};

const isDueSoon = (dateStr) => {
    const due = new Date(dateStr);
    const today = new Date();
    const diff = (due - today) / (1000 * 60 * 60 * 24);
    return diff <= 7;
};

const viewOrder = async (id) => {
    const data = await apiCall(`/orders/${id}`);
    if (!data.success) return;
    const o = data.data;
    const content = document.getElementById('orderDetailContent');
    content.innerHTML = `
        <div style="padding:20px;">
            <div class="form-grid">
                <div><strong>Order:</strong> ${o.order_number}</div>
                <div><strong>Shop:</strong> ${o.shop_name}</div>
                <div><strong>Date:</strong>
                    ${new Date(o.created_at)
                        .toLocaleDateString('en-IN')}</div>
                <div><strong>Due:</strong>
                    ${new Date(o.payment_due_date)
                        .toLocaleDateString('en-IN')}</div>
                <div><strong>Total:</strong>
                    ₹${parseFloat(o.total_amount)
                        .toLocaleString('en-IN')}</div>
                <div><strong>Status:</strong>
                    <span class="badge badge-${o.order_status}">
                        ${o.order_status}</span></div>
            </div>
            <h4 style="margin:15px 0 10px;">Order Items</h4>
            <table class="data-table">
                <thead><tr>
                    <th>Code</th><th>Product</th>
                    <th>Bundles</th><th>Sarees</th>
                    <th>Rate</th><th>Total</th>
                </tr></thead>
                <tbody>${(o.items || []).map(i => `
                    <tr>
                        <td>${i.product_code}</td>
                        <td>${i.product_name}</td>
                        <td>${i.bundles_ordered}</td>
                        <td>${i.total_sarees}</td>
                        <td>₹${i.price_per_saree}</td>
                        <td>₹${parseFloat(i.line_total)
                            .toLocaleString('en-IN')}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
    openModal('orderDetailModal');
};

const shipOrder = (orderId, orderNumber) => {
    const courier = prompt(
        `Enter courier name for ${orderNumber}:`);
    if (!courier) return;
    const tracking = prompt('Enter tracking number:');
    if (!tracking) return;
    const dispatch = prompt('Dispatch date (YYYY-MM-DD):',
        new Date().toISOString().split('T')[0]);
    const expected = prompt('Expected delivery (YYYY-MM-DD):');

    apiCall('/shipments', 'POST', {
        order_id: orderId,
        courier_name: courier,
        tracking_number: tracking,
        dispatch_date: dispatch,
        expected_delivery: expected,
        shipped_from_godown: 1
    }).then(data => {
        if (data.success) {
            alert('✅ Shipment created! Email sent to buyer.');
            loadOrders();
        } else {
            alert('❌ Error: ' + data.message);
        }
    });
};
