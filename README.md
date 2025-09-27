# PackPilot

PackPilot is a 3D box-placement optimizer for truck loading. It finds safe, efficient, and delivery-aware packings under real-world constraints:

- **Safety & Stability:** center-of-gravity, base support ratio, tilt margins
- **Damage Avoidance:** fragility & stackability, max load on top, orientation locks
- **Cold Chain & Zones:** perishable temperature zones and segregation
- **Logistics Reality:** delivery stop order (LIFO/segmenting), aisle/reserve space
- **Efficiency:** volume utilization, travel plan compatibility

---

## Features

- **Constraint-aware placement:** Weight, orientation, stacking limits, incompatibilities.
- **Delivery-order aware:** Keeps earlier-drop items accessible; supports segmenting by stop.
- **Scoring function:** Balances *stability, damage risk, accessibility, efficiency, safety*.
- **Search engine:**
  - Fast greedy + heuristics for baselines
  - **MCTS** (Monte Carlo Tree Search) for near-optimal exploration
- **Visual validation:** WebGL viewer for 3D inspection of placements.
- **API first:** REST endpoints to submit loads, get plans, and stream progress.

---

## Tech Stack

- **Core Engine:** TypeScript (node)
- **API:** Express / REST, JSON I/O
- **Viewer:** WebGL (Three.js) with React/Next.js UI
- **DevOps:** Docker, npm/yarn, GitHub Actions
- **Deploy:** Vercel (UI) + containerized API

---
