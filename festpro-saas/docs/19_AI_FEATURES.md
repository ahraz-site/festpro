# FestPro AI Features — Complete Official Documentation

**Module:** 19 — AI Features  
**Version:** 2.0  
**Dependencies:** Judging (07), Scheduling (08), Registration (06)  
**Applies To:** Festival Directors, Admins, Judges (scoring assistance)

---

# Section 1: Introduction

FestPro integrates Artificial Intelligence to automate repetitive tasks, provide data-driven insights, and enhance decision-making. Five AI features are available: Scoring Assistance, Schedule Optimisation, Duplicate Detection, Report Summarisation, and Language Translation. All AI features are optional and configurable per festival.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Scoring Assistance | ML-based score range suggestions for judges |
| Schedule Optimisation | Constraint-satisfaction algorithm for conflict-free schedules |
| Duplicate Detection | Fuzzy matching to identify duplicate registrations |
| Report Summarisation | Auto-generated narrative summaries of festival data |
| Language Translation | English ↔ Malayalam translation for UI and content |

---

# Section 2: Before You Start

## Prerequisites

| Prerequisite | Details |
|---|---|
| Sufficient Data | AI features improve with more historical data |
| Festival Selection | AI is enabled per festival (not globally) |
| Opt-in Consent | Data anonymisation and consent configured |

## Configuration Checklist

- [ ] Enable AI features in Festival → Settings → AI Features
- [ ] Configure data anonymisation settings
- [ ] Set scoring assistance confidence threshold
- [ ] Define schedule optimisation constraints (time, venue, judge availability)
- [ ] Enable translation for target languages

---

# Section 3: AI Feature Details

## 3.1 Scoring Assistance

**Purpose:** Helps judges make consistent, data-informed scoring decisions.

| Property | Description |
|----------|-------------|
| **Input** | Historical scores from past festivals: judge tendencies, participant history, competition difficulty |
| **Model** | Lightweight regression model trained on anonymised score data |
| **Output** | Suggested score range shown as a coloured bar on the scoring slider |
| **UI Indicator** | Green bar (suggested range) on the slider; judge can adjust |
| **Accuracy** | ±5% after 100+ data points; improves over time |
| **Judge Action** | Accept suggestion, adjust within range, or override entirely |
| **Opt-out** | Judges can disable AI suggestions per competition |

**How it works:**
```
Historical Scores → Feature Extraction → Model Inference → Range [7-9] → Display on Slider
```

## 3.2 Schedule Optimisation

**Purpose:** Auto-generates optimal competition schedules minimising conflicts.

| Property | Description |
|----------|-------------|
| **Algorithm** | Constraint Satisfaction Problem (CSP) solver with heuristic search |
| **Input Constraints** | Venue capacity, judge availability, participant no-conflict rules, category grouping, preferred time slots |
| **Output** | Complete schedule grid: time × venue × competition assignments |
| **Conflict Detection** | Built-in: flags participant double-booking, judge overlaps, venue double-booking |
| **Manual Override** | Schedule can be manually edited after auto-generation |
| **Re-optimise** | Can re-run with modified constraints |

**Constraint Priority:**
1. **Hard Constraints** (must be satisfied): venue capacity, judge availability, participant no-overlap
2. **Soft Constraints** (preferred): category grouping, preferred time slots, break times
3. **Optimisation Goal**: Minimise total schedule duration while satisfying all hard constraints

## 3.3 Duplicate Detection

**Purpose:** Identifies potential duplicate participant registrations.

| Property | Description |
|----------|-------------|
| **Match Criteria** | Fuzzy name similarity + exact email match + exact phone match + DOB match |
| **Algorithm** | Levenshtein distance for name comparison + exact match for other fields |
| **Threshold** | Configurable similarity threshold (default: 85%) |
| **Output** | List of potential duplicates with confidence score |
| **Action** | Admin reviews and merges (keep one registration, cancel duplicates) or dismisses |
| **Batch Scan** | Runs automatically on new registration; manual scan available for existing data |

**Duplicate Confidence Levels:**
| Level | Score | Action |
|-------|:-----:|--------|
| High | 95-100% | Auto-flagged, requires admin review |
| Medium | 85-94% | Flagged for optional review |
| Low | <85% | Logged but not alerted |

## 3.4 Report Summarisation

**Purpose:** Generates concise narrative summaries of festival performance data.

| Property | Description |
|----------|-------------|
| **Input** | Registration numbers, competition data, financial summary, participation stats |
| **Output** | 2-3 paragraph natural language summary |
| **Content** | Key statistics, top-performing categories, notable trends, year-over-year comparison |
| **Use Cases** | Post-festival report, press release, stakeholder briefing |
| **Languages** | English (primary), Malayalam (if translation enabled) |

**Example Output:**

> "The District Youth Festival 2025 saw 8,420 participants across 180 competitions, a 12% increase over 2024. The largest category was Music with 2,100 participants, followed by Dance (1,800). Folk Arts category had the highest participation growth at 28%. Total revenue was ₹12.5L with a net surplus of ₹3.2L. The top-performing institution was Government College, Kozhikode with 45 awards."

## 3.5 Language Translation

**Purpose:** Provides bilingual interface and content support.

