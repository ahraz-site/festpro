"use client"

import { useState } from "react"
import {
  BookOpen, Search, Sparkles, Server, Shield, Trophy, Users,
  CheckCircle2, ArrowRight, Layers, FileText, Lock, AlertTriangle, HelpCircle,
  Video, Play, Terminal, ChevronRight, Activity, Cpu, Globe, LifeBuoy,
  MessageSquare, Compass, Award, ExternalLink, Zap, RefreshCw, Bookmark, Home,
  Check, ArrowLeft, Filter, Info
} from "lucide-react"

// ────────────────────────────────────────────
// DETAILED BILINGUAL MODULE DOCUMENTATION CONTENT
// ────────────────────────────────────────────

const DETAILED_MODULE_DOCS: Record<string, {
  titleEn: string
  titleMl: string
  num: string
  catEn: string
  catMl: string
  overviewEn: string
  overviewMl: string
  stepsEn: string[]
  stepsMl: string[]
  fields: { name: string; type: string; req: string; descEn: string; descMl: string }[]
  workflowEn: string
  workflowMl: string
  tipsEn: string
  tipsMl: string
  warningEn: string
  warningMl: string
  faqEn: { q: string; a: string }[]
  faqMl: { q: string; a: string }[]
  troubleshootEn: { issue: string; fix: string }[]
  troubleshootMl: { issue: string; fix: string }[]
}> = {
  "01": {
    num: "01",
    catEn: "Core Engine",
    catMl: "പ്രധാന സിസ്റ്റം",
    titleEn: "Getting Started & Complete Platform Lifecycle Guide",
    titleMl: "ആരംഭിക്കാം & സമ്പൂർണ്ണ സിസ്റ്റം ഓപ്പറേഷൻ ഗൈഡ്",
    overviewEn: "This master onboarding guide provides an exhaustive, step-by-step walkthrough for Organization Owners and Festival Directors to configure institutions, create Groups / Houses / Units, setup age categories, import participants via CSV, generate QR ID badges, construct drag-and-drop stage timelines, execute double-blind digital judge evaluations, tabulate grade points, and publish live multi-channel leaderboards.",
    overviewMl: "മുൻപരിചയമില്ലാത്തവർക്ക് പോലും സ്വയം പഠിച്ച് സിസ്റ്റം സജ്ജീകരിക്കാനുള്ള സമ്പൂർണ്ണ ഒഫീഷ്യൽ ഗൈഡ്. അക്കൗണ്ട് രജിസ്ട്രേഷൻ, ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് നിർമ്മാണം, മത്സരങ്ങൾ, മത്സരാർത്ഥികളുടെ പ്രവേശനവും QR കാർഡും, ഡ്രാഗ് ആൻഡ് ഡ്രോപ്പ് ഷെഡ്യൂളിംഗ്, ജഡ്ജിംഗ് കോൺസോൾ, ഗ്രേഡ് പോയിന്റ് കാൽക്കുലേഷൻ, ലൈവ് ഫലപ്രഖ്യാപനം എന്നിവ അടങ്ങിയ സമഗ്ര മാർഗ്ഗരേഖ.",
    stepsEn: [
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
    stepsMl: [
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
    fields: [
      { name: "Organization Title", type: "String", req: "Yes", descEn: "Official name of the institution.", descMl: "സ്ഥാപനത്തിന്റെ ഔദ്യോഗിക പേര്." },
      { name: "Org Short Code", type: "String (3-5 chars)", req: "Yes", descEn: "Prefix used for candidate chest numbers (e.g., SJHSS).", descMl: "ചെസ്റ്റ് നമ്പറുകൾക്ക് മുന്നിൽ വരുന്ന കോഡ് (e.g., SJHSS)." },
      { name: "Group / House / Unit Name", type: "String", req: "Yes", descEn: "Contingent house or unit identifier (e.g., Red House, Blue Group).", descMl: "ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റിന്റെ പേര് (e.g., റെഡ് ഹൗസ്, ബ്ലൂ ഗ്രൂപ്പ്)." },
      { name: "Primary Contact Email", type: "Email", req: "Yes", descEn: "Admin email address for OTP PIN delivery.", descMl: "അഡ്മിൻ ഇമെയിൽ വിലാസം." }
    ],
    workflowEn: "Sign Up → Verify Email OTP → Add Group / House / Unit → Register Program → Import Candidates → Drag Schedule to Stage → Score on Tablet → Publish Live Results.",
    workflowMl: "സൈൻ അപ്പ് → ഇമെയിൽ OTP → ഗ്രൂപ്പ് / ഹൗസ് / യൂണിറ്റ് → മത്സരം നിർമ്മിക്കുക → മത്സരാർത്ഥികൾ → സ്റ്റേജ് ഷെഡ്യൂൾ → ടാബ്‌ലെറ്റിൽ മാർക്കിടൽ → ലൈവ് റിസൾട്ട്.",
    tipsEn: "Use the built-in CSV template when importing candidates to automatically validate candidate age eligibility across categories.",
    tipsMl: "മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ ചേർക്കുമ്പോൾ തന്നിട്ടുള്ള CSV ടെംപ്ലേറ്റ് ഉപയോഗിച്ചാൽ പ്രായപരിധി സിസ്റ്റം സ്വയം പരിശോധിക്കും.",
    warningEn: "Do not delete programs once stage evaluation has commenced; this locks scorecards to preserve audit trails.",
    warningMl: "മാർക്കിടൽ ആരംഭിച്ച മത്സരങ്ങൾ ഡിലീറ്റ് ചെയ്യരുത്; ഇത് മാർക്ക് ഷീറ്റുകൾ ലോക്ക് ചെയ്യുന്നതാണ്.",
    faqEn: [
      { q: "Can I use FestPro without an internet connection on stage?", a: "Yes. FestPro Judge Consoles cache marksheets in IndexedDB and automatically re-sync when WiFi is reconnected." },
      { q: "How are candidate chest numbers kept confidential?", a: "FestPro generates randomized Code Letters (e.g., Chest 102 → Letter K) so judges score without knowing candidate names or schools." }
    ],
    faqMl: [
      { q: "ഇന്റർനെറ്റ് ഇല്ലാതെ ടാബ്‌ലെറ്റിൽ മാർക്കിടാൻ സാധിക്കുമോ?", a: "അതെ. നെറ്റ് പോയാലും മാർക്കുകൾ ടാബ്‌ലെറ്റിൽ സേവ് ആവുകയും നെറ്റ് വരുമ്പോൾ തന്നത്താൻ സിങ്ക് ആവുകയും ചെയ്യും." },
      { q: "ജഡ്ജിമാർക്ക് മത്സരാർത്ഥികളെ എങ്ങനെയാണ് തിരിഞ്ഞുപോകാതിരിക്കുന്നത്?", a: "ചെസ്റ്റ് നമ്പറിന് പകരം സിസ്റ്റം നൽകുന്ന റാൻഡം കോഡ് ലെറ്ററുകൾ (e.g. Chest 102 → Letter K) വഴിയാണ് മാർക്കിടുന്നത്." }
    ],
    troubleshootEn: [
      { issue: "Invalid 6-Digit Email OTP PIN", fix: "Click 'Resend PIN Token' and check your spam/junk folder for the code." },
      { issue: "Candidate age out of range error", fix: "Verify birth date under Participant Settings or adjust category age boundaries under /competitions/categories." }
    ],
    troubleshootMl: [
      { issue: "OTP കോഡ് ലഭിച്ചില്ല", fix: "'Resend PIN Code' ക്ലിക്ക് ചെയ്ത് ഇമെയിലിലെ സ്പാം (Spam) ഫോൾഡർ പരിശോധിക്കുക." },
      { issue: "മത്സരാർത്ഥിയുടെ വയസ്സ് തെറ്റാണ് എന്ന എറർ", fix: "മത്സരാർത്ഥിയുടെ ജനനതീയതിയോ കാറ്റഗറിയുടെ പ്രായപരിധിയോ പരിശോധിക്കുക." }
    ]
  },
  "02": {
    num: "02",
    catEn: "Administration",
    catMl: "അഡ്മിനിസ്ട്രേഷൻ",
    titleEn: "Organization Administration, Custom Domains & SMTP Guide",
    titleMl: "ഓർഗനൈസേഷൻ സെറ്റിംഗ്സ്, ഡൊമെയ്ൻ & SMTP ഗൈഡ്",
    overviewEn: "Configure multi-tenant isolation settings, custom white-label branding, CNAME domain mapping, SMTP mail gateway deliverability, and Role-Based Access Control (RBAC) permissions.",
    overviewMl: "നിങ്ങളുടെ സ്ഥാപനത്തിന്റെ ലോഗോ, ബ്രാൻഡിംഗ് നിറങ്ങൾ, സ്വന്തം വെബ്‌സൈറ്റ് ഡൊമെയ്ൻ (CNAME), ഇമെയിൽ സെറ്റിംഗ്സുകൾ (SMTP), സ്റ്റാഫുകളുടെ അധികാരം എന്നിവ ക്രമീകരിക്കാനുള്ള ഗൈഡ്.",
    stepsEn: [
      "1. Navigate to /dashboard/organization/[orgId]/settings.",
      "2. Upload your high-resolution PNG brand logo and set primary theme hex colors.",
      "3. Configure Custom Domain: Enter your custom domain (e.g., kalotsavam.stjosephs.edu.in) and add CNAME record pointing to cname.festpro.app.",
      "4. Setup Custom SMTP Gateway: Input Host, Port (587), Username, Password, and From Email address to send branded notification emails.",
      "5. Invite Staff Members: Navigate to /members, enter staff emails, and assign roles (Org Admin, Festival Director, Tabulator, Stage Manager, Judge)."
    ],
    stepsMl: [
      "1. /dashboard/organization/[orgId]/settings പേജിലേക്ക് പോവുക.",
      "2. സ്ഥാപനത്തിന്റെ ലോഗോ അപ്‌ലോഡ് ചെയ്ത് കളർ തീം സെറ്റ് ചെയ്യുക.",
      "3. കസ്റ്റം ഡൊമെയ്ൻ: നിങ്ങളുടെ സ്വന്തം വെബ്‌സൈറ്റ് (e.g. kalotsavam.stjosephs.edu.in) നൽകി CNAME റെക്കോർഡ് cname.festpro.app-ലേക്ക് പോയിന്റ് ചെയ്യുക.",
      "4. കസ്റ്റം SMTP: ഇമെയിലുകൾ സ്വന്തം വിലാസത്തിൽ നിന്ന് അയക്കാൻ SMTP വിവരങ്ങൾ നൽകുക.",
      "5. സ്റ്റാഫുകളെ ചേർക്കുക: /members പേജ് വഴി മറ്റു അധ്യാപകർക്കും സ്റ്റാഫുകൾക്കും വോളണ്ടിയർമാർക്കും ലോഗിൻ അനുമതി നൽകുക."
    ],
    fields: [
      { name: "Custom CNAME Domain", type: "Domain String", req: "No", descEn: "Custom website domain for white-labeling.", descMl: "നിങ്ങളുടെ സ്വന്തം വെബ്‌സൈറ്റ് വിലാസം." },
      { name: "SMTP Host Server", type: "Hostname", req: "No", descEn: "Outgoing mail server address (e.g., smtp.gmail.com).", descMl: "മെയിൽ സെർവർ വിലാസം." },
      { name: "Default Timezone", type: "Timezone String", req: "Yes", descEn: "Regional timezone for schedule timestamps (e.g. Asia/Kolkata).", descMl: "സമയമേഖല (e.g. Asia/Kolkata)." }
    ],
    workflowEn: "Set Branding → Add Domain CNAME → Verify SSL Certificate → Configure SMTP → Invite Members & Assign Roles.",
    workflowMl: "ബ്രാൻഡിംഗ് → ഡൊമെയ്ൻ CNAME → SSL വാലിഡേഷൻ → SMTP സെറ്റിംഗ്സ് → അംഗങ്ങളെ ക്ഷണിക്കൽ.",
    tipsEn: "Always send a test email after configuring custom SMTP settings to verify SPF/DKIM deliverability.",
    tipsMl: "SMTP സജ്ജീകരിച്ച ശേഷം ഒരു ടെസ്റ്റ് ഇമെയിൽ അയച്ചു നോക്കുന്നത് മെയിലുകൾ സ്പാമിൽ പോകുന്നത് തടയും.",
    warningEn: "Changing Organization Code after issuing candidate IDs will corrupt existing QR badges.",
    warningMl: "മത്സരാർത്ഥികൾക്ക് ചെസ്റ്റ് നമ്പർ നൽകിയ ശേഷം ഓർഗനൈസേഷൻ കോഡ് മാറ്റരുത്.",
    faqEn: [
      { q: "Can we use our school domain name for the festival website?", a: "Yes. Add a CNAME DNS record pointing your subdomain to cname.festpro.app and FestPro automatically issues a free SSL certificate." }
    ],
    faqMl: [
      { q: "ഞങ്ങളുടെ സ്കൂളിന്റെ വെബ്‌സൈറ്റ് വിലാസത്തിൽ ഫെസ്റ്റിവൽ നടത്താമോ?", a: "അതെ. CNAME DNS മാപ്പ് ചെയ്താൽ സിസ്റ്റം സൗജന്യമായി SSL സർട്ടിഫിക്കറ്റോടെ വെബ്‌സൈറ്റ് ഒരുക്കി നൽകും." }
    ],
    troubleshootEn: [
      { issue: "DNS CNAME Verification Pending", fix: "DNS propagation takes up to 24 hours. Verify records using dig or Google DNS Lookup." }
    ],
    troubleshootMl: [
      { issue: "CNAME വെരിഫിക്കേഷൻ പെൻഡിംഗ് കാണിക്കുന്നു", fix: "DNS അപ്‌ഡേറ്റ് ആകാൻ 24 മണിക്കൂർ വരെ സമയമെടുക്കാം; DNS Lookup ഉപയോഗിച്ച് പരിശോധിക്കുക." }
    ]
  },
  "03": {
    num: "03",
    catEn: "Festival Lifecycle",
    catMl: "ഫെസ്റ്റിവൽ മാനേജ്‌മെന്റ്",
    titleEn: "Festival Management, Stages & Venue Registration Guide",
    titleMl: "ഫെസ്റ്റിവൽ നിർമ്മാണം, സ്റ്റേജ് & വേദി സജ്ജീകരണ ഗൈഡ്",
    overviewEn: "Create and manage festival workspaces, define venue layouts, add stages, assign stage managers, set age categories, and manage the event lifecycle from draft to archived state.",
    overviewMl: "ഫെസ്റ്റിവൽ ഉണ്ടാക്കുക, വേദികളും സ്റ്റേജുകളും തരംതിരിക്കുക, സ്റ്റേജ് മാനേജർമാരെ ചുമതലപ്പെടുത്തുക, പ്രായപരിധികൾ നിശ്ചയിക്കുക എന്നിവയ്ക്കുള്ള മാർഗ്ഗരേഖ.",
    stepsEn: [
      "1. Navigate to /dashboard/organization/[orgId]/festivals/create.",
      "2. Enter Festival Title, Slug, Start Date, End Date, and Main Venue Location.",
      "3. Setup Stages under /stages (e.g., Stage 1 Auditorium, Stage 2 Open Air Theatre). Assign Stage Managers to each stage.",
      "4. Configure Competition Categories under /competitions/categories (Sub-Junior, Junior, Senior, General).",
      "5. Set Program Rules & Scoring Rubrics for Single and Group items."
    ],
    stepsMl: [
      "1. /dashboard/organization/[orgId]/festivals/create പേജിലേക്ക് പോവുക.",
      "2. ഫെസ്റ്റിവലിന്റെ പേര്, തീയതികൾ, വേദി എന്നിവ നൽകുക.",
      "3. /stages പേജ് വഴി സ്റ്റേജുകൾ (e.g. സ്റ്റേജ് 1 ഒഡിറ്റോറിയം, സ്റ്റേജ് 2 ഓപ്പൺ എയർ) നിർമ്മിച്ച് സ്റ്റേജ് ഇൻചാർജുകളെ നിയോഗിക്കുക.",
      "4. /competitions/categories വഴി കാറ്റഗറികൾ (സബ് ജൂനിയർ, ജൂനിയർ, സീനിയർ) നിർമ്മിക്കുക.",
      "5. മത്സര നിയമങ്ങളും ഗ്രേഡ് പോയിന്റുകളും സജ്ജമാക്കുക."
    ],
    fields: [
      { name: "Festival Title", type: "String", req: "Yes", descEn: "Name of the cultural event.", descMl: "ഫെസ്റ്റിവലിന്റെ പേര്." },
      { name: "Stage Capacity", type: "Integer", req: "No", descEn: "Seating capacity of the venue.", descMl: "വേദിയുടെ ഇരിപ്പിട ശേഷി." }
    ],
    workflowEn: "Create Festival → Add Stages → Assign Stage Managers → Setup Categories → Launch Event.",
    workflowMl: "ഫെസ്റ്റിവൽ ഉണ്ടാക്കുക → സ്റ്റേജുകൾ ചേർക്കുക → മാനേജർമാർ → കാറ്റഗറികൾ → ഇവന്റ് ലൈവ്.",
    tipsEn: "Assign individual stage managers to specific stages so they can scan candidate passes at call-rooms.",
    tipsMl: "ഓരോ സ്റ്റേജിനും പ്രത്യേകം സ്റ്റേജ് മാനേജർമാരെ നൽകിയാൽ കാൾ റൂം ക്യുആർ ചെക്കിൻ വളരെ എളുപ്പമാകും.",
    warningEn: "Archiving a festival locks all scorecards in read-only mode.",
    warningMl: "ഫെസ്റ്റിവൽ ആർക്കൈവ് ചെയ്താൽ മാർക്ക് ഷീറ്റുകൾ തിരുത്താൻ സാധിക്കില്ല.",
    faqEn: [
      { q: "How many stages can we manage simultaneously?", a: "FestPro supports unlimited simultaneous stages with real-time multi-stage collision detection." }
    ],
    faqMl: [
      { q: "ഒരേസമയം എത്ര സ്റ്റേജുകൾ വരെ നിയന്ത്രിക്കാം?", a: "എത്ര സ്റ്റേജുകൾ വേണമെങ്കിലും ഒരേസമയം നിയന്ത്രിക്കാം; സമയതടസ്സങ്ങൾ സിസ്റ്റം മുൻകൂട്ടി മുന്നറിയിപ്പ് തരും." }
    ],
    troubleshootEn: [
      { issue: "Stage conflict alert on scheduling", fix: "Adjust stage start time or move program to another available stage." }
    ],
    troubleshootMl: [
      { issue: "ഷെഡ്യൂൾ ചെയ്യുമ്പോൾ സമയതടസ്സം (Conflict) കാണിക്കുന്നു", fix: "പ്രോഗ്രാമിന്റെ സമയം മാറ്റുകയോ മറ്റൊരു സ്റ്റേജിലേക്ക് മാറ്റുകയോ ചെയ്യുക." }
    ]
  }
}

// Default fallback generator for remaining 37 modules
function getModuleData(num: string, isMl: boolean) {
  if (DETAILED_MODULE_DOCS[num]) {
    const d = DETAILED_MODULE_DOCS[num]
    return {
      num: d.num,
      title: isMl ? d.titleMl : d.titleEn,
      cat: isMl ? d.catMl : d.catEn,
      overview: isMl ? d.overviewMl : d.overviewEn,
      steps: isMl ? d.stepsMl : d.stepsEn,
      fields: d.fields,
      workflow: isMl ? d.workflowMl : d.workflowEn,
      tips: isMl ? d.tipsMl : d.tipsEn,
      warning: isMl ? d.warningMl : d.warningEn,
      faq: isMl ? d.faqMl : d.faqEn,
      troubleshoot: isMl ? d.troubleshootMl : d.troubleshootEn
    }
  }

  // Fallback for modules 04 to 40
  return {
    num,
    title: isMl ? `മോഡ്യൂൾ ${num} സവിശേഷതകളും മാർഗ്ഗരേഖയും` : `Module ${num} Operational Guide & Reference`,
    cat: isMl ? "സിസ്റ്റം മോഡ്യൂൾ" : "System Module",
    overview: isMl
      ? `FestPro എന്റർപ്രൈസ് SaaS പ്ലാറ്റ്‌ഫോമിലെ മോഡ്യൂൾ ${num}-ന്റെ വിശദമായ പ്രവർത്തന ഘടനയും അഡ്മിനിസ്‌ട്രേഷൻ ഗൈഡും.`
      : `Complete operational manual, data schema, workflow transitions, and troubleshooting matrix for Module ${num} in FestPro Enterprise SaaS Platform.`,
    steps: isMl ? [
      "1. നിയോഗിക്കപ്പെട്ട അഡ്മിൻ അല്ലെങ്കിൽ സ്റ്റാഫ് അക്കൗണ്ട് വഴി ലോഗിൻ ചെയ്യുക.",
      "2. അതാത് മോഡ്യൂൾ ഡാഷ്‌ബോർഡ് ഓപ്പൺ ചെയ്ത് ക്രമീകരണങ്ങൾ തിരുത്തുക.",
      "3. ക്യുആർ കാർഡ് സ്കാനിംഗും വാലിഡേഷനും നടപ്പിലാക്കുക.",
      "4. തത്സമയ റിപ്പോർട്ടുകൾ പരിശോധിച്ച് പ്രസിദ്ധീകരിക്കുക."
    ] : [
      "1. Authenticate with an authorized role account.",
      "2. Access the module dashboard and verify operational flags.",
      "3. Execute actions using the standard workflow buttons.",
      "4. Review real-time analytics and export audit logs."
    ],
    fields: [
      { name: "Module ID", type: "UUIDv4", req: "Yes", descEn: "System identifier.", descMl: "സിസ്റ്റം തിരിച്ചറിയൽ ഐഡി." },
      { name: "Status Flag", type: "Enum", req: "Yes", descEn: "Current operational state.", descMl: "നിലവിലെ പ്രവർത്തന നില." }
    ],
    workflowEn: "Initialize → Process → Validate → Publish → Archive",
    workflowMl: "ആരംഭിക്കുക → പ്രോസസ് ചെയ്യുക → പരിശോധിക്കുക → പ്രസിദ്ധീകരിക്കുക → ആർക്കൈവ്",
    tipsEn: "Always test this workflow on a staging festival before going live.",
    tipsMl: "തത്സമയ ഇവന്റിന് മുൻപായി ഒരു ട്രയൽ ഫെസ്റ്റിവലിൽ പരീക്ഷിച്ചു നോക്കുക.",
    warningEn: "Ensure proper role permissions are granted before executing administrative overrides.",
    warningMl: "അഡ്മിൻ മാറ്റങ്ങൾ വരുത്തുന്നതിന് മുൻപ് ശരിയായ അനുമതികൾ ഉണ്ടെന്ന് ഉറപ്പുവരുത്തുക.",
    faqEn: [
      { q: `How does Module ${num} integrate with the live leaderboard?`, a: "All state updates trigger immediate Supabase Realtime WebSocket broadcasts to stage LED screens." }
    ],
    faqMl: [
      { q: `ഈ മോഡ്യൂൾ ലൈവ് റിസൾട്ടുമായി എങ്ങനെ ബന്ധപ്പെട്ടിരിക്കുന്നു?`, a: "എല്ലാ വിവരങ്ങളും വെബ്‌സോക്കറ്റ് വഴി സ്റ്റേജ് സ്ക്രീനുകളിൽ തത്സമയം തെളിയുന്നതാണ്." }
    ],
    troubleshootEn: [
      { issue: "Permission denied error", fix: "Verify role capabilities under Organization Settings -> RBAC." }
    ],
    troubleshootMl: [
      { issue: "അനുമതിയില്ല (Permission Denied) എന്ന എറർ", fix: "അംഗത്തിന്റെ റോൾ സെറ്റിംഗ്സ് പരിശോധിക്കുക." }
    ]
  }
}

const SYSTEM_MODULES_LIST = [
  { num: "01", en: "Getting Started Guide", ml: "ആരംഭിക്കാം (Getting Started)" },
  { num: "02", en: "Organization Admin", ml: "ഓർഗനൈസേഷൻ ഗൈഡ്" },
  { num: "03", en: "Festival Management", ml: "ഫെസ്റ്റിവൽ മാനേജ്‌മെന്റ്" },
  { num: "04", en: "Competition Registry", ml: "മത്സര ഇനങ്ങൾ (Competition)" },
  { num: "05", en: "Participant Enrollment", ml: "മത്സരാർത്ഥികൾ (Participants)" },
  { num: "06", en: "Stage Schedule Builder", ml: "സ്റ്റേജ് ഷെഡ്യൂൾ (Schedule)" },
  { num: "07", en: "Judge Console", ml: "ഡിജിറ്റൽ ജഡ്ജ് കോൺസോൾ" },
  { num: "08", en: "Results & Tabulation", ml: "ഫലപ്രഖ്യാപനവും ടാബുലേഷനും" },
  { num: "09", en: "E-Certificate Generator", ml: "ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റുകൾ" },
  { num: "10", en: "Finance & Receipts", ml: "ധനകാര്യവും രസീതുകളും" },
  { num: "11", en: "Volunteer Management", ml: "വോളണ്ടിയർ ഡ്യൂട്ടികൾ" },
  { num: "12", en: "Help Desk Support", ml: "ഹെൽപ്പ് ഡെസ്ക് (Support)" },
  { num: "13", en: "Inventory Assets", ml: "ഇൻവെന്ററി & സ്റ്റേജ് സാമഗ്രികൾ" },
  { num: "14", en: "Accommodation Hostel", ml: "താമസം (Accommodation)" },
  { num: "15", en: "Food Catering Coupons", ml: "ഭക്ഷണ കൂപ്പണുകൾ (Food)" },
  { num: "16", en: "Medical First Aid", ml: "മെഡിക്കൽ & പ്രഥമശുശ്രൂഷ" },
  { num: "17", en: "Notifications Gateway", ml: "അറിയിപ്പുകൾ (Notifications)" },
  { num: "18", en: "Public Event Website", ml: "പൊതുജന പോർട്ടൽ (Public Site)" },
  { num: "19", en: "Mobile App PWA", ml: "മൊബൈൽ ആപ്പ് (Mobile App)" },
  { num: "20", en: "SaaS Subscriptions", ml: "SaaS വരിസംഖ്യ (Subscriptions)" },
  { num: "21", en: "AI Schedule Optimizer", ml: "AI അസിസ്റ്റന്റും ഒപ്റ്റിമൈസറും" },
  { num: "22", en: "Real-Time Analytics", ml: "തത്സമയ വിശകലനം (Analytics)" },
  { num: "23", en: "REST API & Webhooks", ml: "REST API & ഡെവലപ്പർ ടൂളുകൾ" },
  { num: "24", en: "Security & OWASP", ml: "സുരക്ഷ (Security & RLS)" },
  { num: "25", en: "Database Backup", ml: "ഡാറ്റാ ബാക്കപ്പ് (Backup)" },
  { num: "26", en: "Telemetry Monitoring", ml: "സിസ്റ്റം ഹെൽത്ത് നിരീക്ഷണം" },
  { num: "27", en: "Localization & i18n", ml: "ഭാഷാ സഹായം (Localization)" },
  { num: "28", en: "Documents PDF Engine", ml: "ഔദ്യോഗിക ഡോക്യുമെന്റുകൾ" },
  { num: "29", en: "DevOps Deployments", ml: "DevOps & എഡ്ജ് നെറ്റ്വർക്ക്" },
  { num: "30", en: "Troubleshooting Guide", ml: "തടസ്സപരിഹാരം (Troubleshooting)" },
  { num: "31", en: "Frequently Asked Questions", ml: "ചോദ്യോത്തരങ്ങൾ (FAQ)" },
  { num: "32", en: "Administrator Manual", ml: "അഡ്മിനിസ്ട്രേറ്റർ ഗൈഡ്" },
  { num: "33", en: "Judge Tablet Manual", ml: "ജഡ്ജസ് ഗൈഡ് (Judge Manual)" },
  { num: "34", en: "Volunteer Field Guide", ml: "വോളണ്ടിയർ ഗൈഡ്" },
  { num: "35", en: "Finance Treasurer Manual", ml: "ട്രഷറർ & ഫിനാൻസ് ഗൈഡ്" },
  { num: "36", en: "Reception Desk Guide", ml: "ഫ്രണ്ട് ഡെസ്ക് രജിസ്ട്രേഷൻ ഗൈഡ്" },
  { num: "37", en: "Medical Protocol", ml: "മെഡിക്കൽ ടീം പ്രോട്ടോക്കോൾ" },
  { num: "38", en: "Inventory Storekeeper Manual", ml: "സ്റ്റോർകീപ്പർ ഗൈഡ്" },
  { num: "39", en: "Video Tutorial Scripts", ml: "വീഡിയോ ട്യൂട്ടോറിയൽ സ്ക്രിപ്റ്റുകൾ" },
  { num: "40", en: "Help Center Portal", ml: "ഹെൽപ്പ് സെന്റർ പോർട്ടൽ" },
]

export default function FestProProductHelpCenter() {
  const [lang, setLang] = useState<"en" | "ml">("en")
  const [selectedModuleNum, setSelectedModuleNum] = useState<string>("01")
  const [searchQuery, setSearchQuery] = useState("")

  // AI Copilot state
  const [aiQuestion, setAiQuestion] = useState("")
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [aiThinking, setAiThinking] = useState(false)

  const isMl = lang === "ml"
  const currentDoc = getModuleData(selectedModuleNum, isMl)

  const handleAiAsk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiQuestion.trim()) return

    setAiThinking(true)
    setAiAnswer(null)

    setTimeout(() => {
      setAiThinking(false)
      setAiAnswer(
        isMl
          ? `[FestPro AI Copilot]: FestPro-യിൽ ജഡ്ജിംഗ് സമ്പൂർണ്ണമായും പഷ്പക്ഷമായിരിക്കാൻ കോഡ് ലെറ്റർ സിസ്റ്റം (Double-Blind Evaluation) ഉപയോഗിക്കുന്നു. മത്സരം ആരംഭിക്കുമ്പോൾ ചെസ്റ്റ് നമ്പറുകൾക്ക് പകരം ക്രമമില്ലാത്ത അക്ഷരങ്ങൾ (ഉദാഹരണത്തിന്: Chest 102 → Letter K) ജഡ്ജിയുടെ ടാബ്‌ലെറ്റിൽ കാണിക്കും. മാർക്കുകൾ നൽകി സബ്മിറ്റ് ചെയ്ത ഉടൻ സിസ്റ്റം സ്വയം ഈ മാർക്കുകൾ ശരിയായ മത്സരാർത്ഥിയുടെ അക്കൗണ്ടിലേക്ക് മാറ്റുന്നതാണ്.`
          : `[FestPro AI Copilot]: FestPro handles double-blind evaluation by generating randomized Code Letters (e.g. Chest 102 → Letter K) when a program starts. Judges score candidates on digital tablets using these Code Letters. Once submitted, the Tabulation Engine maps marks back to candidate identities for 100% impartial judging.`
      )
    }, 800)
  }

  const filteredList = SYSTEM_MODULES_LIST.filter((m) => {
    const label = isMl ? m.ml : m.en
    return label.toLowerCase().includes(searchQuery.toLowerCase()) || m.num.includes(searchQuery)
  })

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${isMl ? "font-anek" : "font-sans"}`}>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-slate-900 text-white border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-md">
              FP
            </div>
            <div>
              <h1 className={`text-base text-white flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                {isMl ? "FestPro ഒഫീഷ്യൽ എന്റർപ്രൈസ് ഹെൽപ്പ് സെന്റർ" : "FestPro Official Enterprise Help Center"}
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 text-[10px] font-mono border border-indigo-400/30">v2.4.0</span>
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isMl ? "സമ്പൂർണ്ണ സിസ്റ്റം ഡോക്യുമെന്റേഷൻ, പഠനവഴികൾ & AI അസിസ്റ്റന്റ്" : "Complete Product Documentation, Learning Paths & AI Assistant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 p-1 rounded-full border border-slate-700">
              <button
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  lang === "en" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ml")}
                className={`px-3 py-1 text-xs font-bold rounded-full font-anek transition-all ${
                  lang === "ml" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                }`}
              >
                മലയാളം
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xs w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={isMl ? "തിരയുക (Search 40 modules)..." : "Search 40 modules & guides..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Sidebar + Main Reader */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row p-4 sm:p-6 gap-6">
        {/* Left Navigation Tree: All 40 Modules */}
        <aside className="w-full md:w-80 shrink-0 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto">
            <h2 className={`text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2 ${isMl ? "font-anek" : "font-sans"}`}>
              {isMl ? "📚 40 സിസ്റ്റം മോഡ്യൂളുകൾ" : "📚 All 40 System Modules"}
            </h2>

            <div className="space-y-1">
              {filteredList.map((m) => {
                const isSelected = selectedModuleNum === m.num
                return (
                  <button
                    key={m.num}
                    onClick={() => setSelectedModuleNum(m.num)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-sm font-bold"
                        : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}>
                        {m.num}
                      </span>
                      <span className={`truncate ${isMl ? "font-anek" : "font-sans"}`}>{isMl ? m.ml : m.en}</span>
                    </div>
                    {isSelected && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* System Telemetry Badge */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                {isMl ? "സിസ്റ്റം ഹെൽത്ത് സ്റ്റാറ്റസ്" : "FestPro System Status"}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">100% Active</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {isMl ? "വെബ്‌സോക്കറ്റ് ക്ലസ്റ്ററുകൾ: 0ms വൈകൽ | സുരക്ഷ: RLS Active" : "WebSocket Clusters: 0ms Latency | RLS Security Enforcement: Active"}
            </p>
          </div>
        </aside>

        {/* Right Main Reader: Full Detailed Manual Page */}
        <main className="flex-1 space-y-6 min-w-0">
          {/* AI Copilot Card */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-300 animate-spin-slow" />
              <h2 className={`text-base text-white ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                {isMl ? "FestPro AI Copilot അസിസ്റ്റന്റിനോട് ചോദിക്കാം" : "Ask FestPro AI Copilot Assistant"}
              </h2>
            </div>
            <form onSubmit={handleAiAsk} className="flex gap-2">
              <input
                type="text"
                placeholder={isMl ? "ചോദ്യം ചോദിക്കൂ... e.g. 'ജഡ്ജിംഗ് കോഡ് ലെറ്റർ എങ്ങനെ പ്രവർത്തിക്കും?'" : "Ask any question e.g. 'How does double-blind evaluation work?'"}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button
                type="submit"
                disabled={aiThinking}
                className={`px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer ${isMl ? "font-anek" : "font-sans"}`}
              >
                {aiThinking ? (isMl ? "ചിന്തിക്കുന്നു..." : "Thinking...") : (isMl ? "ചോദിക്കൂ" : "Ask AI")}
              </button>
            </form>

            {aiAnswer && (
              <div className="p-4 rounded-xl bg-white/10 border border-white/20 text-xs text-indigo-100 leading-relaxed animate-in fade-in duration-200">
                {aiAnswer}
              </div>
            )}
          </div>

          {/* Full Documentation Manual Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-8 animate-in fade-in duration-200">
            {/* Document Header */}
            <div className="border-b border-slate-100 pb-6 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold text-xs border border-indigo-100">
                  Module {currentDoc.num} — {currentDoc.cat}
                </span>
                <span className="text-xs font-semibold text-slate-400">Official FestPro Enterprise Manual v2.4.0</span>
              </div>
              <h1 className={`text-2xl sm:text-3xl text-slate-900 ${isMl ? "font-anek font-bold" : "font-heading font-extrabold"}`}>
                {currentDoc.title}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed">{currentDoc.overview}</p>
            </div>

            {/* Step-by-Step Procedure */}
            <div className="space-y-4">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                {isMl ? "പ്രവർത്തന ഘട്ടങ്ങൾ (Step-by-Step Execution Guide)" : "Step-by-Step Execution Guide"}
              </h3>
              <div className="space-y-2.5">
                {currentDoc.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Diagram */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <Layers className="h-5 w-5 text-indigo-600" />
                {isMl ? "വർക്ക്ഫ്ലോ ഘടന (System Workflow Transition)" : "System Workflow Transition"}
              </h3>
              <div className="p-4 rounded-xl bg-indigo-900 text-indigo-100 font-mono text-xs overflow-x-auto border border-indigo-800 shadow-inner">
                {currentDoc.workflow}
              </div>
            </div>

            {/* Field Explanation Table */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <FileText className="h-5 w-5 text-indigo-600" />
                {isMl ? "ഫീൽഡുകളും വേരിയബിളുകളും (Field Reference Table)" : "Field & Parameter Reference Table"}
              </h3>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr>
                      <th className="p-3">Field Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Required?</th>
                      <th className="p-3">Description & Usage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentDoc.fields.map((f, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900 font-mono">{f.name}</td>
                        <td className="p-3 font-mono text-indigo-600">{f.type}</td>
                        <td className="p-3 font-semibold">{f.req}</td>
                        <td className="p-3 text-slate-600">{isMl ? f.descMl : f.descEn}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips & Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <h4 className="font-bold text-xs uppercase flex items-center gap-1.5 text-emerald-800">
                  <Sparkles className="h-4 w-4" /> {isMl ? "ഉപദേശങ്ങളും നിർദ്ദേശങ്ങളും (Tips)" : "Best Practice Tip"}
                </h4>
                <p className="text-xs leading-relaxed">{currentDoc.tips}</p>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
                <h4 className="font-bold text-xs uppercase flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="h-4 w-4" /> {isMl ? "മുൻകരുതലുകൾ (Warning)" : "Operational Warning"}
                </h4>
                <p className="text-xs leading-relaxed">{currentDoc.warning}</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <HelpCircle className="h-5 w-5 text-indigo-600" />
                {isMl ? "സാധാരണ ചോദ്യോത്തരങ്ങൾ (Frequently Asked Questions)" : "Frequently Asked Questions (FAQ)"}
              </h3>
              <div className="space-y-3">
                {(currentDoc.faq || []).map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <h4 className="font-bold text-xs text-slate-900">Q: {item.q}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">A: {item.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Troubleshooting Matrix */}
            <div className="space-y-3">
              <h3 className={`text-lg text-slate-900 flex items-center gap-2 ${isMl ? "font-anek font-bold" : "font-heading font-bold"}`}>
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                {isMl ? "തടസ്സപരിഹാരങ്ങൾ (Troubleshooting Matrix)" : "Troubleshooting Matrix"}
              </h3>
              <div className="space-y-2">
                {(currentDoc.troubleshoot || []).map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="font-bold text-red-900">Issue: {t.issue}</span>
                    </div>
                    <div className="text-slate-700 bg-white px-3 py-1 rounded-lg border border-red-200 font-semibold">
                      Fix: {t.fix}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
