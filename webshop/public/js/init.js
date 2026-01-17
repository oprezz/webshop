if (!window.webshop) window.webshop = {}
if (!frappe.boot) frappe.boot = {}

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