| Property | Description |
|----------|-------------|
| **Source Language** | English |
| **Target Language** | Malayalam (expandable to other Indian languages) |
| **Scope** | UI labels, email/SMS templates, certificate text, public portal content |
| **Engine** | Machine translation with custom fine-tuning for festival terminology |
| **Quality** | Production-quality for standard content; human review recommended for official communications |
| **Disclaimer** | Auto-generated translations include a "Machine Translated" disclaimer |

---

# Section 4: Business Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| AI-001 | AI features are opt-in per festival (disabled by default) | Settings |
| AI-002 | AI scoring suggestions do not replace judge decisions | UI (judge must confirm) |
| AI-003 | Historical data is anonymised before model training | Data Pipeline |
| AI-004 | Users can opt out of having their data used for AI training | Profile Setting |
| AI-005 | AI-generated translations include a "Machine Translated" disclaimer | Template |
| AI-006 | Schedule optimisation respects all hard constraints; soft constraints are advisory | Algorithm |
| AI-007 | Duplicate detection runs within 5 minutes of new registration | Background Job |
| AI-008 | Report summarisation requires minimum 50 registrations for meaningful output | Server Action |
| AI-009 | AI scoring assistance requires minimum 20 historical score data points per competition | Model |
| AI-010 | Translation quality disclaimer must be visible on all machine-translated content | UI |

---

# Section 5: Permissions

| Operation | Participant | Staff | Judge | Manager | Fest Director | Org Admin | Org Owner |
|-----------|:-----------:|:-----:|:-----:|:-------:|:-------------:|:---------:|:---------:|
| View AI suggestions | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enable/disable AI features | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Configure AI settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Review duplicates | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Generate AI summary | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Opt out of AI training | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

# Section 6: Best Practices

1. **Enable AI for scoring gradually** — start with one competition to build judge confidence
2. **Feed quality data** — accurate historical data produces better AI suggestions
3. **Review duplicate flags daily** — prevent duplicate registrations from slipping through
4. **Use schedule optimisation as a starting point** — manually fine-tune after auto-generation
5. **Human-review AI translations** — especially for official certificates and communications
6. **Monitor AI accuracy metrics** — available in Festival → AI → Analytics
7. **Collect judge feedback** — use the thumbs up/down on AI score suggestions
8. **Run duplicate detection before bulk imports** — catch existing duplicates
9. **Use report summaries for press releases** — saves hours of report writing
10. **Anonymise data before enabling AI training** — comply with privacy regulations

---

# Section 7: Common Mistakes

1. ❌ **Expecting AI to replace human judgment** — scoring assistance is a guide, not a decision
2. ❌ **Enabling AI without sufficient data** — suggestions will be inaccurate
3. ❌ **Not reviewing duplicate flags** — duplicate registrations cause financial and logistical issues
4. ❌ **Using machine translations for legal/official content without review** — nuance may be lost
5. ❌ **Ignoring schedule optimisation constraints** — incomplete constraints lead to unrealistic schedules
6. ❌ **Opting out all users from training** — less data means poorer AI performance

---

# Section 8: Troubleshooting

## P1: AI scoring suggestions not showing
**Problem:** Score slider doesn't show the AI suggestion bar.  
**Root Causes:** (1) AI not enabled for this competition. (2) Insufficient historical data. (3) Judge opted out.  
**Solution:** Enable AI in competition settings; check minimum data threshold (20 data points).

## P2: Schedule optimisation produces conflicts
**Problem:** Auto-generated schedule still has participant/venue conflicts.  
**Root Causes:** Incomplete constraint data; very high number of participants.  
**Solution:** Add missing constraints; increase venue capacity or time slots; manually fix remaining conflicts.

## P3: Duplicate detection missed a duplicate
**Problem:** Obvious duplicate not flagged.  
**Root Causes:** Similarity threshold too high; names entered differently (short form vs full name).  
**Solution:** Lower the similarity threshold; manually mark as duplicate.

## P4: Translation has errors
**Problem:** Translated text contains incorrect terms or grammar.  
**Root Causes:** Machine translation limitations; festival-specific terminology not in model.  
**Solution:** Submit correction feedback; use glossary terms; human-review before publishing.

---

# Section 9: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | **Are AI features available in all plans?** | AI Scoring requires the Pro plan. Other AI features are available on all plans. |
| 2 | **Is my data used to train public AI models?** | No. Models are trained on anonymised, organisation-specific data only. |
| 3 | **How accurate is the scoring assistance?** | ±5% after 100+ data points. Accuracy increases with more data. |
| 4 | **Can I disable AI for specific competitions?** | Yes. AI settings are per-competition. |
| 5 | **How long does schedule optimisation take?** | Typically 5-30 seconds for 100 competitions; up to 2 minutes for 500+. |
| 6 | **Can judges override AI suggestions?** | Always. The AI suggestion is a guide; the judge's final score is what counts. |
| 7 | **What languages are supported for translation?** | Currently English ↔ Malayalam. More languages coming soon. |
| 8 | **Does AI work offline on mobile?** | Scoring assistance requires server connection. Other features work with cached data. |

---

# Section 10: Glossary

| Term | Definition |
|------|------------|
| **ML Model** | Machine Learning model that learns patterns from historical data |
| **Constraint Satisfaction** | Algorithm that finds solutions meeting all specified constraints |
| **Levenshtein Distance** | String metric measuring difference between two name sequences |
| **Anonymisation** | Removing personally identifiable information before data processing |
| **Heuristic Search** | Problem-solving approach using practical methods for faster solutions |

---

*End of AI Features Module Documentation (Module 19)*
