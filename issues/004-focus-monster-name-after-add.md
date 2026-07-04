# Fix: after adding a monster to an encounter, the monster name input on the new row should get focus

## Summary

After submitting the "Add monster" form, the form resets but focus is
lost, forcing the DM to click back into the Monster field before adding
the next monster. Since DMs often add several monsters in a row, this is
a small but repeated bit of friction.

## Current behavior

- `web/src/features/encounters/EncounterSetupPage.tsx`, `onSubmit` handler
  (~lines 90-95) calls `addMonsters.mutate(form, { onSuccess: () =>
  reset(...) })`.
- `reset` (from `react-hook-form`'s `useForm`) only clears form values —
  there is no ref capture or `.focus()` call anywhere in the component.

## Proposed fix

- Capture a ref to the Monster name input (via `register('name').ref` or
  a dedicated `useRef<HTMLInputElement>`).
- In the `onSuccess` callback (after `reset`), call `.focus()` on that
  ref so the cursor returns to the Monster field, ready for the next
  entry.

## Acceptance criteria

- [ ] After adding a monster, the Monster name input is focused and empty.
- [ ] Works for repeated adds without requiring a mouse click between
      submissions.
