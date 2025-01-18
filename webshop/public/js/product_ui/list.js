webshop.ProductList = class {
	/* Options:
		- items: Items
		- settings: Webshop Settings
		- products_section: Products Wrapper
		- preference: If preference is not list view, render but hide
	*/
	constructor(options) {
		Object.assign(this, options);

		if (this.preference !== "List View") {
			this.products_section.addClass("hidden");
		}

		this.products_section.empty();
		this.make();
	}

	make() {
		let me = this;
		let html = `<br><br>`;

		this.items.forEach(item => {
			let title = item.web_item_name || item.item_name || item.item_code || "";
			title = title.length > 200 ? title.substr(0, 200) + "..." : title;

			html += `<div class='row list-row w-100 mb-4'>`;
			html += me.get_image_html(item, title, me.settings);
			html += me.get_row_body_html(item, title, me.settings);
			html += `</div>`;
		});

		let $product_wrapper = this.products_section;
		$product_wrapper.append(html);
	}

	get_image_html(item, title, settings) {
		let image = item.website_image;
		let wishlist_enabled = !item.has_variants && settings.enable_wishlist;
		let image_html = ``;

		if (image) {
			image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${item.route || '#'}">
						<img itemprop="image" class="website-image h-100 w-100" alt="${title}"
							src="${image}">
					</a>
					${wishlist_enabled ? this.get_wishlist_icon(item) : ''}
				</div>
			`;
		} else {
			image_html += `
				<div class="col-2 border text-center rounded list-image">
					<a class="product-link product-list-link" href="/${item.route || '#'}"
						style="text-decoration: none">
						<div class="card-img-top no-image-list">
							${frappe.get_abbr(title)}
						</div>
					</a>
					${wishlist_enabled ? this.get_wishlist_icon(item) : ''}
				</div>
			`;
		}

		return image_html;
	}

	get_row_body_html(item, title, settings) {
		let body_html = `<div class='col-10 text-left'>`;
		body_html += this.get_title_html(item, title, settings);
		body_html += this.get_item_details(item, settings);
		body_html += `</div>`;
		return body_html;
	}

	get_title_html(item, title, settings) {
		let title_html = `<div style="display: flex; margin-left: -15px;">`;
		title_html += `
			<div class="col-8" style="margin-right: -15px;">
				<a class="" href="/${item.route || '#'}"
					style="color: var(--gray-800); font-weight: 500;">
					${title}
				</a>
			</div>
		`;

		if (settings.enabled) {
			title_html += `<div class="col-4 cart-action-container ${item.in_cart ? 'd-flex' : ''}">`;
			title_html += this.get_primary_button(item, settings);
			title_html += `</div>`;
		}
		title_html += `</div>`;

		return title_html;
	}

	get_item_details(item, settings) {
		let details = `
			<p class="product-code">
				${item.item_group}
			</p>
			<div class="mt-2" style="color: var(--gray-600) !important; font-size: 13px;">
				${item.short_description || ''}
			</div>`;

		details += this.get_weekly_availability(item);

		details += `
			<div class="product-price col-3 d-flex" itemprop="offers"  itemscope itemtype="https://schema.org/AggregateOffer" style="float: right;">
			${item.formatted_price || ''}
			`;

		if (item.formatted_mrp) {
			details += `
				<small class="striked-price">
					<s>${item.formatted_mrp ? item.formatted_mrp.replace(/ +/g, "") : ""}</s>
				</small>
				<small class="ml-1 product-info-green">
					${item.discount} OFF
				</small>
			`;
		}

		details += this.get_stock_availability(item, settings);
		details += `</div>`;

		return details;
	}

	get_weekly_availability(item) {
		// List of available days (customize this array)
		const availableDays = item.weekly_availability || [];

		// All days of the week
		const allDays = [
			__("Monday"),
			__("Tuesday"),
			__("Wednesday"),
			__("Thursday"),
			__("Friday"),
			__("Saturday"),
			__("Sunday")
		];

		// All days of the week to check
		const allDaysToCheck = [
			"Monday",
			"Tuesday",
			"Wednesday",
			"Thursday",
			"Friday",
			"Saturday",
			"Sunday"
		];

		// Start building the HTML table with smaller font and reduced padding
		let tableHTML = `
				<table style="width: 70%; border-collapse: collapse; text-align: center; font-size: 12px; line-height: 1.2;">
					<!-- Header Row with "Delivery available on" -->
					<tr>
						<td colspan="7" style="border: 1px; background-color: lightgrey; font-weight: bold; font-size: 14px; text-align: center;">
							${__("Delivery available on")}
						</td>
					</tr>
					<!-- Days of the week -->
					<tr>
						${allDays.map(day => `<th style="border: 1px solid #ddd; padding: 4px; font-size: 13px; text-transform: capitalize;">${day}</th>`).join("")}
					</tr>
					<!-- Availability row with ticks/crosses -->
					<tr>
						${allDaysToCheck.map(day => {
			const isAvailable = availableDays.includes(day);
			const symbol = isAvailable ? "✔" : "✘";
			const color = isAvailable ? "green" : "red";
			return `<td style="border: 1px solid #ddd; padding: 4px; color: ${color}; font-weight: bold; font-size: 14px;">${symbol}</td>`;
		}).join("")}
					</tr>
				</table>
			`;

		return tableHTML;
	}

	get_stock_availability(item, settings) {
		if (settings.show_stock_availability && !item.has_variants) {
			if (item.on_backorder) {
				return `
					<br>
					<span class="out-of-stock mt-2" style="color: var(--primary-color)">
						${__("Available on backorder")}
					</span>
				`;
			} else if (!item.in_stock) {
				return `
					<br>
					<span class="out-of-stock mt-2">${__("Out of stock")}</span>
				`;
			} else if (item.is_stock) {
				return `
					<br>
					<span class="in-stock in-green has-stock mt-2"
						style="font-size: 14px;">${__("In stock")}</span>
				`;
			}
		}
		return ``;
	}

	get_wishlist_icon(item) {
		let icon_class = item.wished ? "wished" : "not-wished";

		return `
			<div class="like-action-list ${item.wished ? "like-action-wished" : ''}"
				data-item-code="${item.item_code}">
				<svg class="icon sm">
					<use class="${icon_class} wish-icon" href="#icon-heart"></use>
				</svg>
			</div>
		`;
	}

	get_primary_button(item, settings) {
		if (item.has_variants) {
			return `
				<a href="/${item.route || '#'}">
					<div class="btn btn-sm btn-explore-variants btn mb-0 mt-0">
						${__('Explore')}
					</div>
				</a>
			`;
		} else if (settings.enabled && (settings.allow_items_not_in_stock || item.in_stock)) {
			return `
				<div id="${item.name}" class="btn
					btn-sm btn-primary btn-add-to-cart-list mb-0
					${item.in_cart ? 'hidden' : ''}"
					data-item-code="${item.item_code}"
					style="margin-top: 0px !important; max-height: 30px; float: right;
						padding: 0.25rem 1rem; min-width: 135px;">
					<span class="mr-2">
						<svg class="icon icon-md">
							<use href="#icon-assets"></use>
						</svg>
					</span>
					${settings.enable_checkout ? __('Add to Cart') : __('Add to Quote')}
				</div>

				<div class="cart-indicator list-indicator ${item.in_cart ? '' : 'hidden'}">
					1
				</div>

				<a href="/cart">
					<div id="${item.name}" class="btn
						btn-sm btn-primary btn-add-to-cart-list
						ml-4 go-to-cart mb-0 mt-0
						${item.in_cart ? '' : 'hidden'}"
						data-item-code="${item.item_code}"
						style="padding: 0.25rem 1rem; min-width: 135px;">
						${settings.enable_checkout ? __('Go to Cart') : __('Go to Quote')}
					</div>
				</a>
			`;
		} else {
			return ``;
		}
	}

};
