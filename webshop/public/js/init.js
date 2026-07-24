if (!window.webshop) window.webshop = {}
if (!frappe.boot) frappe.boot = {}

// Build the labeled order-options block for a product card (kenyerhaz
// customs): an Item Feature <select> and/or a ❄ frozen checkbox. Returns ''
// for items with neither. Rendered as a sibling ABOVE the qty/add-to-cart
// row (.quantity-add-container) in both list and grid views.
webshop.get_item_options_html = function (item) {
    const features = item.features || [];
    const can_freeze = !!item.can_ship_frozen;
    if (!features.length && !can_freeze) return '';

    webshop.ensure_item_options_styles();

    const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    let rows = '';

    if (features.length) {
        const options = [];
        if (!item.require_item_feature) {
            options.push(`<option value="">${__('Plain')}</option>`);
        }
        features.forEach(f => {
            const label = ((f.icon || '') + ' ' + (f.short_name || f.name)).trim();
            options.push(`<option value="${esc(f.name)}">${esc(label)}</option>`);
        });
        rows += `
            <div class="item-option-row">
                <label class="item-option-label">${__('Feature')}</label>
                <select class="form-control item-feature-select" data-item-code="${esc(item.item_code)}">
                    ${options.join('')}
                </select>
            </div>`;
    }

    if (can_freeze) {
        rows += `
            <div class="item-option-row">
                <label class="item-option-label" for="frz-${esc(item.name)}">${__('Delivery')}</label>
                <label class="item-frozen-toggle" for="frz-${esc(item.name)}">
                    <input type="checkbox" id="frz-${esc(item.name)}" class="item-frozen-check"
                        data-item-code="${esc(item.item_code)}">
                    <span>❄ ${__('Frozen')}</span>
                </label>
            </div>`;
    }

    return `<div class="item-order-options">${rows}</div>`;
};

// Touch-friendly qty control with dedicated −/+ buttons (the native number
// spinner is unusable on phones). Shared by the list and grid product cards;
// the add-to-cart handler keeps reading the .item-qty input value.
webshop.get_qty_control_html = function (item_code) {
    webshop.ensure_item_options_styles();
    const esc = (t) => String(t == null ? '' : t).replace(/[&<>"']/g,
        c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    return `
        <div class="item-qty-control mr-2">
            <button type="button" class="qty-btn" data-dir="dwn" aria-label="${__('Decrease quantity')}">−</button>
            <input type="number" inputmode="numeric" class="item-qty" value="1" min="1" step="1"
                data-item-code="${esc(item_code)}">
            <button type="button" class="qty-btn" data-dir="up" aria-label="${__('Increase quantity')}">+</button>
        </div>`;
};

$(document).on('click', '.item-qty-control .qty-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();
    const $input = $(this).closest('.item-qty-control').find('.item-qty');
    let val = parseInt($input.val(), 10) || 1;
    val = $(this).data('dir') === 'up' ? val + 1 : Math.max(1, val - 1);
    $input.val(val).trigger('change');
});

// One-time style injection for the card options block.
webshop.ensure_item_options_styles = function () {
    if (document.getElementById('item-options-styles')) return;
    const css = `
    .item-order-options {
        width: 100%;
        margin-top: 8px;
        margin-bottom: 4px;
        padding: 8px 10px;
        border: 1px solid var(--gray-200, #e2e6e9);
        border-radius: 8px;
        background-color: var(--gray-50, #f8f9fa);
    }
    .item-order-options .item-option-row {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .item-order-options .item-option-row + .item-option-row {
        margin-top: 6px;
    }
    .item-order-options .item-option-label {
        flex: 0 0 62px;
        margin: 0;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        color: var(--gray-600, #6c757d);
    }
    .item-order-options .item-feature-select {
        flex: 1 1 auto;
        height: 30px;
        font-size: 0.85rem;
        padding: 2px 8px;
    }
    .item-order-options .item-frozen-toggle {
        flex: 1 1 auto;
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 0;
        padding: 4px 8px;
        border: 1px solid #90caf9;
        border-radius: 6px;
        background-color: #e3f2fd;
        color: #1565c0;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
    }
    .item-order-options .item-frozen-toggle input {
        margin: 0;
    }
    .item-qty-control {
        display: flex;
        align-items: stretch;
        flex: 0 0 auto;
    }
    .item-qty-control .qty-btn {
        width: 34px;
        height: 34px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
        border: 1px solid var(--gray-300, #ced4da);
        background-color: var(--gray-100, #f1f3f5);
        color: var(--gray-800, #343a40);
        cursor: pointer;
        user-select: none;
    }
    .item-qty-control .qty-btn:active {
        background-color: var(--gray-300, #ced4da);
    }
    .item-qty-control .qty-btn[data-dir="dwn"] {
        border-radius: 6px 0 0 6px;
        border-right: 0;
    }
    .item-qty-control .qty-btn[data-dir="up"] {
        border-radius: 0 6px 6px 0;
        border-left: 0;
    }
    .item-qty-control .item-qty {
        width: 42px;
        height: 34px;
        padding: 0 2px;
        text-align: center;
        font-size: 0.9rem;
        border: 1px solid var(--gray-300, #ced4da);
        border-radius: 0;
        -moz-appearance: textfield;
        appearance: textfield;
    }
    .item-qty-control .item-qty::-webkit-outer-spin-button,
    .item-qty-control .item-qty::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    `;
    const style = document.createElement('style');
    style.id = 'item-options-styles';
    style.textContent = css;
    document.head.appendChild(style);
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
