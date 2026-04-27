import importlib.util
import os

import frappe

# Load www/my-addresses/index.py (hyphenated path is not importable via dotted path)
_spec = importlib.util.spec_from_file_location(
    "webshop_my_addresses_index",
    os.path.join(os.path.dirname(os.path.dirname(__file__)), "www", "my-addresses", "index.py"),
)
_my_addr_mod = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_my_addr_mod)


@frappe.whitelist()
def delete_my_address(address_name):
    return _my_addr_mod.delete_address(address_name)
