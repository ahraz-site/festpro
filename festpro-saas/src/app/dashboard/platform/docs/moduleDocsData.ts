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
    "catEn": "Staff & Volunteer",
    "catMl": "സ്റ്റാഫ് & വോളണ്ടിയർ",
    "titleEn": "Volunteer Shift Management & Checkpoint QR Attendance",
    "titleMl": "വോളണ്ടിയർ ഷിഫ്റ്റുകളും ക്യുആർ ഹാജർ പർട്ടികയും",
    "overviewEn": "Manage volunteer teams, allocate shifts across stages and venues, and track real-time attendance using QR code scanning at checkpoints.",
    "overviewMl": "വോളണ്ടിയർമാരെ വിവിധ ഡ്യൂട്ടികൾക്കും സ്റ്റേജുകൾക്കുമായി തിരിക്കുക, ഷിഫ്റ്റുകൾ നൽകുക, അവർ ഡ്യൂട്ടിക്ക് കയറുമ്പോൾ QR സ്കാൻ ചെയ്തു ഹാജർ രേഖപ്പെടുത്തുക.",
    "stepsEn": [
      "Step 1: Navigate to /volunteers and click 'Add Volunteer' to register staff.",
      "Step 2: Assign specific Checkpoints (e.g., Main Gate, Stage 1 Backstage, Food Counter).",
      "Step 3: Define Shifts (e.g., Morning 8 AM - 1 PM, Afternoon 1 PM - 6 PM).",
      "Step 4: Generate Volunteer ID Badges containing unique QR codes.",
      "Step 5: Checkpoint In-Charges scan the QR codes using the FestPro app to log check-in and check-out times."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /volunteers പേജിൽ പോയി വോളണ്ടിയർമാരുടെ വിവരങ്ങൾ നൽകുക.",
      "ഘട്ടം 2: ഡ്യൂട്ടി പോയിന്റുകൾ സെറ്റ് ചെയ്യുക (ഉദാ: മെയിൻ ഗേറ്റ്, സ്റ്റേജ് 1 ബാക്ക്സ്റ്റേജ്, ഭക്ഷണ ശാല).",
      "ഘട്ടം 3: ഷിഫ്റ്റുകൾ തിരിക്കുക (ഉദാ: രാവിലെ 8 മുതൽ 1 വരെ, ഉച്ചയ്ക്ക് 1 മുതൽ 6 വരെ).",
      "ഘട്ടം 4: വോളണ്ടിയർമാർക്കുള്ള QR ഐഡി കാർഡുകൾ പ്രിന്റ് ചെയ്തു നൽകുക.",
      "ഘട്ടം 5: ഡ്യൂട്ടിക്ക് കയറുമ്പോഴും ഇറങ്ങുമ്പോഴും പോയിന്റിലെ ഇൻചാർജ് QR സ്കാൻ ചെയ്തു ഹാജർ രേഖപ്പെടുത്തുക."
    ],
    "fields": [
      {
        "name": "Shift ID",
        "type": "String",
        "req": "Yes",
        "descEn": "Unique shift identifier.",
        "descMl": "ഷിഫ്റ്റ് കോഡ്."
      },
      {
        "name": "Checkpoint",
        "type": "String",
        "req": "Yes",
        "descEn": "Assigned duty location.",
        "descMl": "ഡ്യൂട്ടി പോയിന്റ്."
      }
    ],
    "workflowEn": "Register Volunteer → Assign Checkpoint → Allocate Shift → Print QR Badge → Scan at Duty Post.",
    "workflowMl": "രജിസ്റ്റർ ചെയ്യുക → പോയിന്റ് നൽകുക → ഷിഫ്റ്റ് നൽകുക → QR പ്രിന്റ് ചെയ്യുക → സ്കാൻ ചെയ്യുക.",
    "tipsEn": "Ensure checkpoint supervisors have stable internet on their mobiles for real-time attendance sync.",
    "tipsMl": "സ്കാൻ ചെയ്യുന്ന ഇൻചാർജുകളുടെ ഫോണിൽ നല്ല ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.",
    "warningEn": "Do not delete a volunteer profile if they have active shifts assigned.",
    "warningMl": "ഡ്യൂട്ടിയിലുള്ള ഒരു വോളണ്ടിയറെ ഡിലീറ്റ് ചെയ്യാൻ പാടില്ല.",
    "faqEn": [
      {
        "q": "How to handle missed check-outs?",
        "a": "Admins can manually override and punch out a volunteer from the dashboard."
      }
    ],
    "faqMl": [
      {
        "q": "ഡ്യൂട്ടി കഴിഞ്ഞ് പോകുമ്പോൾ സ്കാൻ ചെയ്യാൻ വിട്ടുപോയാലോ?",
        "a": "അഡ്മിന് ഡാഷ്‌ബോർഡ് വഴി സമയം നൽകി മാനുവൽ ആയി പഞ്ച് ഔട്ട് ചെയ്യാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "QR code invalid at checkpoint",
        "fix": "Ensure the volunteer is assigned to that specific checkpoint and time shift."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "QR സ്കാൻ ചെയ്യുമ്പോൾ Invalid എന്ന് കാണിക്കുന്നു",
        "fix": "അവർക്ക് അവിടെത്തന്നെയാണോ ഡ്യൂട്ടി എന്നും ഷിഫ്റ്റ് സമയം ആയെന്നും ഉറപ്പാക്കുക."
      }
    ]
  },
  "12": {
    "num": "12",
    "catEn": "Support & Operations",
    "catMl": "സപ്പോർട്ട് & ഓപ്പറേഷൻസ്",
    "titleEn": "Help Desk Support, Incident Ticketing & Escalation Guide",
    "titleMl": "ഹെൽപ്പ് ഡെസ്ക് & പരാതിപരിഹാര ഡെസ്ക് ഗൈഡ്",
    "overviewEn": "Log participant and public queries, track incident reports, assign support tickets to respective departments, and manage escalations.",
    "overviewMl": "മത്സരാർത്ഥികളുടെയോ പൊതുജനങ്ങളുടെയോ പരാതികൾ രേഖപ്പെടുത്തുക, ടിക്കറ്റുകൾ ഉണ്ടാക്കുക, അവ അതാത് ഡിപ്പാർട്ട്മെന്റിന് കൈമാറുകയും പരിഹരിക്കുകയും ചെയ്യുക.",
    "stepsEn": [
      "Step 1: Navigate to /helpdesk in the admin panel.",
      "Step 2: Create a New Ticket for any incoming issue (e.g., 'Lost ID Badge', 'Audio failure at Stage 2').",
      "Step 3: Assign priority levels (Low, Medium, High, Urgent).",
      "Step 4: Route the ticket to the relevant department (IT, Stage Management, Medical).",
      "Step 5: Mark the ticket as 'Resolved' once the issue is completely addressed."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /helpdesk പേജിലേക്ക് പോവുക.",
      "ഘട്ടം 2: ലഭിക്കുന്ന പരാതികൾ പുതിയ ടിക്കറ്റ് ആയി നൽകുക (ഉദാ: ഐഡി നഷ്ടപ്പെട്ടു, സ്റ്റേജ് 2-ൽ മൈക്ക് തകരാറാണ്).",
      "ഘട്ടം 3: പരാതിയുടെ ഗൗരവം (Low, Medium, High) സെറ്റ് ചെയ്യുക.",
      "ഘട്ടം 4: ഏതു ഡിപ്പാർട്ട്മെന്റ് ആണോ അത് പരിഹരിക്കേണ്ടത്, അവർക്ക് ടിക്കറ്റ് കൈമാറുക.",
      "ഘട്ടം 5: പ്രശ്നം പരിഹരിച്ച ശേഷം ടിക്കറ്റ് 'Resolved' ആയി മാർക്ക് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Ticket Priority",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Urgency level of the issue.",
        "descMl": "പരാതിയുടെ ഗൗരവം."
      },
      {
        "name": "Assigned Dept",
        "type": "String",
        "req": "Yes",
        "descEn": "Department responsible for fixing.",
        "descMl": "ചുമതലയുള്ള വിഭാഗം."
      }
    ],
    "workflowEn": "Log Ticket → Set Priority → Assign Department → Resolve Issue → Close Ticket.",
    "workflowMl": "ടിക്കറ്റ് ഉണ്ടാക്കുക → ഗൗരവം സെറ്റ് ചെയ്യുക → കൈമാറുക → പരിഹരിക്കുക → ടിക്കറ്റ് ക്ലോസ് ചെയ്യുക.",
    "tipsEn": "Set up SMS alerts for 'Urgent' priority tickets to instantly notify the core committee.",
    "tipsMl": "അടിയന്തിര പരാതികൾ (Urgent) വരുമ്പോൾ അഡ്മിൻ പാനലിലേക്ക് SMS അലർട്ട് നൽകാവുന്നതാണ്.",
    "warningEn": "Tickets cannot be hard-deleted once logged to maintain audit transparency.",
    "warningMl": "രേഖപ്പെടുത്തിയ പരാതികൾ പൂർണ്ണമായി ഡിലീറ്റ് ചെയ്യാൻ സാധിക്കില്ല; അത് ക്ലോസ് ചെയ്യാൻ മാത്രമേ സാധിക്കൂ.",
    "faqEn": [
      {
        "q": "Can public submit tickets directly?",
        "a": "Yes, via the 'Help' section on the public event portal."
      }
    ],
    "faqMl": [
      {
        "q": "പൊതുജനങ്ങൾക്ക് നേരിട്ട് പരാതി നൽകാൻ സാധിക്കുമോ?",
        "a": "അതെ, പബ്ലിക് പോർട്ടലിലെ 'Help' സെക്ഷൻ വഴി പരാതികൾ നൽകാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Unassigned tickets piling up",
        "fix": "Ensure default routing rules are correctly configured in Settings."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ടിക്കറ്റുകൾ ആർക്കും പോകാതെ കിടക്കുന്നു",
        "fix": "ഓട്ടോമാറ്റിക് ആയി ഡിപ്പാർട്ട്മെന്റിനെ നൽകാനുള്ള സെറ്റിംഗ്സ് ഓൺ ചെയ്യുക."
      }
    ]
  },
  "13": {
    "num": "13",
    "catEn": "Logistics",
    "catMl": "ലോജിസ്റ്റിക്സ്",
    "titleEn": "Stage Asset & Equipment Inventory Audit Manual",
    "titleMl": "സ്റ്റേജ് സാമഗ്രികളും ഇൻവെന്ററി സ്റ്റോക്ക് ആഡിറ്റും",
    "overviewEn": "Track rented and owned stage assets (mics, lights, chairs), manage issuance to specific stages, and audit returns.",
    "overviewMl": "വാടകയ്‌ക്കെടുത്തതോ സ്വന്തമായുള്ളതോ ആയ സ്റ്റേജ് സാമഗ്രികൾ (മൈക്ക്, ലൈറ്റ്, കസേരകൾ) എണ്ണിത്തിട്ടപ്പെടുത്തുക, സ്റ്റേജുകൾക്ക് നൽകുക, തിരികെ ലഭിച്ചോ എന്ന് ഉറപ്പാക്കുക.",
    "stepsEn": [
      "Step 1: Go to /inventory and add items to the central catalog.",
      "Step 2: Assign quantities to specific stages (e.g., 4 Wireless Mics to Stage 1).",
      "Step 3: Generate Gate Pass PDFs when items are physically moved.",
      "Step 4: At the end of the event, perform a return audit using the 'Audit Mode'.",
      "Step 5: Mark missing or damaged items for billing recovery."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /inventory പേജിൽ പോയി സാധനങ്ങളുടെ ലിസ്റ്റ് നൽകുക.",
      "ഘട്ടം 2: ഓരോ സ്റ്റേജിനും ആവശ്യമുള്ള സാധനങ്ങൾ നൽകുക (ഉദാ: സ്റ്റേജ് 1-ന് 4 മൈക്ക്).",
      "ഘട്ടം 3: സാധനങ്ങൾ കൊണ്ടുപോകുമ്പോൾ ഗേറ്റ് പാസ് PDF പ്രിന്റ് ചെയ്യുക.",
      "ഘട്ടം 4: പരിപാടി കഴിഞ്ഞാൽ തിരികെ ലഭിച്ച സാധനങ്ങളുടെ കണക്കെടുപ്പ് (Audit Mode) നടത്തുക.",
      "ഘട്ടം 5: നഷ്ടപ്പെട്ടതോ കേടായതോ ആയ സാധനങ്ങൾ പ്രത്യേകം രേഖപ്പെടുത്തുക."
    ],
    "fields": [
      {
        "name": "Asset Code",
        "type": "String",
        "req": "Yes",
        "descEn": "Unique item barcode or ID.",
        "descMl": "സാധനത്തിന്റെ കോഡ്."
      },
      {
        "name": "Condition",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Good, Damaged, or Missing.",
        "descMl": "സാധനത്തിന്റെ അവസ്ഥ."
      }
    ],
    "workflowEn": "Add Catalog → Issue to Stage → Gate Pass → Event → Return Audit → Log Damages.",
    "workflowMl": "ലിസ്റ്റ് ചെയ്യുക → സ്റ്റേജിന് നൽകുക → ഗേറ്റ് പാസ് → പരിപാടി → കണക്കെടുപ്പ് → നഷ്ടങ്ങൾ രേഖപ്പെടുത്തുക.",
    "tipsEn": "Use barcode labels on expensive equipment like cameras and mixers for quick scanning during return audit.",
    "tipsMl": "വിലപിടിപ്പുള്ള ക്യാമറ, മൈക്ക് എന്നിവയിൽ ബാർകോഡ് ഒട്ടിച്ചാൽ സ്കാൻ ചെയ്തു എളുപ്പത്തിൽ കണക്കെടുക്കാം.",
    "warningEn": "Issuing more stock than currently available in the central pool will throw an error.",
    "warningMl": "സ്റ്റോക്കിൽ ഉള്ളതിനേക്കാൾ കൂടുതൽ സാധനങ്ങൾ സ്റ്റേജിന് നൽകാൻ സിസ്റ്റം അനുവദിക്കില്ല.",
    "faqEn": [
      {
        "q": "Can vendors access this module?",
        "a": "Yes, you can create limited 'Vendor' roles to view only their rented items."
      }
    ],
    "faqMl": [
      {
        "q": "വാടകയ്ക്ക് സാധനങ്ങൾ നൽകിയവർക്ക് ഈ കണക്കുകൾ കാണാമോ?",
        "a": "അതെ, അവർക്ക് 'Vendor' എന്ന റോൾ നൽകി അവരുടെ സാധനങ്ങളുടെ കണക്ക് മാത്രം കാണിച്ചുകൊടുക്കാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Inventory count mismatch",
        "fix": "Check the 'Transfer Logs' to see if items were moved directly between stages."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സാധനങ്ങളുടെ എണ്ണം വ്യത്യാസമുണ്ട്",
        "fix": "'Transfer Logs' എടുത്തു നോക്കുക, ഒരു സ്റ്റേജിൽ നിന്നും മറ്റൊരു സ്റ്റേജിലേക്ക് നേരിട്ട് കൊണ്ടുപോയിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക."
      }
    ]
  },
  "14": {
    "num": "14",
    "catEn": "Logistics",
    "catMl": "ലോജിസ്റ്റിക്സ്",
    "titleEn": "Accommodation & Hostel Room Occupancy Manager",
    "titleMl": "താമസവും ഹോസ്റ്റൽ മുറി വിതരണ മാർഗ്ഗരേഖയും",
    "overviewEn": "Allocate rooms/dormitories to participating teams, track occupancy levels, and manage check-in/check-out processes.",
    "overviewMl": "ദൂരസ്ഥലങ്ങളിൽ നിന്നും വരുന്ന മത്സരാർത്ഥികൾക്കും ടീമുകൾക്കും മുറികളോ ഹാളുകളോ നൽകുക, അവരെ ചെക്കിൻ ചെയ്യുക.",
    "stepsEn": [
      "Step 1: Go to /accommodation and set up Buildings and Rooms (e.g., Block A, Room 101, Capacity 4).",
      "Step 2: Assign contingents (Groups/Schools) to specific rooms.",
      "Step 3: Print Room Allotment Slips with QR codes.",
      "Step 4: Hostel wardens scan the slip at the door to check-in the students.",
      "Step 5: Process check-out and generate clearance certificates."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /accommodation പേജിൽ കെട്ടിടങ്ങളും മുറികളും സജ്ജമാക്കുക (ഉദാ: ബ്ലോക്ക് A, റൂം 101, കപ്പാസിറ്റി 4).",
      "ഘട്ടം 2: ഓരോ സ്കൂളിനും അല്ലെങ്കിൽ ഗ്രൂപ്പിനും മുറികൾ അനുവദിക്കുക.",
      "ഘട്ടം 3: റൂം അലോട്ട്മെന്റ് സ്ലിപ്പുകൾ (QR കോഡോട് കൂടി) പ്രിന്റ് ചെയ്ത് നൽകുക.",
      "ഘട്ടം 4: ഹോസ്റ്റൽ വാർഡന്മാർ സ്ലിപ്പ് സ്കാൻ ചെയ്ത് കുട്ടികളെ ചെക്കിൻ ചെയ്യിക്കുക.",
      "ഘട്ടം 5: പരിപാടി കഴിഞ്ഞ് പോകുമ്പോൾ ചെക്ക്-ഔട്ട് ചെയ്തു ക്ലിയറൻസ് നൽകുക."
    ],
    "fields": [
      {
        "name": "Room Capacity",
        "type": "Number",
        "req": "Yes",
        "descEn": "Max occupants allowed.",
        "descMl": "മുറിയിൽ ഉൾക്കൊള്ളാവുന്ന ആളുകൾ."
      },
      {
        "name": "Contingent",
        "type": "String",
        "req": "Yes",
        "descEn": "Assigned team/school.",
        "descMl": "അനുവദിച്ച സ്കൂൾ അല്ലെങ്കിൽ ഗ്രൂപ്പ്."
      }
    ],
    "workflowEn": "Setup Rooms → Allot Contingents → Print Slips → QR Check-In → QR Check-Out.",
    "workflowMl": "മുറികൾ സെറ്റ് ചെയ്യുക → അനുവദിക്കുക → സ്ലിപ്പ് നൽകുക → QR ചെക്കിൻ → QR ചെക്ക്-ഔട്ട്.",
    "tipsEn": "Allocate male and female dormitories in separate buildings for better compliance and access control.",
    "tipsMl": "ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കും വെവ്വേറെ ബ്ലോക്കുകളിൽ മുറികൾ നൽകാൻ സിസ്റ്റത്തിലെ ഫിൽറ്റർ ഉപയോഗിക്കുക.",
    "warningEn": "Exceeding the Room Capacity will trigger a mandatory override requirement by the admin.",
    "warningMl": "മുറിയുടെ കപ്പാസിറ്റിക്ക് മുകളിൽ ആളുകളെ നൽകാൻ ശ്രമിച്ചാൽ അഡ്മിന്റെ പ്രത്യേക അനുമതി വേണ്ടിവരും.",
    "faqEn": [
      {
        "q": "Can we collect caution deposits?",
        "a": "Yes, enable 'Caution Deposit' in settings to add it to the allotment slip."
      }
    ],
    "faqMl": [
      {
        "q": "മുറി നൽകുമ്പോൾ ഡിപ്പോസിറ്റ് തുക വാങ്ങാൻ സാധിക്കുമോ?",
        "a": "അതെ, സെറ്റിംഗ്സിൽ 'Caution Deposit' ഓൺ ചെയ്താൽ പണം വാങ്ങി രസീത് നൽകാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Overbooking error",
        "fix": "Increase room capacity manually or assign the overflow to a dormitory."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "Overbooking എന്ന എറർ",
        "fix": "മുറിയുടെ കപ്പാസിറ്റി കൂട്ടുക അല്ലെങ്കിൽ ബാക്കിയുള്ള കുട്ടികളെ വലിയ ഹാളിലേക്ക് മാറ്റുക."
      }
    ]
  },
  "15": {
    "num": "15",
    "catEn": "Logistics",
    "catMl": "ലോജിസ്റ്റിക്സ്",
    "titleEn": "Dining Hall Food QR Coupon & Meal Verification System",
    "titleMl": "ഭക്ഷണ കൂപ്പൺ ക്യുആർ പരിശോധനാ സിസ്റ്റം",
    "overviewEn": "Digitize food coupons using the candidate QR badge to prevent double-dipping and track real-time dining hall footfalls.",
    "overviewMl": "മത്സരാർത്ഥികളുടെ ഐഡി കാർഡിലെ ക്യുആർ കോഡ് തന്നെ ഭക്ഷണ കൂപ്പണായി ഉപയോഗിക്കുക. ഒരാൾ രണ്ടു തവണ ഭക്ഷണം വാങ്ങുന്നത് തടയാനും എണ്ണം കൃത്യമായി അറിയാനും സാധിക്കും.",
    "stepsEn": [
      "Step 1: Define Meal Sessions under /food (e.g., Breakfast 7AM-9AM, Lunch 12PM-2PM).",
      "Step 2: Assign food privileges to groups or VIPs.",
      "Step 3: Food Counter Volunteers open the 'Meal Scanner' mode on their mobile devices.",
      "Step 4: Scan Candidate QR badges as they enter the dining hall.",
      "Step 5: The screen flashes Green (Approved) or Red (Already Served/Invalid)."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /food പേജിൽ ഭക്ഷണ സമയങ്ങൾ സെറ്റ് ചെയ്യുക (ഉദാ: പ്രഭാതഭക്ഷണം 7AM-9AM).",
      "ഘട്ടം 2: ആർക്കൊക്കെയാണ് ഭക്ഷണം നൽകേണ്ടതെന്ന് സിസ്റ്റത്തിൽ സെറ്റ് ചെയ്യുക.",
      "ഘട്ടം 3: കൗണ്ടറിലുള്ള വോളണ്ടിയർമാർ മൊബൈലിൽ 'Meal Scanner' മോഡ് തുറന്നുവെക്കുക.",
      "ഘട്ടം 4: ഭക്ഷണം കഴിക്കാൻ വരുന്ന കുട്ടികളുടെ ഐഡി കാർഡിലെ QR സ്കാൻ ചെയ്യുക.",
      "ഘട്ടം 5: സ്ക്രീനിൽ പച്ച നിറം വന്നാൽ ഭക്ഷണം നൽകാം. ചുവപ്പാണ് വരുന്നതെങ്കിൽ അവർ ഇതിനകം ഭക്ഷണം കഴിച്ചവരോ അർഹതയില്ലാത്തവരോ ആണ്."
    ],
    "fields": [
      {
        "name": "Meal Session",
        "type": "String",
        "req": "Yes",
        "descEn": "e.g., Day 1 Lunch.",
        "descMl": "ഭക്ഷണ സമയം (ഉദാ: Day 1 Lunch)."
      },
      {
        "name": "Status Code",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Consumed or Not Consumed.",
        "descMl": "ഭക്ഷണം കഴിച്ചോ ഇല്ലയോ."
      }
    ],
    "workflowEn": "Define Meals → Setup Scanners → Scan QR at Door → Serve Meal → View Live Footfall.",
    "workflowMl": "ഭക്ഷണ സമയം സെറ്റ് ചെയ്യുക → സ്കാനർ ഒരുക്കുക → QR സ്കാൻ ചെയ്യുക → ഭക്ഷണം നൽകുക → തത്സമയ കണക്ക്.",
    "tipsEn": "Keep the scanner app on 'Continuous Scan' mode to process 40-50 candidates per minute quickly.",
    "tipsMl": "സ്കാനർ 'Continuous Scan' മോഡിൽ ഇട്ടാൽ തുടർച്ചയായി വേഗത്തിൽ സ്കാൻ ചെയ്തു പോകാം.",
    "warningEn": "Internet connectivity is strictly required at the food counter to prevent double-serving across multiple lines.",
    "warningMl": "ഒന്നിൽ കൂടുതൽ കൗണ്ടറുകൾ ഉണ്ടെങ്കിൽ, അവിടങ്ങളിൽ മികച്ച ഇന്റർനെറ്റ് ഉണ്ടെന്ന് ഉറപ്പാക്കണം.",
    "faqEn": [
      {
        "q": "Can parents or guests buy food coupons?",
        "a": "Yes, generate 'Guest QR Passes' from the dashboard upon payment."
      }
    ],
    "faqMl": [
      {
        "q": "രക്ഷിതാക്കൾക്ക് പണം കൊടുത്തു കൂപ്പൺ വാങ്ങാമോ?",
        "a": "അതെ, ഫ്രണ്ട് ഡെസ്കിൽ പണമടച്ചാൽ അവർക്ക് 'Guest QR Pass' പ്രിന്റ് ചെയ്തു നൽകാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Scanner says 'Invalid Session'",
        "fix": "Ensure the current time matches the allowed Meal Session window in settings."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "'Invalid Session' എന്ന് കാണിക്കുന്നു",
        "fix": "സിസ്റ്റത്തിലെ ഭക്ഷണ സമയവും ഇപ്പോഴത്തെ സമയവും ഒന്നാണോ എന്ന് പരിശോധിക്കുക."
      }
    ]
  },
  "16": {
    "num": "16",
    "catEn": "Emergency",
    "catMl": "അടിയന്തിര വിഭാഗം",
    "titleEn": "Medical First Aid Protocol & Stage Emergency Holds",
    "titleMl": "മെഡിക്കൽ ടീമും അടിയന്തിര പ്രഥമശുശ്രൂഷാ ലോഗും",
    "overviewEn": "Log medical incidents, trigger stage holds if a candidate needs emergency attention, and track first aid inventory.",
    "overviewMl": "സ്റ്റേജിൽ എന്തെങ്കിലും ആരോഗ്യപ്രശ്നങ്ങൾ ഉണ്ടായാൽ മെഡിക്കൽ ടീമിനെ അറിയിക്കുക, സ്റ്റേജ് താൽക്കാലികമായി നിർത്തിവെക്കുക, പ്രഥമശുശ്രൂഷാ വിവരങ്ങൾ രേഖപ്പെടുത്തുക.",
    "stepsEn": [
      "Step 1: Go to /medical to view the central emergency dashboard.",
      "Step 2: If a candidate faints or gets injured, Stage Manager clicks 'Medical Emergency SOS'.",
      "Step 3: Medical team gets instant SMS/Push notification with Stage Name.",
      "Step 4: The stage timeline is automatically marked as 'On Hold'.",
      "Step 5: Medical officer logs the treatment given and clears the hold to resume the event."
    ],
    "stepsMl": [
      "ഘട്ടം 1: എമർജൻസി ഡാഷ്‌ബോർഡ് കാണാൻ /medical ഓപ്പൺ ചെയ്യുക.",
      "ഘട്ടം 2: സ്റ്റേജിൽ ആർക്കെങ്കിലും വയ്യാതെയായാൽ സ്റ്റേജ് മാനേജർ 'SOS' ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 3: മെഡിക്കൽ ടീമിന് ഫോണിൽ അലർട്ട് ലഭിക്കുകയും അവർ ഉടൻ സ്റ്റേജിലെത്തുകയും ചെയ്യും.",
      "ഘട്ടം 4: ആ സമയം സ്റ്റേജിലെ മത്സരങ്ങൾ താൽക്കാലികമായി 'On Hold' എന്ന് കാണിക്കും.",
      "ഘട്ടം 5: ചികിത്സ നൽകിയ ശേഷം മെഡിക്കൽ ഓഫീസർ ക്ലിയറൻസ് നൽകിയാൽ പരിപാടി വീണ്ടും തുടങ്ങാം."
    ],
    "fields": [
      {
        "name": "Incident Type",
        "type": "String",
        "req": "Yes",
        "descEn": "Nature of medical issue (e.g., Fainting).",
        "descMl": "അസുഖത്തിന്റെ വിവരം."
      },
      {
        "name": "Clearance Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Can the candidate continue?",
        "descMl": "മത്സരത്തിൽ തുടരാൻ സാധിക്കുമോ."
      }
    ],
    "workflowEn": "Trigger SOS → Stage Held → Medical Team Arrives → Treatment Logged → Clear SOS → Resume Stage.",
    "workflowMl": "SOS നൽകുക → സ്റ്റേജ് നിർത്തിവെക്കുക → ചികിത്സ നൽകുക → റിപ്പോർട്ട് നൽകുക → SOS പിൻവലിക്കുക → പരിപാടി തുടരുക.",
    "tipsEn": "Ensure the Medical Desk tablet is always plugged into a charger and sound is turned on for alarms.",
    "tipsMl": "മെഡിക്കൽ ടീമിന്റെ ടാബ്‌ലെറ്റ് എപ്പോഴും ചാർജ്ജ് ഉള്ളതും ശബ്ദം ഓൺ ആക്കി വെച്ചതുമാണെന്ന് ഉറപ്പാക്കുക.",
    "warningEn": "Misusing the SOS button will disrupt live schedules across the platform. Use only in real emergencies.",
    "warningMl": "SOS ബട്ടൺ വെറുതെ ഉപയോഗിക്കരുത്; ഇത് സ്റ്റേജ് ടൈംലൈനുകളെ നിർത്തിവെപ്പിക്കും.",
    "faqEn": [
      {
        "q": "Can we shift a medically cleared candidate's time slot?",
        "a": "Yes, Chief Tabulators can reschedule them to the end of the timeline."
      }
    ],
    "faqMl": [
      {
        "q": "സുഖമില്ലാതായ കുട്ടിക്ക് കുറച്ചു കഴിഞ്ഞു മത്സരിക്കാമോ?",
        "a": "മെഡിക്കൽ ക്ലിയറൻസ് ലഭിച്ചാൽ അവരെ ആ മത്സരത്തിന്റെ അവസാന സമയത്തേക്ക് മാറ്റാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "SOS Alarm not ringing on tablet",
        "fix": "Check browser tab volume and ensure the site has permission to play audio."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "SOS അലാം ശബ്ദം കേൾക്കുന്നില്ല",
        "fix": "ടാബ്‌ലെറ്റിലെ വോളിയം കൂട്ടിവെക്കുകയും ബ്രൗസറിൽ സൗണ്ട് പെർമിഷൻ ഉണ്ടോയെന്നും നോക്കുക."
      }
    ]
  },
  "17": {
    "num": "17",
    "catEn": "Communications",
    "catMl": "അറിയിപ്പുകൾ",
    "titleEn": "Multi-Channel Notifications Gateway & SMS/Push Alerts",
    "titleMl": "അറിയിപ്പുകൾ, SMS & മെസ്സേജ് ഗേറ്റ്‌വേ",
    "overviewEn": "Send bulk SMS, WhatsApp, and email alerts to candidates, parents, and judges regarding schedule changes and results.",
    "overviewMl": "മത്സരാർത്ഥികൾക്കും രക്ഷിതാക്കൾക്കും വിധികർത്താക്കൾക്കും ഷെഡ്യൂൾ മാറ്റങ്ങളും ഫലപ്രഖ്യാപനങ്ങളും SMS, WhatsApp, ഇമെയിൽ വഴി അയക്കാൻ.",
    "stepsEn": [
      "Step 1: Go to /notifications and select the communication channel (SMS, WhatsApp, Email).",
      "Step 2: Select the Target Audience (e.g., All Junior Category Participants, All Judges).",
      "Step 3: Draft your message using placeholders like 'Dear {{name}}, your stage time is {{time}}'.",
      "Step 4: Send a test message to the admin phone number.",
      "Step 5: Click 'Broadcast' to send to the target list."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /notifications പേജിൽ പോയി SMS, WhatsApp അല്ലെങ്കിൽ Email തിരഞ്ഞെടുക്കുക.",
      "ഘട്ടം 2: ആർക്കാണ് മെസ്സേജ് അയക്കേണ്ടത് എന്ന് തിരഞ്ഞെടുക്കുക (ഉദാ: ജൂനിയർ കാറ്റഗറിയിലുള്ളവർ).",
      "ഘട്ടം 3: 'പ്രിയ {{name}}, നിങ്ങളുടെ മത്സരം {{time}} സമയത്താണ്' എന്നിങ്ങനെ മെസ്സേജ് ടൈപ്പ് ചെയ്യുക.",
      "ഘട്ടം 4: അഡ്മിന്റെ ഫോണിലേക്ക് ഒരു ടെസ്റ്റ് മെസ്സേജ് അയച്ചു ശരിയാണോ എന്ന് നോക്കുക.",
      "ഘട്ടം 5: 'Broadcast' ക്ലിക്ക് ചെയ്ത് എല്ലാവർക്കും മെസ്സേജ് അയക്കുക."
    ],
    "fields": [
      {
        "name": "Message Template",
        "type": "Text",
        "req": "Yes",
        "descEn": "The body of the message.",
        "descMl": "മെസ്സേജിന്റെ ഉള്ളടക്കം."
      },
      {
        "name": "Target Group",
        "type": "Filter",
        "req": "Yes",
        "descEn": "Filtered audience list.",
        "descMl": "ലഭിക്കേണ്ട ആളുകൾ."
      }
    ],
    "workflowEn": "Select Channel → Filter Audience → Draft Template → Test → Broadcast.",
    "workflowMl": "ചാനൽ എടുക്കുക → ആളുകളെ തിരഞ്ഞെടുക്കുക → മെസ്സേജ് ടൈപ്പ് ചെയ്യുക → ടെസ്റ്റ് ചെയ്യുക → അയക്കുക.",
    "tipsEn": "Ensure DLT templates (for India) are approved before sending bulk SMS to avoid delivery failures.",
    "tipsMl": "ഇന്ത്യയിൽ SMS അയക്കുമ്പോൾ DLT അപ്രൂവൽ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.",
    "warningEn": "Sending too many bulk messages in a short time via WhatsApp may temporarily block the API number.",
    "warningMl": "WhatsApp വഴി ഒരുപാട് മെസ്സേജുകൾ ഒന്നിച്ച് അയക്കുമ്പോൾ നമ്പർ ബ്ലോക്ക് ആകാൻ സാധ്യതയുണ്ട്.",
    "faqEn": [
      {
        "q": "Are results sent automatically?",
        "a": "Yes, if 'Auto-Notify Winners' is enabled in Event Settings."
      }
    ],
    "faqMl": [
      {
        "q": "റിസൾട്ട് വന്നാൽ ഓട്ടോമാറ്റിക് ആയി മെസ്സേജ് പോകുമോ?",
        "a": "അതെ, സെറ്റിംഗ്സിൽ 'Auto-Notify Winners' ഓൺ ആക്കി വെച്ചാൽ മതി."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Messages queued but not delivered",
        "fix": "Check API credit balance with your SMS gateway provider."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "മെസ്സേജുകൾ ഡെലിവർ ആകുന്നില്ല",
        "fix": "SMS ഗേറ്റ്‌വേയിൽ പൈസ (ക്രെഡിറ്റ്) ഉണ്ടോ എന്ന് പരിശോധിക്കുക."
      }
    ]
  },
  "18": {
    "num": "18",
    "catEn": "Public Display",
    "catMl": "പബ്ലിക് ഡിസ്പ്ലേ",
    "titleEn": "Public Event Website & Live Stage LED Wall Ticker Engine",
    "titleMl": "പൊതുജന ലൈവ് വെബ്‌സൈറ്റും എൽഇഡി സ്ക്രീനും",
    "overviewEn": "Configure the public-facing website for participants and power large LED screens on stages with live score tickers.",
    "overviewMl": "കാണികൾക്കുള്ള ലൈവ് വെബ്‌സൈറ്റ് ഒരുക്കാനും, സ്റ്റേജിലെ വലിയ LED സ്ക്രീനുകളിൽ ഫലങ്ങളും ഷെഡ്യൂളും പ്രദർശിപ്പിക്കാനും.",
    "stepsEn": [
      "Step 1: Go to /live-display to configure the public portal theme.",
      "Step 2: Choose the LED Wall mode (Leaderboard, Upcoming Schedules, or Sponsor Banners).",
      "Step 3: Connect the control laptop to the LED processor via HDMI.",
      "Step 4: Launch the '/tv' link in full-screen mode (F11) on the browser.",
      "Step 5: The display will auto-refresh smoothly using WebSockets without page reloads."
    ],
    "stepsMl": [
      "ഘട്ടം 1: പബ്ലിക് വെബ്‌സൈറ്റ് തീം മാറ്റാൻ /live-display പേജിൽ പോവുക.",
      "ഘട്ടം 2: LED സ്ക്രീനിൽ എന്താണ് കാണിക്കേണ്ടത് എന്ന് തിരഞ്ഞെടുക്കുക (റിസൾട്ട്, വരാനിരിക്കുന്നവ, പരസ്യം).",
      "ഘട്ടം 3: കൺട്രോൾ ലാപ്‌ടോപ്പ് LED പ്രോസസ്സറുമായി HDMI വഴി ബന്ധിപ്പിക്കുക.",
      "ഘട്ടം 4: ബ്രൗസറിൽ '/tv' എന്ന ലിങ്ക് തുറന്ന് ഫുൾ സ്ക്രീൻ (F11) ആക്കുക.",
      "ഘട്ടം 5: റിഫ്രഷ് ചെയ്യാതെ തന്നെ സ്ക്രീനിൽ വിവരങ്ങൾ തത്സമയം മാറിക്കൊണ്ടിരിക്കും."
    ],
    "fields": [
      {
        "name": "Display Mode",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Content to display on TV.",
        "descMl": "ടിവിയിൽ കാണിക്കേണ്ടവ."
      },
      {
        "name": "Ticker Speed",
        "type": "Number",
        "req": "Yes",
        "descEn": "Scroll speed of text.",
        "descMl": "സ്ക്രോളിംഗ് വേഗത."
      }
    ],
    "workflowEn": "Configure Theme → Select LED Mode → Connect HDMI → Open TV Link → Fullscreen.",
    "workflowMl": "തീം മാറ്റുക → മോഡ് സെലക്ട് ചെയ്യുക → HDMI കണക്ട് ചെയ്യുക → ലിങ്ക് തുറക്കുക → ഫുൾ സ്ക്രീൻ ആക്കുക.",
    "tipsEn": "Use Dark Theme for LED walls to reduce glare and power consumption.",
    "tipsMl": "LED സ്ക്രീനുകൾക്ക് എപ്പോഴും ഡാർക്ക് തീം (Dark Theme) നൽകുക; ഇത് കാണികൾക്ക് വ്യക്തത കൂട്ടും.",
    "warningEn": "Do not let the control laptop go to sleep or activate screen savers.",
    "warningMl": "ടിവി കണക്ട് ചെയ്ത ലാപ്‌ടോപ്പിന്റെ സ്ക്രീൻ ഓഫ് ആകാതെ സൂക്ഷിക്കുക.",
    "faqEn": [
      {
        "q": "Can we run different content on different LED walls?",
        "a": "Yes, just open /tv?stage=1 on one laptop and /tv?stage=2 on another."
      }
    ],
    "faqMl": [
      {
        "q": "വ്യത്യസ്ത സ്റ്റേജുകളിൽ വ്യത്യസ്ത കാര്യങ്ങൾ കാണിക്കാമോ?",
        "a": "അതെ, /tv?stage=1, /tv?stage=2 എന്നിങ്ങനെ ലിങ്കുകൾ മാറ്റി നൽകിയാൽ മതി."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Display is not auto-updating",
        "fix": "Check the internet connection on the control laptop. WebSockets require constant connection."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സ്ക്രീനിലെ വിവരങ്ങൾ മാറുന്നില്ല",
        "fix": "ലാപ്‌ടോപ്പിലെ ഇന്റർനെറ്റ് കണക്ഷൻ കട്ടായിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക."
      }
    ]
  },
  "19": {
    "num": "19",
    "catEn": "Mobile Operations",
    "catMl": "മൊബൈൽ ഓപ്പറേഷൻസ്",
    "titleEn": "Mobile App (PWA) Operational Manual for Field Staff",
    "titleMl": "സ്റ്റാഫുകൾക്കുള്ള മൊബൈൽ ആപ്പ് ഗൈഡ്",
    "overviewEn": "Install the FestPro Progressive Web App (PWA) on field staff smartphones for QR scanning, updates, and quick access.",
    "overviewMl": "വോളണ്ടിയർമാരും സ്റ്റാഫുകളും ഫോണിൽ മൊബൈൽ ആപ്പ് (PWA) ഇൻസ്റ്റാൾ ചെയ്യാനും സ്കാനിംഗ് ഉപയോഗിക്കാനുമുള്ള ഗൈഡ്.",
    "stepsEn": [
      "Step 1: Open the FestPro admin link in Safari (iOS) or Chrome (Android).",
      "Step 2: Tap 'Share' and select 'Add to Home Screen' (iOS), or click the 'Install App' prompt (Android).",
      "Step 3: Launch the app from the home screen icon for a full-screen app experience.",
      "Step 4: Log in using assigned Staff Credentials.",
      "Step 5: Use the built-in mobile camera to scan QR badges directly from the app."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഫോണിലെ ബ്രൗസറിൽ (Chrome/Safari) വെബ്‌സൈറ്റ് ലിങ്ക് തുറക്കുക.",
      "ഘട്ടം 2: ഐഫോണിൽ 'Add to Home Screen' കൊടുക്കുക, ആൻഡ്രോയിഡിൽ 'Install App' ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 3: ഹോം സ്ക്രീനിൽ വന്ന ഐക്കൺ ക്ലിക്ക് ചെയ്ത് ആപ്പ് തുറക്കുക.",
      "ഘട്ടം 4: സ്റ്റാഫ് ലോഗിൻ വിവരങ്ങൾ നൽകി ലോഗിൻ ചെയ്യുക.",
      "ഘട്ടം 5: ആപ്പിലെ ക്യാമറ ഉപയോഗിച്ച് ഐഡി കാർഡുകൾ സ്കാൻ ചെയ്യാം."
    ],
    "fields": [
      {
        "name": "Camera Permission",
        "type": "System",
        "req": "Yes",
        "descEn": "Allow browser to use camera.",
        "descMl": "ക്യാമറ ഉപയോഗിക്കാനുള്ള അനുമതി."
      },
      {
        "name": "Offline Mode",
        "type": "Boolean",
        "req": "No",
        "descEn": "Cache data for offline use.",
        "descMl": "നെറ്റ് ഇല്ലാതെ ഉപയോഗിക്കാൻ."
      }
    ],
    "workflowEn": "Open Link → Add to Home Screen → Log In → Allow Camera → Scan.",
    "workflowMl": "ലിങ്ക് തുറക്കുക → ഹോം സ്ക്രീനിൽ ആക്കുക → ലോഗിൻ ചെയ്യുക → പെർമിഷൻ നൽകുക → സ്കാൻ ചെയ്യുക.",
    "tipsEn": "For Android, ensure Google Play Services for AR/Barcode scanning is updated for faster scanning.",
    "tipsMl": "പെട്ടെന്ന് സ്കാൻ ചെയ്യാൻ ഫോണിലെ ക്യാമറ ലെൻസ് തുടച്ചു വൃത്തിയാക്കി വെക്കുക.",
    "warningEn": "Clearing browser cache will log you out of the PWA and clear offline data.",
    "warningMl": "ബ്രൗസറിലെ കാഷെ (Cache) ക്ലിയർ ചെയ്താൽ ആപ്പിൽ നിന്നും ലോഗൗട്ട് ആകുന്നതാണ്.",
    "faqEn": [
      {
        "q": "Is it available on the App Store/Play Store?",
        "a": "No, it's a PWA. It installs instantly directly from the browser without needing the app store."
      }
    ],
    "faqMl": [
      {
        "q": "Play Store-ൽ ആപ്പ് ലഭ്യമാണോ?",
        "a": "ഇല്ല, ഇത് വെബ്‌സൈറ്റിൽ നിന്നും നേരിട്ട് ഫോണിലേക്ക് ഇൻസ്റ്റാൾ ചെയ്യാൻ സാധിക്കുന്ന PWA ആപ്പ് ആണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Camera not opening in app",
        "fix": "Go to Phone Settings -> Apps -> Chrome/Safari -> Permissions, and allow Camera."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ആപ്പിൽ ക്യാമറ തുറക്കുന്നില്ല",
        "fix": "ഫോൺ സെറ്റിംഗ്സിൽ പോയി ബ്രൗസറിന് ക്യാമറ പെർമിഷൻ നൽകിയിട്ടുണ്ടോ എന്ന് പരിശോധിക്കുക."
      }
    ]
  },
  "20": {
    "num": "20",
    "catEn": "Billing & SaaS",
    "catMl": "സബ്‌സ്‌ക്രിപ്‌ഷൻ",
    "titleEn": "SaaS Tenant Subscriptions, Quotas & White-Label Domain Manager",
    "titleMl": "SaaS പ്ലാനുകളും സബ്‌സ്‌ക്രിപ്‌ഷൻ ക്വാട്ടകളും",
    "overviewEn": "Manage your organization's FestPro billing plan, monitor participant limits, and configure custom white-label domains.",
    "overviewMl": "നിങ്ങളുടെ ഫെസ്റ്റ്പ്രോ പ്ലാൻ നിയന്ത്രിക്കുക, ഉപയോഗിക്കാവുന്ന ആളുകളുടെ എണ്ണം പരിശോധിക്കുക, കസ്റ്റം വെബ്‌സൈറ്റ് ഡൊമെയ്ൻ സജ്ജീകരിക്കുക.",
    "stepsEn": [
      "Step 1: Go to /billing to view your current SaaS tier (Basic, Pro, Enterprise).",
      "Step 2: Monitor 'Participant Quota' to ensure you don't exceed your plan limits.",
      "Step 3: Click 'Upgrade Plan' to increase limits and unlock premium modules.",
      "Step 4: Navigate to Domain Settings to map your custom domain (e.g., fest.myschool.com).",
      "Step 5: Verify DNS propagation and SSL certificate issuance."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /billing പേജിൽ പോയി നിങ്ങളുടെ ഇപ്പോഴത്തെ പ്ലാൻ പരിശോധിക്കുക.",
      "ഘട്ടം 2: നിങ്ങളുടെ പ്ലാനിൽ എത്ര കുട്ടികളെ ഉൾപ്പെടുത്താം എന്ന് (Quota) നോക്കുക.",
      "ഘട്ടം 3: കൂടുതൽ കുട്ടികളെ ചേർക്കണമെങ്കിൽ 'Upgrade Plan' ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 4: ഡൊമെയ്ൻ സെറ്റിംഗ്സിൽ പോയി നിങ്ങളുടെ സ്വന്തം വെബ്സൈറ്റ് പേര് നൽകുക.",
      "ഘട്ടം 5: DNS അപ്‌ഡേറ്റ് ആയെന്നും SSL ആക്റ്റീവ് ആയെന്നും ഉറപ്പാക്കുക."
    ],
    "fields": [
      {
        "name": "Current Plan",
        "type": "String",
        "req": "Yes",
        "descEn": "Active subscription tier.",
        "descMl": "ആക്റ്റീവ് ആയ പ്ലാൻ."
      },
      {
        "name": "Usage Limits",
        "type": "Metrics",
        "req": "Yes",
        "descEn": "Participant and storage caps.",
        "descMl": "ഉപയോഗിക്കാവുന്ന ലിമിറ്റ്."
      }
    ],
    "workflowEn": "Check Limits → Upgrade if needed → Process Payment → Add Custom Domain → Verify SSL.",
    "workflowMl": "ലിമിറ്റ് നോക്കുക → അപ്‌ഗ്രേഡ് ചെയ്യുക → പണമടക്കുക → ഡൊമെയ്ൻ നൽകുക → SSL വെരിഫൈ ചെയ്യുക.",
    "tipsEn": "Enterprise users get automated daily database backups and a dedicated account manager.",
    "tipsMl": "എന്റർപ്രൈസ് പ്ലാനിൽ ഉള്ളവർക്ക് സിസ്റ്റം ഡാറ്റ ദിവസവും തനിയെ ബാക്കപ്പ് ചെയ്യപ്പെടുന്നതാണ്.",
    "warningEn": "Exceeding candidate quota will disable the 'Add Participant' button until upgraded.",
    "warningMl": "പ്ലാനിലെ കുട്ടികളുടെ എണ്ണം കഴിഞ്ഞാൽ പുതിയ ആളുകളെ ചേർക്കാൻ സാധിക്കില്ല.",
    "faqEn": [
      {
        "q": "How long does custom domain SSL take?",
        "a": "Once DNS is pointed, SSL is generated automatically within 15-30 minutes via Let's Encrypt."
      }
    ],
    "faqMl": [
      {
        "q": "കസ്റ്റം ഡൊമെയ്ൻ ആക്റ്റീവ് ആകാൻ എത്ര സമയമെടുക്കും?",
        "a": "DNS പോയിന്റ് ചെയ്ത് 15-30 മിനിറ്റിനുള്ളിൽ SSL സർട്ടിഫിക്കറ്റ് ആക്റ്റീവ് ആകുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Domain shows 'Not Secure'",
        "fix": "Ensure CNAME record is strictly pointing to cname.festpro.app."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "വെബ്‌സൈറ്റിൽ 'Not Secure' കാണിക്കുന്നു",
        "fix": "നിങ്ങളുടെ DNS കൺട്രോൾ പാനലിൽ CNAME റെക്കോർഡ് ശരിയാണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "21": {
    "num": "21",
    "catEn": "Core Engine",
    "catMl": "പ്രധാന സിസ്റ്റം",
    "titleEn": "AI Schedule Optimizer & Candidate Conflict Predictor Engine",
    "titleMl": "AI ഷെഡ്യൂൾ ഒപ്റ്റിമൈസറും സമയതടസ്സ പ്രവചനവും",
    "overviewEn": "Leverage algorithmic scheduling to automatically arrange stage timelines, minimizing candidate double-booking across concurrent stages.",
    "overviewMl": "ഓട്ടോമാറ്റിക് ആയി മത്സര സമയങ്ങൾ ക്രമീകരിക്കുകയും, കുട്ടികൾക്ക് ഒരേസമയം രണ്ടു സ്റ്റേജിൽ വരേണ്ട സാഹചര്യം പരമാവധി ഒഴിവാക്കുകയും ചെയ്യുന്ന സ്മാർട്ട് എഞ്ചിൻ.",
    "stepsEn": [
      "Step 1: Ensure all programs and candidates are fully registered in the system.",
      "Step 2: Go to /schedules and click 'Run AI Optimizer'.",
      "Step 3: Set constraints (e.g., Stage 1 ends at 6 PM, allow 15 min gaps for costume changes).",
      "Step 4: Review the AI-generated timeline draft.",
      "Step 5: Manually drag and drop any final adjustments and click 'Lock Schedule'."
    ],
    "stepsMl": [
      "ഘട്ടം 1: എല്ലാ മത്സരങ്ങളും കുട്ടികളും രജിസ്റ്റർ ചെയ്തിട്ടുണ്ടെന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 2: /schedules പേജിൽ പോയി 'Run AI Optimizer' ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 3: സമയപരിധികൾ നൽകുക (ഉദാ: സ്റ്റേജ് 1 വൈകുന്നേരം 6-ന് തീരണം, മേക്കപ്പ് മാറ്റാൻ 15 മിനിറ്റ് ഗ്യാപ്പ് വേണം).",
      "ഘട്ടം 4: സിസ്റ്റം സ്വയം നിർമ്മിച്ച ഷെഡ്യൂൾ പരിശോധിച്ച് മാറ്റങ്ങൾ ഉണ്ടെങ്കിൽ വരുത്തുക.",
      "ഘട്ടം 5: എല്ലാം ശരിയായ ശേഷം 'Lock Schedule' ക്ലിക്ക് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Costume Buffer",
        "type": "Minutes",
        "req": "Yes",
        "descEn": "Time given for candidates changing attire.",
        "descMl": "വസ്ത്രം മാറാൻ നൽകുന്ന സമയം."
      },
      {
        "name": "Conflict Score",
        "type": "Number",
        "req": "Yes",
        "descEn": "Predicted overlapping probability.",
        "descMl": "സമയതടസ്സം വരാനുള്ള സാധ്യത."
      }
    ],
    "workflowEn": "Set Constraints → Run Optimizer → Review Draft → Resolve Edge Cases → Lock.",
    "workflowMl": "നിയമങ്ങൾ നൽകുക → ഒപ്റ്റിമൈസർ റൺ ചെയ്യുക → ഷെഡ്യൂൾ പരിശോധിക്കുക → മാറ്റങ്ങൾ വരുത്തുക → ലോക്ക് ചെയ്യുക.",
    "tipsEn": "Run the optimizer at least 24 hours before the event to allow time for manual review.",
    "tipsMl": "പരിപാടിക്ക് 24 മണിക്കൂർ മുൻപ് തന്നെ ഷെഡ്യൂൾ ഒപ്റ്റിമൈസ് ചെയ്തു വെക്കുക.",
    "warningEn": "Re-running the AI optimizer will overwrite any manual adjustments made to the draft timeline.",
    "warningMl": "ഒപ്റ്റിമൈസർ രണ്ടാമതും റൺ ചെയ്താൽ നിങ്ങൾ മാനുവലായി വരുത്തിയ മാറ്റങ്ങൾ മാഞ്ഞുപോകും.",
    "faqEn": [
      {
        "q": "What if an impossible conflict occurs?",
        "a": "The system will highlight the unresolvable candidate in red so you can manually shift their specific slot."
      }
    ],
    "faqMl": [
      {
        "q": "ഒഴിവാക്കാൻ പറ്റാത്ത സമയതടസ്സം വന്നാൽ എന്ത് ചെയ്യും?",
        "a": "സിസ്റ്റം ചുവപ്പ് നിറത്തിൽ മുന്നറിയിപ്പ് നൽകും, നിങ്ങൾക്ക് അവരുടെ സമയം മാനുവൽ ആയി മാറ്റിവെക്കാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Optimizer timeout error",
        "fix": "Too many constraints. Try increasing the event end time or adding another stage."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഒപ്റ്റിമൈസർ വർക്ക് ആകുന്നില്ല",
        "fix": "സ്റ്റേജിന്റെ സമയം കൂട്ടുകയോ മറ്റൊരു സ്റ്റേജ് കൂടി ഉൾപ്പെടുത്തുകയോ ചെയ്യുക."
      }
    ]
  },
  "22": {
    "num": "22",
    "catEn": "Analytics",
    "catMl": "അനലിറ്റിക്‌സ്",
    "titleEn": "Real-Time Stage Analytics, Telemetry & Scoring Curve Graphs",
    "titleMl": "തത്സമയ സ്റ്റേജ് ഗ്രാഫുകളും അനലിറ്റിക്‌സും",
    "overviewEn": "Visualize live event progress, monitor judge scoring patterns, track stage delays, and analyze participation demographics via interactive charts.",
    "overviewMl": "സ്റ്റേജുകളിൽ നടക്കുന്ന കാര്യങ്ങൾ ഗ്രാഫുകളിലൂടെ തത്സമയം കാണാനും, വിധികർത്താക്കളുടെ മാർക്കിംഗ് ശൈലി നിരീക്ഷിക്കാനുമുള്ള ഡാഷ്‌ബോർഡ്.",
    "stepsEn": [
      "Step 1: Open the /analytics dashboard in the admin portal.",
      "Step 2: View the 'Stage Progress' bar to see which stages are running on time vs delayed.",
      "Step 3: Analyze the 'Judge Bell Curve' to detect anomalies (e.g., a judge giving exceptionally high/low scores).",
      "Step 4: Check 'Demographics' to see participant distribution by category and Group.",
      "Step 5: Export analytical reports as PDF for the event closing ceremony."
    ],
    "stepsMl": [
      "ഘട്ടം 1: അഡ്മിൻ പാനലിലെ /analytics പേജ് തുറക്കുക.",
      "ഘട്ടം 2: ഏത് സ്റ്റേജ് ആണ് കൃത്യസമയത്ത് നടക്കുന്നതെന്നും ഏതാണ് വൈകുന്നതെന്നും 'Stage Progress' വഴി അറിയാം.",
      "ഘട്ടം 3: ജഡ്ജിമാർ എങ്ങനെയാണ് മാർക്കിടുന്നത് എന്ന് 'Judge Bell Curve' ഗ്രാഫ് വഴി നിരീക്ഷിക്കാം.",
      "ഘട്ടം 4: ഏതു കാറ്റഗറിയിലാണെന്നും ഗ്രൂപ്പിലാണെന്നും കുട്ടികളുടെ കണക്കുകൾ നോക്കാം.",
      "ഘട്ടം 5: പരിപാടിയുടെ സമാപന സമ്മേളനത്തിനായി ഈ വിവരങ്ങൾ PDF ആയി ഡൗൺലോഡ് ചെയ്യാം."
    ],
    "fields": [
      {
        "name": "Stage Delay Time",
        "type": "Minutes",
        "req": "No",
        "descEn": "Time behind schedule.",
        "descMl": "സ്റ്റേജ് വൈകിയ സമയം."
      },
      {
        "name": "Score Variance",
        "type": "Float",
        "req": "No",
        "descEn": "Statistical deviation in judge marks.",
        "descMl": "മാർക്കുകളിലെ വ്യത്യാസം."
      }
    ],
    "workflowEn": "Open Dashboard → Monitor Delays → Audit Judge Curves → Export Summary Report.",
    "workflowMl": "ഡാഷ്‌ബോർഡ് തുറക്കുക → സമയം നിരീക്ഷിക്കുക → ജഡ്ജിമാരുടെ മാർക്കിംഗ് പരിശോധിക്കുക → റിപ്പോർട്ട് എടുക്കുക.",
    "tipsEn": "Use the Judge Bell Curve to quickly spot if a judge is being too strict compared to the panel average.",
    "tipsMl": "ഒരു ജഡ്ജി മാത്രം വളരെ കുറഞ്ഞ മാർക്കാണോ നൽകുന്നത് എന്ന് പെട്ടെന്ന് കണ്ടെത്താൻ ഗ്രാഫ് സഹായിക്കും.",
    "warningEn": "Analytics data caches every 5 minutes. Extremely fresh data might have a slight delay.",
    "warningMl": "ഡാറ്റകൾ എല്ലാ 5 മിനിറ്റിലുമാണ് അപ്‌ഡേറ്റ് ആകുക, അതിനാൽ ചെറിയ കാലതാമസം ഗ്രാഫിൽ ഉണ്ടാകും.",
    "faqEn": [
      {
        "q": "Can sponsors see these analytics?",
        "a": "No, this dashboard is strictly limited to Festival Directors and Admins."
      }
    ],
    "faqMl": [
      {
        "q": "പൊതുജനങ്ങൾക്കോ സ്പോൺസർമാർക്കോ ഈ ഗ്രാഫ് കാണാമോ?",
        "a": "ഇല്ല, അഡ്മിനുകൾക്കും ഡയറക്ടർമാർക്കും മാത്രമേ ഇതിലേക്ക് പ്രവേശനമുള്ളൂ."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Graphs not rendering",
        "fix": "Ensure your browser supports HTML5 Canvas and hardware acceleration is enabled."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഗ്രാഫുകൾ ലോഡ് ആകുന്നില്ല",
        "fix": "ബ്രൗസറിൽ ഹാർഡ്‌വെയർ ആക്സിലറേഷൻ ഓൺ ആണോ എന്ന് നോക്കുക."
      }
    ]
  },
  "23": {
    "num": "23",
    "catEn": "Developers",
    "catMl": "ഡെവലപ്പർമാർ",
    "titleEn": "Enterprise REST API v2, Webhook Events & SDK Scope Guide",
    "titleMl": "REST API & വെബ്‌ഹുക്ക് ഡെവലപ്പർ ഗൈഡ്",
    "overviewEn": "Integrate FestPro with external school ERPs, accounting software, and custom mobile apps using secure REST endpoints and real-time Webhooks.",
    "overviewMl": "നിങ്ങളുടെ സ്കൂൾ സോഫ്റ്റ്‌വെയറുമായോ മറ്റ് ആപ്പുകളുമായോ FestPro ബന്ധിപ്പിക്കാൻ ആവശ്യമായ API, വെബ്‌ഹുക്ക് വിവരങ്ങൾ.",
    "stepsEn": [
      "Step 1: Generate an API Bearer Token from /settings/developers.",
      "Step 2: Review API documentation at api.festpro.app/docs (Swagger/OpenAPI).",
      "Step 3: Configure Webhooks by entering your destination URL to receive live event payloads (e.g., result.published).",
      "Step 4: Use the Node.js or Python SDK to authenticate and fetch candidate rosters.",
      "Step 5: Monitor API limits and error logs in the Developer Dashboard."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /settings/developers പേജിൽ നിന്നും API ടോക്കൺ നിർമ്മിക്കുക.",
      "ഘട്ടം 2: api.festpro.app/docs എന്ന ലിങ്കിൽ കയറി API വിവരങ്ങൾ വായിച്ചു മനസ്സിലാക്കുക.",
      "ഘട്ടം 3: റിസൾട്ട് വരുമ്പോൾ മറ്റ് ആപ്പുകളിലേക്ക് വിവരങ്ങൾ എത്താൻ വെബ്‌ഹുക്ക് URL സെറ്റ് ചെയ്യുക.",
      "ഘട്ടം 4: Node.js അല്ലെങ്കിൽ Python SDK ഉപയോഗിച്ച് പ്രോഗ്രാം ചെയ്യുക.",
      "ഘട്ടം 5: ഡെവലപ്പർ ഡാഷ്‌ബോർഡിൽ API ലിമിറ്റുകളും ലോഗുകളും നിരീക്ഷിക്കുക."
    ],
    "fields": [
      {
        "name": "API Key",
        "type": "Bearer Token",
        "req": "Yes",
        "descEn": "Secret key for authentication.",
        "descMl": "രഹസ്യ API കോഡ്."
      },
      {
        "name": "Webhook URL",
        "type": "HTTPS URL",
        "req": "Yes",
        "descEn": "Endpoint receiving POST requests.",
        "descMl": "വിവരങ്ങൾ ലഭിക്കേണ്ട URL."
      }
    ],
    "workflowEn": "Generate Token → Read Docs → Setup Webhook → Test Call → Monitor Logs.",
    "workflowMl": "ടോക്കൺ ഉണ്ടാക്കുക → ഡോക്യുമെന്റേഷൻ വായിക്കുക → വെബ്‌ഹുക്ക് നൽകുക → ടെസ്റ്റ് ചെയ്യുക → ലോഗ് നോക്കുക.",
    "tipsEn": "Always verify the Webhook Signature header (X-FestPro-Signature) to ensure payloads are authentic.",
    "tipsMl": "വെബ്‌ഹുക്കിൽ വരുന്ന വിവരങ്ങൾ FestPro-ൽ നിന്നാണെന്ന് ഉറപ്പാക്കാൻ സിഗ്നേച്ചർ ചെക്ക് ചെയ്യുക.",
    "warningEn": "Never expose your API Bearer Token in client-side code like React or plain HTML.",
    "warningMl": "API ടോക്കൺ യാതൊരു കാരണവശാലും പബ്ലിക് ആയി വെബ്സൈറ്റുകളിൽ ഉൾപ്പെടുത്തരുത്.",
    "faqEn": [
      {
        "q": "What is the API rate limit?",
        "a": "Standard tier allows 100 requests/min. Enterprise tier allows up to 1000 requests/min."
      }
    ],
    "faqMl": [
      {
        "q": "API വഴി ഒരു മിനിറ്റിൽ എത്ര തവണ വിവരങ്ങൾ എടുക്കാം?",
        "a": "സാധാരണ പ്ലാനിൽ 100 തവണയും എന്റർപ്രൈസിൽ 1000 തവണയുമാണ് ലിമിറ്റ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Webhook returning 401 Unauthorized",
        "fix": "Ensure your receiving server whitelist FestPro IP ranges."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "വെബ്‌ഹുക്കിൽ 401 എറർ കാണിക്കുന്നു",
        "fix": "നിങ്ങളുടെ സെർവർ FestPro ഐപികൾ ബ്ലോക്ക് ചെയ്യുന്നില്ല എന്ന് ഉറപ്പാക്കുക."
      }
    ]
  },
  "24": {
    "num": "24",
    "catEn": "Security",
    "catMl": "സെക്യൂരിറ്റി",
    "titleEn": "Supabase Row-Level Security (RLS), IP Whitelisting & OWASP Guide",
    "titleMl": "ഡാറ്റാ സുരക്ഷ, RLS & IP വൈറ്റ്‌ലിസ്റ്റിംഗ്",
    "overviewEn": "Protect sensitive student data using advanced database Row-Level Security (RLS), configure IP access restrictions, and adhere to OWASP security standards.",
    "overviewMl": "കുട്ടികളുടെ വ്യക്തിവിവരങ്ങൾ സുരക്ഷിതമാക്കാൻ ഡാറ്റാബേസ് സെക്യൂരിറ്റി (RLS) നൽകുക, അഡ്മിൻ ആക്സസ് സുരക്ഷിതമാക്കുക.",
    "stepsEn": [
      "Step 1: Verify that Supabase RLS policies are active on all tenant tables (e.g., participants, scores).",
      "Step 2: Go to /settings/security to configure IP Whitelisting for Admin access.",
      "Step 3: Enable Two-Factor Authentication (2FA) for Organization Owners.",
      "Step 4: Review the Audit Log to monitor any unauthorized access attempts.",
      "Step 5: Enforce strict password complexity rules for Staff accounts."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഡാറ്റാബേസിൽ RLS പോളിസികൾ ആക്റ്റീവ് ആണെന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 2: അഡ്മിൻ പാനലിൽ കയറാൻ ചില IP വിലാസങ്ങൾ മാത്രം അനുവദിക്കുന്ന IP Whitelisting നൽകുക.",
      "ഘട്ടം 3: അഡ്മിൻ അക്കൗണ്ടുകൾക്ക് 2-Factor Authentication (2FA) നിർബന്ധമാക്കുക.",
      "ഘട്ടം 4: ആരെങ്കിലും അക്കൗണ്ടിൽ കയറാൻ ശ്രമിച്ചിട്ടുണ്ടോ എന്ന് Audit Log വഴി പരിശോധിക്കുക.",
      "ഘട്ടം 5: സ്റ്റാഫുകൾക്ക് ലോഗിൻ നൽകുമ്പോൾ സ്ട്രോങ്ങ് പാസ്‌വേഡ് ഉപയോഗിക്കാൻ നിർദ്ദേശിക്കുക."
    ],
    "fields": [
      {
        "name": "Allowed IPs",
        "type": "CIDR Block",
        "req": "No",
        "descEn": "Networks permitted to access admin.",
        "descMl": "അനുവദനീയമായ ഐപി അഡ്രസുകൾ."
      },
      {
        "name": "2FA Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "MFA enabled flag.",
        "descMl": "2FA ആക്റ്റീവ് ആണോ എന്ന്."
      }
    ],
    "workflowEn": "Enable RLS → Add IP Whitelist → Force 2FA → Monitor Audit Logs → Patch Vulnerabilities.",
    "workflowMl": "RLS ഓൺ ചെയ്യുക → ഐപി നൽകുക → 2FA നിർബന്ധമാക്കുക → ലോഗുകൾ നോക്കുക → സുരക്ഷ ഉറപ്പാക്കുക.",
    "tipsEn": "Whitelist the school's static IP so admins can only log in from the campus network.",
    "tipsMl": "സ്കൂളിലെ നെറ്റ്‌വർക്കിൽ നിന്ന് മാത്രം ലോഗിൻ ചെയ്യാൻ കഴിയുന്ന രീതിയിൽ ഐപി സെറ്റ് ചെയ്യുന്നത് സുരക്ഷ കൂട്ടും.",
    "warningEn": "Disabling RLS even temporarily exposes all multi-tenant data to public querying. Never do this.",
    "warningMl": "ഒരു കാരണവശാലും RLS പോളിസികൾ ഓഫ് ചെയ്യാൻ പാടില്ല, ഇത് ഡാറ്റാ ചോർച്ചയ്ക്ക് കാരണമാകും.",
    "faqEn": [
      {
        "q": "Are the passwords encrypted?",
        "a": "Yes, FestPro uses bcrypt hashing for all passwords, meaning even database admins cannot read them."
      }
    ],
    "faqMl": [
      {
        "q": "പാസ്‌വേഡുകൾ ഡാറ്റാബേസിൽ കാണാൻ സാധിക്കുമോ?",
        "a": "ഇല്ല, പാസ്‌വേഡുകൾ പൂർണ്ണമായും എൻക്രിപ്റ്റ് ചെയ്തതിനാലാണ് സേവ് ചെയ്യുന്നത്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Admin locked out due to IP restriction",
        "fix": "Organization Owner can bypass IP locks via emergency email recovery link."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ഐപി കാരണം അഡ്മിന് ലോഗിൻ ചെയ്യാൻ പറ്റുന്നില്ല",
        "fix": "ഇമെയിലിൽ വരുന്ന എമർജൻസി ലിങ്ക് ഉപയോഗിച്ച് അഡ്മിന് ലോഗിൻ ചെയ്യാം."
      }
    ]
  },
  "25": {
    "num": "25",
    "catEn": "DevOps",
    "catMl": "DevOps",
    "titleEn": "Automated PostgreSQL Database Backup & Disaster Recovery Manual",
    "titleMl": "ദിനംപ്രതിയുള്ള ഡാറ്റാ ബാക്കപ്പും റിക്കവറിയും",
    "overviewEn": "Configure automated daily snapshots, perform Point-in-Time Recovery (PITR), and export manual SQL dumps to ensure zero data loss during the event.",
    "overviewMl": "ഓരോ ദിവസവും സിസ്റ്റം സ്വയം ബാക്കപ്പ് എടുക്കുകയും, എന്തെങ്കിലും പ്രശ്നമുണ്ടായാൽ പഴയ സമയത്തേക്ക് ഡാറ്റാ തിരികെ കൊണ്ടുവരുകയും ചെയ്യാനുള്ള മാർഗ്ഗരേഖ.",
    "stepsEn": [
      "Step 1: Navigate to the Supabase Database settings and ensure PITR (Point-in-Time Recovery) is enabled.",
      "Step 2: Set the automated daily backup schedule (e.g., 2:00 AM UTC).",
      "Step 3: To download a manual backup, go to /settings/database and click 'Export Full SQL Dump'.",
      "Step 4: In case of accidental data deletion, use the 'Restore from Backup' option.",
      "Step 5: Verify the integrity of the downloaded SQL dump locally before an event starts."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഡാറ്റാബേസ് സെറ്റിംഗ്സിൽ PITR (Point-in-Time Recovery) ഓൺ ആണെന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 2: ദിവസേനയുള്ള ബാക്കപ്പ് സമയം നിശ്ചയിക്കുക (ഉദാ: രാത്രി 2 മണി).",
      "ഘട്ടം 3: അഡ്മിൻ പാനലിലെ /settings/database വഴി എപ്പോൾ വേണമെങ്കിലും ഫുൾ ബാക്കപ്പ് ഡൗൺലോഡ് ചെയ്യാം.",
      "ഘട്ടം 4: അബദ്ധത്തിൽ ഡാറ്റാ മാഞ്ഞുപോയാൽ 'Restore from Backup' വഴി പഴയ സമയത്തേക്ക് തിരികെ പോവാം.",
      "ഘട്ടം 5: ഡൗൺലോഡ് ചെയ്ത ബാക്കപ്പ് ഫയൽ കൃത്യമാണെന്ന് പരിപാടി തുടങ്ങുന്നതിന് മുൻപ് ഉറപ്പാക്കുക."
    ],
    "fields": [
      {
        "name": "Backup Time",
        "type": "Cron String",
        "req": "Yes",
        "descEn": "Daily execution schedule.",
        "descMl": "ദിവസേന ബാക്കപ്പ് എടുക്കുന്ന സമയം."
      },
      {
        "name": "Recovery Point",
        "type": "Timestamp",
        "req": "Yes",
        "descEn": "Time to restore to.",
        "descMl": "ഏതു സമയത്തെ ഡാറ്റയാണ് തിരികെ വേണ്ടത്."
      }
    ],
    "workflowEn": "Enable PITR → Schedule Daily Dumps → Test Manual Export → Execute Restore if needed.",
    "workflowMl": "PITR ഓൺ ചെയ്യുക → സമയം നിശ്ചയിക്കുക → ബാക്കപ്പ് ടെസ്റ്റ് ചെയ്യുക → റിക്കവറി നടത്തുക.",
    "tipsEn": "Store manual SQL dumps on an encrypted physical hard drive or AWS S3 for redundant safety.",
    "tipsMl": "ഡൗൺലോഡ് ചെയ്യുന്ന ബാക്കപ്പുകൾ ഹാർഡ് ഡ്രൈവുകളിലോ ഗൂഗിൾ ഡ്രൈവിലോ സൂക്ഷിക്കുക.",
    "warningEn": "Restoring a database will overwrite all current live data back to the timestamp selected.",
    "warningMl": "പഴയ ബാക്കപ്പ് റീസ്റ്റോർ ചെയ്താൽ നിലവിലുള്ള പുതിയ ഡാറ്റകൾ എല്ലാം മാഞ്ഞുപോകും.",
    "faqEn": [
      {
        "q": "How long are backups retained?",
        "a": "Standard plans retain backups for 7 days, Enterprise plans for 30 days."
      }
    ],
    "faqMl": [
      {
        "q": "ബാക്കപ്പുകൾ എത്ര ദിവസം വരെ സിസ്റ്റത്തിൽ ഉണ്ടാകും?",
        "a": "സാധാരണ പ്ലാനിൽ 7 ദിവസവും എന്റർപ്രൈസ് പ്ലാനിൽ 30 ദിവസവുമാണ് നിലനിൽക്കുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "SQL Dump export timeout",
        "fix": "Use pg_dump via CLI instead of the browser interface for databases larger than 2GB."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "വലിയ ബാക്കപ്പ് ഡൗൺലോഡ് ആകുന്നില്ല",
        "fix": "വലിയ ഫയലുകൾക്ക് കമാൻഡ് ലൈൻ (CLI) വഴി pg_dump ഉപയോഗിക്കുക."
      }
    ]
  },
  "26": {
    "num": "26",
    "catEn": "Monitoring",
    "catMl": "സിസ്റ്റം ഹെൽത്ത്",
    "titleEn": "Telemetry Monitoring & Real-Time WebSocket Health Metrics",
    "titleMl": "സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണവും ടെലിമെട്രിയും",
    "overviewEn": "Monitor server load, WebSocket connection health, active concurrent users, and API latency to ensure smooth festival operations.",
    "overviewMl": "സിസ്റ്റത്തിന്റെ പ്രവർത്തന വേഗത, സർവ്വറിലെ ലോഡ്, തത്സമയ കണക്ഷനുകൾ എന്നിവ നിരീക്ഷിക്കാനുള്ള ഡാഷ്‌ബോർഡ്.",
    "stepsEn": [
      "Step 1: Open /observability in the admin dashboard.",
      "Step 2: Check the 'WebSocket Active Connections' to see how many Judge Tablets and LED screens are online.",
      "Step 3: Monitor 'API Latency'; it should ideally remain under 200ms.",
      "Step 4: View the 'Error Rate' chart to identify any failing endpoints or 500 status codes.",
      "Step 5: Set up Alert Thresholds (e.g., notify if CPU usage > 80%)."
    ],
    "stepsMl": [
      "ഘട്ടം 1: അഡ്മിൻ ഡാഷ്‌ബോർഡിലെ /observability പേജ് തുറക്കുക.",
      "ഘട്ടം 2: എത്ര ടാബ്‌ലെറ്റുകളും സ്ക്രീനുകളുമാണ് ഓൺലൈൻ ഉള്ളതെന്ന് 'Active Connections' വഴി അറിയാം.",
      "ഘട്ടം 3: സിസ്റ്റത്തിന്റെ വേഗത (API Latency) എപ്പോഴും 200ms-ൽ താഴെയാണെന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 4: എററുകൾ വല്ലതും ഉണ്ടോയെന്ന് ഗ്രാഫിൽ പരിശോധിക്കുക.",
      "ഘട്ടം 5: സർവ്വർ ലോഡ് കൂടുമ്പോൾ മെസ്സേജ് ലഭിക്കാൻ 'Alert Thresholds' സെറ്റ് ചെയ്യുക."
    ],
    "fields": [
      {
        "name": "Active WebSockets",
        "type": "Number",
        "req": "No",
        "descEn": "Current live connections.",
        "descMl": "ലൈവ് കണക്ഷനുകളുടെ എണ്ണം."
      },
      {
        "name": "Latency",
        "type": "Milliseconds",
        "req": "No",
        "descEn": "Server response time.",
        "descMl": "സർവ്വർ വേഗത."
      }
    ],
    "workflowEn": "Open Observability → Check Connection Counts → Monitor Latency → Setup CPU Alerts.",
    "workflowMl": "നിരീക്ഷണ പാനൽ തുറക്കുക → കണക്ഷനുകൾ എണ്ണുക → വേഗത നിരീക്ഷിക്കുക → അലർട്ടുകൾ സെറ്റ് ചെയ്യുക.",
    "tipsEn": "If WebSocket connections drop suddenly, check the venue WiFi router for DHCP lease exhaustion.",
    "tipsMl": "പെട്ടെന്ന് എല്ലാ കണക്ഷനുകളും കട്ടായാൽ, സ്റ്റേജിലെ വൈഫൈ റൂട്ടർ കേടായതാണോ എന്ന് പരിശോധിക്കുക.",
    "warningEn": "High API latency during result publication means the database is under heavy read load.",
    "warningMl": "റിസൾട്ട് പബ്ലിഷ് ചെയ്യുമ്പോൾ സിസ്റ്റം സ്ലോ ആയാൽ പേടിക്കേണ്ടതില്ല, അനേകം പേർ ഒരുമിച്ച് നോക്കുന്നതുകൊണ്ടാണ്.",
    "faqEn": [
      {
        "q": "What is the maximum concurrent user limit?",
        "a": "Vercel Edge functions auto-scale, handling up to 100,000 concurrent viewers flawlessly."
      }
    ],
    "faqMl": [
      {
        "q": "ഒരേസമയം എത്ര പേർക്ക് വെബ്‌സൈറ്റ് ഉപയോഗിക്കാം?",
        "a": "സിസ്റ്റം ഓട്ടോ-സ്കെയിൽ ആയതിനാൽ ലക്ഷക്കണക്കിന് ആളുകൾക്ക് ഒരേസമയം ഉപയോഗിക്കാം."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "WebSocket disconnect loop",
        "fix": "Disable aggressive ad-blockers or corporate firewalls blocking wss:// traffic."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "തത്സമയ അപ്‌ഡേറ്റുകൾ വരുന്നില്ല",
        "fix": "ഉപയോഗിക്കുന്ന ബ്രൗസറിലെ ആഡ്-ബ്ലോക്കറുകൾ വെബ്‌സോക്കറ്റ് കണക്ഷനെ തടയുന്നില്ല എന്ന് ഉറപ്പാക്കുക."
      }
    ]
  },
  "27": {
    "num": "27",
    "catEn": "Configuration",
    "catMl": "സെറ്റിംഗ്സ്",
    "titleEn": "Localization, i18n & Anek Malayalam Translation Packs",
    "titleMl": "മലയാളം ഫോണ്ടും ഭാഷാ സെറ്റിംഗുകളും",
    "overviewEn": "Toggle platform languages between English and Malayalam seamlessly, utilizing Google Anek font for perfect regional typography rendering.",
    "overviewMl": "വെബ്‌സൈറ്റ് ഇംഗ്ലീഷിൽ നിന്നും മലയാളത്തിലേക്ക് മാറ്റാനും, 'അനേക് മലയാളം' ഫോണ്ട് ഉപയോഗിച്ച് മികച്ച വായനാനുഭവം നൽകാനുമുള്ള സജ്ജീകരണങ്ങൾ.",
    "stepsEn": [
      "Step 1: The language toggle is available at the top right of the dashboard (EN / ML).",
      "Step 2: The system instantly switches routing locales without reloading the page.",
      "Step 3: Font swapping occurs automatically, loading 'Anek Malayalam' weights securely.",
      "Step 4: Go to /settings/localization to edit custom text fields (e.g., changing 'Chest Number' to something else).",
      "Step 5: Apply changes to reflect across both admin panels and the public portal."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഡാഷ്‌ബോർഡിന്റെ മുകളിൽ വലതുവശത്തുള്ള ബട്ടൺ (EN / ML) വഴി ഭാഷ മാറ്റാം.",
      "ഘട്ടം 2: പേജ് റീഫ്രഷ് ആവാതെ തന്നെ സിസ്റ്റം പൂർണ്ണമായും മലയാളത്തിലേക്ക് മാറും.",
      "ഘട്ടം 3: മികച്ച വ്യക്തതക്കായി ഗൂഗിളിന്റെ 'അനേക് മലയാളം' ഫോണ്ട് ആണ് സിസ്റ്റം ഉപയോഗിക്കുന്നത്.",
      "ഘട്ടം 4: വെബ്സൈറ്റിലെ വാക്കുകൾ മാറ്റാൻ (ഉദാ: Chest Number എന്നതിന് പകരം വേറെ വാക്ക്) /settings/localization ഉപയോഗിക്കാം.",
      "ഘട്ടം 5: ഇവിടെ മാറ്റങ്ങൾ വരുത്തിയാൽ അത് പബ്ലിക് വെബ്‌സൈറ്റിലും മാറും."
    ],
    "fields": [
      {
        "name": "Default Locale",
        "type": "String (en/ml)",
        "req": "Yes",
        "descEn": "Starting language for users.",
        "descMl": "തുറക്കുമ്പോൾ വരേണ്ട ഭാഷ."
      },
      {
        "name": "Custom Strings",
        "type": "JSON",
        "req": "No",
        "descEn": "User-defined translation overrides.",
        "descMl": "മാറ്റം വരുത്തിയ വാക്കുകൾ."
      }
    ],
    "workflowEn": "Toggle EN/ML → Preview Font Rendering → Edit Custom Strings → Save Translation Pack.",
    "workflowMl": "ഭാഷ മാറ്റുക → ഫോണ്ട് ശരിയാണോ എന്ന് നോക്കുക → വാക്കുകൾ തിരുത്തുക → സേവ് ചെയ്യുക.",
    "tipsEn": "Ensure user-uploaded Malayalam fonts for certificates are in Unicode format, not legacy ASCII (like FML).",
    "tipsMl": "സർട്ടിഫിക്കറ്റുകളിൽ മലയാളം ഉപയോഗിക്കുമ്പോൾ യൂണികോഡ് ഫോണ്ടുകൾ തന്നെ ഉപയോഗിക്കാൻ ശ്രദ്ധിക്കുക.",
    "warningEn": "Changing the default locale during an active event might confuse judges using the tablet interface.",
    "warningMl": "പരിപാടി നടന്നുകൊണ്ടിരിക്കുമ്പോൾ സിസ്റ്റം ഭാഷ പെട്ടെന്ന് മാറ്റുന്നത് ജഡ്ജിമാർക്ക് ആശയക്കുഴപ്പം ഉണ്ടാക്കാം.",
    "faqEn": [
      {
        "q": "Can we add a third language like Hindi or Arabic?",
        "a": "Yes, custom i18n JSON files can be uploaded under advanced settings."
      }
    ],
    "faqMl": [
      {
        "q": "ഹിന്ദിയോ അറബിയോ ചേർക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, അഡ്വാൻസ്ഡ് സെറ്റിംഗ്സിൽ പോയി പുതിയ ഭാഷയുടെ ഫയൽ അപ്‌ലോഡ് ചെയ്യാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Malayalam text showing as square boxes",
        "fix": "Ensure the OS has proper Unicode rendering enabled or force-refresh the Anek webfont cache."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "മലയാളം അക്ഷരങ്ങൾക്ക് പകരം ചതുരങ്ങൾ വരുന്നു",
        "fix": "സിസ്റ്റത്തിൽ യൂണികോഡ് സപ്പോർട്ട് ഉണ്ടെന്നും ഇന്റർനെറ്റ് വഴി ഫോണ്ട് ഡൗൺലോഡ് ആയോ എന്നും പരിശോധിക്കുക."
      }
    ]
  },
  "28": {
    "num": "28",
    "catEn": "Documents",
    "catMl": "ഡോക്യുമെന്റ്സ്",
    "titleEn": "Server-Side PDF Document Generator Engine Manual",
    "titleMl": "ഔദ്യോഗിക PDF പ്രിന്റൗട്ട് എഞ്ചിൻ ഗൈഡ്",
    "overviewEn": "Understand how FestPro generates pixel-perfect PDF scorecards, certificates, and ID badges using Puppeteer/HTML-to-PDF serverless architecture.",
    "overviewMl": "സർട്ടിഫിക്കറ്റുകൾ, സ്കോർ ഷീറ്റുകൾ, ഐഡി കാർഡുകൾ എന്നിവ ഏറ്റവും മികച്ച ക്വാളിറ്റിയിൽ PDF ആയി പ്രിന്റ് എടുക്കാനുള്ള സാങ്കേതിക ഗൈഡ്.",
    "stepsEn": [
      "Step 1: Ensure your browser is set to allow pop-ups from FestPro.",
      "Step 2: Navigate to any print section (e.g., /participants -> Print QR Badges).",
      "Step 3: Click 'Generate PDF'. The server renders the HTML into a high-res PDF instantly.",
      "Step 4: Use the browser print dialogue. Set Paper Size to A4 and Margins to 'None'.",
      "Step 5: Enable 'Background Graphics' in print settings to ensure colors print correctly."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ബ്രൗസറിൽ പോപ്പ്-അപ്പ് (Pop-up) ബ്ലോക്കർ ഇല്ല എന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 2: പ്രിന്റ് എടുക്കേണ്ട പേജിലേക്ക് പോവുക (ഉദാ: Print QR Badges).",
      "ഘട്ടം 3: 'Generate PDF' ക്ലിക്ക് ചെയ്യുക. സിസ്റ്റം സ്വയം A4 സൈസിൽ PDF ഉണ്ടാക്കിത്തരും.",
      "ഘട്ടം 4: പ്രിന്റ് ചെയ്യുമ്പോൾ Paper Size 'A4' എന്നും Margins 'None' എന്നും നൽകുക.",
      "ഘട്ടം 5: നിറങ്ങൾ കൃത്യമായി കിട്ടാൻ പ്രിന്റ് സെറ്റിംഗ്സിൽ 'Background Graphics' ഓൺ ആക്കുക."
    ],
    "fields": [
      {
        "name": "Paper Size",
        "type": "String",
        "req": "Yes",
        "descEn": "A4 or A5 default sizing.",
        "descMl": "പേപ്പർ സൈസ് (A4)."
      },
      {
        "name": "Backgrounds",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Toggle CSS background printing.",
        "descMl": "ബാക്ക്ഗ്രൗണ്ട് കളർ."
      }
    ],
    "workflowEn": "Click Generate → Server Renders PDF → Open Print Dialog → Set A4 / No Margins → Print.",
    "workflowMl": "PDF ഡൗൺലോഡ് കൊടുക്കുക → പ്രിന്റ് ബോക്സ് തുറക്കുക → A4 സെറ്റ് ചെയ്യുക → മാർജിൻ ഒഴിവാക്കുക → പ്രിന്റ് ചെയ്യുക.",
    "tipsEn": "For certificates, always do a test print on a single page before printing the entire batch of 500.",
    "tipsMl": "സർട്ടിഫിക്കറ്റുകൾ നൂറുകണക്കിന് ഒരുമിച്ച് പ്രിന്റ് ചെയ്യാൻ കൊടുക്കുന്നതിന് മുൻപ് ഒരെണ്ണം പ്രിന്റ് എടുത്തു നോക്കുക.",
    "warningEn": "Do not scale the print to 'Fit to Page' when printing QR badges, as it might shrink the barcodes making them unscannable.",
    "warningMl": "QR കാർഡുകൾ പ്രിന്റ് ചെയ്യുമ്പോൾ സ്കെയിൽ (Scale) കുറയ്ക്കരുത്, അത് സ്കാനിങ്ങിനെ ബാധിക്കും.",
    "faqEn": [
      {
        "q": "Why are the PDF sizes so large?",
        "a": "High-resolution background graphics are embedded for print quality. You can compress them using external tools if sending via email."
      }
    ],
    "faqMl": [
      {
        "q": "PDF ഫയലിന്റെ സൈസ് വളരെ കൂടുതലാണല്ലോ?",
        "a": "മികച്ച പ്രിന്റ് ക്വാളിറ്റിക്കായി ഹൈ-റെസല്യൂഷൻ ഇമേജുകൾ ഉപയോഗിച്ചതിനാലാണ്; ആവശ്യമെങ്കിൽ കംപ്രസ്സ് ചെയ്യാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Colors are missing in printed PDF",
        "fix": "Check 'Print Background Graphics' in Chrome/Edge print window."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "പ്രിന്റ് എടുത്തപ്പോൾ ലോഗോയും നിറങ്ങളും ഇല്ല",
        "fix": "പ്രിന്റ് സെറ്റിംഗ്സിൽ 'Print Background Graphics' ഓൺ ചെയ്യാത്തതുകൊണ്ടാണ്."
      }
    ]
  },
  "29": {
    "num": "29",
    "catEn": "Infrastructure",
    "catMl": "ഇൻഫ്രാസ്ട്രക്ചർ",
    "titleEn": "DevOps CI/CD Pipelines & Vercel Edge Mesh Architecture",
    "titleMl": "DevOps & സർവ്വർ ഇൻഫ്രാസ്ട്രക്ചർ",
    "overviewEn": "Technical overview of the Next.js Vercel Edge network, global content delivery, and zero-downtime deployment pipelines.",
    "overviewMl": "FestPro-യുടെ സർവ്വർ സംവിധാനങ്ങൾ, വേഗത, സുരക്ഷ എന്നിവയെക്കുറിച്ചുള്ള സാങ്കേതിക വിവരങ്ങൾ.",
    "stepsEn": [
      "Step 1: All traffic routes through Vercel's Edge Network for global CDN caching.",
      "Step 2: Media assets (images, logos) are optimized dynamically via Next.js Image Optimization.",
      "Step 3: Database queries leverage Supabase Connection Pooling (PgBouncer) for high concurrency.",
      "Step 4: Real-time traffic is handled via globally distributed WebSocket clusters.",
      "Step 5: Daily deployments execute with zero-downtime; active users are unaffected during updates."
    ],
    "stepsMl": [
      "ഘട്ടം 1: വെബ്‌സൈറ്റിന്റെ ട്രാഫിക് പൂർണ്ണമായും Vercel സർവ്വറുകൾ വഴിയാണ് നിയന്ത്രിക്കുന്നത്.",
      "ഘട്ടം 2: ഫോട്ടോകളും ലോഗോകളും ഓട്ടോമാറ്റിക് ആയി കംപ്രസ്സ് ആയിട്ടാണ് ലോഡ് ആകുന്നത് (വേഗത കൂട്ടാൻ).",
      "ഘട്ടം 3: ലക്ഷക്കണക്കിന് ആളുകൾ വന്നാലും ഡാറ്റാബേസ് സ്ലോ ആവാതിരിക്കാൻ PgBouncer ഉപയോഗിക്കുന്നു.",
      "ഘട്ടം 4: ലൈവ് റിസൾട്ടുകൾ നൽകാൻ ലോകമെമ്പാടുമുള്ള വെബ്‌സോക്കറ്റ് ക്ലസ്റ്ററുകൾ സഹായിക്കുന്നു.",
      "ഘട്ടം 5: സിസ്റ്റം അപ്‌ഡേറ്റ് ചെയ്യുമ്പോൾ ഉപയോഗിക്കുന്നവർക്ക് യാതൊരു തടസ്സവും ഉണ്ടാകില്ല (Zero-downtime)."
    ],
    "fields": [
      {
        "name": "CDN Cache",
        "type": "Header",
        "req": "Yes",
        "descEn": "Edge cache HIT/MISS status.",
        "descMl": "സർവ്വർ കാഷെ."
      },
      {
        "name": "Pool Size",
        "type": "Number",
        "req": "Yes",
        "descEn": "Active DB connections.",
        "descMl": "ഡാറ്റാബേസ് കണക്ഷനുകൾ."
      }
    ],
    "workflowEn": "Code Push → Automated Tests → Vercel Edge Build → CDN Invalidation → Zero-Downtime Rollout.",
    "workflowMl": "പുതിയ കോഡ് → ടെസ്റ്റിംഗ് → സർവ്വർ ബിൽഡ് → അപ്‌ഡേറ്റ് → ലൈവ്.",
    "tipsEn": "If you experience slow loading, check the Network tab in DevTools for 'x-vercel-cache' headers.",
    "tipsMl": "വേഗത കുറവനുഭവപ്പെട്ടാൽ ബ്രൗസറിലെ ലൊക്കേഷൻ ഫിൽറ്ററുകൾ പരിശോധിക്കുക.",
    "warningEn": "Custom reverse proxies in front of FestPro may break WebSocket secure connections.",
    "warningMl": "സ്കൂളിന്റെ ഫയർവാളുകൾ ചിലപ്പോൾ ലൈവ് ഡാറ്റ വരുന്നത് തടഞ്ഞേക്കാം.",
    "faqEn": [
      {
        "q": "Where is the data stored physically?",
        "a": "Primary databases are securely hosted in AWS/AWS-Gov regions depending on compliance needs."
      }
    ],
    "faqMl": [
      {
        "q": "ഡാറ്റകൾ എവിടെയാണ് സേവ് ചെയ്യുന്നത്?",
        "a": "ഏറ്റവും സുരക്ഷിതമായ AWS ക്ലൗഡ് സർവ്വറുകളിലാണ് വിവരങ്ങൾ സൂക്ഷിക്കുന്നത്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "504 Gateway Timeout during heavy load",
        "fix": "The connection pool might be exhausted. Contact Enterprise Support for auto-scale limits."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "504 Gateway Timeout എന്ന് കാണിക്കുന്നു",
        "fix": "സർവ്വറിൽ വലിയ ലോഡ് വരുമ്പോഴാണ് ഇത് സംഭവിക്കുന്നത്; തനിയെ ശരിയാകുന്നതാണ്."
      }
    ]
  },
  "30": {
    "num": "30",
    "catEn": "Emergency",
    "catMl": "എമർജൻസി",
    "titleEn": "Master Troubleshooting Matrix, Diagnostic Keys & Emergency Manual",
    "titleMl": "പ്രശ്നപരിഹാര വഴികളും എറർ കോഡ് മാസ്റ്റർ ചാർട്ടും",
    "overviewEn": "A complete diagnostic master chart mapping all platform error codes (e.g., ERR_403_AUTH) to instant resolution steps.",
    "overviewMl": "സിസ്റ്റത്തിൽ വരാൻ സാധ്യതയുള്ള എല്ലാ എറർ കോഡുകളും (ഉദാ: 403, 500) അവ പരിഹരിക്കാനുള്ള എളുപ്പവഴികളും അടങ്ങിയ മാസ്റ്റർ ചാർട്ട്.",
    "stepsEn": [
      "Step 1: Identify the error code displayed on the screen (e.g., ERR_DUP_ENTRY).",
      "Step 2: Cross-reference the code in this Master Manual.",
      "Step 3: Follow the step-by-step 'Fix' protocol listed alongside the code.",
      "Step 4: If unresolved, click 'Generate Diagnostic Report' from /observability.",
      "Step 5: Send the report UUID to FestPro Enterprise Support."
    ],
    "stepsMl": [
      "ഘട്ടം 1: സ്ക്രീനിൽ കാണിക്കുന്ന എറർ കോഡ് നോക്കിവെക്കുക.",
      "ഘട്ടം 2: ആ കോഡ് ഈ മാസ്റ്റർ ചാർട്ടിൽ തിരയുക.",
      "ഘട്ടം 3: അതിൽ പറയുന്ന പരിഹാര മാർഗ്ഗങ്ങൾ (Fix) ചെയ്തു നോക്കുക.",
      "ഘട്ടം 4: എന്നിട്ടും ശരിയായില്ലെങ്കിൽ /observability പോയി 'Diagnostic Report' എടുക്കുക.",
      "ഘട്ടം 5: ആ റിപ്പോർട്ട് FestPro സപ്പോർട്ട് ടീമിന് അയച്ചു നൽകുക."
    ],
    "fields": [
      {
        "name": "Error Code",
        "type": "String",
        "req": "Yes",
        "descEn": "Unique diagnostic identifier.",
        "descMl": "എറർ നമ്പർ."
      },
      {
        "name": "Trace ID",
        "type": "UUID",
        "req": "Yes",
        "descEn": "Specific event log ID.",
        "descMl": "ലോഗ് നമ്പർ."
      }
    ],
    "workflowEn": "Note Error Code → Check Manual → Apply Fix → Generate Report (If needed) → Contact Support.",
    "workflowMl": "എറർ കോഡ് നോക്കുക → ചാർട്ട് നോക്കുക → പരിഹരിക്കുക → റിപ്പോർട്ട് എടുക്കുക → സപ്പോർട്ടിനെ വിളിക്കുക.",
    "tipsEn": "Press Ctrl+Shift+I (F12) to open DevTools and capture the Console log text before contacting support.",
    "tipsMl": "സപ്പോർട്ടിനെ വിളിക്കുന്നതിന് മുൻപ് എറർ മെസ്സേജിന്റെ സ്ക്രീൻഷോട്ട് എടുത്തുവെക്കുക.",
    "warningEn": "Never clear browser cache blindly; it will erase offline-synced judge scorecards.",
    "warningMl": "ജഡ്ജിമാരുടെ ടാബ്‌ലെറ്റിൽ എറർ വന്നാൽ ഒരു കാരണവശാലും കാഷെ (Cache) ക്ലിയർ ചെയ്യരുത്; മാർക്കുകൾ മാഞ്ഞുപോകും.",
    "faqEn": [
      {
        "q": "What does a blank white screen mean?",
        "a": "Usually a browser compatibility issue. Update Chrome/Safari to the latest version."
      }
    ],
    "faqMl": [
      {
        "q": "വെബ്‌സൈറ്റ് തുറക്കുമ്പോൾ വെള്ള സ്ക്രീൻ മാത്രം കാണുന്നു?",
        "a": "ബ്രൗസർ പഴയതായതുകൊണ്ടാകാം; ഗൂഗിൾ ക്രോം അപ്‌ഡേറ്റ് ചെയ്തു നോക്കുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "ERR_NET_DISCONNECT",
        "fix": "Check router cables. App will auto-reconnect once internet is restored."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "നെറ്റ്വർക്ക് എറർ കാണിക്കുന്നു",
        "fix": "വൈഫൈ ശരിയാണോ എന്ന് നോക്കുക; നെറ്റ് വന്നാൽ സിസ്റ്റം തനിയെ റീലോഡ് ആകും."
      }
    ]
  },
  "31": {
    "num": "31",
    "catEn": "Help & Resources",
    "catMl": "സഹായം",
    "titleEn": "Frequently Asked Questions (FAQ Master Reference)",
    "titleMl": "സാധാരണ ചോദ്യങ്ങളും ഉത്തരങ്ങളും (FAQ)",
    "overviewEn": "A centralized repository of common questions, troubleshooting steps, and operational guidelines for quick reference.",
    "overviewMl": "ഫെസ്റ്റ്പ്രോ ഉപയോഗിക്കുമ്പോൾ ഉണ്ടാകുന്ന സാധാരണ സംശയങ്ങൾക്കും ചോദ്യങ്ങൾക്കുമുള്ള ഉത്തരങ്ങൾ നൽകുന്ന മാസ്റ്റർ റഫറൻസ്.",
    "stepsEn": [
      "Step 1: Open the /help center in your dashboard.",
      "Step 2: Use the search bar to find specific topics (e.g., 'Forgot Password').",
      "Step 3: Click on a question to expand its detailed answer.",
      "Step 4: If your question isn't listed, use the 'Contact Support' button.",
      "Step 5: Review the FAQ before raising support tickets."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഡാഷ്‌ബോർഡിലെ /help സെന്റർ തുറക്കുക.",
      "ഘട്ടം 2: സെർച്ച് ബാറിൽ നിങ്ങളുടെ സംശയം ടൈപ്പ് ചെയ്യുക (ഉദാ: പാസ്‌വേഡ്).",
      "ഘട്ടം 3: താഴെ വരുന്ന ചോദ്യങ്ങളിൽ ക്ലിക്ക് ചെയ്താൽ ഉത്തരം വായിക്കാം.",
      "ഘട്ടം 4: ഉത്തരം കിട്ടിയില്ലെങ്കിൽ 'Contact Support' ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 5: പരാതി നൽകുന്നതിന് മുൻപ് ഈ ലിസ്റ്റ് പരിശോധിക്കുന്നത് നല്ലതാണ്."
    ],
    "fields": [
      {
        "name": "Search Query",
        "type": "String",
        "req": "No",
        "descEn": "Keyword to find answers.",
        "descMl": "തിരയാനുള്ള വാക്ക്."
      },
      {
        "name": "Category Filter",
        "type": "Enum",
        "req": "No",
        "descEn": "Filter FAQs by module.",
        "descMl": "വിഭാഗം തിരിച്ചു തിരയാൻ."
      }
    ],
    "workflowEn": "Search Issue → Read Answer → Try Solution → If Unresolved, Contact Support.",
    "workflowMl": "പ്രശ്നം തിരയുക → ഉത്തരം വായിക്കുക → ചെയ്തു നോക്കുക → ശരിയായില്ലെങ്കിൽ പരാതി നൽകുക.",
    "tipsEn": "Update the FAQ list dynamically via /settings/faq based on your school's custom rules.",
    "tipsMl": "സ്കൂളിന്റെ സ്വന്തം നിയമങ്ങൾ ഈ ലിസ്റ്റിലേക്ക് അഡ്മിന് കൂട്ടിചേർക്കാവുന്നതാണ്.",
    "warningEn": "Do not delete core system FAQs as they guide field volunteers.",
    "warningMl": "സിസ്റ്റത്തിലുള്ള പ്രധാന വിവരങ്ങൾ ഡിലീറ്റ് ചെയ്യരുത്, അത് വോളണ്ടിയർമാർക്കുള്ള ഗൈഡ് ആണ്.",
    "faqEn": [
      {
        "q": "How often is the FAQ updated?",
        "a": "The master repository is updated globally during every major version release."
      }
    ],
    "faqMl": [
      {
        "q": "ഈ വിവരങ്ങൾ എപ്പോഴൊക്കെ അപ്‌ഡേറ്റ് ആകും?",
        "a": "സിസ്റ്റത്തിന്റെ പുതിയ വേർഷൻ വരുമ്പോഴെല്ലാം ഇവിടെ പുതിയ വിവരങ്ങൾ എത്തുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Search returns no results",
        "fix": "Try using broader keywords or check your spelling."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സെർച്ച് ചെയ്യുമ്പോൾ ഒന്നും വരുന്നില്ല",
        "fix": "സ്പെല്ലിങ് ശരിയാണോ എന്ന് നോക്കുകയോ, ചെറിയ വാക്കുകൾ ഉപയോഗിച്ച് തിരയുകയോ ചെയ്യുക."
      }
    ]
  },
  "32": {
    "num": "32",
    "catEn": "Administration",
    "catMl": "അഡ്മിനിസ്ട്രേഷൻ",
    "titleEn": "Administrator Master Operational Manual",
    "titleMl": "അഡ്മിനിസ്ട്രേറ്റർ മാസ്റ്റർ മാനുവൽ",
    "overviewEn": "The ultimate handbook for Organization Owners to manage the entire platform, roles, security, and overriding data.",
    "overviewMl": "ഓർഗനൈസേഷൻ അഡ്മിനുകൾക്ക് മാത്രം സിസ്റ്റം പൂർണ്ണമായും നിയന്ത്രിക്കാനും തീരുമാനങ്ങൾ എടുക്കാനുമുള്ള പ്രധാന ഗൈഡ്.",
    "stepsEn": [
      "Step 1: The 'Organization Owner' has top-level access via the /dashboard/organization settings.",
      "Step 2: Assign other users as 'Festival Director' or 'Tabulator' under /members.",
      "Step 3: Review billing, custom domains, and security access logs regularly.",
      "Step 4: Use the 'Master Override' function to fix critical errors (like unlocking a scorecard).",
      "Step 5: Archive the entire festival data safely once the event concludes."
    ],
    "stepsMl": [
      "ഘട്ടം 1: 'Organization Owner' എന്ന റോൾ ഉള്ളവർക്ക് മാത്രമേ ഈ സെറ്റിംഗ്സ് കാണാൻ സാധിക്കൂ.",
      "ഘട്ടം 2: /members പേജിൽ പോയി മറ്റുള്ളവർക്ക് അനുമതികൾ നൽകാം.",
      "ഘട്ടം 3: സുരക്ഷാ ലോഗുകളും ഡൊമെയ്ൻ വിവരങ്ങളും പരിശോധിക്കാം.",
      "ഘട്ടം 4: അത്യാവശ്യ ഘട്ടങ്ങളിൽ റിസൾട്ട് മാറ്റാനോ സ്കോർ അൺലോക്ക് ചെയ്യാനോ 'Master Override' ഉപയോഗിക്കാം.",
      "ഘട്ടം 5: പരിപാടി കഴിഞ്ഞാൽ ഫെസ്റ്റിവൽ പൂർണ്ണമായും ആർക്കൈവ് ചെയ്യാം."
    ],
    "fields": [
      {
        "name": "Admin PIN",
        "type": "6-Digit String",
        "req": "Yes",
        "descEn": "Required for Master Override.",
        "descMl": "സുപ്രധാന തീരുമാനങ്ങൾക്കുള്ള പിൻ."
      },
      {
        "name": "Access Level",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Owner vs Director.",
        "descMl": "അധികാര പരിധി."
      }
    ],
    "workflowEn": "Assign Roles → Monitor Security → Manage Subscriptions → Handle Overrides → Archive Event.",
    "workflowMl": "റോളുകൾ നൽകുക → സുരക്ഷ നോക്കുക → പ്ലാനുകൾ മാറ്റുക → മാറ്റങ്ങൾ വരുത്തുക → ആർക്കൈവ് ചെയ്യുക.",
    "tipsEn": "Keep your Admin PIN strictly confidential. It can override any system lock.",
    "tipsMl": "അഡ്മിൻ പിൻ രഹസ്യമായി സൂക്ഷിക്കുക; സിസ്റ്റത്തിലെ എന്ത് മാറ്റവും വരുത്താൻ ഇതുവഴി സാധിക്കും.",
    "warningEn": "Archiving a festival is permanent. Ensure all certificates and reports are generated first.",
    "warningMl": "ആർക്കൈവ് ചെയ്തു കഴിഞ്ഞാൽ പിന്നെ യാതൊരു മാറ്റവും വരുത്താൻ സാധിക്കില്ല.",
    "faqEn": [
      {
        "q": "Can I have multiple Organization Owners?",
        "a": "Yes, you can elevate other directors to Owner status in the Members section."
      }
    ],
    "faqMl": [
      {
        "q": "ഒന്നിൽ കൂടുതൽ അഡ്മിനുകളെ വെക്കാൻ സാധിക്കുമോ?",
        "a": "അതെ, ഒന്നിലധികം പേർക്ക് അഡ്മിൻ ആക്സസ് നൽകാമെങ്കിലും സൂക്ഷിച്ചു മാത്രം നൽകുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Cannot edit a locked competition",
        "fix": "Enter your Admin PIN when prompted to force-unlock it."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ലോക്ക് ചെയ്ത മത്സരം എഡിറ്റ് ചെയ്യാൻ പറ്റുന്നില്ല",
        "fix": "നിങ്ങളുടെ 6-അക്ക അഡ്മിൻ പിൻ നൽകിയാൽ അൺലോക്ക് ചെയ്യാവുന്നതാണ്."
      }
    ]
  },
  "33": {
    "num": "33",
    "catEn": "Judging",
    "catMl": "ജഡ്ജിംഗ്",
    "titleEn": "Judge Tablet Scoring & Criterion Manual",
    "titleMl": "ജഡ്ജസ് ടാബ്‌ലെറ്റ് സ്കോറിംഗ് മാനുവൽ",
    "overviewEn": "Detailed guidelines on using the digital judge console, evaluating criteria, and submitting final marksheets securely.",
    "overviewMl": "വിധികർത്താക്കൾക്ക് ടാബ്‌ലെറ്റ് ഉപയോഗിച്ച് മാർക്കിടാനും, മാനദണ്ഡങ്ങൾ മനസ്സിലാക്കാനും, മാർക്കുകൾ സബ്മിറ്റ് ചെയ്യാനുമുള്ള ഗൈഡ്.",
    "stepsEn": [
      "Step 1: Connect the tablet to the secure stage WiFi network.",
      "Step 2: Enter the 4-digit PIN provided by the Stage Manager at /mobile/judging.",
      "Step 3: Evaluate each candidate using the slider bars for each specific criterion.",
      "Step 4: Do not refresh the page while judging. Drafts auto-save to the device.",
      "Step 5: Tap 'Submit Final Marksheet' and wait for the green confirmation checkmark."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ടാബ്‌ലെറ്റിൽ സ്റ്റേജിലെ വൈഫൈ കണക്ട് ചെയ്യുക.",
      "ഘട്ടം 2: സ്റ്റേജ് മാനേജർ തരുന്ന 4-അക്ക പിൻ /mobile/judging പേജിൽ അടിക്കുക.",
      "ഘട്ടം 3: ഓരോ കുട്ടിക്കും ഓരോ മാനദണ്ഡങ്ങൾക്കും സ്ളൈഡർ മാറ്റി കൃത്യമായി മാർക്കിടുക.",
      "ഘട്ടം 4: മാർക്കിട്ടുകൊണ്ടിരിക്കുമ്പോൾ സ്ക്രീൻ റീഫ്രഷ് ചെയ്യരുത്.",
      "ഘട്ടം 5: എല്ലാം കഴിഞ്ഞ ശേഷം 'Submit' ക്ലിക്ക് ചെയ്ത് പച്ച ശരി അടയാളം വരുന്നത് വരെ കാത്തിരിക്കുക."
    ],
    "fields": [
      {
        "name": "Criteria Slider",
        "type": "Number (0-100)",
        "req": "Yes",
        "descEn": "Score input mechanism.",
        "descMl": "മാർക്ക് നൽകാനുള്ള സ്ളൈഡർ."
      },
      {
        "name": "Code Letter",
        "type": "Character",
        "req": "Yes",
        "descEn": "Candidate's blind ID.",
        "descMl": "കുട്ടികളുടെ രഹസ്യ കോഡ്."
      }
    ],
    "workflowEn": "Login via PIN → Select Candidate → Slide Scores → Submit → Verify Green Tick.",
    "workflowMl": "പിൻ അടിക്കുക → കുട്ടിയെ എടുക്കുക → മാർക്കിടുക → സബ്മിറ്റ് ചെയ്യുക → ശരിയാണെന്ന് ഉറപ്പാക്കുക.",
    "tipsEn": "If internet drops, keep scoring. The tablet will store data offline and sync later automatically.",
    "tipsMl": "നെറ്റ് പോയാലും മാർക്കിടാം; നെറ്റ് വരുമ്പോൾ അത് തനിയെ സെർവറിലേക്ക് പൊയ്ക്കൊള്ളും.",
    "warningEn": "Once submitted, you cannot change a score without the Chief Tabulator's override key.",
    "warningMl": "ഒരിക്കൽ സബ്മിറ്റ് ചെയ്താൽ പിന്നെ മാർക്ക് മാറ്റാൻ ടാബുലേറ്ററുടെ പാസ്‌വേഡ് വേണ്ടിവരും.",
    "faqEn": [
      {
        "q": "Why don't I see the chest numbers?",
        "a": "FestPro uses a double-blind system. Chest numbers are hidden behind random code letters to ensure fairness."
      }
    ],
    "faqMl": [
      {
        "q": "എന്തുകൊണ്ടാണ് ചെസ്റ്റ് നമ്പറുകൾ കാണാത്തത്?",
        "a": "പക്ഷപാതം ഒഴിവാക്കാൻ ചെസ്റ്റ് നമ്പറിന് പകരം കോഡ് ലെറ്ററുകൾ ആണ് ടാബ്‌ലെറ്റിൽ കാണിക്കുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Submit button is greyed out",
        "fix": "Ensure you have scored all candidates in the list. Missing scores block submission."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സബ്മിറ്റ് ബട്ടൺ വർക്ക് ആകുന്നില്ല",
        "fix": "ലിസ്റ്റിലെ എല്ലാവർക്കും മാർക്കിട്ടു എന്ന് ഉറപ്പുവരുത്തുക."
      }
    ]
  },
  "34": {
    "num": "34",
    "catEn": "Staff & Volunteer",
    "catMl": "വോളണ്ടിയർ",
    "titleEn": "Volunteer Field Ushering & Checkpoint Guide",
    "titleMl": "വോളണ്ടിയർ ഗ്രൗണ്ട് ഡ്യൂട്ടി മാർഗ്ഗരേഖ",
    "overviewEn": "Instructions for field volunteers on handling crowd control, scanning candidate passes at call rooms, and reporting to stage managers.",
    "overviewMl": "വോളണ്ടിയർമാർക്കുള്ള ഡ്യൂട്ടി ഗൈഡ്; കുട്ടികളെ സ്റ്റേജിലേക്ക് എത്തിക്കുക, ഐഡി സ്കാൻ ചെയ്യുക, സുരക്ഷ ഉറപ്പാക്കുക.",
    "stepsEn": [
      "Step 1: Install the FestPro App on your phone and log in with your Volunteer ID.",
      "Step 2: Report to your assigned Checkpoint (e.g., Call Room A) and scan your own attendance.",
      "Step 3: When candidates arrive, use 'Scan Candidate' mode to verify their QR badges.",
      "Step 4: Guide verified candidates to the backstage area sequentially.",
      "Step 5: Alert the Stage Manager via the app if a candidate is missing."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ഫോണിൽ FestPro ആപ്പ് എടുത്ത് വോളണ്ടിയർ ലോഗിൻ ചെയ്യുക.",
      "ഘട്ടം 2: നിങ്ങളുടെ ഡ്യൂട്ടി പോയിന്റിൽ (ഉദാ: കാൾ റൂം) എത്തി സ്വന്തം ഹാജർ സ്കാൻ ചെയ്യുക.",
      "ഘട്ടം 3: കുട്ടികൾ വരുമ്പോൾ അവരുടെ ഐഡി കാർഡ് സ്കാൻ ചെയ്ത് ശരിയാണെന്ന് ഉറപ്പാക്കുക.",
      "ഘട്ടം 4: ക്രമമനുസരിച്ച് അവരെ സ്റ്റേജിന് പിന്നിലേക്ക് പറഞ്ഞയക്കുക.",
      "ഘട്ടം 5: ആരെയെങ്കിലും കാണാനില്ലെങ്കിൽ ആപ്പ് വഴി സ്റ്റേജ് മാനേജറെ അറിയിക്കുക."
    ],
    "fields": [
      {
        "name": "Scanner Mode",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Candidate vs Meal Scan.",
        "descMl": "ഏതു തരം സ്കാനിംഗ് ആണ്."
      },
      {
        "name": "Clearance",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Candidate allowed entry.",
        "descMl": "പ്രവേശനം അനുവദിക്കാമോ."
      }
    ],
    "workflowEn": "Login App → Mark Attendance → Scan Candidates → Manage Queue → Report Missing.",
    "workflowMl": "ആപ്പ് തുറക്കുക → ഹാജർ വെക്കുക → കുട്ടികളെ സ്കാൻ ചെയ്യുക → ക്യൂ നിയന്ത്രിക്കുക → വിവരങ്ങൾ അറിയിക്കുക.",
    "tipsEn": "Ensure your phone battery is fully charged before a 4-hour shift.",
    "tipsMl": "ഡ്യൂട്ടിക്ക് കയറുന്നതിന് മുൻപ് ഫോണിൽ ഫുൾ ചാർജ്ജ് ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.",
    "warningEn": "Do not let any candidate proceed backstage without a valid Green tick on your scanner.",
    "warningMl": "സ്കാൻ ചെയ്യുമ്പോൾ പച്ച ടിക്ക് വന്നില്ലെങ്കിൽ ആരെയും സ്റ്റേജിന്റെ അടുത്തേക്ക് വിടരുത്.",
    "faqEn": [
      {
        "q": "What if a candidate lost their badge?",
        "a": "Send them to the Front Desk to print a duplicate badge."
      }
    ],
    "faqMl": [
      {
        "q": "കുട്ടിയുടെ ഐഡി കാർഡ് കളഞ്ഞുപോയാലോ?",
        "a": "പുതിയ ഐഡി പ്രിന്റ് എടുക്കാനായി ഫ്രണ്ട് ഡെസ്കിലേക്ക് അവരെ പറഞ്ഞുവിടുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Camera scanner is very slow",
        "fix": "Ensure good lighting at the checkpoint and tap the screen to focus."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സ്കാൻ ചെയ്യാൻ നല്ല താമസം നേരിടുന്നു",
        "fix": "വെളിച്ചമുള്ള സ്ഥലത്ത് നിൽക്കുക, ക്യാമറ ലെൻസ് തുടക്കുക."
      }
    ]
  },
  "35": {
    "num": "35",
    "catEn": "Finance",
    "catMl": "ധനകാര്യം",
    "titleEn": "Finance Treasurer Fee Collection & Receipt Manual",
    "titleMl": "ട്രഷറർ ഫ്രണ്ട് ഡെസ്ക് ഫീസ് മാനുവൽ",
    "overviewEn": "A guide for the Treasurer on accepting payments, issuing official receipts, and generating end-of-day cash reports.",
    "overviewMl": "ട്രഷറർമാർക്കുള്ള ഗൈഡ്; പണം വാങ്ങുക, രസീത് നൽകുക, ദിവസാവസാനമുള്ള കണക്കുകൾ തിട്ടപ്പെടുത്തുക.",
    "stepsEn": [
      "Step 1: Open the /finance dashboard at the payment counter.",
      "Step 2: Search for the candidate's name or scan their provisional slip.",
      "Step 3: Click 'Accept Payment', choose Cash/UPI, and enter the amount.",
      "Step 4: The system will generate a PDF Receipt. Print it or email it.",
      "Step 5: At the end of the day, click 'Export Daily Ledger' for cash tallying."
    ],
    "stepsMl": [
      "ഘട്ടം 1: പണം സ്വീകരിക്കുന്ന കൗണ്ടറിൽ /finance ഡാഷ്‌ബോർഡ് തുറക്കുക.",
      "ഘട്ടം 2: കുട്ടിയുടെ പേര് തിരയുകയോ സ്ലിപ്പ് സ്കാൻ ചെയ്യുകയോ ചെയ്യുക.",
      "ഘട്ടം 3: 'Accept Payment' കൊടുത്ത് Cash അല്ലെങ്കിൽ UPI സെലക്ട് ചെയ്യുക.",
      "ഘട്ടം 4: സിസ്റ്റം ഒരു PDF രസീത് നൽകും; അത് പ്രിന്റ് ചെയ്ത് നൽകാം.",
      "ഘട്ടം 5: ഡ്യൂട്ടി കഴിയുമ്പോൾ 'Export Daily Ledger' വഴി അന്നത്തെ കണക്കുകൾ ഡൗൺലോഡ് ചെയ്യാം."
    ],
    "fields": [
      {
        "name": "Payment Method",
        "type": "Enum",
        "req": "Yes",
        "descEn": "Cash, UPI, Card.",
        "descMl": "പണമടച്ച രീതി."
      },
      {
        "name": "Transaction ID",
        "type": "String",
        "req": "No",
        "descEn": "UPI or bank ref number.",
        "descMl": "ബാങ്ക് റഫറൻസ് നമ്പർ."
      }
    ],
    "workflowEn": "Search Candidate → Select Payment Method → Generate Receipt → Tally Cash End-of-Day.",
    "workflowMl": "ആളെ കണ്ടെത്തുക → പണം വാങ്ങുക → രസീത് നൽകുക → ദിവസാവസാനം കണക്കെടുക്കുക.",
    "tipsEn": "For UPI payments, always record the 12-digit transaction UTR number before issuing the receipt.",
    "tipsMl": "GPay അല്ലെങ്കിൽ UPI വഴിയാണ് പണം തരുന്നതെങ്കിൽ ട്രാൻസാക്ഷൻ നമ്പർ സിസ്റ്റത്തിൽ അടിച്ചു കൊടുക്കുക.",
    "warningEn": "Reversing a receipt requires an Admin PIN and will leave an audit trail.",
    "warningMl": "അടിച്ച രസീത് ക്യാൻസൽ ചെയ്യണമെങ്കിൽ അഡ്മിൻ പിൻ വേണ്ടിവരും, അത് കണക്കുകളിൽ കാണിക്കുകയും ചെയ്യും.",
    "faqEn": [
      {
        "q": "Can multiple participants pay together?",
        "a": "Yes, select multiple rows in the participant list and click 'Bulk Payment'."
      }
    ],
    "faqMl": [
      {
        "q": "ഒരു ഗ്രൂപ്പിന്റെ പണം ഒന്നിച്ചു അടക്കാമോ?",
        "a": "അതെ, ലിസ്റ്റിൽ നിന്നും എല്ലാവരെയും സെലക്ട് ചെയ്ത് ഒറ്റ രസീത് ആയി നൽകാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Thermal printer not printing receipts",
        "fix": "Ensure the PDF is scaled to 80mm in your browser's print dialog."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ചെറിയ പ്രിന്ററിൽ നിന്നും രസീത് വരുന്നില്ല",
        "fix": "പ്രിന്റ് സെറ്റിംഗ്സിൽ പേപ്പർ സൈസ് 80mm ആയി സെറ്റ് ചെയ്തിട്ടുണ്ടോ എന്ന് നോക്കുക."
      }
    ]
  },
  "36": {
    "num": "36",
    "catEn": "Administration",
    "catMl": "രജിസ്ട്രേഷൻ",
    "titleEn": "Reception & Front Desk Registration Manual",
    "titleMl": "ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ മാനുവൽ",
    "overviewEn": "Standard operating procedures for front desk staff handling walk-in registrations, issuing passes, and answering queries.",
    "overviewMl": "ഫ്രണ്ട് ഡെസ്കിലുള്ളവർക്കുള്ള ഗൈഡ്; പുതിയ ആളുകളെ ചേർക്കുക, പാസുകൾ നൽകുക, സംശയങ്ങൾക്ക് മറുപടി നൽകുക.",
    "stepsEn": [
      "Step 1: Welcome contingents and ask for their pre-registration printouts.",
      "Step 2: Go to /participants and search for the school/group name.",
      "Step 3: Click 'Mark as Arrived' to check them into the festival campus.",
      "Step 4: Hand over the printed QR Badges and accommodation slips.",
      "Step 5: Direct them to their respective hostels or stages."
    ],
    "stepsMl": [
      "ഘട്ടം 1: വരുന്ന ടീമുകളോട് അവരുടെ രജിസ്ട്രേഷൻ പ്രിന്റൗട്ട് ചോദിക്കുക.",
      "ഘട്ടം 2: /participants പേജിൽ അവരുടെ സ്കൂൾ അല്ലെങ്കിൽ ഗ്രൂപ്പ് തിരയുക.",
      "ഘട്ടം 3: അവർ എത്തിയതായി രേഖപ്പെടുത്താൻ 'Mark as Arrived' ക്ലിക്ക് ചെയ്യുക.",
      "ഘട്ടം 4: അവർക്കുള്ള QR കാർഡുകളും റൂം സ്ലിപ്പുകളും നൽകുക.",
      "ഘട്ടം 5: അവർക്ക് പോകേണ്ട സ്ഥലത്തേക്കുള്ള വഴികൾ പറഞ്ഞുകൊടുക്കുക."
    ],
    "fields": [
      {
        "name": "Arrival Status",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Whether the team is on campus.",
        "descMl": "ടീം ഫെസ്റ്റിവലിൽ എത്തിയിട്ടുണ്ടോ."
      },
      {
        "name": "Kit Issued",
        "type": "Boolean",
        "req": "No",
        "descEn": "Welcome kit handed over.",
        "descMl": "കിറ്റുകൾ നൽകിയോ."
      }
    ],
    "workflowEn": "Receive Team → Search DB → Mark Arrived → Handover Badges → Provide Directions.",
    "workflowMl": "ടീമിനെ സ്വീകരിക്കുക → ഡാറ്റാബേസിൽ നോക്കുക → ഹാജർ രേഖപ്പെടുത്തുക → ഐഡി നൽകുക → വഴി കാണിക്കുക.",
    "tipsEn": "Keep pre-printed badges organized alphabetically in folders for rapid distribution.",
    "tipsMl": "ഐഡി കാർഡുകൾ അക്ഷരമാലാക്രമത്തിൽ ഫയലുകളിൽ വെച്ചാൽ എളുപ്പത്തിൽ എടുത്തുനൽകാം.",
    "warningEn": "Do not issue duplicate badges without verifying the team manager's identity.",
    "warningMl": "ടീം മാനേജർ ആരാണെന്ന് ഉറപ്പാക്കാതെ പുതിയ ഐഡി കാർഡുകൾ പ്രിന്റ് ചെയ്തു നൽകരുത്.",
    "faqEn": [
      {
        "q": "Can we do spot registrations?",
        "a": "Only if 'Allow Spot Registration' is enabled in Festival Settings by the admin."
      }
    ],
    "faqMl": [
      {
        "q": "പുതിയ ഒരാൾക്ക് അപ്പോൾ വന്ന് രജിസ്റ്റർ ചെയ്യാമോ?",
        "a": "അഡ്മിൻ 'Spot Registration' ഓൺ ആക്കി വെച്ചിട്ടുണ്ടെങ്കിൽ മാത്രമേ സാധിക്കൂ."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Team not found in system",
        "fix": "Check if they registered under a slightly different spelling or in a different category."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ടീമിന്റെ പേര് സിസ്റ്റത്തിൽ കാണുന്നില്ല",
        "fix": "സ്പെല്ലിങ് വ്യത്യാസമുണ്ടോ എന്നോ വേറെ കാറ്റഗറിയിലാണോ നൽകിയതെന്നോ പരിശോധിക്കുക."
      }
    ]
  },
  "37": {
    "num": "37",
    "catEn": "Emergency",
    "catMl": "എമർജൻസി",
    "titleEn": "Medical Team Emergency Response Protocol",
    "titleMl": "മെഡിക്കൽ ടീം എമർജൻസി പ്രോട്ടോക്കോൾ",
    "overviewEn": "Detailed guidelines for the medical staff on using the SOS app, logging treatments, and requesting ambulances.",
    "overviewMl": "മെഡിക്കൽ സ്റ്റാഫുകൾക്കുള്ള നിർദ്ദേശങ്ങൾ; SOS സിഗ്നലുകൾ സ്വീകരിക്കുക, ചികിത്സകൾ രേഖപ്പെടുത്തുക.",
    "stepsEn": [
      "Step 1: Keep the /medical dashboard open on your tablet at all times with sound on.",
      "Step 2: When a Red SOS flashes, immediately dispatch a responder to the specific stage mentioned.",
      "Step 3: After treating the patient, log the medical notes in the dashboard.",
      "Step 4: If hospital transfer is needed, click 'Call Ambulance' to alert transport volunteers.",
      "Step 5: Click 'Clear Stage Hold' to allow the stage manager to resume the event."
    ],
    "stepsMl": [
      "ഘട്ടം 1: നിങ്ങളുടെ ടാബ്‌ലെറ്റിൽ എപ്പോഴും /medical പേജ് തുറന്നുവെക്കുക (സൗണ്ട് ഓൺ ആയിരിക്കണം).",
      "ഘട്ടം 2: ചുവന്ന നിറത്തിൽ SOS വരുമ്പോൾ ഉടൻ തന്നെ ആ സ്റ്റേജിലേക്ക് ആളെ വിടുക.",
      "ഘട്ടം 3: പ്രഥമശുശ്രൂഷ നൽകിയ ശേഷം ആ വിവരങ്ങൾ ഡാഷ്‌ബോർഡിൽ ടൈപ്പ് ചെയ്തു വെക്കുക.",
      "ഘട്ടം 4: ആശുപത്രിയിലേക്ക് മാറ്റണമെങ്കിൽ 'Call Ambulance' ക്ലിക്ക് ചെയ്ത് വണ്ടി ഏർപ്പാടാക്കുക.",
      "ഘട്ടം 5: സ്റ്റേജിലെ പ്രശ്നങ്ങൾ മാറിയാൽ 'Clear Hold' കൊടുക്കുക, എങ്കിലേ മത്സരം തുടരാനാകൂ."
    ],
    "fields": [
      {
        "name": "Vitals Log",
        "type": "Text",
        "req": "No",
        "descEn": "Patient vitals and notes.",
        "descMl": "രോഗവിവരങ്ങൾ."
      },
      {
        "name": "Ambulance Req",
        "type": "Boolean",
        "req": "No",
        "descEn": "Hospital transport needed.",
        "descMl": "ആംബുലൻസ് ആവശ്യമുണ്ടോ."
      }
    ],
    "workflowEn": "Hear Alarm → Dispatch Team → Treat → Log Notes → Clear SOS Hold.",
    "workflowMl": "അലാം കേൾക്കുക → ആളെ വിടുക → ചികിത്സ നൽകുക → ലോഗ് ടൈപ്പ് ചെയ്യുക → ക്ലിയറൻസ് നൽകുക.",
    "tipsEn": "Prepare first-aid kits customized for dance stages (pain sprays, bandages, glucose).",
    "tipsMl": "ഡാൻസ് മത്സരങ്ങൾ നടക്കുന്ന സ്റ്റേജുകൾക്ക് അരികിൽ സ്പ്രേ, ബാൻഡേജ് എന്നിവ എപ്പോഴും കരുതുക.",
    "warningEn": "Failing to clear the Stage Hold will prevent the next candidate from performing.",
    "warningMl": "നിങ്ങൾ 'Clear Hold' കൊടുത്തില്ലെങ്കിൽ സ്റ്റേജ് മാനേജർക്ക് അടുത്ത മത്സരം തുടങ്ങാൻ സാധിക്കില്ല.",
    "faqEn": [
      {
        "q": "Do we keep records of medicines given?",
        "a": "Yes, it is legally recommended to log all OTC medicines administered in the system."
      }
    ],
    "faqMl": [
      {
        "q": "നൽകിയ മരുന്നുകളുടെ വിവരം സിസ്റ്റത്തിൽ വെക്കേണ്ടതുണ്ടോ?",
        "a": "അതെ, സുരക്ഷാ കാരണങ്ങളാൽ നൽകിയ മരുന്നുകളുടെ പേരുകൾ ലോഗിൽ ഉൾപ്പെടുത്തുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "SOS alert didn't clear",
        "fix": "Ensure you have filled in the mandatory 'Treatment Notes' field."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "SOS അലർട്ട് മാറുന്നില്ല",
        "fix": "'Treatment Notes' എന്ന കോളത്തിൽ എന്തെങ്കിലും ടൈപ്പ് ചെയ്യാത്തതുകൊണ്ടാണ്."
      }
    ]
  },
  "38": {
    "num": "38",
    "catEn": "Logistics",
    "catMl": "ലോജിസ്റ്റിക്സ്",
    "titleEn": "Storekeeper Equipment Inventory Audit Guide",
    "titleMl": "സ്റ്റോർകീപ്പർ ഇൻവെന്ററി ഗൈഡ്",
    "overviewEn": "A daily operational guide for the central storekeeper managing event materials, food stock, and electronics.",
    "overviewMl": "സ്റ്റോർ റൂം കൈകാര്യം ചെയ്യുന്നവർക്കുള്ള ഗൈഡ്; സാധനങ്ങൾ നൽകുക, സ്റ്റോക്ക് എണ്ണുക, കുറവുള്ളവ റിപ്പോർട്ട് ചെയ്യുക.",
    "stepsEn": [
      "Step 1: Start your day by checking /inventory for stock levels.",
      "Step 2: When someone requests items (e.g., 500 paper cups), scan their volunteer ID.",
      "Step 3: Enter the quantity issued in the system to deduct from central stock.",
      "Step 4: At end of day, perform a physical tally against the system's 'Expected Stock'.",
      "Step 5: Click 'Raise Indent' if critical items are running below minimum thresholds."
    ],
    "stepsMl": [
      "ഘട്ടം 1: /inventory പേജ് തുറന്ന് ഇന്നത്തെ സ്റ്റോക്കുകൾ പരിശോധിക്കുക.",
      "ഘട്ടം 2: ആരെങ്കിലും സാധനങ്ങൾ ചോദിച്ചു വന്നാൽ അവരുടെ ഐഡി സ്കാൻ ചെയ്യുക.",
      "ഘട്ടം 3: എത്ര സാധനം നൽകി എന്ന് സിസ്റ്റത്തിൽ എന്റർ ചെയ്യുക (അപ്പോൾ സ്റ്റോക്ക് കുറയും).",
      "ഘട്ടം 4: ഡ്യൂട്ടി തീരുമ്പോൾ സിസ്റ്റത്തിലെ കണക്കും ബാക്കിയുള്ള സാധനങ്ങളും തമ്മിൽ ഒത്തുനോക്കുക.",
      "ഘട്ടം 5: അത്യാവശ്യ സാധനങ്ങൾ തീരാറായെങ്കിൽ ഉടൻ തന്നെ 'Raise Indent' വഴി അഡ്മിനെ അറിയിക്കുക."
    ],
    "fields": [
      {
        "name": "Issued To",
        "type": "String",
        "req": "Yes",
        "descEn": "Person taking the item.",
        "descMl": "ആർക്കാണ് നൽകിയത്."
      },
      {
        "name": "Current Stock",
        "type": "Number",
        "req": "Yes",
        "descEn": "Remaining items.",
        "descMl": "ബാക്കിയുള്ള സ്റ്റോക്ക്."
      }
    ],
    "workflowEn": "Check Stock → Issue Item & Log → Tally End of Day → Raise Indent.",
    "workflowMl": "സ്റ്റോക്ക് നോക്കുക → സാധനം നൽകുക → എണ്ണുക → കുറവുകൾ അറിയിക്കുക.",
    "tipsEn": "Set minimum threshold alerts for water and food plates to automatically text organizers when low.",
    "tipsMl": "കുടിവെള്ളം, പ്ലേറ്റ് എന്നിവ തീരാറാകുമ്പോൾ തനിയെ മെസ്സേജ് പോകാനുള്ള സെറ്റിംഗ്സ് ഓൺ ആക്കുക.",
    "warningEn": "Never issue expensive electronic assets without logging the Receiver's ID.",
    "warningMl": "വിലപിടിപ്പുള്ള സാധനങ്ങൾ വാങ്ങാൻ വരുന്ന ആളുടെ ഐഡി സിസ്റ്റത്തിൽ വെക്കാതെ സാധനങ്ങൾ നൽകരുത്.",
    "faqEn": [
      {
        "q": "How to handle damaged returns?",
        "a": "Receive it into the system under the 'Damaged/Scrap' condition flag."
      }
    ],
    "faqMl": [
      {
        "q": "പൊട്ടിയ സാധനങ്ങൾ തിരികെ തന്നാൽ എന്ത് ചെയ്യും?",
        "a": "സിസ്റ്റത്തിൽ അത് തിരികെ എടുക്കുമ്പോൾ 'Damaged' എന്ന് സെലക്ട് ചെയ്യുക."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Negative stock error",
        "fix": "You forgot to 'Receive' a new purchase into the system before issuing it out."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "സ്റ്റോക്ക് മൈനസ് ആയി കാണിക്കുന്നു",
        "fix": "പുതിയതായി വാങ്ങിയ സാധനങ്ങൾ സിസ്റ്റത്തിൽ ആഡ് ചെയ്യാതെ മറ്റൊരാൾക്ക് നൽകിയതുകൊണ്ടാണ്."
      }
    ]
  },
  "39": {
    "num": "39",
    "catEn": "Help & Resources",
    "catMl": "പരിശീലനം",
    "titleEn": "2-Minute Video Tutorial Onboarding Scripts",
    "titleMl": "2-മിനിറ്റ് പരിശീലന വീഡിയോ സ്ക്രിപ്റ്റുകൾ",
    "overviewEn": "Scripts and outlines for creating quick video tutorials to train volunteers, stage managers, and judges.",
    "overviewMl": "വോളണ്ടിയർമാർക്കും ജഡ്ജിമാർക്കും പെട്ടെന്ന് കാര്യങ്ങൾ മനസ്സിലാക്കാൻ നൽകേണ്ട ചെറിയ ട്രെയിനിങ് വീഡിയോകളുടെ വിവരങ്ങൾ.",
    "stepsEn": [
      "Step 1: Navigate to the /training section in the app.",
      "Step 2: Select your role (e.g., 'I am a Judge').",
      "Step 3: Watch the short 2-minute video on how to use the tablet.",
      "Step 4: Take the 3-question quick quiz to unlock your actual dashboard.",
      "Step 5: Replay videos anytime from the Help icon."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ആപ്പിലെ /training പേജ് തുറക്കുക.",
      "ഘട്ടം 2: നിങ്ങളുടെ ഡ്യൂട്ടി എന്താണെന്ന് തിരഞ്ഞെടുക്കുക (ഉദാ: ഞാൻ ഒരു ജഡ്ജിയാണ്).",
      "ഘട്ടം 3: ടാബ്‌ലെറ്റ് എങ്ങനെ ഉപയോഗിക്കാം എന്നതിന്റെ 2-മിനിറ്റ് വീഡിയോ കാണുക.",
      "ഘട്ടം 4: അതിനുശേഷമുള്ള 3 ചെറിയ ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകിയാൽ ഡാഷ്‌ബോർഡ് തുറന്നുവരും.",
      "ഘട്ടം 5: സംശയം വന്നാൽ എപ്പോൾ വേണമെങ്കിലും ആ വീഡിയോ വീണ്ടും കാണാവുന്നതാണ്."
    ],
    "fields": [
      {
        "name": "Video Module",
        "type": "Video URL",
        "req": "Yes",
        "descEn": "Embedded YouTube/Vimeo link.",
        "descMl": "വീഡിയോ ലിങ്ക്."
      },
      {
        "name": "Completion Flag",
        "type": "Boolean",
        "req": "Yes",
        "descEn": "Did the user pass the quiz?",
        "descMl": "വീഡിയോ കണ്ടു തീർത്തോ."
      }
    ],
    "workflowEn": "Open Training → Watch Video → Answer Quiz → Unlock Access.",
    "workflowMl": "ട്രെയിനിങ് തുറക്കുക → വീഡിയോ കാണുക → ചോദ്യങ്ങൾക്ക് ഉത്തരം നൽകുക → അക്കൗണ്ട് അൺലോക്ക് ആകുക.",
    "tipsEn": "Subtitles are available in both English and Malayalam for all video tutorials.",
    "tipsMl": "എല്ലാ വീഡിയോകൾക്കും താഴെ മലയാളത്തിലും ഇംഗ്ലീഷിലും എഴുതിക്കാണിക്കുന്നതാണ് (Subtitles).",
    "warningEn": "Skipping the video will prevent you from accessing the judge console.",
    "warningMl": "വീഡിയോ കാണാതെ സ്കിപ്പ് ചെയ്താൽ ജഡ്ജിങ് പാനലിലേക്ക് പ്രവേശിക്കാൻ സാധിക്കില്ല.",
    "faqEn": [
      {
        "q": "Can I watch the videos offline?",
        "a": "Yes, if you installed the PWA, the videos are cached on your device."
      }
    ],
    "faqMl": [
      {
        "q": "നെറ്റ് ഇല്ലാതെ വീഡിയോ കാണാമോ?",
        "a": "അതെ, PWA ആപ്പ് ഫോണിൽ ഇൻസ്റ്റാൾ ചെയ്തവർക്ക് നെറ്റ് ഇല്ലാതെയും വീഡിയോ പ്ലേ ആകും."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Video buffering endlessly",
        "fix": "Switch video quality to 360p or connect to the venue WiFi."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "വീഡിയോ പ്ലേ ആകുന്നില്ല",
        "fix": "വീഡിയോയുടെ ക്വാളിറ്റി 360p ആക്കി കുറയ്ക്കുക അല്ലെങ്കിൽ സ്റ്റേജിലെ വൈഫൈ ഉപയോഗിക്കുക."
      }
    ]
  },
  "40": {
    "num": "40",
    "catEn": "Help & Resources",
    "catMl": "സഹായം",
    "titleEn": "In-App Help Center Portal Operations Manual",
    "titleMl": "ഹെൽപ്പ് സെന്റർ പോർട്ടൽ മാനുവൽ",
    "overviewEn": "Manage the built-in knowledge base, update articles, and provide self-service tools for platform users.",
    "overviewMl": "ഫെസ്റ്റ്പ്രോയുമായി ബന്ധപ്പെട്ട എല്ലാ ലേഖനങ്ങളും വിവരങ്ങളും അപ്‌ഡേറ്റ് ചെയ്യാനും നിയന്ത്രിക്കാനുമുള്ള മാനുവൽ.",
    "stepsEn": [
      "Step 1: Go to /admin/helpcenter to manage articles.",
      "Step 2: Use the WYSIWYG editor to write new guides or update existing ones.",
      "Step 3: Tag articles (e.g., #billing, #judging) for easy searchability.",
      "Step 4: Click 'Publish' to make the article live on the public and staff portals.",
      "Step 5: Review analytics to see which help articles are read the most."
    ],
    "stepsMl": [
      "ഘട്ടം 1: ആർട്ടിക്കിളുകൾ എഴുതാൻ /admin/helpcenter പേജ് തുറക്കുക.",
      "ഘട്ടം 2: അവിടെയുള്ള എഡിറ്റർ ഉപയോഗിച്ച് പുതിയ ഗൈഡുകൾ ടൈപ്പ് ചെയ്യുകയോ മാറ്റങ്ങൾ വരുത്തുകയോ ചെയ്യാം.",
      "ഘട്ടം 3: പെട്ടെന്ന് സെർച്ച് ചെയ്യാൻ എളുപ്പത്തിന് ടാഗുകൾ (ഉദാ: #judging) നൽകുക.",
      "ഘട്ടം 4: 'Publish' ക്ലിക്ക് ചെയ്താൽ അത് എല്ലാവർക്കും വായിക്കാൻ സാധിക്കുന്നതാണ്.",
      "ഘട്ടം 5: ഏതു ലേഖനമാണ് കൂടുതൽ പേർ വായിച്ചതെന്ന് അനലിറ്റിക്‌സ് വഴി അറിയാം."
    ],
    "fields": [
      {
        "name": "Article Title",
        "type": "String",
        "req": "Yes",
        "descEn": "Heading of the guide.",
        "descMl": "ലേഖനത്തിന്റെ തലക്കെട്ട്."
      },
      {
        "name": "Tags",
        "type": "Array",
        "req": "No",
        "descEn": "Keywords for search.",
        "descMl": "തിരയാനുള്ള ടാഗുകൾ."
      }
    ],
    "workflowEn": "Write Article → Add Tags → Publish → Analyze Readership → Update.",
    "workflowMl": "എഴുതുക → ടാഗ് നൽകുക → പബ്ലിഷ് ചെയ്യുക → വായനക്കാരുടെ എണ്ണം നോക്കുക → അപ്‌ഡേറ്റ് ചെയ്യുക.",
    "tipsEn": "Include screenshots and GIFs in your articles; users understand visuals faster than text.",
    "tipsMl": "ലേഖനങ്ങളിൽ സ്ക്രീൻഷോട്ടുകളോ ചെറിയ അനങ്ങുന്ന ചിത്രങ്ങളോ (GIF) ഉൾപ്പെടുത്തിയാൽ പെട്ടെന്ന് മനസ്സിലാകും.",
    "warningEn": "Ensure articles are translated into Malayalam before publishing globally.",
    "warningMl": "ലേഖനം പബ്ലിഷ് ചെയ്യുന്നതിന് മുൻപ് അത് മലയാളത്തിലേക്ക് കൂടി നൽകാൻ മറക്കരുത്.",
    "faqEn": [
      {
        "q": "Can users comment on help articles?",
        "a": "Yes, they can rate it 'Helpful' or 'Not Helpful' to give feedback."
      }
    ],
    "faqMl": [
      {
        "q": "വായിക്കുന്നവർക്ക് അഭിപ്രായം രേഖപ്പെടുത്താമോ?",
        "a": "അതെ, അവർക്ക് അത് ഉപകാരപ്പെട്ടോ ഇല്ലയോ എന്ന് റേറ്റിംഗ് നൽകാവുന്നതാണ്."
      }
    ],
    "troubleshootEn": [
      {
        "issue": "Images not loading in article",
        "fix": "Ensure image files are compressed below 1MB before uploading."
      }
    ],
    "troubleshootMl": [
      {
        "issue": "ലേഖനത്തിലെ ഫോട്ടോകൾ ലോഡ് ആകുന്നില്ല",
        "fix": "ഫോട്ടോയുടെ സൈസ് 1MB യിൽ താഴെയാണെന്ന് ഉറപ്പുവരുത്തിയ ശേഷം അപ്‌ലോഡ് ചെയ്യുക."
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
