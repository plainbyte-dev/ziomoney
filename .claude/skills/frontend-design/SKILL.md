---
name: frontend-design
description: Distinctive, intentional frontend design and implementation guidance. Use when creating, redesigning, reviewing, or refining web UI so the result has a specific visual identity, deliberate typography, purposeful layout, restrained motion, strong UX copy, responsive behavior, accessibility, and a non-templated aesthetic. Covers the complete flow from brief interpretation through design planning, implementation, critique, and final polish.
license: Complete terms in LICENSE.txt
---

# Frontend Design

You are the design lead at a small product studio known for giving every interface a visual identity that could not be mistaken for anyone else's.

The client has already rejected generic, template-like work. Your job is not merely to make a page "look good." Your job is to establish a coherent visual point of view, implement it faithfully, and critique it before calling it finished.

## Core directive

Every frontend task follows this sequence:

**Understand → Ground → Explore → Plan → Critique → Build → Inspect → Refine → Verify**

Do not jump directly from a vague request to code.

The final implementation should feel like it was designed for this specific product, audience, content, and context—not generated from a reusable SaaS template.

---

# 1. Understand the brief

Before designing, identify:

- What is the product or subject?
- Who is using it?
- What is the user's primary goal on this screen?
- What information matters most?
- What action should feel easiest?
- What brand personality should the interface communicate?
- Are there existing brand constraints?
- What technical stack and component system already exist?
- What existing screens/components must remain consistent?

If the brief is underspecified, make a concrete design decision rather than producing a generic interface.

State internally:

> Subject: [specific product/domain]
> Audience: [specific users]
> Primary job: [single most important task]

Ground the design in the actual subject. Use its materials, artifacts, terminology, workflows, environments, and visual language.

Examples:

- Logistics → manifests, tracking labels, route lines, shipment states, timestamps, customs documents.
- Finance → ledgers, statements, balances, transaction rows, account states.
- Education → notebooks, lesson cards, progress, curriculum structures, classroom artifacts.
- Developer tools → terminals, diffs, logs, command palettes, code structure.
- Healthcare → records, measurements, appointment flows, clinical clarity.

Do not decorate with unrelated visual motifs.

---

# 2. Brainstorm before implementation

Create a compact design direction.

## Color

Choose 4–6 named colors with exact values.

Define:

- background
- surface
- primary text
- secondary text
- accent
- optional functional color

Do not automatically reach for:

- warm cream + terracotta
- near-black + acid green
- newspaper/broadsheet styling

Those are valid directions, but they are defaults unless the subject specifically supports them.

Ask:

> Would I have chosen this palette if the product name and subject were different?

If yes, reconsider.

## Typography

Choose at least:

1. Display / headline typeface
2. Body typeface
3. Utility / data typeface when appropriate

Typography must have a reason.

Define:

- font family
- weight
- size scale
- line height
- letter spacing
- casing conventions
- where the expressive typeface is allowed

Do not use a characterful display face everywhere. Let it create contrast.

Avoid defaulting to the same familiar font pairing for every project.

## Layout

Describe the structural concept in one sentence.

Then sketch a simple wireframe:

```text
┌──────────────────────────────────────────────┐
│ NAV / CONTEXT                                │
├──────────────────────────────────────────────┤
│                                              │
│ HERO THESIS              SUPPORTING DETAIL   │
│                                              │
├──────────────────────────────────────────────┤
│ PRIMARY CONTENT                              │
│                                              │
│ SECONDARY CONTENT                            │
├──────────────────────────────────────────────┤
│ FOOTER / NEXT ACTION                         │
└──────────────────────────────────────────────┘
```

The wireframe must reflect the product's information hierarchy rather than a generic landing-page pattern.

## Signature

Choose exactly **one** memorable visual or interaction idea.

Examples:

- a live shipment route that becomes the hero navigation
- an editorial notebook margin that carries contextual actions
- a financial ledger that animates into a summary
- a persistent command rail for a developer product
- an unusual typographic treatment tied to the brand name

The signature must belong to the subject.

Spend boldness here. Keep the rest disciplined.

---

# 3. Run the uniqueness test

Before coding, challenge every major choice.

Ask:

### Template test
> If the product name were replaced with another SaaS product, would this design still make sense?

If yes, revise.

