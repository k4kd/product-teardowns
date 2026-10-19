# Design lens

This file says which design decisions are worth the reader's time, through build-products-design-kunal's view: what someone building a product has to get right so people can use it, trust it and enjoy it. Only include rows where the evidence found something. Leave a row out when there's none, and never guess to fill the table.

## The table

| Area | What they did (measured / judged) | Verdict | Why, and when it applies |
|---|---|---|---|
| Flows and IA | steps per task; navigation model; where things live | steal / skip | |
| States and feedback | empty, loading, error and success handled? how fast is feedback? | | |
| Forms and input | fields before value; validation timing; defaults | | |
| Visual hierarchy | what the eye lands on first; one primary action per screen? | | |
| Typography | type scale; line length; readability | | |
| Colour and contrast | palette as roles; contrast results | | |
| Design systems | tokens; component reuse; consistency counts | | |
| Accessibility | WCAG 2.2 AA results; keyboard; focus; names; targets | | |
| Content and microcopy | button labels; error messages; empty-state copy | | |
| Motion | what moves, how fast, and whether it explains anything | | |
| Trust and dark patterns | honest defaults, or deceptive patterns? | | |

**Verdicts:**
- **Steal:** a design choice the reader can copy, **with its conditions** ("works for 5 options or fewer; past that, add search").
- **Skip:** a choice that only works for their audience or brand, breaks accessibility, or adds inconsistency. Say what to do instead.

Deep ideas worth learning properly are not a verdict. They become new concepts in the doc.

**Red flags to call out plainly:** contrast below 4.5:1 on body text, targets under 24×24 px, controls with no accessible name, focus that can't be seen, error messages that blame the user, and any deceptive pattern. Describe each as a lesson, with the measurement.

## Smallest design system you could start with

End with one paragraph: for a product like this, what's the least design system that would work? A type scale of how many steps, a spacing unit, how many colour roles, which five components first, and which one or two concepts the reader would need to master.
