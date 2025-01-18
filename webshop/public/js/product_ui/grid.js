webshop.ProductGrid = class {
	/* Options:
		- items: Items
		- settings: Webshop Settings
		- products_section: Products Wrapper
		- preference: If preference is not grid view, render but hide
	*/
	constructor(options) {
		Object.assign(this, options);

		if (this.preference !== "Grid View") {
			this.products_section.addClass("hidden");
		}

		this.products_section.empty();
		this.make();
	}

	make() {
		let me = this;
		let html = ``;

		this.items.forEach(item => {
			let title = item.web_item_name || item.item_name || item.item_code || "";
			title = title.length > 90 ? title.substr(0, 90) + "..." : title;

			html += `<div class="col-sm-4 item-card"><div class="card text-left">`;
			html += me.get_image_html(item, title);
			html += me.get_card_body_html(item, title, me.settings);
			html += `</div></div>`;
		});

		let $product_wrapper = this.products_section;
		$product_wrapper.append(html);
	}

	get_image_html(item, title) {
		let image = item.website_image;

		if (image) {
			return `
				<div class="card-img-container">
					<a href="/${item.route || '#'}" style="text-decoration: none;">
						<img itemprop="image" class="card-img" src="${image}" alt="${title}">
					</a>
				</div>
			`;
		} else {
			return `
				<div class="card-img-container">
					<a href="/${item.route || '#'}" style="text-decoration: none;">
						<div class="card-img-top no-image">
							${frappe.get_abbr(title)}
						</div>
					</a>
				</div>
			`;
		}
	}

	get_card_body_html(item, title, settings) {
		let body_html = `
			<div class="card-body text-left card-body-flex" style="width:100%">
				<div style="margin-top: 1rem; display: flex;">
		`;
		body_html += this.get_title(item, title);

		// get floating elements
		if (!item.has_variants) {
			if (settings.enable_wishlist) {
				body_html += this.get_wishlist_icon(item);
			}
			if (settings.enabled) {
				body_html += this.get_cart_indicator(item);
			}

		}

		body_html += `</div>`;
		body_html += `<div class="product-category" itemprop="name">${item.item_group || ''}</div>`;

		body_html += this.get_weekly_availability(item);

		if (item.formatted_price) {
			body_html += this.get_price_html(item);
		}

		body_html += this.get_stock_availability(item, settings);
		body_html += this.get_primary_button(item, settings);
		body_html += `</div>`; // close div on line 49

		return body_html;
	}

	get_title(item, title) {
		let title_html = `
			<a href="/${item.route || '#'}">
				<div class="product-title" itemprop="name">
					${title || ''}
				</div>
			</a>
		`;
		return title_html;
	}

	get_wishlist_icon(item) {
		let icon_class = item.wished ? "wished" : "not-wished";
		return `
			<div class="like-action ${item.wished ? "like-action-wished" : ''}"
				data-item-code="${item.item_code}">
				<svg class="icon sm">
					<use class="${icon_class} wish-icon" href="#icon-heart"></use>
				</svg>
			</div>
		`;
	}

	get_cart_indicator(item) {
		return `
			<div class="cart-indicator ${item.in_cart ? '' : 'hidden'}" data-item-code="${item.item_code}">
				1
			</div>
		`;
	}

	get_price_html(item) {
		let price_html = `
			<div class="product-price" itemprop="offers" itemscope itemtype="https://schema.org/AggregateOffer">
				${item.formatted_price || ''}
		`;

		if (item.formatted_mrp) {
			price_html += `
				<small class="striked-price">
					<s>${item.formatted_mrp ? item.formatted_mrp.replace(/ +/g, "") : ""}</s>
				</small>
				<small class="ml-1 product-info-green">
					${item.discount} ${__("OFF")}
				</small>
			`;
		}
		price_html += `</div>`;
		return price_html;
	}

	get_weekly_availability(item) {
		// List of available days (customize this array)
		const availableDays = item.weekly_availability || [];

		// All days of the week to display
		const allDays = [
			__("Mon"),
			__("Tue"),
			__("Wed"),
			__("Thu"),
			__("Fri"),
			__("Sat"),
			__("Sun")
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
					<span class="out-of-stock mb-2 mt-1" style="color: var(--primary-color)">
						${__("Available on backorder")}
					</span>
				`;
			} else if (!item.in_stock) {
				return `
					<span class="out-of-stock mb-2 mt-1">
						${__("Out of stock")}
					</span>
				`;
			}
		}

		return ``;
	}

	get_primary_button(item, settings) {
		if (item.has_variants) {
			return `
				<a href="/${item.route || '#'}">
					<div class="btn btn-sm btn-explore-variants w-100 mt-4">
						${__("Explore")}
					</div>
				</a>
			`;
		} else if (settings.enabled && (settings.allow_items_not_in_stock || item.in_stock)) {
			return `
				<div id="${item.name}" class="btn
					btn-sm btn-primary btn-add-to-cart-list
					w-100 mt-2 ${item.in_cart ? 'hidden' : ''}"
					data-item-code="${item.item_code}">
					<span class="mr-2">
						<svg class="icon icon-md">
							<use href="#icon-assets"></use>
						</svg>
					</span>
					${settings.enable_checkout ? __("Add to Cart") : __("Add to Quote")}
				</div>

				<a href="/cart">
					<div id="${item.name}" class="btn
						btn-sm btn-primary btn-add-to-cart-list
						w-100 mt-4 go-to-cart-grid
						${item.in_cart ? '' : 'hidden'}"
						data-item-code="${item.item_code}">
						${settings.enable_checkout ? __("Go to Cart") : __("Go to Quote")}
					</div>
				</a>
			`;
		} else {
			return ``;
		}
	}
};