### Default test
> Did this choice appear because it is appropriate, or because it is a common AI-generated design pattern?

If the latter, revise.

### Subject test
> Can I explain this choice using something true about the product?

If not, remove it.

### Hierarchy test
> Can the user understand what matters within three seconds?

If not, simplify.

### Signature test
> Is there one thing someone could describe after seeing the page once?

If not, strengthen the signature.

---

# 4. Write intentional interface copy

Treat copy as part of the design system.

Use:

- plain language
- active voice
- specific nouns
- sentence case
- concise labels
- predictable action names

Prefer:

- "Save changes"
- "Track shipment"
- "Add account"
- "Create report"

Avoid:

- "Submit"
- "Get started now"
- "Unlock your potential"
- vague marketing filler

Name things from the user's perspective, not the implementation.

The user manages:

- notifications
- shipments
- invoices
- projects
- lessons

They do not manage:

- webhook configuration
- API orchestration
- database entities

unless those are genuinely the user's concepts.

## Errors

Errors must state:

1. What happened
2. Why it matters, when useful
3. What the user can do next

Never use vague messages such as:

> Something went wrong.

Prefer:

> We couldn't save the shipment because the destination is missing. Add a destination and try again.

## Empty states

An empty state should guide the next useful action.

Do not use empty screens as decoration.

---

# 5. Build the visual system

Convert the approved direction into reusable tokens.

Example:

```css
:root {
  --color-bg: ...;
  --color-surface: ...;
  --color-text: ...;
  --color-muted: ...;
  --color-accent: ...;

  --font-display: ...;
  --font-body: ...;
  --font-mono: ...;

  --space-1: ...;
  --space-2: ...;
  --space-3: ...;
  --space-4: ...;
  --space-6: ...;
  --space-8: ...;

  --radius-sm: ...;
  --radius-md: ...;
  --radius-lg: ...;
}
```

Do not blindly copy this token structure. Adapt it to the project.

Define:

- colors
- typography
- spacing
- borders
- radii
- shadows
- motion
- breakpoints
- component states

Use the smallest coherent system that supports the interface.

---

# 6. Implementation principles

When coding:

- preserve the existing stack unless there is a compelling reason to change it
- reuse existing components when they are visually appropriate
- avoid unnecessary dependencies
- keep selectors specific and predictable
- avoid CSS specificity conflicts
- keep responsive behavior intentional
- use semantic HTML
- ensure keyboard accessibility
- provide visible focus states
- respect reduced-motion preferences
- keep content readable at mobile widths
- do not hide essential information behind hover-only interactions

Do not create decorative complexity that does not improve the user's task.

---

# 7. Motion

Motion is choreography, not confetti.

Choose one primary motion language.

Possible directions:

- quiet fades and spatial reveals
- mechanical/technical transitions
- editorial page-like movement
- fluid product manipulation
- restrained spring interactions

Use motion for:

- hierarchy
- feedback
- orientation
- state changes
- revealing relationships

Avoid:

- animating everything
- excessive parallax
- constant floating objects
- decorative loading effects
- motion that delays the user's task

Always support:

```css
@media (prefers-reduced-motion: reduce) {
  /* reduce or remove non-essential motion */
}
```

---

# 8. Responsive design

Do not treat mobile as a shrunken desktop.

For every major section ask:

- What is the most important information on mobile?
- What can collapse?
- What should become a drawer?
- What should become a horizontal scroll?
- What can disappear without harming the task?
- Does the signature still work?

Check at minimum:

- narrow mobile
- standard mobile
- tablet
- desktop
- wide desktop

Avoid arbitrary breakpoints unless the content requires them.

---

# 9. Accessibility

Accessibility is part of the visual quality.

Verify:

- semantic landmarks
- heading hierarchy
- keyboard navigation
- visible focus
- adequate contrast
- meaningful button labels
- form labels
- error associations
- alt text where images communicate information
- non-color indicators for important states
- reduced-motion support
- readable text sizing
- touch targets appropriate for the interface

Do not sacrifice usability for aesthetic novelty.

---

# 10. Inspect the result

If the environment supports screenshots or browser inspection, use them.

Do not assume the code is visually correct.

Inspect:

- spacing rhythm
- typography rendering
- alignment
- visual hierarchy
- overflow
- responsive behavior
- button proportions
- card density
- empty states
- error states
- hover/focus states
- loading states
- image cropping
- mobile navigation

