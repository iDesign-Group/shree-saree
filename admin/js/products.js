const BASE_IMG = 'http://localhost:5000/';

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

const loadProducts = async (search = '') => {
    const tbody = document.getElementById('productsTable');
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">Loading...</td></tr>';
    const data = await apiCall(`/products?search=${search}&limit=100`);
    if (!data.success) return;

    tbody.innerHTML = data.data.length ? data.data.map(p => {
        const imgSrc = p.primary_image
            ? BASE_IMG + p.primary_image.replace(/\\/g, '/').replace(/^(api\/)?/, '')
            : null;

        return `
        <tr>
            <td>${imgSrc
                ? `<img src="${imgSrc}" class="product-img" onerror="this.style.display='none'">`
                : '\u2014'}</td>
            <td><strong>${p.product_code}</strong></td>
            <td>${p.name}</td>
            <td>${p.category_name || '\u2014'}</td>
            <td>\u20B9${parseFloat(p.price_per_saree).toFixed(2)}</td>
            <td>${p.sarees_per_bundle || '\u2014'} pcs</td>
            <td>\u20B9${p.bundle_price ? parseFloat(p.bundle_price).toFixed(2) : '\u2014'}</td>
            <td><span class="badge ${p.is_active ? 'badge-active' : 'badge-inactive'}">
                ${p.is_active ? 'Active' : 'Inactive'}</span></td>
            <td class="action-btns">
                <button class="btn-edit" onclick="openEditModal(${p.id})">\u270F\uFE0F Edit</button>
                <button class="btn-edit" onclick="viewStock(${p.id})">Stock</button>
                <button class="btn-delete" onclick="deleteProduct(${p.id}, '${p.name.replace(/'/g, "\\'")}'")\uD83D\uDDD1\uFE0F Delete</button>
            </td>
        </tr>`;
    }).join('')
    : '<tr><td colspan="9" class="text-center">No products found</td></tr>';
};

const searchProducts = () => {
    const q = document.getElementById('productSearch').value;
    loadProducts(q);
};

const calcBundlePrice = () => {
    const price  = parseFloat(document.querySelector('[name="price_per_saree"]').value) || 0;
    const bundle = parseInt(document.querySelector('[name="sarees_per_bundle"]').value) || 0;
    document.getElementById('bundlePriceDisplay').value =
        price && bundle ? `\u20B9${(price * bundle).toFixed(2)}` : '';
};

const calcEditBundlePrice = () => {
    const price  = parseFloat(document.getElementById('editPricePerSaree').value) || 0;
    const bundle = parseInt(document.getElementById('editSareesPerBundle').value) || 0;
    document.getElementById('editBundlePriceDisplay').value =
        price && bundle ? `\u20B9${(price * bundle).toFixed(2)}` : '';
};

// Open Edit Modal & pre-fill with product data
const openEditModal = async (productId) => {
    const data = await apiCall(`/products/${productId}`);
    if (!data.success) {
        alert('\u274C Could not load product details.');
        return;
    }
    const p = data.data;

    document.getElementById('editProductId').value       = p.id;
    document.getElementById('editProductCode').value     = p.product_code || '';
    document.getElementById('editProductName').value     = p.name || '';
    document.getElementById('editPricePerSaree').value   = parseFloat(p.price_per_saree) || '';
    document.getElementById('editSareesPerBundle').value = p.sarees_per_bundle || '';
    document.getElementById('editDescription').value     = p.description || '';
    document.getElementById('editMetaTitle').value       = p.meta_title || '';
    document.getElementById('editMetaDescription').value = p.meta_description || '';

    setSelectValue('editFabric', p.fabric);
    setSelectValue('editOccasion', p.occasion);

    const price  = parseFloat(p.price_per_saree) || 0;
    const bundle = parseInt(p.sarees_per_bundle) || 0;
    document.getElementById('editBundlePriceDisplay').value =
        price && bundle ? `\u20B9${(price * bundle).toFixed(2)}` : '';

    openModal('editProductModal');
};

const setSelectValue = (id, value) => {
    const sel = document.getElementById(id);
    if (!sel || !value) return;
    for (const opt of sel.options) {
        if (opt.value.toLowerCase() === value.toLowerCase()) {
            sel.value = opt.value;
            break;
        }
    }
};

// Delete product with confirmation
const deleteProduct = async (productId, productName) => {
    const confirmed = confirm(
        `\u26A0\uFE0F Are you sure you want to delete "${productName}"?\n\nThis will permanently remove the product and all its images. This action cannot be undone.`
    );
    if (!confirmed) return;

    const token = localStorage.getItem('ss_token');
    const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    const data = await res.json();

    if (data.success) {
        loadProducts();
        alert('\u2705 Product deleted successfully!');
    } else {
        alert('\u274C Error: ' + (data.message || 'Delete failed.'));
    }
};

// Edit product form submission
document.getElementById('editProductForm')
    .addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editProductId').value;

    const payload = {
        product_code:      document.getElementById('editProductCode').value.trim(),
        name:              document.getElementById('editProductName').value.trim(),
        price_per_saree:   parseFloat(document.getElementById('editPricePerSaree').value),
        sarees_per_bundle: parseInt(document.getElementById('editSareesPerBundle').value),
        fabric:            document.getElementById('editFabric').value,
        occasion:          document.getElementById('editOccasion').value,
        description:       document.getElementById('editDescription').value.trim(),
        meta_title:        document.getElementById('editMetaTitle').value.trim(),
        meta_description:  document.getElementById('editMetaDescription').value.trim(),
    };

    const token = localStorage.getItem('ss_token');
    const res = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.success) {
        closeModal('editProductModal');
        loadProducts();
        alert('\u2705 Product updated successfully!');
    } else {
        alert('\u274C Error: ' + (data.message || 'Update failed.'));
    }
});

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
        alert('\u2705 Product added successfully!');
    } else {
        alert('\u274C Error: ' + data.message);
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
        const rackLabel  = `R${String(s.rack_id).padStart(3, '0')}`;
        const shelfLabel = ['A','B','C','D','E','F'][s.shelf_id - 1] || s.shelf_id;
        return `${s.godown_name || 'Godown ' + s.godown_id} > `
             + `${rackLabel} > Shelf ${shelfLabel}: `
             + `${s.bundles_available} bundles (${s.sarees_available} sarees)`;
    }).join('\n');
    alert(`Stock Locations:\n${msg}`);
};
