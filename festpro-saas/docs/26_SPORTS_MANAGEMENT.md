# FestPro Sports Management — Complete Official Documentation

**Module:** 26 — Sports Management  
**Version:** 1.0  
**Applies To:** Sports Coordinators, Event Managers

---

# Section 1: Introduction

The Sports Management module handles sports events alongside cultural competitions. It supports team-based and individual sports, bracket/ knockout generation, match scheduling, score tracking, and referee assignment. Designed for athletics, team sports (cricket, football, volleyball), and indoor games (chess, table tennis, badminton).

## Key Capabilities

| Capability | Description |
|------------|-------------|
| Event Types | Individual, Team, Relay |
| Bracket Generation | Single elimination, double elimination, league/round-robin, group stage + knockout |
| Match Scheduling | Auto-schedule with venue and referee availability |
| Score Tracking | Points, sets, time, goals — configurable per sport |
| Referee Assignment | Assign officials to matches |
| Team Management | Squad lists, substitutions, captains |
| Result Publication | Automated bracket advancement and standings |
| League Tables | Points table with win/loss/draw calculations |

---

# Section 2: Navigation

| Page | URL | Purpose |
|------|-----|---------|
| Sports Dashboard | `/dashboard/festivals/[id]/sports` | Overview of all sports events |
| Events | `/dashboard/festivals/[id]/sports/events` | Sports event list |
| Event Detail | `/dashboard/festivals/[id]/sports/events/[id]` | Bracket view, matches, standings |
| Teams | `/dashboard/festivals/[id]/sports/teams` | Registered teams |
| Team Detail | `/dashboard/festivals/[id]/sports/teams/[id]` | Squad, schedule, results |
| Matches | `/dashboard/festivals/[id]/sports/matches` | All matches with filters |
| Live Score | `/dashboard/festivals/[id]/sports/live` | Real-time score entry |
| Referees | `/dashboard/festivals/[id]/sports/referees` | Official assignments |
| Settings | `/dashboard/festivals/[id]/sports/settings` | Sport types, rules, formats |

---

# Section 3: Every Form

## Sports Event Form

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| Sport Name | text | Yes | 2-100 chars | e.g., "Cricket", "Badminton" |
| Event Type | dropdown | Yes | Individual, Team, Relay | Participant structure |
| Format | dropdown | Yes | Knockout, League, Group+KO, Double Elim | Tournament format |
| Team Size | number | Conditional | Required for team events | Players per team (min/max) |
| Scoring Method | dropdown | Yes | Points, Goals, Sets, Time, Points+Rounds | How winner is determined |
| Points for Win | number | Conditional | League format | Points awarded for win |
| Points for Draw | number | Conditional | League format | Points for draw |
| Match Duration | number | No | Minutes | Default match length |
| Max Teams/Participants | number | No | 2-256 | Entry limit |

## Match Score Entry Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Match ID | text | Auto | System-generated |
| Participant/Team 1 | text | Auto | From bracket |
| Participant/Team 2 | text | Auto | From bracket |
| Score 1 | number | Yes | Points/goals for team 1 |
| Score 2 | number | Yes | Points/goals for team 2 |
| Sets/Criteria | dynamic | Varies | Per-sport scoring breakdown |
| Winner | auto | Auto | Calculated from scores |
| Referee | autocomplete | Yes | Officiating referee |
| Notes | textarea | No | Match report |

---

# Section 4: Bracket Generation

## Supported Formats

```
Knockout (Single Elim):
R1 ──┬── R2 ──┬── R3 ──┬── Final
     │        │        │
R1 ──┘        │        │
     R1 ──────┘        │
                       │
R1 ──┬── R2 ───────────┘
     │
R1 ──┘

League (Round Robin):
Team A ── Team B ── Team C
  │          │          │
  ├── 3-1    ├── 2-2    ├── 1-3
  ▼          ▼          ▼
  Points: 3  1          0

Group + Knockout:
Group A ──┬── Quarter──┬── Semi──┬── Final
Group B ──┘            │        │
Group C ──┬── Quarter──┘        │
Group D ──┘                     │
                                │
Group E ──┬── Quarter──┬── Semi─┘
Group F ──┘            │
Group G ──┬── Quarter──┘
Group H ──┘
```

---

# Section 5: Business Rules

| Rule ID | Rule |
|---------|------|
| SPORT-001 | Bracket generation requires minimum participants based on format (KO: 4, League: 3) |
| SPORT-002 | Byes are assigned for non-power-of-2 participant counts in knockout formats |
| SPORT-003 | League standings: sorted by points, then head-to-head, then net score |
| SPORT-004 | A participant/team cannot be scheduled for overlapping matches |
| SPORT-005 | Match scores, once locked, require referee override to edit |
| SPORT-006 | Substitutions are allowed only before match start |
| SPORT-007 | Walkover recorded if participant/team does not appear within 15 min of scheduled time |
| SPORT-008 | Referee assignments consider existing match schedules (no double-booking) |

---

# Section 6: Permissions

| Operation | Staff | Manager | Fest Director | Referee |
|-----------|:-----:|:-------:|:-------------:|:-------:|
| View events | ✅ | ✅ | ✅ | ✅ |
| Create events | ❌ | ✅ | ✅ | ❌ |
| Enter scores | ❌ | ✅ | ✅ | ✅ |
| Lock scores | ❌ | ❌ | ✅ | ✅ |
| Generate brackets | ❌ | ✅ | ✅ | ❌ |
| Assign referees | ❌ | ❌ | ✅ | ❌ |
| Publish results | ❌ | ❌ | ✅ | ❌ |

---

*End of Sports Management Module Documentation (Module 26)*
