let currentTab = 'brokers';

document.addEventListener('DOMContentLoaded', () => {
    switchTab('brokers');
    loadBrokersForSelect();
});

const switchTab = async (tab) => {
    currentTab = tab;
    document.querySelectorAll('.tab').forEach((t, i) => {
        t.classList.toggle('active',
            ['brokers','shops','all'][i] === tab);
    });

    const head = document.getElementById('usersTableHead');
    const tbody = document.getElementById('usersTable');
    tbody.innerHTML =
        '<tr><td colspan="8" class="text-center">Loading...</td></tr>';

    if (tab === 'brokers') {
        head.innerHTML = `<tr>
            <th>Name</th><th>Email</th><th>Code</th>
            <th>Commission</th><th>Shops</th>
            <th>Orders</th><th>Status</th><th>Actions</th>
        </tr>`;
        const data = await apiCall('/users/brokers/list');
        tbody.innerHTML = data.data?.length
            ? data.data.map(b => `
            <tr>
                <td><strong>${b.name}</strong></td>
                <td>${b.email}</td>
                <td>${b.broker_code || '—'}</td>
                <td>${b.commission_percent}%</td>
                <td>${b.total_shops}</td>
                <td>${b.total_orders}</td>
                <td><span class="badge ${b.is_active
                    ? 'badge-active' : 'badge-inactive'}">
                    ${b.is_active ? 'Active' : 'Inactive'}</span></td>
                <td><button class="btn-danger"
                    onclick="toggleStatus(${b.id})">
                    Toggle</button></td>
            </tr>`).join('')
            : '<tr><td colspan="8" class="text-center">No brokers found</td></tr>';

    } else if (tab === 'shops') {
        head.innerHTML = `<tr>
            <th>Shop</th><th>Owner</th><th>City</th>
            <th>Broker</th><th>Credit Days</th>
            <th>Orders</th><th>Last Login</th><th>Status</th>
        </tr>`;
        const data = await apiCall('/users/shops/list');
        tbody.innerHTML = data.data?.length
            ? data.data.map(s => `
            <tr>
                <td><strong>${s.shop_name}</strong></td>
                <td>${s.owner_name || s.name}</td>
                <td>${s.city || '—'}</td>
                <td>${s.broker_code || '—'}</td>
                <td>${s.credit_days} days</td>
                <td>${s.total_orders}</td>
                <td>${s.last_login
                    ? new Date(s.last_login)
                        .toLocaleDateString('en-IN')
                    : 'Never'}</td>
                <td><span class="badge ${s.is_active
                    ? 'badge-active' : 'badge-inactive'}">
                    ${s.is_active ? 'Active':'Inactive'}</span></td>
            </tr>`).join('')
            : '<tr><td colspan="8" class="text-center">No shops found</td></tr>';

    } else {
        head.innerHTML = `<tr>
            <th>Name</th><th>Email</th><th>Phone</th>
            <th>Role</th><th>Last Login</th>
            <th>Status</th><th>Actions</th>
        </tr>`;
        const data = await apiCall('/users?limit=100');
        tbody.innerHTML = data.data?.length
            ? data.data.map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.phone || '—'}</td>
                <td><span class="badge badge-placed">${u.role}</span></td>
                <td>${u.last_login
                    ? new Date(u.last_login)
                        .toLocaleDateString('en-IN')
                    : 'Never'}</td>
                <td><span class="badge ${u.is_active
                    ? 'badge-active' : 'badge-inactive'}">
                    ${u.is_active ? 'Active':'Inactive'}</span></td>
                <td><button class="btn-danger"
                    onclick="toggleStatus(${u.id})">
                    Toggle</button></td>
            </tr>`).join('')
            : '<tr><td colspan="7" class="text-center">No users found</td></tr>';
    }
};

const loadBrokersForSelect = async () => {
    const data = await apiCall('/users/brokers/list');
    if (!data.success) return;
    const sel = document.getElementById('brokerSelect');
    data.data.forEach(b => {
        sel.innerHTML +=
            `<option value="${b.id}">${b.name} (${b.broker_code || '—'})</option>`;
    });
};

const toggleRoleFields = () => {
    const role = document.getElementById('userRole').value;
    document.getElementById('brokerFields')
        .classList.toggle('hidden', role !== 'broker');
    document.getElementById('shopFields')
        .classList.toggle('hidden', role !== 'shop_owner');
};

document.getElementById('addUserForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const body = Object.fromEntries(formData.entries());
    const data = await apiCall('/users', 'POST', body);
    if (data.success) {
        closeModal('addUserModal');
        e.target.reset();
        switchTab(currentTab);
        alert('✅ User created successfully!');
    } else {
        alert('❌ Error: ' + data.message);
    }
});

const toggleStatus = async (userId) => {
    if (!confirm('Toggle user status?')) return;
    const data = await apiCall(
        `/users/${userId}/toggle-status`, 'PUT');
    if (data.success) {
        alert(`✅ User ${data.is_active
            ? 'activated' : 'deactivated'}.`);
        switchTab(currentTab);
    }
};
