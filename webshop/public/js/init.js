if (!window.webshop) window.webshop = {}
if (!frappe.boot) frappe.boot = {}

// Build the Item Feature <select> for a product card (kenyerhaz custom).
// Items without features get an empty string. `full_width` is used by the
// grid view where the picker sits above the qty/add-to-cart row.
webshop.get_item_feature_select = function (item, full_width) {
    const features = item.features || [];
    if (!features.length) return '';

    const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    const options = [];
    if (!item.require_item_feature) {
        options.push(`<option value="">${__('Plain')}</option>`);
    }
    features.forEach(f => {
        const label = ((f.icon || '') + ' ' + (f.short_name || f.name)).trim();
        options.push(`<option value="${esc(f.name)}">${esc(label)}</option>`);
    });

    const wrapStyle = full_width
        ? 'class="w-100 mt-2" style=""'
        : 'class="input-group input-group-sm mr-2" style="width: 150px; flex: 0 0 150px;"';

    return `
        <div ${wrapStyle}>
            <select class="form-control item-feature-select w-100"
                style="height: 30px; font-size: 0.8rem; padding: 2px 8px;"
                data-item-code="${esc(item.item_code)}">
                ${options.join('')}
            </select>
        </div>`;
};

frappe.ready(function () {
    // Global fix for Address Web Form: Preserve success_url in Edit button
    // This runs on all pages but only takes affect if we are on an address page with the edit button
    if (window.location.pathname.includes('/address/')) {
        const params = new URLSearchParams(window.location.search);
        if (params.has('success_url')) {
            const $editBtn = $('.edit-button');
            if ($editBtn.length) {
                const currentHref = $editBtn.attr('href');
                if (currentHref && !currentHref.includes('success_url')) {
                    const separator = currentHref.includes('?') ? '&' : '?';
                    $editBtn.attr('href', currentHref + separator + 'success_url=' + params.get('success_url'));
                }
            }
        }
    }
});
