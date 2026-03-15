document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default dispatch date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('shipDispatchDate').value = today;

    // Set expected delivery 7 days from today
    const expected = new Date();
    expected.setDate(expected.getDate() + 7);
    document.getElementById('shipExpectedDate').value =
        expected.toISOString().split('T')[0];

    loadShipments();
    loadPendingOrders();
});

// ============================================
// Load all shipments
// ============================================
const loadShipments = async () => {
    const status = document.getElementById('filterShipmentStatus').value;
    const tbody = document.getElementById('shipmentsTable');
    tbody.innerHTML =
        '<tr><td colspan="10" class="text-center">Loading...</td></tr>';

    try {
        // Get all orders that are shipped/processing
        const ordersData = await apiCall('/orders?limit=500');
        if (!ordersData.success) {
            tbody.innerHTML =
                '<tr><td colspan="10" class="text-center">Failed to load</td></tr>';
            return;
        }

        // Get shipments for each shipped order
        const shippedOrders = ordersData.data.filter(o =>
            ['shipped','delivered','processing'].includes(o.order_status));

        if (shippedOrders.length === 0) {
            tbody.innerHTML =
                '<tr><td colspan="10" class="text-center">No shipments found</td></tr>';
            return;
        }

        // Load individual shipment details
        const shipmentRows = [];
        for (const order of shippedOrders) {
            const sData = await apiCall(
                `/shipments/order/${order.id}`);
            if (sData.success && sData.data) {
                shipmentRows.push({
                    ...sData.data,
                    order_number: order.order_number,
                    shop_name: order.shop_name
                });
            }
        }

        renderShipmentsTable(shipmentRows, status);

    } catch (err) {
        tbody.innerHTML =
            `<tr><td colspan="10" class="text-center">
                Error: ${err.message}</td></tr>`;
    }
};

const renderShipmentsTable = (rows, statusFilter) => {
    const tbody = document.getElementById('shipmentsTable');
    const filtered = statusFilter
        ? rows.filter(r => r.shipment_status === statusFilter)
        : rows;

    tbody.innerHTML = filtered.length ? filtered.map(s => `
        <tr>
            <td><strong>${s.order_number}</strong></td>
            <td>${s.shop_name || '—'}</td>
            <td>${s.courier_name || '—'}</td>
            <td><strong>${s.tracking_number || '—'}</strong></td>
            <td>${s.dispatch_date
                ? new Date(s.dispatch_date)
                    .toLocaleDateString('en-IN') : '—'}</td>
            <td>${s.expected_delivery
                ? new Date(s.expected_delivery)
                    .toLocaleDateString('en-IN') : '—'}</td>
            <td>${s.actual_delivery
                ? new Date(s.actual_delivery)
                    .toLocaleDateString('en-IN')
                : '<span style="color:#999">Pending</span>'}</td>
            <td><span class="badge badge-${getStatusBadge(s.shipment_status)}">
                ${s.shipment_status}</span></td>
            <td>${s.email_sent
                ? `<span class="badge badge-confirmed">✅ Sent</span>`
                : `<span class="badge badge-cancelled">❌ No</span>`}</td>
            <td class="action-btns">
                <button class="btn-edit"
                    onclick="openUpdateModal(${s.id},
                    '${s.shipment_status}',
                    '${s.tracking_number || ''}',
                    '${s.notes || ''}')">
                    Update
                </button>
            </td>
        </tr>`).join('')
        : '<tr><td colspan="10" class="text-center">No shipments found</td></tr>';
};

const getStatusBadge = (status) => {
    const map = {
        preparing: 'placed',
        dispatched: 'shipped',
        in_transit: 'pending',
        delivered: 'confirmed',
        returned: 'cancelled'
    };
    return map[status] || 'placed';
};