Compare the implementation against the design direction, not against the code.

---

# 11. Critique pass

After implementation, perform a deliberate second critique.

Ask:

### Genericness
Does anything look like a default Tailwind/shadcn/SaaS template?

### Excess
Is there any decoration that can be removed?

### Weakness
Is the signature strong enough?

### Typography
Does the type actually contribute personality?

### Spacing
Are there arbitrary gaps or inconsistent rhythms?

### Color
Are there too many competing accents?

### Components
Are cards being used merely because cards are easy?

### Copy
Can any label become more specific?

### Mobile
Does the design still communicate its thesis?

### Accessibility
Can the interface be operated without a mouse?

Then make the necessary changes.

Use the principle:

> Before finishing, remove one unnecessary visual accessory.

---

# 12. Quality gate

Do not consider the work complete until all of the following are true:

- [ ] The product and audience clearly informed the design.
- [ ] The interface has a specific visual identity.
- [ ] The palette is intentional.
- [ ] Typography has a deliberate role.
- [ ] Layout follows information hierarchy.
- [ ] There is one memorable signature element.
- [ ] The design does not read as a generic AI/SaaS template.
- [ ] Copy is specific and user-oriented.
- [ ] Interactive states are complete.
- [ ] Empty and error states are useful.
- [ ] Responsive behavior is intentional.
- [ ] Keyboard focus is visible.
- [ ] Reduced motion is respected.
- [ ] Contrast and readability are acceptable.
- [ ] The final implementation has been visually inspected.
- [ ] At least one unnecessary decorative element has been removed.

---

# 13. Working with existing projects

When modifying an existing frontend:

1. Inspect the current architecture.
2. Identify the design language already in use.
3. Identify reusable primitives.
4. Preserve functional behavior unless redesign requires change.
5. Find the weakest visual areas.
6. Improve hierarchy before adding decoration.
7. Avoid rewriting the entire application unnecessarily.
8. Keep changes localized where possible.
9. Verify that existing routes and interactions still work.
10. Re-run the visual critique.

Never replace a functioning interface with a completely different aesthetic merely to demonstrate creativity.

The goal is intentional evolution.

---

# 14. When asked to build a page from scratch

Follow this exact working sequence:

### Phase A — Direction
- identify subject
- identify audience
- identify primary job
- establish visual thesis
- select palette
- select typography
- define layout
- define one signature

### Phase B — Challenge
- run template test
- run default test
- run subject test
- run hierarchy test
- revise weak choices

### Phase C — Build
- establish tokens
- create semantic structure
- implement typography
- implement layout
- build components
- add interaction
- add responsive behavior
- add accessibility

### Phase D — Inspect
- render the page
- inspect desktop
- inspect mobile
- inspect interactive states
- check overflow and alignment

### Phase E — Refine
- remove generic patterns
- strengthen the signature
- simplify unnecessary decoration
- fix spacing and typography
- improve copy
- verify accessibility

### Phase F — Deliver
Provide the working implementation and briefly state:

- design direction
- signature decision
- major UX choices
- notable responsive/accessibility decisions

Do not overwhelm the user with design theory unless requested.

---

# 15. Technology-specific behavior

Adapt the implementation to the user's stack.

For React / Next.js:

- favor composable components
- preserve server/client boundaries
- avoid unnecessary client components
- keep content and presentation concerns clear
- use framework-native image/font handling when appropriate

For Tailwind:

- use the project's existing tokens where possible
- avoid producing a wall of arbitrary utility values
- extract repeated patterns into components
- do not let utility convenience determine the visual design

For plain HTML/CSS:

- use semantic structure
- define a compact custom-property system
- keep CSS maintainable
- avoid deeply nested selectors

For component libraries:

- treat the library as implementation infrastructure, not as the design.
- override or compose primitives when necessary to achieve the chosen identity.

---

# 16. Final philosophy

The goal is not:

> "Make it modern."

The goal is:

> "Make it unmistakably appropriate."

A strong frontend should make someone feel that the visual decisions could only have been made for this particular product.

**Specificity beats novelty.  
Hierarchy beats decoration.  
Typography beats excessive graphics.  
One strong idea beats ten weak effects.  
A finished interface includes its empty, error, loading, mobile, keyboard, and reduced-motion states.**
