Perfect — let’s move up a layer and do the same kind of deep dive for Compounds. Think of this as the “chapter two” in the layered component methodology.

⸻

Deep Dive: Compounds

Why Compounds Exist

If primitives are the raw parts, compounds are the predictable bundles. They emerge when teams repeatedly combine the same primitives in the same ways. Instead of asking designers and developers to reinvent the bundle every time, the system codifies the convention.

Compounds give structure to combinations that look obvious in hindsight but are fragile in practice. A text input always needs a label. A table row always assumes a parent table. A card usually pairs heading, body, and actions in a fixed layout.

The compound layer is where convention becomes codified.

⸻

Characteristics of Compounds
• Predictable combinations: the system says, “these primitives always travel together.”
• Narrow scope: compounds aren’t meant to anticipate every combination—only the blessed ones.
• Stable defaults: compounds take care of padding, grouping, or spacing rules once, so teams don’t keep tweaking.
• Consistent behavior: accessibility rules (like label associations) are guaranteed, not optional.

⸻

Examples of Compounds
• TextField: bundles Input, Label, ErrorMessage.
• TableRow: bundles TableCell primitives with semantics tied to Table.
• Card: bundles Heading, Body, Footer with standardized spacing.
• Tag / Chip: bundles Label and DismissButton.

⸻

The Work of the System at the Compound Layer

1. Conventions
   • Define what belongs together: label + input, icon + text, header + footer.
   • Define approved variations (e.g., TextField can have optional helper text, but never hides the label).

2. Blessed Combinations
   • Encode spacing, order, and accessibility rules into the compound.
   • Example: a TextField enforces label placement and aria-describedby linking to the error state.

3. Flexibility Without Drift
   • Compounds should allow a controlled amount of flexibility (slots, optional props).
   • The key is to prevent unbounded prop creep—flexibility should follow the system’s conventions.

⸻

Pitfalls of Compounds 1. Prop Explosion
• When compounds try to solve every variation, they mutate into composers.
• Guardrail: compounds support only the blessed variations. If you find yourself adding a boolean every sprint, you’ve crossed layers. 2. Breaking Accessibility by Accident
• A text field without a proper <label> or aria-describedby is a broken compound.
• Guardrail: accessibility associations must be baked in, not optional. 3. Over-abstracting Visuals
• Avoid infinite layout variations. For instance, a Card that allows every combination of header/body/footer permutations becomes ungovernable.
• Guardrail: fix the expected structure, allow slots for content. 4. Duplication of Logic
• Don’t reimplement primitive behaviors inside compounds (e.g., don’t reinvent Checkbox logic inside a “FilterRow” compound).
• Guardrail: compounds compose primitives; they don’t replace them.

⸻

Example: TextField

Without a compound:
• Every product team must remember to add a label.
• ARIA association to the error message might get missed.
• Spacing between label, input, and error differs across products.

With a compound:

export interface TextFieldProps {
id: string;
label: string;
error?: string;
helperText?: string;
required?: boolean;
}

export function TextField({ id, label, error, helperText, required }: TextFieldProps) {
return (

<div className="textfield">
<label htmlFor={id}>{label}{required && '\*'}</label>
<Input id={id} aria-describedby={error ? `${id}-error` : undefined} aria-invalid={!!error} />
{helperText && <p id={`${id}-helper`} className="helper">{helperText}</p>}
{error && <p id={`${id}-error`} className="error">{error}</p>}
</div>
);
}

    •	The Input primitive is still used, but labeling, error messaging, and helper text are orchestrated once.
    •	Teams now can’t “forget” accessibility—they inherit it automatically.

⸻

Why Compounds are Critical
• They reduce cognitive load: designers and engineers don’t have to reassemble primitives every time.
• They prevent inconsistent conventions: spacing, order, accessibility are centralized.
• They free the system team from triaging endless one-offs: by pre-blessing common bundles, the system reduces churn.
• They create legibility in design files and codebases: “TextField” communicates intent better than “Input + Label + Error stacked manually.”

⸻

Summary

Compounds are the codified bundles of your design system.
• Examples: TextField, TableRow, Card, Chip
• Work of the system: conventions, blessed combinations, baked-in accessibility
• Pitfalls: prop explosion, accessibility drift, ungoverned permutations, logic duplication

If primitives are the boring DNA, compounds are the grammar rules—they make sure the words can be combined into predictable, legible sentences.

⸻

Do you want me to continue the series with the same treatment for Composers next (where orchestration, state, and variation management become the main work)?
