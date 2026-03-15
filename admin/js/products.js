const BASE_IMG = 'http://localhost:5000/';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

const loadProducts = async (search = '') => {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';
    const data = await apiCall(`/products?search=${search}&limit=100`);
    if (!data.success) return;

    tbody.innerHTML = data.data.length ? data.data.map(p => `
        <tr>
            <td>${p.primary_image
                ? `<img src="${BASE_IMG}${p.primary_image}"
                        class="product-img">`
                : '—'}</td>
            <td><strong>${p.product_code}</strong></td>
            <td>${p.name}</td>
            <td>${p.category_name || '—'}</td>
            <td>₹${p.price_per_saree}</td>
            <td>${p.sarees_per_bundle || '—'} pcs</td>
            <td>₹${p.bundle_price || '—'}</td>
            <td><span class="badge ${p.is_active
                ? 'badge-active' : 'badge-inactive'}">
                ${p.is_active ? 'Active' : 'Inactive'}</span></td>
            <td class="action-btns">
                <button class="btn-edit"
                    onclick="viewStock(${p.id})">Stock</button>
            </td>
        </tr>`).join('')
        : '<tr><td colspan="9" class="text-center">No products found</td></tr>';
};

const searchProducts = () => {
    const q = document.getElementById('productSearch').value;
    loadProducts(q);
};

const calcBundlePrice = () => {
    const price = parseFloat(
        document.querySelector('[name="price_per_saree"]').value) || 0;
    const bundle = parseInt(
        document.querySelector('[name="sarees_per_bundle"]').value) || 0;
    document.getElementById('bundlePriceDisplay').value =
        price && bundle ? `₹${(price * bundle).toFixed(2)}` : '';
};

// Add product form submission
document.getElementById('addProductForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = await apiUpload('/products', formData);
    if (data.success) {
        closeModal('addProductModal');
        form.reset();
        document.getElementById('bundlePriceDisplay').value = '';
        loadProducts();
        alert('✅ Product added successfully!');
    } else {
        alert('❌ Error: ' + data.message);
    }
});

const viewStock = async (productId) => {
    const data = await apiCall(`/stock/product/${productId}`);
    if (!data.success) {
        alert('Could not load stock.');
        return;
    }

    const rows = data.data || [];

    if (!rows.length) {
        alert('No stock found for this product.');
        return;
    }

    const msg = rows.map(s => {
        const rackLabel = `R${String(s.rack_id).padStart(3, '0')}`;
        const shelfLabel =
            ['A','B','C','D','E','F'][s.shelf_id - 1] || s.shelf_id;

        return `${s.godown_name || 'Godown ' + s.godown_id} > `
             + `${rackLabel} > Shelf ${shelfLabel}: `
             + `${s.bundles_available} bundles `
             + `(${s.sarees_available} sarees)`;
    }).join('\n');

    alert(`Stock Locations:\n${msg}`);
};
