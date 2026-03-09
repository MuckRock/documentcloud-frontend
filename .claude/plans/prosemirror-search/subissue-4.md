# Task: Mobile/Responsive Audit

## Goal

Create Storybook stories that render the SearchEditor at mobile, tablet, and desktop viewport sizes using the project's existing Storybook viewport presets. These stories enable a manual visual audit of responsive behavior.

## Current State

- The editor has `min-width: 32rem` (512px), which may overflow on mobile.
- The autocomplete dropdown has `max-width: 280px` and `max-height: 16rem`.
- No media queries exist in any SearchEditor CSS.
- Storybook has a `modes.ts` config with a default viewport of 1280px. Additional viewports need to be defined.

## Work Required

### 1. Define Viewport Presets

Add named viewport modes to `.storybook/modes.ts` (or the preview config) if they don't already exist:

```ts
export const allModes = {
  mobile: { viewport: 375 },
  tablet: { viewport: 768 },
  default: { viewport: 1280 },
};
```

Check if Storybook's `@storybook/addon-viewport` is already configured and use its built-in presets if available.

### 2. Add Responsive Stories

Add stories to `stories/SearchEditor.stories.svelte` that use viewport parameters:

- **Mobile / Empty** — empty editor at 375px
- **Mobile / With Chips** — complex query with multiple chips at 375px
- **Mobile / Autocomplete Open** — editor with autocomplete dropdown visible at 375px
- **Tablet / With Chips** — complex query at 768px
- **Tablet / Autocomplete Open** — autocomplete dropdown at 768px

Each story should use the `parameters.viewport` Storybook API to set the viewport size.

### 3. Queries to Test

Use these representative queries across viewport sizes:

- Empty editor (placeholder visibility)
- Short query: `user:102112 access:public`
- Long query: `+user:102112 created_at:[NOW-11MONTH TO NOW-3MONTH] AND project:214246 sort:page_count`
- Query with many chips that would wrap

## Files to Modify

| File | Change |
|------|--------|
| `.storybook/modes.ts` | Add mobile (375px) and tablet (768px) viewport modes if not already present. |
| `stories/SearchEditor.stories.svelte` | Add responsive stories using viewport parameters. |

## Deliverable

Storybook stories at each viewport size that can be visually inspected. No CSS fixes are included in this task — issues found during the audit will be filed as separate follow-ups.

## Out of Scope

- Fixing any responsive issues found (those become separate tasks).
- Touch interaction changes.
- Automated visual regression testing.
