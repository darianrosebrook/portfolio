Let’s close the loop with the Assemblies deep dive.

⸻

Deep Dive: Assemblies

What Assemblies Are

Assemblies are the product-level constructs that combine primitives, compounds, and composers into flows and interfaces that deliver business value.
• A checkout flow that strings together forms, summaries, payment methods, and confirmation.
• A project board that combines cards, drag-and-drop lists, filters, and bulk actions.
• A reporting dashboard with charts, tables, filters, and export actions.

Assemblies are recognizable as applications inside the application. They encode product logic, not just design rules.

⸻

Why Assemblies Don’t Belong in the System

Design systems succeed by being generalized, reusable, and product-agnostic. Assemblies are the opposite: 1. Too Product-Specific
• A checkout flow in Commerce is irrelevant to a dashboard in SaaS.
• Standardizing at this level risks forcing a pattern onto products that don’t share context. 2. Volatile Requirements
• Assemblies change rapidly with product strategy, business models, and regulations.
• System teams can’t chase every update without becoming a bottleneck. 3. Unscalable Scope
• If the design system codifies assemblies, it risks becoming a parallel product org.
• The surface area explodes: every team wants their feature “blessed” as a system component. 4. Diluted Governance
• At the assembly level, product managers own flows.
• The system should not become the arbiter of business rules.

⸻

The Role of the System Team

While assemblies don’t belong inside the design system, they are where the system proves its value. The system team’s role shifts from author to consultant:
• Inform: provide primitives, compounds, and composers that make assemblies easy to build without reinvention.
• Advise: consult on accessibility, composability, and interaction pitfalls when teams compose assemblies.
• Audit: help teams evaluate whether their assembly aligns with system conventions or accidentally reinvents a primitive/compound.
• Inspire: show examples of successful assemblies built on the system, to spread patterns laterally across product teams.

This is how assemblies become success stories of the system in use.

⸻

Example: Checkout Flow
• System contribution:
• Primitives: Button, Input, Checkbox
• Compounds: TextField, Card
• Composers: Form Field, Pagination (multi-step), Toolbar (action bar)
• Product assembly:
• Payment step → TextField for card number, Checkbox for “save for later”
• Review step → Card composer + Table compounds
• Confirmation step → Modal composer

The design system didn’t ship a “CheckoutFlow” component. Instead, it provided the building blocks, orchestration patterns, and accessibility rules. The product team composed them into a flow that matched their business logic.

⸻

Pitfalls When Assemblies Creep Into Systems 1. Assembly Drift: one team’s flow becomes a “component” in the system, and suddenly the system is maintaining product-specific features. 2. Over-standardization: forcing every product to use the same assembly pattern, even when needs diverge. 3. System Bloat: the system grows too heavy, making adoption harder rather than easier.

⸻

Success Metrics for Assemblies

The system team shouldn’t measure success by “number of assemblies in the system,” but rather by:
• Speed of composition: how quickly product teams can build flows using primitives/compounds/composers.
• Reduction in reinvention: fewer ad-hoc components created to plug assembly gaps.
• Consistency of experience: flows across products feel coherent because they share the same underlying grammar.
• Confidence in accessibility: product teams don’t have to relearn label associations, focus rules, or ARIA conventions — they inherit them.

⸻

Summary

Assemblies are where the system meets the product, but they rarely belong inside the design system.
• What they are: application-specific flows (checkout, boards, dashboards).
• Why they don’t belong: product-specific, volatile, unscalable, business-owned.
• Role of the system: consult, inform, audit, inspire — not codify.
• Success story: when a team builds a complex flow quickly, confidently, and accessibly because of the system, not inside it.

In the layered model:
• Primitives: boring, stable, standardized.
• Compounds: predictable bundles.
• Composers: orchestrated patterns.
• Assemblies: proof that the system works — but living in product space, not system space.

⸻
