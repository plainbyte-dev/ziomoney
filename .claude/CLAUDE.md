# Frontend Development Rules

## Design workflow

For all frontend work, use the `frontend-design` skill.

Do not immediately start coding UI.

Follow this workflow:

1. Inspect the existing project and understand its architecture.
2. Identify the product, audience and primary user task.
3. Inspect the existing visual language before changing it.
4. Establish or preserve a deliberate visual direction.
5. Define typography, color, spacing and layout decisions.
6. Identify one memorable signature element when appropriate.
7. Challenge the design against generic AI/SaaS patterns.
8. Implement the design.
9. Use existing components before creating duplicates.
10. Test responsive behavior.
11. Inspect the rendered result.
12. Perform a visual critique.
13. Refine the implementation before considering the task complete.

## Animation

When animation is needed, use the installed GSAP skills.

Prefer:

- gsap-core for fundamental animations
- gsap-react for React/Next.js integration
- gsap-timeline for coordinated sequences
- gsap-scrolltrigger for scroll-driven experiences
- gsap-performance for animation performance

Do not add animation merely for decoration.

Animation should support hierarchy, feedback, navigation, storytelling or interaction.

Respect reduced-motion preferences.

## Visual identity

Do not automatically use:

- generic SaaS dashboards
- excessive rounded cards
- default gradients
- unnecessary glassmorphism
- generic hero sections
- excessive shadows
- arbitrary decorative blobs
- repetitive AI-generated layouts

Make visual decisions based on the actual product.

The industrial-brutalist skill may be used when its aesthetic is appropriate, but it must not automatically determine every project's visual direction.

## Existing project

Before modifying an existing frontend:

- inspect package.json
- inspect the routing structure
- inspect existing components
- inspect the styling system
- inspect existing design tokens
- inspect installed UI libraries
- preserve existing functionality
- avoid unnecessary rewrites

Prefer evolution over unnecessary replacement.

## Quality

A frontend task is not complete merely because the code compiles.

Check:

- desktop
- tablet
- mobile
- keyboard navigation
- focus states
- loading states
- empty states
- error states
- reduced motion
- overflow
- typography
- spacing
- visual hierarchy
- animation performance