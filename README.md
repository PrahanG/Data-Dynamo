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
  - Graph-based state encoding for pruning and cache hits
- **Visual validation:** WebGL viewer for 3D inspection of placements.
- **API first:** REST endpoints to submit loads, get plans, and stream progress.

---

## Tech Stack

- **Core Engine:** TypeScript (node)
- **API:** Express / REST, JSON I/O
- **Viewer:** WebGL (Three.js) with React/Next.js UI
- **Data & Caching:** Redis (search cache / tabu memory), PostgreSQL (jobs/history)
- **DevOps:** Docker, npm/yarn, GitHub Actions
- **Deploy:** Vercel (UI) + containerized API

---

## Scoring (high level)

For a plan \(P\) with placements \(p_i\):

\[
\text{Score}(P) =
w_s \cdot \text{Stability}(P) + 
w_d \cdot \text{DamagePenalty}(P) +
w_a \cdot \text{Accessibility}(P) +
w_e \cdot \text{Utilization}(P) +
w_c \cdot \text{ColdChainCompliance}(P)
\]

- **Stability:** base support %, CoG within footprint, no tip risk
- **DamagePenalty:** loads exceeding item stack-limit/orientation, adjacency rules
- **Accessibility:** penalties if earlier-drop items are buried
- **Utilization:** packed volume / available volume
- **ColdChainCompliance:** penalties for zone violations

All weights are configurable per fleet/policy.
