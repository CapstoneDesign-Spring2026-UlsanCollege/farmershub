# ADR 0002 — Whether to apply graph engineering

- **Status:** Accepted
- **Date:** 2026-08-07
- **Phase:** 1 (Planning) → 3 (Design)
- **Decides:** whether FarmersHub adopts graph data modelling, graph algorithms, or a graph database

## Context

"Graph engineering" is not one standard term. It usually means one of four distinct things, and they carry very different costs:

| Meaning | What it is | Cost to adopt |
|---|---|---|
| **Graph modelling** | Designing the domain as entities and relationships before writing schemas | Free — it is a thinking tool |
| **Graph algorithms** | Shortest path, centrality, community detection, traversal | Low — ordinary code over ordinary data |
| **Graph database** | Neo4j, Neptune: storage engine optimised for traversal | High — a second datastore to run, back up and explain |
| **Knowledge graph** | Semantic layer linking heterogeneous data | High — usually organisational, not product |

One clarification worth stating because the confusion is common: **GraphQL is not graph engineering.** It is an API query language and works perfectly well over a plain relational or document database. Adopting GraphQL says nothing about how data is stored.

## Where a graph genuinely fits FarmersHub

**Provenance and traceability — the strongest fit.** A farm-direct marketplace's entire value proposition is knowing where food came from. `Farm → Field → Harvest batch → Order line → Customer` is a chain, and questions like *"show every order affected by this harvest batch"* or *"trace this basket item back to its farm"* are traversals. This is the one place where graph thinking is not decoration — it is the domain.

**Delivery routing — a real algorithmic fit.** If delivery partners return, assigning routes over a zone graph is a genuine shortest-path problem.

**Recommendations — real but premature.** Customers and products form a bipartite graph; "bought together" and "farms near you" fall out of it. This needs purchase volume that does not exist yet.

## Where it does not fit

Catalog, cart, orders and auth are ordinary document workloads. Modelling them as a graph buys nothing and costs a datastore.

## Decision

1. **Do not adopt a graph database.** At capstone data volume, a traversal over Mongo documents in application code is faster to build, easier to deploy, and indistinguishable in performance from Neo4j. A second datastore would double the operational surface — backups, connection strings, hosting — for no user-visible gain.

2. **Do use graph modelling now, before Milestone 3.** Draw the domain as nodes and edges before writing a single schema. This is free and it is the part that actually improves the design. It belongs in `docs/architecture.md`.

3. **If a graph showcase is wanted for the capstone, build provenance traceability** as a scoped feature in Milestone 3+, implemented as graph traversal in application code over Mongo. This gives the intellectual content of graph engineering — modelling, traversal, cycle-safety, depth limits — with none of the operational cost, and it is defensible because it serves the product's actual premise rather than being bolted on.

4. **Escalate to a real graph database only on evidence:** traversals that are too deep or too slow in application code. At this scale that will not happen, and saying so explicitly is better engineering than adopting the technology speculatively.

## Consequences

- MongoDB remains the single datastore.
- `docs/architecture.md` must contain an entity-relationship graph of the domain (blocks M3).
- Provenance traceability is a candidate M3+ feature, not a commitment.
- This ADR is revisited if delivery routing or recommendations re-enter scope.
