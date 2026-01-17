import frappe
from frappe import _

def get_context(context):
	if frappe.session.user == "Guest":
		frappe.throw(_("You need to be logged in to access this page"), frappe.PermissionError)

	context.addresses = get_user_addresses()
	# Pass success_url so the form redirects back to this custom page after saving
	context.add_address_route = "/address/new?success_url=/my-addresses"


def get_user_addresses():
	"""Fetch addresses linked to the current user via Contact/Customer or direct ownership."""
	user = frappe.session.user
	
	# 1. Get Contact linked to User
	contact_name = frappe.db.get_value("Contact", {"email_id": user})
	
	parent_names = []
	if contact_name:
		# Get links (Customer, Supplier) from Contact
		links = frappe.get_all("Dynamic Link", 
			filters={"parent": contact_name, "link_doctype": ["in", ["Customer", "Supplier"]]},
			fields=["link_doctype", "link_name"]
		)
		parent_names = [l.link_name for l in links]

	address_names = []
	
	# 2. If we found linked parents (e.g. User -> Contact -> Customer A)
	if parent_names:
		# Find addresses linked to these parents
		linked_addresses = frappe.db.sql("""
			SELECT DISTINCT parent 
			FROM `tabDynamic Link`
			WHERE link_doctype IN ('Customer', 'Supplier') 
			AND link_name IN %(names)s
			AND parenttype = 'Address'
		""", {"names": tuple(parent_names)}, as_dict=1)
		
		address_names = [a.parent for a in linked_addresses]
	
	# 3. Fetch full address details
	filters = {"disabled": 0}
	
	if address_names:
		# If user has corporate links, show those addresses
		filters["name"] = ["in", address_names]
		# Optionally also include personal addresses (owner=user) via OR condition?
		# For now, let's trust the links first. If no links, fallback to owner.
	else:
		# Fallback: simple ownership check
		filters["owner"] = user

	addresses = frappe.get_all("Address", 
		filters=filters,
		fields=["name", "address_title", "address_type", "address_line1", "city", "state", "country", "pincode", "is_primary_address", "is_shipping_address", "phone"],
		order_by="is_primary_address desc, creation desc"
	)
	
	return addresses
