document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('currentDate').textContent =
        new Date().toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric'
        });

    // 1) Load product count
    const prodCountRes = await apiCall('/products/count');
    if (prodCountRes.success) {
        document.getElementById('totalProducts').textContent =
            prodCountRes.total;
    }

    // 2) Load orders + brokers as before
    const [orders, brokers] = await Promise.all([
        apiCall('/orders?limit=100'),
        apiCall('/users/brokers/list')
    ]);

    if (orders.success) {
        document.getElementById('totalOrders').textContent =
            orders.data.length;
        document.getElementById('pendingOrders').textContent =
            orders.data.filter(o => o.order_status === 'placed').length;
        document.getElementById('shippedOrders').textContent =
            orders.data.filter(o => o.order_status === 'shipped').length;

        const tbody = document.getElementById('recentOrdersTable');
        const recent = orders.data.slice(0, 10);
        tbody.innerHTML = recent.length ? recent.map(o => `
            <tr>
                <td><strong>${o.order_number}</strong></td>
                <td>${o.shop_name || '—'}</td>
                <td>${o.total_bundles}</td>
                <td>₹${parseFloat(o.total_amount)
                    .toLocaleString('en-IN')}</td>
                <td>${new Date(o.payment_due_date)
                    .toLocaleDateString('en-IN')}</td>
                <td><span class="badge badge-${o.order_status}">
                    ${o.order_status}</span></td>
            </tr>`).join('')
            : '<tr><td colspan="6" class="text-center">No orders yet</td></tr>';
    }

    if (brokers.success) {
        document.getElementById('totalBrokers').textContent =
            brokers.data.length;
        const totalShops = brokers.data.reduce(
            (sum, b) => sum + (b.total_shops || 0), 0);
        document.getElementById('totalShops').textContent = totalShops;
    }
});