// ============================================
// Load pending orders for shipment dropdown
// ============================================
const loadPendingOrders = async () => {
    const data = await apiCall('/orders?limit=500');
    if (!data.success) return;

    const pendingOrders = data.data.filter(o =>
        ['placed','confirmed','processing'].includes(o.order_status));

    const sel = document.getElementById('shipmentOrder');
    sel.innerHTML = '<option value="">-- Select Order --</option>';

    if (pendingOrders.length === 0) {
        sel.innerHTML +=
            '<option disabled>No pending orders available</option>';
        return;
    }

    pendingOrders.forEach(o => {
        sel.innerHTML += `
            <option value="${o.id}"
                data-shop="${o.shop_name || ''}"
                data-amount="₹${parseFloat(o.total_amount)
                    .toLocaleString('en-IN')}"
                data-bundles="${o.total_bundles}"
                data-sarees="${o.total_sarees}">
                ${o.order_number} – ${o.shop_name || 'Unknown'}
                (${o.total_bundles} bundles)
            </option>`;
    });
};

// ============================================
// Load order info when order is selected
// ============================================
const loadOrderInfo = async () => {
    const sel = document.getElementById('shipmentOrder');
    const opt = sel.options[sel.selectedIndex];

    if (!opt || !opt.value) {
        document.getElementById('shipmentShopName').value = '';
        document.getElementById('orderItemsPreview')
            .classList.add('hidden');
        return;
    }

    // Fill shop name
    document.getElementById('shipmentShopName').value =
        opt.dataset.shop || '—';

    // Load order items
    const orderId = opt.value;
    const data = await apiCall(`/orders/${orderId}`);

    if (data.success && data.data.items) {
        const preview = document.getElementById('orderItemsPreview');
        const tbody = document.getElementById('orderItemsBody');

        tbody.innerHTML = data.data.items.map(i => `
            <tr>
                <td><strong>${i.product_code}</strong></td>
                <td>${i.product_name}</td>
                <td>${i.bundles_ordered}</td>
                <td>${i.total_sarees}</td>
                <td>₹${parseFloat(i.line_total)
                    .toLocaleString('en-IN')}</td>
            </tr>`).join('');

        preview.classList.remove('hidden');
    }
};

// ============================================
// Create Shipment Form Submit
// ============================================
document.getElementById('createShipmentForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = e.target.querySelector('[type="submit"]');
    submitBtn.textContent = 'Creating...';
    submitBtn.disabled = true;

    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    try {
        const data = await apiCall('/shipments', 'POST', body);
        if (data.success) {
            closeModal('createShipmentModal');
            e.target.reset();
            document.getElementById('shipmentShopName').value = '';
            document.getElementById('orderItemsPreview')
                .classList.add('hidden');

            // Reset dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('shipDispatchDate').value = today;
            const exp = new Date();
            exp.setDate(exp.getDate() + 7);
            document.getElementById('shipExpectedDate').value =
                exp.toISOString().split('T')[0];

            loadShipments();
            loadPendingOrders();

            alert('✅ Shipment created successfully!\n📧 Email sent to buyer.');
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (err) {
        alert('❌ Server error: ' + err.message);
    }

    submitBtn.textContent = '🚚 Create Shipment & Send Email';
    submitBtn.disabled = false;
});

// ============================================
// Open Update Modal
// ============================================
const openUpdateModal = (id, status, tracking, notes) => {
    document.getElementById('updateShipmentId').value = id;
    document.getElementById('updateStatus').value = status;
    document.getElementById('updateTracking').value = tracking;
    document.getElementById('updateNotes').value = notes;
    document.getElementById('updateActualDelivery').value = '';
    openModal('updateShipmentModal');
};

// ============================================
// Update Shipment Form Submit
// ============================================
document.getElementById('updateShipmentForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('updateShipmentId').value;
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());

    // Remove empty fields
    Object.keys(body).forEach(k => {
        if (!body[k]) delete body[k];
    });

    const data = await apiCall(`/shipments/${id}`, 'PUT', body);
    if (data.success) {
        closeModal('updateShipmentModal');
        loadShipments();
        alert('✅ Shipment updated successfully!');
    } else {
        alert('❌ Error: ' + data.message);
    }
});
