import frappe
from frappe import _

def get_context(context):
	if frappe.session.user == "Guest":
		frappe.throw(_("You need to be logged in to access this page"), frappe.PermissionError)

	context.addresses = get_user_addresses()
	# Pass success_url so the form redirects back to this custom page after saving
	context.add_address_route = "/address/new?success_url=/my-addresses"


def _user_address_names():
	"""Return the set of address names the current user is allowed to manage."""
	from webshop.webshop.shopping_cart.cart import get_party

	try:
		party = get_party()
	except Exception:
		party = None

	if not party:
		return set()

	rows = frappe.db.get_all(
		"Dynamic Link",
		fields=["parent"],
		filters={
			"parenttype": "Address",
			"link_doctype": party.doctype,
			"link_name": party.name,
		},
	)
	return {r.parent for r in rows}


def delete_address(address_name):
	"""Delete an Address that belongs to the current user (called via shim)."""
	if frappe.session.user == "Guest":
		frappe.throw(_("You need to be logged in"), frappe.PermissionError)

	if not address_name:
		frappe.throw(_("Address is required"))

	allowed = _user_address_names()
	if address_name not in allowed:
		frappe.throw(_("You are not allowed to delete this address"), frappe.PermissionError)

	frappe.delete_doc("Address", address_name, ignore_permissions=True)
	return {"ok": True}


def get_user_addresses():
	"""Fetch addresses linked to the current user's party (Customer/Supplier).

	Uses the same resolution as the cart and weekly-order pages so that every
	portal surface shows exactly the same set of addresses.
	"""
	from webshop.webshop.shopping_cart.cart import get_party

	try:
		party = get_party()
	except Exception:
		party = None

	if not party:
		return []

	address_names = frappe.db.get_all(
		"Dynamic Link",
		fields=["parent"],
		filters={
			"parenttype": "Address",
			"link_doctype": party.doctype,
			"link_name": party.name,
		},
	)

	out = []
	seen = set()
	for row in address_names:
		if row.parent in seen:
			continue
		seen.add(row.parent)
		try:
			address = frappe.get_doc("Address", row.parent)
		except frappe.DoesNotExistError:
			continue
		if address.disabled:
			continue
		out.append(address)

	out.sort(key=lambda a: (-a.is_primary_address, a.creation), reverse=False)
	return out
