# FestPro Inventory Management — Complete Official Documentation

**Module:** 32 — Inventory Management  
**Version:** 1.0  
**Applies To:** Storekeepers, Logistics Team

---

# Section 1: Introduction

The Inventory Management module tracks physical assets and consumables used during festivals — equipment, stationery, trophies, medals, uniforms, and supplies. Supports stock-in/stock-out, reorder alerts, and allocation tracking.

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Item Catalog | Categorised item database |
| Stock Tracking | In/out movements with quantities |
| Reorder Alerts | Notify when stock below threshold |
| Item Assignment | Link items to competitions, stages, volunteers |
| Barcode/QR | Label generation for physical items |
| Audit Trail | Complete movement history |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Inventory | `/dashboard/festivals/[id]/inventory` | All items |
| Item Detail | `/dashboard/festivals/[id]/inventory/[id]` | Stock history |
| Stock In | `/dashboard/festivals/[id]/inventory/stock-in` | Add stock |
| Stock Out | `/dashboard/festivals/[id]/inventory/stock-out` | Issue items |
| Categories | `/dashboard/festivals/[id]/inventory/categories` | Manage categories |

---

# Section 3: Business Rules

| Rule ID | Rule |
|---------|------|
| INV-001 | Stock cannot go below zero (negative inventory blocked) |
| INV-002 | Stock-out requires approver for items > ₹5000 |
| INV-003 | Reorder alert triggers when stock <= reorder_level |
| INV-004 | Each transaction (in/out) records user, timestamp, quantity |
| INV-005 | Physical inventory count can be logged for reconciliation |

---

*End of Inventory Management Module Documentation (Module 32)*
