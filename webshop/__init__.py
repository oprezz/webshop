
__version__ = '0.0.1'

import frappe
from erpnext.utilities.web_form.addresses import addresses as addresses_web_form

# Patch Address Web Form to respect success_url query parameter
_original_wf_get_context = addresses_web_form.get_context

def _wf_get_context_wrapper(context):
    if _original_wf_get_context:
        _original_wf_get_context(context)
    
    if frappe.form_dict.get("success_url"):
         context.web_form_doc["success_url"] = frappe.form_dict.get("success_url")

addresses_web_form.get_context = _wf_get_context_wrapper

