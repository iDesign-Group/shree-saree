document.addEventListener('DOMContentLoaded', async () => {
    await loadGodowns();
    await loadProductsDropdown();
    document.getElementById('stockDate').value =
        new Date().toISOString().split('T')[0];
    loadStockLedger();
});

const loadGodowns = async () => {
    // Seed godowns directly since no GET /godowns API yet
    const godowns = [
        { id: 1, name: 'Godown 1 – Bhiwandi' },
        { id: 2, name: 'Godown 2 – Mumbai' },
        { id: 3, name: 'Godown 3 – Surat' },
        { id: 4, name: 'Godown 4 – Ahmedabad' }
    ];
    const sel = document.getElementById('stockGodown');
    const filterSel = document.getElementById('filterGodown');
    godowns.forEach(g => {
        sel.innerHTML += `<option value="${g.id}">${g.name}</option>`;
        filterSel.innerHTML +=
            `<option value="${g.id}">${g.name}</option>`;
    });
};

const loadProductsDropdown = async () => {
    const data = await apiCall('/products?limit=500');
    if (!data.success) return;
    const sel = document.getElementById('stockProduct');
    data.data.forEach(p => {
        sel.innerHTML +=
            `<option value="${p.id}"
                data-bundle="${p.sarees_per_bundle}">
                ${p.product_code} – ${p.name}</option>`;
    });
};

const loadBundleInfo = () => {
    const sel = document.getElementById('stockProduct');
    const opt = sel.options[sel.selectedIndex];
    const bundle = opt.dataset.bundle || '';
    document.getElementById('stockBundleSize').value =
        bundle ? `${bundle} sarees/bundle` : '';
    calcTotalSarees();
};

const calcTotalSarees = () => {
    const sel = document.getElementById('stockProduct');
    const opt = sel.options[sel.selectedIndex];
    const bundle = parseInt(opt?.dataset.bundle) || 0;
    const count = parseInt(
        document.getElementById('stockBundles').value) || 0;
    document.getElementById('stockTotalSarees').value =
        bundle && count ? `${bundle * count} sarees` : '';
};

const loadRacks = async () => {
    const godownId = document.getElementById('stockGodown').value;
    if (!godownId) return;
    // Generate racks based on godown
    const rackCount = godownId == 1 ? 300 : 50;
    const sel = document.getElementById('stockRack');
    sel.innerHTML = '<option value="">-- Select Rack --</option>';
    for (let i = 1; i <= rackCount; i++) {
        const rNum = `R${String(i).padStart(3,'0')}`;
        sel.innerHTML += `<option value="${i}">${rNum}</option>`;
    }
    document.getElementById('stockShelf').innerHTML =
        '<option value="">-- Select Shelf --</option>';
};

const loadShelves = () => {
    const sel = document.getElementById('stockShelf');
    sel.innerHTML = '<option value="">-- Select Shelf --</option>';
    ['A','B','C','D','E','F'].forEach((s, i) => {
        sel.innerHTML += `<option value="${i+1}">Shelf ${s}</option>`;
    });
};

document.getElementById('stockInwardForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const body = Object.fromEntries(formData.entries());

    const data = await apiCall('/stock/inward', 'POST', body);
    if (data.success) {
        form.reset();
        document.getElementById('stockDate').value =
            new Date().toISOString().split('T')[0];
        document.getElementById('stockBundleSize').value = '';
        document.getElementById('stockTotalSarees').value = '';
        loadStockLedger();
        alert(`✅ Stock inward recorded! 
Total Sarees: ${data.total_sarees}`);
    } else {
        alert('❌ Error: ' + data.message);
    }
});

const loadStockLedger = async () => {
    const godownId = document.getElementById('filterGodown').value;
    const tbody = document.getElementById('stockLedgerTable');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">Loading...</td></tr>';

    if (godownId) {
        const data = await apiCall(`/stock/godown/${godownId}`);
        renderStockTable(data.data || []);
    } else {
        // Load all godowns
        const all = [];
        for (let i = 1; i <= 4; i++) {
            const data = await apiCall(`/stock/godown/${i}`);
            if (data.success) all.push(...data.data);
        }
        renderStockTable(all);
    }
};

const renderStockTable = (rows) => {
    const tbody = document.getElementById('stockLedgerTable');

    tbody.innerHTML = rows.length ? rows.map(s => `
        <tr>
            <td><strong>${s.product_code}</strong></td>
            <td>${s.product_name}</td>
            <td>${s.godown_name || 'Godown ' + s.godown_id}</td>
            <td>—</td>  <!-- Rack (merged) -->
            <td>—</td>  <!-- Shelf (merged) -->
            <td><strong>${s.bundles_available}</strong></td>
            <td>${s.sarees_available}</td>
        </tr>`).join('')
        : '<tr><td colspan="7" class="text-center">No stock records found</td></tr>';
};
