export const DETAILED_MODULE_DOCS: Record<string, any> = {
  "10": {
    "num": "10",
    "catEn": "Finance",
    "catMl": "ധനകാര്യം",
    "titleEn": "Finance, Registration Fees & Sponsor CRM Operational Manual",
    "titleMl": "ധനകാര്യം, രജിസ്ട്രേഷൻ ഫീസ് & സ്പോൺസർ കണക്ക് മാനുവൽ",
    "overviewEn": "Track registration entry fee collection, issue automated PDF payment receipts, manage sponsor pledges, record donor contributions, and reconcile event budget accounts.",
    "overviewMl": "മത്സര രജിസ്ട്രേഷൻ ഫീസ് പിരിവ്, പണമടച്ച രസീതുകൾ നൽകൽ, സ്പോൺസർമാരുടെ കണക്കുകൾ, ഫെസ്റ്റിവൽ ബജറ്റ് കണക്കുകൾ എന്നിവ നിയന്ത്രിക്കുക.",
    "stepsEn": [
      "Step 1: Navigate to /dashboard/organization/[orgId]/festivals/[festivalId]/sponsor.",
      "Step 2: Define item entry fee rules under /settings (e.g., Solo Item: ₹100, Group Item: ₹500).",
      "Step 3: Record Incoming Payments: Reception desk marks candidate entry fees as Paid and issues automated PDF receipts with receipt numbers.",
      "Step 4: Sponsor CRM: Track sponsor campaigns, pledge amounts, banner allocations, and payment fulfillment status.",
      "Step 5: Budget Reconciliation: Export total revenue and expense ledgers in Excel/CSV format for official auditing."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /sponsor പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: ഫീസ് സെറ്റിംഗ്സ് നൽകുക (ഉദാ: സിംഗിൾ ഇനം: ₹100, ഗ്രൂപ്പ് ഇനം: ₹500).",
      "ഘട്ടം 3: ഫീസ് സ്വീകരിക്കൽ: ഫ്രണ്ട് ഡെസ്കിൽ ഫീസ് വാങ്ങുമ്പോൾ സിസ്റ്റം സ്വയം PDF രസീതുകൾ പ്രിന്റ് ചെയ്തു നൽകുന്നു.",
      "ഘട്ടം 4: സ്പോൺസർ മാനേജ്‌മെന്റ്: സ്പോൺസർമാരുടെ വിവരങ്ങൾ, പരസ്യ ബാനറുകൾ, പണം അടച്ച വിവരങ്ങൾ എന്നിവ രേഖപ്പെടുത്താം.",
      "ഘട്ടം 5: ബജറ്റ് കണക്കുകൾ: വരവ്-ചെലവ് കണക്കുകൾ ആഡിറ്റിംഗിനായി എക്‌സെൽ രൂപത്തിൽ ഡൗൺലോഡ് ചെയ്യാം."
    ],
    "fields": [
      {
        "name": "Receipt Number",
        "type": "Sequential String",
        "req": "Yes",
        "descEn": "Unique financial invoice ID.",
        "descMl": "യുണീക് രസീത് നമ്പർ."
      },
      {
        "name": "Pledge Amount",
        "type": "Currency (INR)",
        "req": "Yes",
        "descEn": "Committed sponsorship funds.",
        "descMl": "സ്പോൺസർഷിപ്പ് തുക."
      }
    ],
    "workflowEn": "Set Entry Fees → Receive Payment → Issue PDF Receipt → Record Sponsor Pledges → Export Audit Ledger.",
    "workflowMl": "ഫീസ് നിശ്ചയിക്കുക → പണം വാങ്ങുക → രസീത് നൽകുക → സ്പോൺസർ ഡാറ്റ → ആഡിറ്റ് കണക്കുകൾ.",
    "tipsEn": "Link Online Payment Gateways (Razorpay/Stripe) to automatically issue digital receipts upon CSV registration.",
    "tipsMl": "ഓൺലൈൻ പേയ്‌മെന്റ് ഗേറ്റ്‌വേ ലിങ്ക് ചെയ്താൽ ആളുകൾ അപേക്ഷിച്ച് പണമടയ്ക്കുമ്പോൾ രസീത് സ്വയം ഫോണിലേക്ക് എത്തും.",
    "warningEn": "Do not issue manual paper receipts without entering the transaction into FestPro to prevent audit gaps.",
    "warningMl": "കണക്കിൽ പെടാത്ത രസീതുകൾ നൽകരുത്; അല്ലാത്തപക്ഷം ഓഡിറ്റ് റീപോർട്ടിൽ വ്യത്യാസം വരും.",
    "faqEn": [
      {
        "q": "Can we refund entry fees if a program is cancelled?",
        "a": "Yes. Click 'Initiate Refund' on candidate billing page to issue a credit note receipt."
      }
    ],
    "faqMl": [
      {
        "q": "പ്രോഗ്രാം ക്യാൻസലായാൽ ഫീസ് തിരികെ നൽകാൻ സാധിക്കുമോ?",
        "a": "അതെ. മത്സരാർത്ഥിയുടെ പേജിൻ പോയി 'Initiate Refund' ക്ലിക്ക് ചെയ്താൽ ഫീസ് റീഫണ്ട് ചെയ്യാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Receipt Number duplication error",
        "fix": "Reset receipt sequence prefix under Finance Settings -> Invoice Numbers."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "രസീത് നമ്പർ ഒരേപോലെ വരുന്നു",
        "fix": "ഫാബ്രിക് രസീത് പ്രീഫിക്സ് സെറ്റിംഗ്സിൽ റീസെറ്റ് ചെയ്യുക."
      }
    ]
  },
  "11": {
    "num": "11",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Volunteer Shift Management & Checkpoint QR Attendance Guide",
    "titleMl": "വോളണ്ടിയർ ഷിഫ്റ്റുകളും ക്യുആർ ഹാജർ പർട്ടികയും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Volunteer Shift Management & Checkpoint QR Attendance Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ വോളണ്ടിയർ ഷിഫ്റ്റുകളും ക്യുആർ ഹാജർ പർട്ടികയും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 11 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 11 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_11_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Volunteer Shift Management & Checkpoint QR Attendance Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. വോളണ്ടിയർ ഷിഫ്റ്റുകളും ക്യുആർ ഹാജർ പർട്ടികയും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 11 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "12": {
    "num": "12",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Help Desk Support, Incident Ticketing & Escalation Guide",
    "titleMl": "ഹെൽപ്പ് ഡെസ്ക് & പരാതിപരിഹാര ഡെസ്ക് ഗൈഡ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Help Desk Support, Incident Ticketing & Escalation Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഹെൽപ്പ് ഡെസ്ക് & പരാതിപരിഹാര ഡെസ്ക് ഗൈഡ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 12 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 12 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_12_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Help Desk Support, Incident Ticketing & Escalation Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഹെൽപ്പ് ഡെസ്ക് & പരാതിപരിഹാര ഡെസ്ക് ഗൈഡ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 12 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "13": {
    "num": "13",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Stage Asset & Equipment Inventory Audit Manual",
    "titleMl": "സ്റ്റേജ് സാമഗ്രികളും ഇൻവെന്ററി സ്റ്റോക്ക് ആഡിറ്റും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Stage Asset & Equipment Inventory Audit Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ സ്റ്റേജ് സാമഗ്രികളും ഇൻവെന്ററി സ്റ്റോക്ക് ആഡിറ്റും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 13 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 13 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_13_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Stage Asset & Equipment Inventory Audit Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. സ്റ്റേജ് സാമഗ്രികളും ഇൻവെന്ററി സ്റ്റോക്ക് ആഡിറ്റും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 13 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "14": {
    "num": "14",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Accommodation & Hostel Room Occupancy Manager",
    "titleMl": "താമസവും ഹോസ്റ്റൽ മുറി വിതരണ മാർഗ്ഗരേഖയും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Accommodation & Hostel Room Occupancy Manager in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ താമസവും ഹോസ്റ്റൽ മുറി വിതരണ മാർഗ്ഗരേഖയും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 14 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 14 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_14_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Accommodation & Hostel Room Occupancy Manager, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. താമസവും ഹോസ്റ്റൽ മുറി വിതരണ മാർഗ്ഗരേഖയും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 14 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "15": {
    "num": "15",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Dining Hall Food QR Coupon & Meal Verification System",
    "titleMl": "ഭക്ഷണ കൂപ്പൺ ക്യുആർ പരിശോധനാ സിസ്റ്റം",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Dining Hall Food QR Coupon & Meal Verification System in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഭക്ഷണ കൂപ്പൺ ക്യുആർ പരിശോധനാ സിസ്റ്റം-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 15 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 15 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_15_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Dining Hall Food QR Coupon & Meal Verification System, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഭക്ഷണ കൂപ്പൺ ക്യുആർ പരിശോധനാ സിസ്റ്റം-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 15 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "16": {
    "num": "16",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Medical First Aid Protocol & Stage Emergency Holds",
    "titleMl": "മെഡിക്കൽ ടീമും അടിയന്തിര പ്രഥമശുശ്രൂഷാ ലോഗും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Medical First Aid Protocol & Stage Emergency Holds in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ മെഡിക്കൽ ടീമും അടിയന്തിര പ്രഥമശുശ്രൂഷാ ലോഗും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 16 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 16 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_16_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Medical First Aid Protocol & Stage Emergency Holds, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. മെഡിക്കൽ ടീമും അടിയന്തിര പ്രഥമശുശ്രൂഷാ ലോഗും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 16 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "17": {
    "num": "17",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Multi-Channel Notifications Gateway & SMS/Push Alerts",
    "titleMl": "അറിയിപ്പുകൾ, SMS & മെസ്സേജ് ഗേറ്റ്‌വേ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Multi-Channel Notifications Gateway & SMS/Push Alerts in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ അറിയിപ്പുകൾ, SMS & മെസ്സേജ് ഗേറ്റ്‌വേ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 17 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 17 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_17_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Multi-Channel Notifications Gateway & SMS/Push Alerts, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. അറിയിപ്പുകൾ, SMS & മെസ്സേജ് ഗേറ്റ്‌വേ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 17 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "18": {
    "num": "18",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Public Event Website & Live Stage LED Wall Ticker Engine",
    "titleMl": "പൊതുജന ലൈവ് വെബ്‌സൈറ്റും എൽഇഡി സ്ക്രീനും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Public Event Website & Live Stage LED Wall Ticker Engine in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ പൊതുജന ലൈവ് വെബ്‌സൈറ്റും എൽഇഡി സ്ക്രീനും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 18 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 18 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_18_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Public Event Website & Live Stage LED Wall Ticker Engine, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. പൊതുജന ലൈവ് വെബ്‌സൈറ്റും എൽഇഡി സ്ക്രീനും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 18 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "19": {
    "num": "19",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Mobile App (PWA) Operational Manual for Field Staff",
    "titleMl": "സ്റ്റാഫുകൾക്കുള്ള മൊബൈൽ ആപ്പ് ഗൈഡ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Mobile App (PWA) Operational Manual for Field Staff in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ സ്റ്റാഫുകൾക്കുള്ള മൊബൈൽ ആപ്പ് ഗൈഡ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 19 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 19 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_19_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Mobile App (PWA) Operational Manual for Field Staff, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. സ്റ്റാഫുകൾക്കുള്ള മൊബൈൽ ആപ്പ് ഗൈഡ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 19 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "20": {
    "num": "20",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "SaaS Tenant Subscriptions, Quotas & White-Label Domain Manager",
    "titleMl": "SaaS പ്ലാനുകളും സബ്‌സ്‌ക്രിപ്‌ഷൻ ക്വാട്ടകളും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for SaaS Tenant Subscriptions, Quotas & White-Label Domain Manager in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ SaaS പ്ലാനുകളും സബ്‌സ്‌ക്രിപ്‌ഷൻ ക്വാട്ടകളും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 20 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 20 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_20_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For SaaS Tenant Subscriptions, Quotas & White-Label Domain Manager, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. SaaS പ്ലാനുകളും സബ്‌സ്‌ക്രിപ്‌ഷൻ ക്വാട്ടകളും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 20 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "21": {
    "num": "21",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "AI Schedule Optimizer & Candidate Conflict Predictor Engine",
    "titleMl": "AI ഷെഡ്യൂൾ ഒപ്റ്റിമൈസറും സമയതടസ്സ പ്രവചനവും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for AI Schedule Optimizer & Candidate Conflict Predictor Engine in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ AI ഷെഡ്യൂൾ ഒപ്റ്റിമൈസറും സമയതടസ്സ പ്രവചനവും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 21 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 21 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_21_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For AI Schedule Optimizer & Candidate Conflict Predictor Engine, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. AI ഷെഡ്യൂൾ ഒപ്റ്റിമൈസറും സമയതടസ്സ പ്രവചനവും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 21 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "22": {
    "num": "22",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Real-Time Stage Analytics, Telemetry & Scoring Curve Graphs",
    "titleMl": "തത്സമയ സ്റ്റേജ് ഗ്രാഫുകളും അനലിറ്റിക്‌സും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Real-Time Stage Analytics, Telemetry & Scoring Curve Graphs in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ തത്സമയ സ്റ്റേജ് ഗ്രാഫുകളും അനലിറ്റിക്‌സും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 22 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 22 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_22_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Real-Time Stage Analytics, Telemetry & Scoring Curve Graphs, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. തത്സമയ സ്റ്റേജ് ഗ്രാഫുകളും അനലിറ്റിക്‌സും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 22 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "23": {
    "num": "23",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Enterprise REST API v2, Webhook Events & SDK Scope Guide",
    "titleMl": "REST API & വെബ്‌ഹുക്ക് ഡെവലപ്പർ ഗൈഡ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Enterprise REST API v2, Webhook Events & SDK Scope Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ REST API & വെബ്‌ഹുക്ക് ഡെവലപ്പർ ഗൈഡ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 23 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 23 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_23_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Enterprise REST API v2, Webhook Events & SDK Scope Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. REST API & വെബ്‌ഹുക്ക് ഡെവലപ്പർ ഗൈഡ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 23 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "24": {
    "num": "24",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Supabase Row-Level Security (RLS), IP Whitelisting & OWASP Guide",
    "titleMl": "ഡാറ്റാ സുരക്ഷ, RLS & IP വൈറ്റ്‌ലിസ്റ്റിംഗ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Supabase Row-Level Security (RLS), IP Whitelisting & OWASP Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഡാറ്റാ സുരക്ഷ, RLS & IP വൈറ്റ്‌ലിസ്റ്റിംഗ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 24 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 24 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_24_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Supabase Row-Level Security (RLS), IP Whitelisting & OWASP Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഡാറ്റാ സുരക്ഷ, RLS & IP വൈറ്റ്‌ലിസ്റ്റിംഗ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 24 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "25": {
    "num": "25",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Automated PostgreSQL Database Backup & Disaster Recovery Manual",
    "titleMl": "ദിനംപ്രതിയുള്ള ഡാറ്റാ ബാക്കപ്പും റിക്കവറിയും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Automated PostgreSQL Database Backup & Disaster Recovery Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ദിനംപ്രതിയുള്ള ഡാറ്റാ ബാക്കപ്പും റിക്കവറിയും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 25 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 25 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_25_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Automated PostgreSQL Database Backup & Disaster Recovery Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ദിനംപ്രതിയുള്ള ഡാറ്റാ ബാക്കപ്പും റിക്കവറിയും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 25 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "26": {
    "num": "26",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Telemetry Monitoring & Real-Time WebSocket Health Metrics",
    "titleMl": "സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണവും ടെലിമെട്രിയും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Telemetry Monitoring & Real-Time WebSocket Health Metrics in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണവും ടെലിമെട്രിയും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 26 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 26 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_26_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Telemetry Monitoring & Real-Time WebSocket Health Metrics, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണവും ടെലിമെട്രിയും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 26 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "27": {
    "num": "27",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Localization, i18n & Anek Malayalam Translation Packs",
    "titleMl": "മലയാളം ഫോണ്ടും ഭാഷാ സെറ്റിംഗുകളും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Localization, i18n & Anek Malayalam Translation Packs in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ മലയാളം ഫോണ്ടും ഭാഷാ സെറ്റിംഗുകളും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 27 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 27 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_27_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Localization, i18n & Anek Malayalam Translation Packs, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. മലയാളം ഫോണ്ടും ഭാഷാ സെറ്റിംഗുകളും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 27 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "28": {
    "num": "28",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Server-Side PDF Document Generator Engine Manual",
    "titleMl": "ഔദ്യോഗിക PDF പ്രിന്റൗട്ട് എഞ്ചിൻ ഗൈഡ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Server-Side PDF Document Generator Engine Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഔദ്യോഗിക PDF പ്രിന്റൗട്ട് എഞ്ചിൻ ഗൈഡ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 28 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 28 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_28_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Server-Side PDF Document Generator Engine Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഔദ്യോഗിക PDF പ്രിന്റൗട്ട് എഞ്ചിൻ ഗൈഡ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 28 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "29": {
    "num": "29",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "DevOps CI/CD Pipelines & Vercel Edge Mesh Architecture",
    "titleMl": "DevOps & സർവ്വർ ഇൻഫ്രാസ്ട്രക്ചർ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for DevOps CI/CD Pipelines & Vercel Edge Mesh Architecture in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ DevOps & സർവ്വർ ഇൻഫ്രാസ്ട്രക്ചർ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 29 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 29 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_29_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For DevOps CI/CD Pipelines & Vercel Edge Mesh Architecture, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. DevOps & സർവ്വർ ഇൻഫ്രാസ്ട്രക്ചർ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 29 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "30": {
    "num": "30",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Master Troubleshooting Matrix, Diagnostic Keys & Emergency Manual",
    "titleMl": "പ്രശ്നപരിഹാര വഴികളും എറർ കോഡ് മാസ്റ്റർ ചാർട്ടും",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Master Troubleshooting Matrix, Diagnostic Keys & Emergency Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ പ്രശ്നപരിഹാര വഴികളും എറർ കോഡ് മാസ്റ്റർ ചാർട്ടും-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 30 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 30 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_30_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Master Troubleshooting Matrix, Diagnostic Keys & Emergency Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. പ്രശ്നപരിഹാര വഴികളും എറർ കോഡ് മാസ്റ്റർ ചാർട്ടും-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 30 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "31": {
    "num": "31",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Frequently Asked Questions (FAQ Master Reference)",
    "titleMl": "സാധാരണ ചോദ്യങ്ങളും ഉത്തരങ്ങളും (FAQ)",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Frequently Asked Questions (FAQ Master Reference) in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ സാധാരണ ചോദ്യങ്ങളും ഉത്തരങ്ങളും (FAQ)-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 31 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 31 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_31_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Frequently Asked Questions (FAQ Master Reference), ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. സാധാരണ ചോദ്യങ്ങളും ഉത്തരങ്ങളും (FAQ)-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 31 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "32": {
    "num": "32",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Administrator Master Operational Manual",
    "titleMl": "അഡ്മിനിസ്ട്രേറ്റർ മാസ്റ്റർ മാനുവൽ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Administrator Master Operational Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ അഡ്മിനിസ്ട്രേറ്റർ മാസ്റ്റർ മാനുവൽ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 32 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 32 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_32_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Administrator Master Operational Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. അഡ്മിനിസ്ട്രേറ്റർ മാസ്റ്റർ മാനുവൽ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 32 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "33": {
    "num": "33",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Judge Tablet Scoring & Criterion Manual",
    "titleMl": "ജഡ്ജസ് ടാബ്‌ലെറ്റ് സ്കോറിംഗ് മാനുവൽ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Judge Tablet Scoring & Criterion Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ജഡ്ജസ് ടാബ്‌ലെറ്റ് സ്കോറിംഗ് മാനുവൽ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 33 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 33 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_33_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Judge Tablet Scoring & Criterion Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ജഡ്ജസ് ടാബ്‌ലെറ്റ് സ്കോറിംഗ് മാനുവൽ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 33 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "34": {
    "num": "34",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Volunteer Field Ushering & Checkpoint Guide",
    "titleMl": "വോളണ്ടിയർ ഗ്രൗണ്ട് ഡ്യൂട്ടി മാർഗ്ഗരേഖ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Volunteer Field Ushering & Checkpoint Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ വോളണ്ടിയർ ഗ്രൗണ്ട് ഡ്യൂട്ടി മാർഗ്ഗരേഖ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 34 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 34 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_34_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Volunteer Field Ushering & Checkpoint Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. വോളണ്ടിയർ ഗ്രൗണ്ട് ഡ്യൂട്ടി മാർഗ്ഗരേഖ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 34 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "35": {
    "num": "35",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Finance Treasurer Fee Collection & Receipt Manual",
    "titleMl": "ട്രഷറർ ഫ്രണ്ട് ഡെസ്ക് ഫീസ് മാനുവൽ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Finance Treasurer Fee Collection & Receipt Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ട്രഷറർ ഫ്രണ്ട് ഡെസ്ക് ഫീസ് മാനുവൽ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 35 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 35 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_35_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Finance Treasurer Fee Collection & Receipt Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ട്രഷറർ ഫ്രണ്ട് ഡെസ്ക് ഫീസ് മാനുവൽ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 35 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "36": {
    "num": "36",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Reception & Front Desk Registration Manual",
    "titleMl": "ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ മാനുവൽ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Reception & Front Desk Registration Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ മാനുവൽ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 36 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 36 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_36_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Reception & Front Desk Registration Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ മാനുവൽ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 36 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "37": {
    "num": "37",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Medical Team Emergency Response Protocol",
    "titleMl": "മെഡിക്കൽ ടീം എമർജൻസി പ്രോട്ടോക്കോൾ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Medical Team Emergency Response Protocol in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ മെഡിക്കൽ ടീം എമർജൻസി പ്രോട്ടോക്കോൾ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 37 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 37 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_37_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Medical Team Emergency Response Protocol, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. മെഡിക്കൽ ടീം എമർജൻസി പ്രോട്ടോക്കോൾ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 37 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "38": {
    "num": "38",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "Storekeeper Equipment Inventory Audit Guide",
    "titleMl": "സ്റ്റോർകീപ്പർ ഇൻവെന്ററി ഗൈഡ്",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for Storekeeper Equipment Inventory Audit Guide in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ സ്റ്റോർകീപ്പർ ഇൻവെന്ററി ഗൈഡ്-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 38 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 38 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_38_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For Storekeeper Equipment Inventory Audit Guide, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. സ്റ്റോർകീപ്പർ ഇൻവെന്ററി ഗൈഡ്-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 38 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "39": {
    "num": "39",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "2-Minute Video Tutorial Onboarding Scripts",
    "titleMl": "2-മിനിറ്റ് പരിശീലന വീഡിയോ സ്ക്രിപ്റ്റുകൾ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for 2-Minute Video Tutorial Onboarding Scripts in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ 2-മിനിറ്റ് പരിശീലന വീഡിയോ സ്ക്രിപ്റ്റുകൾ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 39 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 39 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_39_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For 2-Minute Video Tutorial Onboarding Scripts, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. 2-മിനിറ്റ് പരിശീലന വീഡിയോ സ്ക്രിപ്റ്റുകൾ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 39 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "40": {
    "num": "40",
    "catEn": "System Operations",
    "catMl": "സിസ്റ്റം ഓപ്പറേഷൻസ്",
    "titleEn": "In-App Help Center Portal Operations Manual",
    "titleMl": "ഹെൽപ്പ് സെന്റർ പോർട്ടൽ മാനുവൽ",
    "overviewEn": "Complete operational handbook, integration rules, step-by-step procedures, and diagnostic matrices for In-App Help Center Portal Operations Manual in FestPro SaaS Platform. Includes full setup and maintenance protocols.",
    "overviewMl": "FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ ഹെൽപ്പ് സെന്റർ പോർട്ടൽ മാനുവൽ-ന്റെ സമ്പൂർണ്ണ ഒഫീഷ്യൽ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഹാൻഡ്‌ബുക്കും. പൂർണ്ണമായ സെറ്റപ്പ് ഗൈഡും മെയിന്റനൻസും ഇതിൽ ഉൾപ്പെടുന്നു.",
    "stepsEn": [
      "Step 1: Access the Module 40 administrative dashboard via /dashboard/platform.",
      "Step 2: Inspect active indicators, module health, and configure the target operating parameters.",
      "Step 3: Execute integration checks and validate setup using the real-time preview.",
      "Step 4: Enable synchronization and verify connections across other active FestPro modules.",
      "Step 5: Complete transaction, save the configuration, and export verified PDF audit logs."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/platform വഴി മോഡ്യൂൾ 40 ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: ഡാഷ്‌ബോർഡിലെ വിവരങ്ങൾ പരിശോധിച്ചു സെറ്റിംഗ്സുകൾ ക്രമീകരിക്കുക.",
      "ഘട്ടം 3: മറ്റു മോഡ്യൂളുകളുമായുള്ള കണക്ഷൻ ഉറപ്പുവരുത്താൻ തത്സമയ പ്രിവ്യൂ ഉപയോഗിക്കുക.",
      "ഘട്ടം 4: മാറ്റങ്ങൾ സേവ് ചെയ്ത് സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുക.",
      "ഘട്ടം 5: പ്രോസസ്സ് പൂർത്തിയാക്കി റിപ്പോർട്ട് PDF ആയി ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Module_40_ID",
        "type": "UUIDv4",
        "req": "Yes",
        "descEn": "Primary system identity key.",
        "descMl": "സിസ്റ്റം തിരിച്ചറിയൽ കോഡ്."
      },
      {
        "name": "Configuration Payload",
        "type": "JSON Object",
        "req": "Yes",
        "descEn": "Operational configuration values.",
        "descMl": "സെറ്റിംഗ്സുകൾ."
      },
      {
        "name": "Active Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Operational flag state.",
        "descMl": "പ്രവർത്തന നില."
      }
    ],
    "workflowEn": "Initialize Module → Verify Permissions → Process Setup Data → Broadcast Status → Secure Audit Entry",
    "workflowMl": "ആരംഭിക്കുക → അനുമതി പരിശോധിക്കുക → വിവരങ്ങൾ ചേർക്കുക → തത്സമയ അപ്‌ഡേറ്റ് → സെക്യൂർ സേവ്",
    "tipsEn": "Regularly audit this module's diagnostic logs under /observability/logs to prevent unauthorized overrides. For In-App Help Center Portal Operations Manual, ensure permissions are restricted to Admins.",
    "tipsMl": "ക്രമക്കേടുകൾ തടയാൻ സിസ്റ്റം ലോഗുകൾ പരിശോധിച്ച് ഉറപ്പുവരുത്തുക. ഹെൽപ്പ് സെന്റർ പോർട്ടൽ മാനുവൽ-ന്റെ ആക്സസ് അഡ്മിനുകൾക്ക് മാത്രം നൽകുക.",
    "warningEn": "Ensure administrative approval is signed before modifying locked configuration records in this module. Incorrect edits can cause sync delays.",
    "warningMl": "ലോക്ക് ചെയ്ത വിവരങ്ങൾ മാറ്റുന്നതിന് മുൻപ് അഡ്മിൻ അനുമതി വാങ്ങിയിരിക്കണം. തെറ്റായ മാറ്റങ്ങൾ സിസ്റ്റം സ്ലോ ആക്കാം.",
    "faqEn": [
      {
        "q": "How does Module 40 interact with Supabase Realtime?",
        "a": "State mutations publish instant 0ms events over WebSockets to connected client consoles, syncing immediately across all active screens."
      },
      {
        "q": "Can I revert changes made here?",
        "a": "Yes, module history is preserved. Access the History tab to rollback to the last known good configuration."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ മോഡ്യൂളിലെ മാറ്റങ്ങൾ എത്ര വേഗത്തിൽ തത്സമയം അറിയാം?",
        "a": "വെബ്‌സോക്കറ്റ് വഴി 0ms വൈകൽ ഇല്ലാതെ മാറ്റങ്ങൾ തത്സമയം വെബ്‌സൈറ്റിൽ കാണാം."
      },
      {
        "q": "മാറ്റങ്ങൾ പഴയപടിയാക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, പഴയ സെറ്റിംഗ്സ് തിരികെ എടുക്കാൻ ഹിസ്റ്ററി ടാബ് ഉപയോഗിക്കാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Action permission denied (403)",
        "fix": "Request role capability elevation from your Organization Owner. Make sure your JWT token is not expired."
      },
      {
        "issue": "Module Sync Timeout",
        "fix": "Check your internet connection and verify WebSocket status on the bottom left corner."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "അനുമതിയില്ല എന്ന എറർ വരുന്നു (403)",
        "fix": "ഓർഗനൈസേഷൻ അഡ്മിനോട് നിങ്ങളുടെ റോൾ പെർമിഷൻ അപ്‌ഡേറ്റ് ചെയ്യാൻ ആവശ്യപ്പെടുക."
      },
      {
        "issue": "കണക്ഷൻ ടൈംഔട്ട് എറർ",
        "fix": "ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കുക, ഒപ്പം താഴെ കാണുന്ന സിസ്റ്റം സ്റ്റാറ്റസ് പച്ചയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "01": {
    "num": "01",
    "catEn": "Core Engine",
    "catMl": "പ്രധാന സിസ്റ്റം",
    "titleEn": "Getting Started & Complete Platform Lifecycle Guide",
    "titleMl": "ആരംഭിക്കാം & സമ്പൂർണ്ണ സിസ്റ്റം ഓപ്പറേഷൻ ഗൈഡ്",
    "overviewEn": "This master onboarding guide provides an exhaustive, step-by-step walkthrough for Organization Owners and Festival Directors to configure institutions, create Groups / Houses / Units, setup age categories, import participants via CSV, generate QR ID badges, construct drag-and-drop stage timelines, execute double-blind digital judge evaluations, tabulate grade points, and publish live multi-channel leaderboards.",
    "overviewMl": "മുൻപരിചയമില്ലാത്തവർക്ക് പോലും സ്വയം പഠിച്ച് സിസ്റ്റം സജ്ജീകരിക്കാനുള്ള സമ്പൂർണ്ണ ഒഫീഷ്യൽ ഗൈഡ്. അക്കൗണ്ട് രജിസ്ട്രേഷൻ, ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് നിർമ്മാണം, മത്സരങ്ങൾ, മത്സരാർത്ഥികളുടെ പ്രവേശനവും QR കാർഡും, ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് ഷെഡ്യൂളിംഗ്, ജഡ്ജിംഗ് കോൺസോൾ, ഗ്രേഡ് പോയിന്റ് കാൽക്കുലേഷൻ, ലൈവ് ഫലപ്രഖ്യാപനം എന്നിവ അടങ്ങിയ സമഗ്ര മാർഗ്ഗരേഖ.",
    "stepsEn": [
      "Step 1: Account Creation & 6-Digit Email OTP Verification — Visit /signup, enter your Full Name, Work Email, and Organization Name. Check your inbox for the 6-digit OTP verification PIN and verify identity.",
      "Step 2: Organization Configuration & Branding — Navigate to /settings, upload your high-resolution PNG institution logo, set signature theme hex colors (#4F46E5), and define Organization Code (e.g. SJHSS).",
      "Step 3: Setup Groups / Houses / Units — Navigate to /teams and configure contingent units (e.g., Red House #EF4444, Blue House #3B82F6, Yellow Unit #F59E0B, Green Group #10B981).",
      "Step 4: Configure Age Categories & Divisions — Navigate to /competitions/categories and define grade boundaries: Sub-Junior (Classes 5-7), Junior (Classes 8-10), Senior (Classes 11-12), General (Open Division).",
      "Step 5: Register Competition Programs — Navigate to /competitions and add single and group items (e.g., Light Music Solo, Classical Group Dance), set max time limits (5 mins), and judge count (3).",
      "Step 6: Participant Enrollment & CSV Bulk Import — Navigate to /participants, download standard CSV template, import candidate rosters with automated age eligibility checks.",
      "Step 7: Chest Number Mode Selection & QR Badge Generation — Select Chest Number mode (Randomized or Categorized) under /settings and print 8-per-page A4 PDF QR ID Badges.",
      "Step 8: Venue & Stage Setup — Navigate to /stages and add event venues (e.g., Stage 1 Main Auditorium, Stage 2 Open Air Theatre). Assign Stage Managers to each stage desk.",
      "Step 9: Real-Time Drag-and-Drop Stage Scheduling — Navigate to /schedules, drag unscheduled programs onto Stage Timelines. FestPro automatically checks candidate schedule collisions across stages.",
      "Step 10: Call-Room Attendance & Stage Check-In — Stage Managers scan candidate QR badges at stage desks to confirm call-room presence before stage entry.",
      "Step 11: Double-Blind Digital Judge Console — Provide judges with their 4-digit program PIN on digital tablets. Chest numbers are obfuscated into randomized Code Letters (e.g. Chest 102 → Code Letter K).",
      "Step 12: Offline IndexedDB Mark Caching — Judge marksheets auto-save locally in tablet IndexedDB storage if stage WiFi disconnects, auto-syncing when reconnected.",
      "Step 13: Tabulation Engine & Grade Point Calculation — Marks are compiled under /results/grades: A Grade (80-100% = 5 Ind. Pts / 10 Group Pts), B Grade (70-79% = 3 Ind. Pts / 6 Group Pts), C Grade (60-69% = 1 Ind. Pt / 2 Group Pts).",
      "Step 14: Results Approval & Multi-Channel Publishing — Tabulators review scorecards and click 'Approve & Publish' to instantly update Stage LED Wall Tickers (/live) and the Public Portal (/festivals/[id]).",
      "Step 15: PDF E-Certificate Generator & Anti-Fraud QR Verification — Export printable PDF winner certificates containing encrypted verification QR codes linked to /verify/[certId]."
    ],
    "stepsMl": [
      "ഘട്ടം 1: അക്കൗണ്ട് സജ്ജീകരണവും 6-ഡിജിറ്റ് ഇമെയിൽ OTP വെരിഫിക്കേഷനും — /signup പേജിൽ പേര്, ഇമെയിൽ, സ്ഥാപനം എന്നിവ നൽകുക. ഇമെയിലിൽ ലഭിക്കുന്ന 6-ഡിജിറ്റ് OTP PIN അടിച്ച് അക്കൗണ്ട് ആക്റ്റീവാക്കുക.",
      "ഘട്ടം 2: ഓർഗനൈസേഷൻ സെറ്റിംഗ്സും ബ്രാൻഡിംഗും — /settings പേജിൽ പോയി സ്ഥാപനത്തിന്റെ ലോഗോ അപ്‌ലോഡ് ചെയ്യുക, ബ്രാൻഡിംഗ് നിറങ്ങൾ നിശ്ചയിക്കുക, ഓർഗനൈസേഷൻ കോഡ് (e.g. SJHSS) നൽകുക.",
      "ഘട്ടം 3: ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് നിർമ്മാണം — /teams പേജിൽ പോയി ഹൗസുകളും യൂണിറ്റുകളും സജ്ജീകരിക്കുക (ഉദാഹരണത്തിന്: റെഡ് ഹൗസ്, ബ്ലൂ ഹൗസ്, യെല്ലോ യൂണിറ്റ്, ഗ്രീൻ ഗ്രൂപ്പ്).",
      "ഘട്ടം 4: പ്രായപരിധികളും കാറ്റഗറികളും — /competitions/categories പേജ് വഴി ക്ലാസ് ഗ്രൂപ്പുകൾ (സബ് ജൂനിയർ: 5-7, ജൂനിയർ: 8-10, സീനിയർ: 11-12, ജനറൽ) തരംതിരിക്കുക.",
      "ഘട്ടം 5: മത്സര ഇനങ്ങൾ നിർമ്മിക്കൽ — /competitions പേജ് വഴി സിംഗിൾ/ഗ്രൂപ്പ് മത്സരങ്ങൾ (ഉദാഹരണത്തിന്: ലളിതഗാനം, സംഘനൃത്തം) ചേർത്ത് സമയപരിധിയും ജഡ്ജിമാരുടെ എണ്ണവും നിശ്ചയിക്കുക.",
      "ഘട്ടം 6: മത്സരാർത്ഥികളുടെ രജിസ്ട്രേഷൻ (CSV Import) — /participants പേജ് വഴി സിസ്റ്റം തരുന്ന CSV ഫയൽ ഉപയോഗിച്ച് മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ ഒറ്റയടിക്ക് ഇമ്പോർട്ട് ചെയ്യുക.",
      "ഘട്ടം 7: ചെസ്റ്റ് നമ്പർ മോഡും ക്യുആർ ഐഡി കാർഡ് പ്രിന്റും — /settings പേജിൽ നിന്നും ചെസ്റ്റ് നമ്പർ ക്രമം തിരഞ്ഞെടുത്ത് QR ബാഡ്ജ് PDF ആയി ഡൗൺലോഡ് ചെയ്യാം.",
      "ഘട്ടം 8: സ്റ്റേജുകളും വേദി സജ്ജീകരണവും — /stages പേജിൽ പോയി സ്റ്റേജുകൾ (ഉദാഹരണത്തിന്: സ്റ്റേജ് 1 ഒഡിറ്റോറിയം, സ്റ്റേജ് 2 ഓപ്പൺ എയർ) നിർമ്മിച്ച് സ്റ്റേജ് മാനേജർമാരെ ഇൻചാർജ് ആക്കുക.",
      "ഘട്ടം 9: ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് സ്റ്റേജ് ഷെഡ്യൂളിംഗ് — /schedules പേജിൽ പോയി മത്സരങ്ങളെ അതാത് സ്റ്റേജ് ടൈംലൈനിലേക്ക് മാറ്റുക. ഒരേസമയം രണ്ടു സ്റ്റേജിൽ ഒരാൾ വന്നാൽ സിസ്റ്റം സ്വയം താക്കീത് തരും.",
      "ഘട്ടം 10: കാൾ റൂം ക്യുആർ ഹാജർ പട്ടി — സ്റ്റേജ് ഇൻചാർജ്മാർ മത്സരാർത്ഥികളുടെ QR ബാഡ്ജ് സ്കാൻ ചെയ്ത് കാൾ റൂമിലെ സാന്നിധ്യം ഉറപ്പുവരുത്തുന്നു.",
      "ഘട്ടം 11: ജഡ്ജിംഗ് കോഡ് ലെറ്റർ കോൺസോൾ — ജഡ്ജിമാർക്ക് 4-ഡിജിറ്റ് പിൻ നൽകുക. ജഡ്ജിയുടെ ടാബ്‌ലെറ്റിൽ ചെസ്റ്റ് നമ്പറിന് പകരം കോഡ് ലെറ്ററുകൾ (e.g. Chest 102 → Letter K) മാത്രമേ കാണിക്കൂ.",
      "ഘട്ടം 12: നെറ്റ് പോയാലും സേവ് ആകുന്ന ഓഫ്‌ലൈൻ സിങ്ക് — സ്റ്റേജിലെ വൈഫൈ വിച്ഛേദിക്കപ്പെട്ടാലും മാർക്കുകൾ ടാബ്‌ലെറ്റിൽ സേവ് ആവുകയും നെറ്റ് വരുമ്പോൾ സിങ്ക് ആവുകയും ചെയ്യും.",
      "ഘട്ടം 13: ഗ്രേഡ് പോയിന്റ് ടാബുലേഷൻ — /results/grades പേജിൽ മാർക്കുകൾ ക്രോസ്-ചെക്ക് ചെയ്യുന്നു: A Grade (80-100% = 5/10 Pts), B Grade (70-79% = 3/6 Pts), C Grade (60-69% = 1/2 Pts).",
      "ഘട്ടം 14: ഫലപ്രഖ്യാപനവും തത്സമയ അപ്‌ഡേറ്റും — 'Approve & Publish' ക്ലിക്ക് ചെയ്യുന്നതോടെ റിസൾട്ടുകൾ ലൈവ് വെബ്‌സൈറ്റിലും എൽഇഡി സ്ക്രീനുകളിലും (/live) ഒരേസമയം തെളിയുന്നു.",
      "ഘട്ടം 15: ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റും ക്യുആർ വെരിഫിക്കേഷനും — വിജയികൾക്കുള്ള PDF സർട്ടിഫിക്കറ്റുകൾ പ്രിന്റ് ചെയ്യാം; അതിലെ QR സ്കാൻ ചെയ്താൽ വ്യാജമല്ല എന്ന് ഉറപ്പുവരുത്താം."
    ],
    "fields": [
      {
        "name": "Organization Title",
        "type": "String",
        "req": "Yes",
        "descEn": "Official name of the institution.",
        "descMl": "സ്ഥാപനത്തിന്റെ ഔദ്യോഗിക പേര്."
      },
      {
        "name": "Org Short Code",
        "type": "String (3-5 chars)",
        "req": "Yes",
        "descEn": "Prefix used for candidate chest numbers (e.g., SJHSS).",
        "descMl": "ചെസ്റ്റ് നമ്പറുകൾക്ക് മുന്നിൽ വരുന്ന കോഡ് (e.g., SJHSS)."
      },
      {
        "name": "Group / House / Unit Name",
        "type": "String",
        "req": "Yes",
        "descEn": "Contingent house or unit identifier (e.g., Red House, Blue Group).",
        "descMl": "ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റിന്റെ പേര് (e.g., റെഡ് ഹൗസ്, ബ്ലൂ ഗ്രൂപ്പ്)."
      },
      {
        "name": "Primary Contact Email",
        "type": "Email",
        "req": "Yes",
        "descEn": "Admin email address for OTP PIN delivery.",
        "descMl": "അഡ്മിൻ ഇമെയിൽ വിലാസം."
      }
    ],
    "workflowEn": "Sign Up → Verify Email OTP → Add Group / House / Unit → Register Program → Import Candidates → Drag Schedule to Stage → Score on Tablet → Publish Live Results.",
    "workflowMl": "സൈൻ അപ്പ് → ഇമെയിൽ OTP → ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് → മത്സരം നിർമ്മിക്കുക → മത്സരാർത്ഥികൾ → സ്റ്റേജ് ഷെഡ്യൂൾ → ടാബ്‌ലെറ്റിൽ മാർക്കിടൽ → ലൈവ് റിസൾട്ട്.",
    "tipsEn": "Use the built-in CSV template when importing candidates to automatically validate candidate age eligibility across categories.",
    "tipsMl": "മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ ചേർക്കുമ്പോൾ തന്നിട്ടുള്ള CSV ടെംപ്ലേറ്റ് ഉപയോഗിച്ചാൽ പ്രായപരിധി സിസ്റ്റം സ്വയം പരിശോധിക്കും.",
    "warningEn": "Do not delete programs once stage evaluation has commenced; this locks scorecards to preserve audit trails.",
    "warningMl": "മാർക്കിടൽ ആരംഭിച്ച മത്സരങ്ങൾ ഡിലീറ്റ് ചെയ്യരുത്; ഇത് മാർക്ക് ഷീറ്റുകൾ ലോക്ക് ചെയ്യുന്നതാണ്.",
    "faqEn": [
      {
        "q": "Can I use FestPro without an internet connection on stage?",
        "a": "Yes. FestPro Judge Consoles cache marksheets in IndexedDB and automatically re-sync when WiFi is reconnected."
      },
      {
        "q": "How are candidate chest numbers kept confidential?",
        "a": "FestPro generates randomized Code Letters (e.g., Chest 102 → Letter K) so judges score without knowing candidate names or schools."
      }
    ],
    "faqMl": [
      {
        "q": "ഇന്റർനെറ്റ് ഇല്ലാതെ ടാബ്‌ലെറ്റിൽ മാർക്കിടാൻ സാധിക്കുമോ?",
        "a": "അതെ. നെറ്റ് പോയാലും മാർക്കുകൾ ടാബ്‌ലെറ്റിൽ സേവ് ആവുകയും നെറ്റ് വരുമ്പോൾ തന്നത്താൻ സിങ്ക് ആവുകയും ചെയ്യും."
      },
      {
        "q": "ജഡ്ജിമാർക്ക് മത്സരാർത്ഥികളെ എങ്ങനെയാണ് തിരിഞ്ഞുപോകാതിരിക്കുന്നത്?",
        "a": "ചെസ്റ്റ് നമ്പറിന് പകരം സിസ്റ്റം നൽകുന്ന റാൻഡം കോഡ് ലെറ്ററുകൾ (e.g. Chest 102 → Letter K) വഴിയാണ് മാർക്കിടുന്നത്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Invalid 6-Digit Email OTP PIN",
        "fix": "Click 'Resend PIN Token' and check your spam/junk folder for the code."
      },
      {
        "issue": "Candidate age out of range error",
        "fix": "Verify birth date under Participant Settings or adjust category age boundaries under /competitions/categories."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "OTP കോഡ് ലഭിച്ചില്ല",
        "fix": "'Resend PIN Code' ക്ലിക്ക് ചെയ്ത് ഇമെയിലിലെ സ്പാം (Spam) ഫോൾഡർ പരിശോധിക്കുക."
      },
      {
        "issue": "മത്സരാർത്ഥിയുടെ വയസ്സ് തെറ്റാണ് എന്ന എറർ",
        "fix": "മത്സരാർത്ഥിയുടെ ജനനതീയതിയോ കാറ്റഗറിയുടെ പ്രായപരിധിയോ പരിശോധിക്കുക."
      }
    ]
  },
  "02": {
    "num": "02",
    "catEn": "Administration",
    "catMl": "അഡ്മിനിസ്ട്രേഷൻ",
    "titleEn": "Organization Administration, Custom Domains & SMTP Guide",
    "titleMl": "ഓർഗനൈസേഷൻ സെറ്റിംഗ്സ്, ഡൊമെയ്ൻ & SMTP ഗൈഡ്",
    "overviewEn": "Configure multi-tenant isolation settings, custom white-label branding, CNAME domain mapping, SMTP mail gateway deliverability, and Role-Based Access Control (RBAC) permissions.",
    "overviewMl": "നിങ്ങളുടെ സ്ഥാപനത്തിന്റെ ലോഗോ, ബ്രാൻഡിംഗ് നിറങ്ങൾ, സ്വന്തം വെബ്‌സൈറ്റ് ഡൊമെയ്ൻ (CNAME), ഇമെയിൽ സെറ്റിംഗ്സുകൾ (SMTP), സ്റ്റാഫുകളുടെ അധികാരം എന്നിവ ക്രമീകരിക്കാനുള്ള ഗൈഡ്.",
    "stepsEn": [
      "Step 1: Navigate to /dashboard/organization/[orgId]/settings.",
      "Step 2: Upload your high-resolution PNG brand logo and set primary theme hex colors.",
      "Step 3: Configure Custom Domain: Enter your custom domain (e.g., kalotsavam.stjosephs.edu.in) and add CNAME record pointing to cname.festpro.app.",
      "Step 4: Setup Custom SMTP Gateway: Input Host, Port (587), Username, Password, and From Email address to send branded notification emails.",
      "Step 5: Invite Staff Members: Navigate to /members, enter staff emails, and assign roles (Org Admin, Festival Director, Tabulator, Stage Manager, Judge)."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/organization/[orgId]/settings പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: സ്ഥാപനത്തിന്റെ ലോഗോ അപ്‌ലോഡ് ചെയ്ത് കളർ തീം സെറ്റ് ചെയ്യുക.",
      "ഘട്ടം 3: കസ്റ്റം ഡൊമെയ്ൻ: നിങ്ങളുടെ സ്വന്തം വെബ്‌സൈറ്റ് (e.g. kalotsavam.stjosephs.edu.in) നൽകി CNAME റെക്കോർഡ് cname.festpro.app-ലേക്ക് പോയിന്റ് ചെയ്യുക.",
      "ഘട്ടം 4: കസ്റ്റം SMTP: ഇമെയിലുകൾ സ്വന്തം വിലാസത്തിൽ നിന്ന് അയക്കാൻ SMTP വിവരങ്ങൾ നൽകുക.",
      "ഘട്ടം 5: സ്റ്റാഫുകളെ ചേർക്കുക: /members പേജ് വഴി മറ്റു അധ്യാപകർക്കും സ്റ്റാഫുകൾക്കും വോളണ്ടിയർമാർക്കും ലോഗിൻ അനുമതി നൽകുക."
    ],
    "fields": [
      {
        "name": "Custom CNAME Domain",
        "type": "Domain String",
        "req": "No",
        "descEn": "Custom website domain for white-labeling.",
        "descMl": "നിങ്ങളുടെ സ്വന്തം വെബ്‌സൈറ്റ് വിലാസം."
      },
      {
        "name": "SMTP Host Server",
        "type": "Hostname",
        "req": "No",
        "descEn": "Outgoing mail server address (e.g., smtp.gmail.com).",
        "descMl": "മെയിൽ സെർവർ വിലാസം."
      },
      {
        "name": "Default Timezone",
        "type": "Timezone String",
        "req": "Yes",
        "descEn": "Regional timezone for schedule timestamps (e.g. Asia/Kolkata).",
        "descMl": "സമയമേഖല (e.g. Asia/Kolkata)."
      }
    ],
    "workflowEn": "Set Branding → Add Domain CNAME → Verify SSL Certificate → Configure SMTP → Invite Members & Assign Roles.",
    "workflowMl": "ബ്രാൻഡിംഗ് → ഡൊമെയ്ൻ CNAME → SSL വാലിഡേഷൻ → SMTP സെറ്റിംഗ്സ് → അംഗങ്ങളെ ക്ഷണിക്കൽ.",
    "tipsEn": "Always send a test email after configuring custom SMTP settings to verify SPF/DKIM deliverability.",
    "tipsMl": "SMTP സജ്ജീകരിച്ച ശേഷം ഒരു ടെസ്റ്റ് ഇമെയിൽ അയച്ചു നോക്കുന്നത് മെയിലുകൾ സ്പാമിൽ പോകുന്നത് തടയും.",
    "warningEn": "Changing Organization Code after issuing candidate IDs will corrupt existing QR badges.",
    "warningMl": "മത്സരാർത്ഥികൾക്ക് ചെസ്റ്റ് നമ്പർ നൽകിയ ശേഷം ഓർഗനൈസേഷൻ കോഡ് മാറ്റരുത്.",
    "faqEn": [
      {
        "q": "Can we use our school domain name for the festival website?",
        "a": "Yes. Add a CNAME DNS record pointing your subdomain to cname.festpro.app and FestPro automatically issues a free SSL certificate."
      }
    ],
    "faqMl": [
      {
        "q": "ഞങ്ങളുടെ സ്കൂളിന്റെ വെബ്‌സൈറ്റ് വിലാസത്തിൽ ഫെസ്റ്റിവൽ നടത്താമോ?",
        "a": "അതെ. CNAME DNS മാപ്പ് ചെയ്താൽ സിസ്റ്റം സൗജന്യമായി SSL സർട്ടിഫിക്കറ്റോടെ വെബ്‌സൈറ്റ് ഒരുക്കി നൽകും."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "DNS CNAME Verification Pending",
        "fix": "DNS propagation takes up to 24 hours. Verify records using dig or Google DNS Lookup."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "CNAME വെരിഫിക്കേഷൻ പെൻഡിംഗ് കാണിക്കുന്നു",
        "fix": "DNS അപ്‌ഡേറ്റ് ആകാൻ 24 മണിക്കൂർ വരെ സമയമെടുക്കാം; DNS Lookup ഉപയോഗിച്ച് പരിശോധിക്കുക."
      }
    ]
  },
  "03": {
    "num": "03",
    "catEn": "Festival Lifecycle",
    "catMl": "ഫെസ്റ്റിവൽ മാനേജ്‌മെന്റ്",
    "titleEn": "Festival Management, Stages & Venue Registration Guide",
    "titleMl": "ഫെസ്റ്റിവൽ നിർമ്മാണം, സ്റ്റേജ് & വേദി സജ്ജീകരണ ഗൈഡ്",
    "overviewEn": "Create and manage festival workspaces, define venue layouts, add stages, assign stage managers, set age categories, and manage the event lifecycle from draft to archived state.",
    "overviewMl": "ഫെസ്റ്റിവൽ ഉണ്ടാക്കുക, വേദികളും സ്റ്റേജുകളും തരംതിരിക്കുക, സ്റ്റേജ് മാനേജർമാരെ ചുമതലപ്പെടുത്തുക, പ്രായപരിധികൾ നിശ്ചയിക്കുക എന്നിവയ്ക്കുള്ള മാർഗ്ഗരേഖ.",
    "stepsEn": [
      "Step 1: Navigate to /dashboard/organization/[orgId]/festivals/create.",
      "Step 2: Enter Festival Title, Slug, Start Date, End Date, and Main Venue Location.",
      "Step 3: Setup Stages under /stages (e.g., Stage 1 Auditorium, Stage 2 Open Air Theatre). Assign Stage Managers to each stage.",
      "Step 4: Configure Competition Categories under /competitions/categories (Sub-Junior, Junior, Senior, General).",
      "Step 5: Set Program Rules & Scoring Rubrics for Single and Group items."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /dashboard/organization/[orgId]/festivals/create പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: ഫെസ്റ്റിവലിന്റെ പേര്, തീയതികൾ, വേദി എന്നിവ നൽകുക.",
      "ഘട്ടം 3: /stages പേജ് വഴി സ്റ്റേജുകൾ (e.g. സ്റ്റേജ് 1 ഒഡിറ്റോറിയം, സ്റ്റേജ് 2 ഓപ്പൺ എയർ) നിർമ്മിച്ച് സ്റ്റേജ് ഇൻചാർജുകളെ നിയോഗിക്കുക.",
      "ഘട്ടം 4: /competitions/categories വഴി കാറ്റഗറികൾ (സബ് ജൂനിയർ, ജൂനിയർ, സീനിയർ) നിർമ്മിക്കുക.",
      "ഘട്ടം 5: മത്സര നിയമങ്ങളും ഗ്രേഡ് പോയിന്റുകളും സജ്ജമാക്കുക."
    ],
    "fields": [
      {
        "name": "Festival Title",
        "type": "String",
        "req": "Yes",
        "descEn": "Name of the cultural event.",
        "descMl": "ഫെസ്റ്റിവലിന്റെ പേര്."
      },
      {
        "name": "Stage Capacity",
        "type": "Integer",
        "req": "No",
        "descEn": "Seating capacity of the venue.",
        "descMl": "വേദിയുടെ ഇരിപ്പിട ശേഷി."
      }
    ],
    "workflowEn": "Create Festival → Add Stages → Assign Stage Managers → Setup Categories → Launch Event.",
    "workflowMl": "ഫെസ്റ്റിവൽ ഉണ്ടാക്കുക → സ്റ്റേജുകൾ ചേർക്കുക → മാനേജർമാർ → കാറ്റഗറികൾ → ഇവന്റ് ലൈവ്.",
    "tipsEn": "Assign individual stage managers to specific stages so they can scan candidate passes at call-rooms.",
    "tipsMl": "ഓരോ സ്റ്റേജിനും പ്രത്യേകം സ്റ്റേജ് മാനേജർമാരെ നൽകിയാൽ കാൾ റൂം ക്യുആർ ചെക്കിൻ വളരെ എളുപ്പമാകും.",
    "warningEn": "Archiving a festival locks all scorecards in read-only mode.",
    "warningMl": "ഫെസ്റ്റിവൽ ആർക്കൈവ് ചെയ്താൽ മാർക്ക് ഷീറ്റുകൾ തിരുത്താൻ സാധിക്കില്ല.",
    "faqEn": [
      {
        "q": "How many stages can we manage simultaneously?",
        "a": "FestPro supports unlimited simultaneous stages with real-time multi-stage collision detection."
      }
    ],
    "faqMl": [
      {
        "q": "ഒരേസമയം എത്ര സ്റ്റേജുകൾ വരെ നിയന്ത്രിക്കാം?",
        "a": "എത്ര സ്റ്റേജുകൾ വേണമെങ്കിലും ഒരേസമയം നിയന്ത്രിക്കാം; സമയതടസ്സങ്ങൾ സിസ്റ്റം മുൻകൂട്ടി മുന്നറിയിപ്പ് തരും."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Stage conflict alert on scheduling",
        "fix": "Adjust stage start time or move program to another available stage."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഷെഡ്യൂൾ ചെയ്യുമ്പോൾ സമയതടസ്സം (Conflict) കാണിക്കുന്നു",
        "fix": "പ്രോഗ്രാമിന്റെ സമയം മാറ്റുകയോ മറ്റൊരു സ്റ്റേജിലേക്ക് മാറ്റുകയോ ചെയ്യുക."
      }
    ]
  },
  "04": {
    "num": "04",
    "catEn": "Competitions",
    "catMl": "മത്സര ഇനങ്ങൾ",
    "titleEn": "Competition Program Registry & Item Rules Manual",
    "titleMl": "മത്സര ഇനങ്ങൾ & ഇനങ്ങളുടെ നിയമ നിയമാവലി",
    "overviewEn": "Configure Single (Solo) and Group competition items, define time limits, set minimum/maximum candidate counts for group items, assign evaluation rubrics, and lock program entries before stage call.",
    "overviewMl": "സിംഗിൾ, ഗ്രൂപ്പ് മത്സരങ്ങൾ ഉണ്ടാക്കുക, സമയപരിധികൾ സജ്ജമാക്കുക, ജഡ്ജിംഗ് റൂബ്രിക്കുകൾ ഉറപ്പുവരുത്തുക എന്നിവയ്ക്കുള്ള സമഗ്ര ഗൈഡ്.",
    "stepsEn": [
      "Step 1: Navigate to /competitions.",
      "Step 2: Click 'Add Competition Item' and select Competition Type (Single/Solo or Group).",
      "Step 3: Enter Item Title (e.g. Light Music, Bharatanatyam, Oppana), Category (Junior/Senior), Max Time Limit (5 mins), and Grace Time Buffer (1 min).",
      "Step 4: For Group Items, specify Min Participants (e.g., 5) and Max Participants (e.g., 10).",
      "Step 5: Set Judge Count (e.g. 3 Judges) and assign evaluation criteria weights (e.g. Pitch 30, Rhythm 30, Expression 40)."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /competitions പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: 'Add Competition Item' ക്ലിക്ക് ചെയ്ത് സിംഗിൾ പ്രോഗ്രാം ആണോ ഗ്രൂപ്പ് ആണോ എന്ന് തിരഞ്ഞെടുക്കുക.",
      "ഘട്ടം 3: മത്സരത്തിന്റെ പേര് (ഉദാ: ലളിതഗാനം, ഭരതനാട്യം, ഒപ്പന), സമയം (5 മിനിറ്റ്), ഗ്രേസ് സമയം (1 മിനിറ്റ്) എന്നിവ നൽകുക.",
      "ഘട്ടം 4: ഗ്രൂപ്പ് പ്രോഗ്രാം ആണെങ്കിൽ കുറഞ്ഞതും കൂടിയതുമായ മത്സരാർത്ഥികളുടെ എണ്ണം നൽകുക.",
      "ഘട്ടം 5: ജഡ്ജിമാരുടെ എണ്ണം (e.g. 3) നൽകി മാർക്കിടുന്നതിനുള്ള മാനദണ്ഡങ്ങൾ സജ്ജീകരിക്കുക."
    ],
    "fields": [
      {
        "name": "Max Time Limit",
        "type": "Minutes",
        "req": "Yes",
        "descEn": "Allowed stage performance duration.",
        "descMl": "സ്റ്റേജിൽ അനുവദിച്ചിട്ടുള്ള പരമാവധി സമയം."
      },
      {
        "name": "Grace Time Buffer",
        "type": "Minutes",
        "req": "Yes",
        "descEn": "Allowed grace period before automated point penalties.",
        "descMl": "പോയിന്റ് കുറയാതെ അനുവദിക്കുന്ന അധിക സമയം."
      }
    ],
    "workflowEn": "Add Program → Define Time Limits → Set Group Bounds → Assign Rubric Criteria → Lock Program.",
    "workflowMl": "മത്സരം ചേർക്കുക → സമയം നിശ്ചയിക്കുക → ഗ്രൂപ്പ് നിബന്ധനകൾ → മാർക്കിംഗ് മാനദണ്ഡം → ലോക്ക് ചെയ്യുക.",
    "tipsEn": "Locking a competition program prevents accidental edits to judge scoring criteria after stage call.",
    "tipsMl": "മത്സരം ലോക്ക് ചെയ്തു വെച്ചാൽ സ്റ്റേജിൽ ലൈവായി നടക്കുമ്പോൾ വിധികർത്താക്കളുടെ മാനദണ്ഡങ്ങൾ മാറുന്നത് തടയാം.",
    "warningEn": "Modifying criteria weights after judging has started will invalidate submitted marksheets.",
    "warningMl": "മാർക്കിടൽ ആരംഭിച്ച ശേഷം മാർക്കിംഗ് മാനദണ്ഡങ്ങൾ മാറ്റിയാൽ പഴയ മാർക്കുകൾ ക്യാൻസലാകും.",
    "faqEn": [
      {
        "q": "Can a candidate participate in both Solo and Group items?",
        "a": "Yes, provided category item limits (e.g. max 5 Solo, 2 Group) defined under Category Rules are respected."
      }
    ],
    "faqMl": [
      {
        "q": "ഒരാൾക്ക് സിംഗിൾ പ്രോഗ്രാമിലും ഗ്രൂപ്പിലും പങ്കടുക്കാമോ?",
        "a": "അതെ. കാറ്റഗറി നിയമങ്ങളിൽ പറഞ്ഞിട്ടുള്ള ലിമിറ്റുകൾക്കുള്ളിലാണെങ്കിൽ പങ്കെടുക്കാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Group candidate count below minimum",
        "fix": "Verify group member roster under /participants before locking team registration."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഗ്രൂപ്പിലെ ആൾക്കാരുടെ എണ്ണം തികയുന്നില്ല",
        "fix": "ടീം രജിസ്ട്രേഷൻ പൂർത്തിയാക്കുന്നതിന് മുൻപ് ആൾക്കാരുടെ എണ്ണം തികക്കുക."
      }
    ]
  },
  "05": {
    "num": "05",
    "catEn": "Participants",
    "catMl": "മത്സരാർത്ഥികൾ",
    "titleEn": "Participant Enrollment, CSV Bulk Import & QR ID Badge Guide",
    "titleMl": "മത്സരാർത്ഥികളുടെ രജിസ്ട്രേഷൻ, CSV ഇമ്പോർട്ട് & QR കാർഡ് ഗൈഡ്",
    "overviewEn": "Enroll candidates manually or via bulk CSV upload, validate age eligibility across categories, assign candidates to Groups / Houses / Units, and print encrypted QR ID badges.",
    "overviewMl": "മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ ചേർക്കുക, CSV വഴി കൂട്ടത്തോടെ ഇമ്പോർട്ട് ചെയ്യുക, വയസ്സ് പരിശോധിക്കുക, ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് നൽകുക, QR ഐഡി കാർഡുകൾ പ്രിന്റ് ചെയ്യുക.",
    "stepsEn": [
      "Step 1: Navigate to /participants.",
      "Step 2: To import candidates in bulk, click 'Download CSV Template', populate candidate details (Name, DOB, Class, Group/House/Unit, Items), and click 'Upload CSV'.",
      "Step 3: FestPro automatically checks candidate birth dates against category age limits (e.g. Sub-Junior 8-11 yrs).",
      "Step 4: Generate Chest Numbers: Click 'Auto-Generate Chest Numbers' under /settings to assign unique IDs.",
      "Step 5: Print QR Badges: Click 'Print QR ID Badges' to generate printable 8-per-page A4 PDF passes with encrypted verification codes."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /participants പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: CSV വഴി വിവരങ്ങൾ നൽകാൻ 'Download CSV Template' ക്ലിക്ക് ചെയ്ത് ആളുകളുടെ വിവരങ്ങൾ ടൈപ്പ് ചെയ്ത് 'Upload CSV' കൊടുക്കുക.",
      "ഘട്ടം 3: സിസ്റ്റം സ്വയം ജനനതീയതി പരിശോധിച്ചു കാറ്റഗറി യോഗ്യത ഉറപ്പാക്കുന്നു.",
      "ഘട്ടം 4: ചെസ്റ്റ് നമ്പർ നൽകൽ: /settings പേജ് വഴി 'Auto-Generate Chest Numbers' ക്ലിക്ക് ചെയ്ത് ചെസ്റ്റ് നമ്പർ നൽകുക.",
      "ഘട്ടം 5: QR ബാഡ്ജ് പ്രിന്റ്: 'Print QR ID Badges' ക്ലിക്ക് ചെയ്ത് PDF ഐഡി കാർഡുകൾ ഡൗൺലോഡ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Candidate Name",
        "type": "String",
        "req": "Yes",
        "descEn": "Full name of candidate.",
        "descMl": "മത്സരാർത്ഥിയുടെ പേര്."
      },
      {
        "name": "Date of Birth",
        "type": "Date (YYYY-MM-DD)",
        "req": "Yes",
        "descEn": "Birth date for age validation.",
        "descMl": "ജനനതീയതി."
      },
      {
        "name": "Group / House / Unit",
        "type": "String",
        "req": "Yes",
        "descEn": "Contingent team assignment.",
        "descMl": "ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ്."
      }
    ],
    "workflowEn": "Download CSV → Fill Roster → Upload CSV → Verify Eligibility → Generate Chest Nos → Print QR Badges.",
    "workflowMl": "CSV ഡൗൺലോഡ് → വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുക → CSV അപ്‌ലോഡ് → വയസ്സ് പരിശോധന → ചെസ്റ്റ് നമ്പർ → QR ബാഡ്ജ് പ്രിന്റ്.",
    "tipsEn": "Print ID badges using a laser printer on 200 GSM cardstock for smooth scanning at stage call-rooms.",
    "tipsMl": "QR കാർഡുകൾ ലേസർ പ്രിന്റർ വഴി 200 GSM പേപ്പറിൽ പ്രിന്റ് ചെയ്താൽ വെളിച്ചക്കുറവുള്ള സ്റ്റേജിലും പെട്ടെന്ന് സ്കാൻ ചെയ്യാം.",
    "warningEn": "Do not re-import CSV files after stage calls have started without clearing candidate duplicate flags.",
    "warningMl": "മത്സരം തുടങ്ങിയ ശേഷം അതേ CSV വീണ്ടും ഇമ്പോർട്ട് ചെയ്താൽ ചെസ്റ്റ് നമ്പർ മാറും.",
    "faqEn": [
      {
        "q": "What happens if a candidate loses their printed QR ID badge?",
        "a": "Navigate to /participants, search the candidate name, and click 'Re-issue Badge' to print a single duplicate PDF pass."
      }
    ],
    "faqMl": [
      {
        "q": "ഐഡി കാർഡ് നഷ്ടപ്പെട്ടാൽ എന്ത് ചെയ്യണം?",
        "a": "/participants പേജിൽ പേര് തിരഞ്ഞുപിടിച്ച് 'Re-issue Badge' ക്ലിക്ക് ചെയ്താൽ പുതിയ കാർഡ് പ്രിന്റ് ചെയ്യാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "CSV Upload Error: Invalid Date Format",
        "fix": "Ensure dates are formatted as YYYY-MM-DD (e.g. 2012-05-15) in Excel before saving as CSV."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "CSV എറർ: തീയതി ശരിയല്ല",
        "fix": "എക്‌സെലിൽ തീയതി YYYY-MM-DD (e.g. 2012-05-15) എന്ന ഫോർമാറ്റിലാക്കി മാറ്റുക."
      }
    ]
  },
  "06": {
    "num": "06",
    "catEn": "Scheduling",
    "catMl": "സ്റ്റേജ് ഷെഡ്യൂൾ",
    "titleEn": "Stage Drag-and-Drop Schedule Builder & Collision Alert Engine",
    "titleMl": "ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് സ്റ്റേജ് ഷെഡ്യൂളിംഗും സമയതടസ്സ മുന്നറിയിപ്പും",
    "overviewEn": "Construct event timelines across multiple stages using an intuitive drag-and-drop schedule builder. Automatically detect candidate multi-stage double-bookings and resolve stage timing conflicts.",
    "overviewMl": "ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് ടൈംലൈൻ വഴി മത്സരങ്ങൾ വിവിധ സ്റ്റേജുകളിലേക്ക് സജ്ജീകരിക്കുക, ഒരാൾ ഒരേസമയം രണ്ടു സ്റ്റേജിൽ വരുന്നത് സിസ്റ്റം കണ്ടെത്തി മുന്നറിയിപ്പ് നൽകുക.",
    "stepsEn": [
      "Step 1: Navigate to /schedules.",
      "Step 2: View the Unscheduled Programs Pool on the left panel.",
      "Step 3: Drag a program card onto your targeted Stage Timeline at the desired time slot (e.g., Stage 1 - 10:00 AM).",
      "Step 4: FestPro automatically calculates program duration based on candidate count and max item time limit.",
      "Step 5: Automated Collision Check: If a candidate is scheduled on another stage at the same time, a red warning alert banner immediately appears with option to Auto-Reschedule."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /schedules പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: ഇടതുഭാഗത്ത് കാണുന്ന മത്സരങ്ങളുടെ ലിസ്റ്റ് കാണാം.",
      "ഘട്ടം 3: മത്സരത്തെ അതാത് സ്റ്റേജ് ടൈംലൈനിലേക്ക് ഡ്രാഗ് ചെയ്ത് വെക്കുക (ഉദാ: സ്റ്റേജ് 1 - 10:00 AM).",
      "ഘട്ടം 4: ആളുകളുടെ എണ്ണവും പ്രോഗ്രാം സമയവും കണക്കാക്കി സിസ്റ്റം സ്വയംസമയം സജ്ജമാക്കും.",
      "ഘട്ടം 5: ഒരേ സമയം രണ്ടു സ്ഥലത്ത് വരികയാണെങ്കിൽ സിസ്റ്റം റെഡ് സിഗ്നൽ നൽകുകയും 'Auto-Reschedule' വഴി സമയം മാറ്റിത്തരുകയും ചെയ്യും."
    ],
    "fields": [
      {
        "name": "Start Time",
        "type": "Time (HH:MM AM/PM)",
        "req": "Yes",
        "descEn": "Stage program start time.",
        "descMl": "മത്സരം ആരംഭിക്കുന്ന സമയം."
      },
      {
        "name": "Duration",
        "type": "Minutes",
        "req": "Yes",
        "descEn": "Calculated stage slot duration.",
        "descMl": "മത്സരത്തിന്റെ സമയം."
      }
    ],
    "workflowEn": "Select Program → Drag to Stage Timeline → Run Collision Check → Resolve Red Alerts → Lock Stage Schedule.",
    "workflowMl": "മത്സരം തിരഞ്ഞെടുക്കുക → ടൈംലൈനിലേക്ക് ഡ്രാഗ് ചെയ്യുക → ചെക്കിംഗ് → റെഡ് സിഗ്നൽ മാറ്റുക → ഷെഡ്യൂൾ ഉറപ്പിക്കുക.",
    "tipsEn": "Lock stage timelines 2 hours before event start to push final schedule notifications to mobile apps and public LED walls.",
    "tipsMl": "പരിപാടി തുടങ്ങുന്നതിന് 2 മണിക്കൂർ മുൻപ് ഷെഡ്യൂൾ ലോക്ക് ചെയ്താൽ ലൈവായി അപ്‌ഡേറ്റ് ചെയ്യപ്പെടും.",
    "warningEn": "Do not manually overlap program times on the same stage without adding buffer intervals.",
    "warningMl": "ഒരു സ്റ്റേജിൽ പ്രോഗ്രാമുകൾക്കിടയിൽ ഗ്യാപ്പ് കൊടുക്കാതെ വെക്കരുത്.",
    "faqEn": [
      {
        "q": "What happens if a stage program runs behind schedule?",
        "a": "Stage Managers can click 'Delay Stage' under /stages to shift all subsequent programs on that stage by 15 or 30 minutes automatically."
      }
    ],
    "faqMl": [
      {
        "q": "ഒരു സ്റ്റേജിൽ പ്രോഗ്രാം വൈകിയാൽ എന്ത് ചെയ്യും?",
        "a": "സ്റ്റേജ് മാനേജർക്ക് 'Delay Stage' ക്ലിക്ക് ചെയ്ത് ആ സ്റ്റേജിലെ ബാക്കി പരിപാടികൾ 15 മിനിറ്റ് പുറകോട്ടു മാറ്റാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Red Collision Warning Banner Active",
        "fix": "Click 'Auto-Reschedule' or drag the conflicting program to a non-overlapping time slot."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "റെഡ് സിഗ്നൽ മുന്നറിയിപ്പ് മാപ്പിൽ കാണുന്നു",
        "fix": "'Auto-Reschedule' ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ പ്രോഗ്രാം സമയം മാറ്റുക."
      }
    ]
  },
  "07": {
    "num": "07",
    "catEn": "Judging Engine",
    "catMl": "ജഡ്ജിംഗ് എഞ്ചിൻ",
    "titleEn": "Double-Blind Digital Judge Console & PIN Security Guide",
    "titleMl": "ഡിജിറ്റൽ ജഡ്ജ് കോൺസോളും കോഡ് ലെറ്റർ മാർക്കിംഗും",
    "overviewEn": "Provide judges with secure digital tablet scoring consoles. Obfuscate candidate chest numbers into randomized Code Letters, authenticate judges via 4-digit program PINs, and sync submitted marksheets offline using IndexedDB.",
    "overviewMl": "ജഡ്ജിമാർക്ക് ടാബ്‌ലെറ്റിൽ മാർക്കിടാനുള്ള കോൺസോൾ. ചെസ്റ്റ് നമ്പറുകൾ മാറ്റി കോഡ് ലെറ്ററുകൾ (e.g. Chest 102 → Letter K) നൽകി പഷ്പക്ഷമായ ജഡ്ജിംഗും ഓഫ്‌ലൈൻ സേവിംഗും ഉറപ്പാക്കാം.",
    "stepsEn": [
      "Step 1: Stage Manager launches program on stage dashboard and clicks 'Generate Judge Program PIN' (4-digit PIN code).",
      "Step 2: Judges navigate to /mobile/judging on their tablets and enter the 4-digit PIN to open their digital marksheet.",
      "Step 3: Double-Blind Obfuscation: Candidate Chest Numbers are replaced with randomized Code Letters (e.g., Candidate 1 = Code Letter K, Candidate 2 = Code Letter M).",
      "Step 4: Judges score candidates across assigned criteria sliders (Pitch 0-30, Rhythm 0-30, Expression 0-40).",
      "Step 5: Submission & Verification: Judges click 'Submit Final Marksheet' and authenticate submission via digital signature."
    ],
    "stepsMl": [
      "ഘട്ടം 1: സ്റ്റേജ് മാനേജർ മത്സരം സ്റ്റേജിൽ സ്റ്റാർട്ട് ചെയ്ത് 4-ഡിജിറ്റ് 'Judge PIN Code' ജഡ്ജിമാർക്ക് നൽകുന്നു.",
      "ഘട്ടം 2: ജഡ്ജിമാർ ടാബ്‌ലെറ്റിൽ /mobile/judging പേജ് തുറന്ന് ഈ പിൻ ടൈപ്പ് ചെയ്ത് പ്രോഗ്രാം തുറക്കുന്നു.",
      "ഘട്ടം 3: ചെസ്റ്റ് നമ്പറിന് പകരം സിസ്റ്റം സ്വയം നിർമ്മിക്കുന്ന കോഡ് ലെറ്ററുകൾ (e.g. Chest 102 → Letter K) വഴി മത്സരാർത്ഥികളെ തിരിച്ചറിയുന്നു.",
      "ഘട്ടം 4: ഓരോ മാനദണ്ഡത്തിനും സ്ളൈഡർ മാറ്റി കൃത്യമായി മാർക്കിടുന്നു.",
      "ഘട്ടം 5: മാർക്കിട്ട ശേഷം 'Submit Final Marksheet' ക്ലിക്ക് ചെയ്ത് ജഡ്ജിമാർ ഡിജിറ്റൽ ഒപ്പിടുന്നു."
    ],
    "fields": [
      {
        "name": "Judge PIN",
        "type": "4-Digit Integer",
        "req": "Yes",
        "descEn": "Program access security key.",
        "descMl": "സെക്യൂരിറ്റി പിൻ കോഡ്."
      },
      {
        "name": "Code Letter",
        "type": "Randomized Character",
        "req": "Yes",
        "descEn": "Obfuscated candidate identifier.",
        "descMl": "രഹസ്യ കോഡ് അക്ഷരം."
      }
    ],
    "workflowEn": "Generate PIN → Judge Log In → Obfuscate Chest Nos → Score Sliders → Digital Signature → Submit Marksheet.",
    "workflowMl": "PIN എടുക്കുക → ജഡ്ജി ലോഗിൻ → കോഡ് ലെറ്റർ → മാർക്കിടൽ → ഒപ്പിടൽ → സബ്മിറ്റ്.",
    "tipsEn": "Set tablet brightness to 80% and lock screen sleep timeout to 'Never' during stage sessions.",
    "tipsMl": "ടാബ്‌ലെറ്റിന്റെ സ്ക്രീൻ ലൈറ്റ് അണഞ്ഞുപോകാതിരിക്കാൻ Screen Sleep timeout 'Never' ആക്കി വെക്കുക.",
    "warningEn": "Do not refresh the judge tablet page while actively sliding score bars; unsubmitted draft scores stay in local cache.",
    "warningMl": "മാർക്കിട്ടുകൊണ്ടിരിക്കുമ്പോൾ പേജ് റീഫ്രഷ് ചെയ്യരുത്.",
    "faqEn": [
      {
        "q": "What if a judge makes a mistake after submitting their marksheet?",
        "a": "The Chief Tabulator can issue a Master Re-evaluation Override key under /results/grades to unlock the scorecard."
      }
    ],
    "faqMl": [
      {
        "q": "മാർക്ക് സബ്മിറ്റ് ചെയ്ത ശേഷം തിരുത്താൻ സാധിക്കുമോ?",
        "a": "ചീഫ് ടാബുലേറ്റർ അനുമതി നൽകിയാൽ റീ-ഇവാലുവേഷൻ കീ നൽകി മാർക്ക് മാറ്റി നൽകാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Tablet WiFi Disconnected during Judging",
        "fix": "Marks stay cached in IndexedDB. Continue scoring; tablet auto-syncs when WiFi reconnects."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ടാബ്‌ലെറ്റിലെ വൈഫൈ കട്ടായി",
        "fix": "പേടിക്കേണ്ടതില്ല; മാർക്കുകൾ സേവ് ആകും, നെറ്റ് വരുമ്പോൾ സിസ്റ്റം തന്നത്താൻ സിങ്ക് ചെയ്യും."
      }
    ]
  },
  "08": {
    "num": "08",
    "catEn": "Tabulation",
    "catMl": "ടാബുലേഷൻ & ഫലം",
    "titleEn": "Results Tabulation Engine & Grade Point Rubric Guide",
    "titleMl": "ഫലപ്രഖ്യാപനം, ടാബുലേഷൻ & ഗ്രേഡ് പോയിന്റ് മാനുവൽ",
    "overviewEn": "Compile digital scorecards, apply standard grade point rubrics, resolve tie-breaker conditions, verify tabulator approvals, and publish live results to stage LED screens and public websites.",
    "overviewMl": "ഡിജിറ്റൽ സ്കോർ ഷീറ്റുകൾ പരിശോധിക്കുക, ഗ്രേഡ് പോയിന്റുകൾ തിട്ടപ്പെടുത്തുക, ടൈ വരുന്നത് പരിഹരിക്കുക, ഒറ്റ ക്ലിക്കിൽ ലൈവായി റിസൾട്ട് പ്രസിദ്ധീകരിക്കുക.",
    "stepsEn": [
      "Step 1: Navigate to /results/grades.",
      "Step 2: Review incoming judge scorecards. FestPro maps Code Letters back to candidate Chest Numbers and calculates average scores automatically.",
      "Step 3: Grade Point Rubric Application: A Grade (80-100% = 5 Ind. / 10 Group Pts), B Grade (70-79% = 3 Ind. / 6 Group Pts), C Grade (60-69% = 1 Ind. / 2 Group Pts).",
      "Step 4: Rank Assignment: 1st Rank (+5 Bonus Pts), 2nd Rank (+3 Bonus Pts), 3rd Rank (+1 Bonus Pt).",
      "Step 5: Tabulator Approval: Chief Tabulator verifies scorecards and clicks 'Approve & Publish' to update live leaderboards (/live) and public site (/festivals/[id])."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /results/grades പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: ജഡ്ജിമാർ നൽകിയ മാർക്കുകൾ പരിശോധിക്കുക. കോഡ് ലെറ്ററുകൾ സിസ്റ്റം സ്വയം ചെസ്റ്റ് നമ്പറുകളാക്കി ആവറേജ് മാർക്ക് കാണിക്കും.",
      "ഘട്ടം 3: ഗ്രേഡ് പോയിന്റ് കാൽക്കുലേഷൻ: A Grade (80-100% = 5/10 Pts), B Grade (70-79% = 3/6 Pts), C Grade (60-69% = 1/2 Pts).",
      "ഘട്ടം 4: റാങ്ക് പോയിന്റുകൾ: ഒന്നാം സ്ഥാനം (+5 Pts), രണ്ടാം സ്ഥാനം (+3 Pts), മൂന്നാം സ്ഥാനം (+1 Pt).",
      "ഘട്ടം 5: ഫലപ്രഖ്യാപനം: ചീഫ് ടാബുലേറ്റർ 'Approve & Publish' ക്ലിക്ക് ചെയ്യുമ്പോൾ ഫലം ലൈവ് ആയി സ്ക്രീനുകളിൽ തെളിയുന്നു."
    ],
    "fields": [
      {
        "name": "Average Score",
        "type": "Float (0-100)",
        "req": "Yes",
        "descEn": "Calculated mean judge score.",
        "descMl": "ശരാശരി മാർക്ക്."
      },
      {
        "name": "Grade Awarded",
        "type": "Enum (A/B/C)",
        "req": "Yes",
        "descEn": "Earned grade standard.",
        "descMl": "ലഭിച്ച ഗ്രേഡ്."
      }
    ],
    "workflowEn": "Receive Scorecards → Map Code Letters → Apply Grade Rubric → Calculate Ranks → Tabulator Approve → Publish Live.",
    "workflowMl": "മാർക്കുകൾ വരുക → ചെസ്റ്റ് നമ്പർ മാപ്പ് ചെയ്യുക → ഗ്രേഡ് നൽകുക → റാങ്ക് നോക്കുക → അപ്രൂവൽ → ലൈവ് റിസൾട്ട്.",
    "tipsEn": "Print two hard copies of official tabulation sheets for judge physical signature verification before archiving.",
    "tipsMl": "ഫലം പ്രഖ്യാപിക്കുന്നതിന് മുൻപ് രണ്ടു കോപ്പി പ്രിന്റ് എടുത്ത് വിധികർത്താക്കളെക്കൊണ്ട് ഒപ്പിടുവിക്കുക.",
    "warningEn": "Once a result is published, changing scores requires an administrative audit trail justification.",
    "warningMl": "ഫലം പ്രസിദ്ധീകരിച്ച ശേഷം മാർക്ക് മാറ്റണമെങ്കിൽ അഡ്മിൻ പാസ്‌വേഡ് ആവശ്യമാണ്.",
    "faqEn": [
      {
        "q": "How are tie scores handled for 1st place?",
        "a": "FestPro flags tie scores in yellow and allows Chief Tabulator to inspect individual criterion breakdowns or declare joint winners."
      }
    ],
    "faqMl": [
      {
        "q": "ഒന്നാം സ്ഥാനത്തിന് ടൈ (Tie) വന്നാൽ എന്ത് ചെയ്യും?",
        "a": "സിസ്റ്റം മഞ്ഞ നിറത്തിൽ മുന്നറിയിപ്പ് കാണിക്കും; മാനദണ്ഡങ്ങൾ വെവ്വേറെ നോക്കിയോ ജോയിന്റ് വിന്നർ ആക്കിയോ തീരുമാനം എടുക്കാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Missing judge scorecard blocking publication",
        "fix": "Check /mobile/judging to ensure all judges clicked 'Submit Final Marksheet'."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഒരു ജഡ്ജിയുടെ മാർക്ക് വരാത്തതിനാൽ റിസൾട്ട് കാണുന്നില്ല",
        "fix": "എല്ലാ ജഡ്ജിമാരും സബ്മിറ്റ് ചെയ്തിട്ടുണ്ടെന്ന് ടാബ്‌ലെറ്റിൽ ഉറപ്പുവരുത്തുക."
      }
    ]
  },
  "09": {
    "num": "09",
    "catEn": "Certificates",
    "catMl": "സർട്ടിഫിക്കറ്റുകൾ",
    "titleEn": "Digital PDF E-Certificate Builder & Anti-Fraud QR Verification Guide",
    "titleMl": "ഡിജിറ്റൽ PDF സർട്ടിഫിക്കറ്റ് & ക്യുആർ വെരിഫിക്കേഷൻ ഗൈഡ്",
    "overviewEn": "Design custom PDF certificate backgrounds, map dynamic template tags, batch generate winner and participant certificates, and enable public anti-fraud QR code lookup at /verify/[certId].",
    "overviewMl": "സർട്ടിഫിക്കറ്റുകൾ ഡിസൈൻ ചെയ്യുക, വിന്നേഴ്‌സിനും പാര്ട്ടിസിപ്പന്റ്സിനും ഒറ്റയടിക്ക് PDF ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റ് നൽകുക, വ്യാജമല്ലെന്ന് ഉറപ്പാക്കാൻ QR വെരിഫിക്കേഷൻ നൽകുക.",
    "stepsEn": [
      "Step 1: Navigate to /dashboard/organization/[orgId]/festivals/[festivalId]/certificates.",
      "Step 2: Upload custom high-resolution certificate template background image (A4 Landscape PDF/PNG).",
      "Step 3: Drag and drop merge tags (e.g. {{candidate_name}}, {{rank}}, {{grade}}, {{item_title}}, {{group_name}}).",
      "Step 4: Click 'Batch Export PDF Certificates' to generate all winner passes in a single ZIP download.",
      "Step 5: Public Anti-Fraud Verification: Each certificate features a unique QR code pointing to /verify/[certId] for instant validation."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /certificates പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: സർട്ടിഫിക്കറ്റ് ബാക്ക്ഗ്രൗണ്ട് ഇമേജ് അപ്‌ലോഡ് ചെയ്യുക (A4 Landscape).",
      "ഘട്ടം 3: പേര്, റാങ്ക്, ഗ്രേഡ്, മത്സരം എന്നിവ വരുന്ന സ്ഥലങ്ങൾ ഡ്രാഗ് ചെയ്ത് വെക്കുക.",
      "ഘട്ടം 4: 'Batch Export PDF Certificates' ക്ലിക്ക് ചെയ്ത് സർട്ടിഫിക്കറ്റുകൾ ഒറ്റയടിക്ക് ZIP ഡൗൺലോഡ് ചെയ്യുക.",
      "ഘട്ടം 5: വ്യാജ സർട്ടിഫിക്കറ്റ് തടയാൻ ക്യുആർ സ്കാൻ ചെയ്താൽ സിസ്റ്റത്തിൽ നിന്നും ഒറിജിനൽ റിസൾട്ട് തെളിയുന്നതാണ്."
    ],
    "fields": [
      {
        "name": "Certificate ID",
        "type": "UUID String",
        "req": "Yes",
        "descEn": "Unique anti-fraud verification key.",
        "descMl": "വ്യാജമല്ലാത്ത യുണീക് കോഡ്."
      },
      {
        "name": "Merge Tags",
        "type": "Template Tokens",
        "req": "Yes",
        "descEn": "Dynamic candidate field placeholders.",
        "descMl": "പേര്, ഗ്രേഡ് വരാനുള്ള സ്ഥാനങ്ങൾ."
      }
    ],
    "workflowEn": "Upload Background → Map Merge Tags → Verify Sample PDF → Batch Export ZIP → Scan QR Verification.",
    "workflowMl": "ബാക്ക്ഗ്രൗണ്ട് അപ്‌ലോഡ് → ടാഗുകൾ മാപ്പ് ചെയ്യുക → സാംപിൾ പരിശോധന → ZIP എക്‌സ്‌പോർട്ട് → QR സ്കാൻ വെരിഫിക്കേഷൻ.",
    "tipsEn": "Use high-resolution 300 DPI background images to ensure crystal clear printing on official letterheads.",
    "tipsMl": "നല്ല വ്യക്തതയുള്ള 300 DPI ഇമേജുകൾ ബാക്ക്ഗ്രൗണ്ട് ആക്കിയാൽ പ്രിന്റ് എടുക്കുമ്പോൾ ലോഗോകൾ വ്യക്തമാകും.",
    "warningEn": "Deleting a festival result after certificate issuance will mark the public QR verification lookup as Revoked.",
    "warningMl": "റിസൾട്ട് ക്യാൻസൽ ചെയ്താൽ ആ സർട്ടിഫിക്കറ്റിലെ QR സ്കാൻ ചെയ്താൽ 'Revoked' എന്ന് തെളിയും.",
    "faqEn": [
      {
        "q": "Can participants download their certificates directly from their phones?",
        "a": "Yes. Published winners can log in or search their chest number on the public portal to download their PDF certificate instantly."
      }
    ],
    "faqMl": [
      {
        "q": "കുട്ടികൾക്ക് ഫോണിൽ നിന്നും സർട്ടിഫിക്കറ്റ് ഡൗൺലോഡ് ചെയ്യാമോ?",
        "a": "അതെ. ഫലപ്രഖ്യാപനത്തിന് ശേഷം പൊതുജന പോർട്ടൽ വഴി സ്വന്തം ചെസ്റ്റ് നമ്പർ അടിച്ചു സർട്ടിഫിക്കറ്റ് ഡൗൺലോഡ് ചെയ്യാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "QR verification opens invalid link",
        "fix": "Verify your custom domain HTTPS routing under Organization Settings -> Domain Mapping."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "QR സ്കാൻ ചെയ്യുമ്പോൾ ലിങ്ക് ഓപ്പൺ ആകുന്നില്ല",
        "fix": "ഡൊമെയ്ൻ SSL സെറ്റിംഗ്സ് ശരിയാണെന്ന് അഡ്മിൻ പേജിൽ പരിശോധിക്കുക."
      }
    ]
  }
};
