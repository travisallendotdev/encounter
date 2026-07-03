# Ralph Agent Instructions

You are an autonomous coding agent working on a software project.

## Your Task

1. Read the PRD at `.ralph/prd.json`
2. Read the progress log at `.ralph/progress.txt` (check Codebase Patterns section first)
3. Check you're on the correct branch from PRD `branchName`. If not, check it out or create from main.
4. Pick the **highest priority** user story where `passes: false`
5. Read the task file at the story's `taskFile` path — this contains detailed step-by-step instructions
6. If you need broader context (architecture, tech stack, dependencies), read `.ralph/tasks/plan-context.md`
7. Follow the task file steps exactly — it includes code to write, tests to run, and expected outcomes
8. Run quality checks after each step as specified in the task file (typecheck, test, etc.)
9. Update CLAUDE.md files if you discover reusable patterns (see below)
10. If all checks pass, commit ALL changes with message: `feat: [Story ID] - [Story Title]`
11. Update the PRD to set `passes: true` for the completed story
12. Append your progress to `.ralph/progress.txt`

## Working with Task Files

Each task file contains the complete implementation instructions for one task including:
- Files to create or modify
- Exact code to write (use as-is unless it doesn't compile/pass)
- Test code to write first (TDD — write test, verify it fails, then implement)
- Commands to run and expected outcomes
- Commit instructions

**Follow the steps in order.** If a step says "Run test to verify it fails," do that before implementing. If a step says "Run full test suite," do that before committing.

**If code in the task file doesn't compile or pass tests**, adapt it to fit the actual codebase while preserving the intent. Note what you changed in the progress log.

## Progress Report Format

APPEND to `.ralph/progress.txt` (never replace, always append):
```
## [Date/Time] - [Story ID]
- What was implemented
- Files changed
- Any deviations from the task file and why
- **Learnings for future iterations:**
  - Patterns discovered (e.g., "this codebase uses X for Y")
  - Gotchas encountered (e.g., "don't forget to update Z when changing W")
  - Useful context (e.g., "the evaluation panel is in component X")
---
```

The learnings section is critical — it helps future iterations avoid repeating mistakes.

## Consolidate Patterns

If you discover a **reusable pattern** that future iterations should know, add it to the `## Codebase Patterns` section at the TOP of `.ralph/progress.txt` (create it if it doesn't exist):

```
## Codebase Patterns
- Example: Use `sql<number>` template for aggregations
- Example: Always use `IF NOT EXISTS` for migrations
- Example: Export types from actions.ts for UI components
```

Only add patterns that are **general and reusable**, not story-specific details.

## Update CLAUDE.md Files

Before committing, check if any edited files have learnings worth preserving in nearby CLAUDE.md files:

1. **Identify directories with edited files**
2. **Check for existing CLAUDE.md** in those directories or parent directories
3. **Add valuable learnings** — API patterns, gotchas, dependencies, testing approaches

**Do NOT add:** Story-specific details, temporary debugging notes, info already in progress.txt

## Quality Requirements

- ALL commits must pass quality checks (typecheck, lint, test)
- Do NOT commit broken code
- Keep changes focused and minimal
- Follow existing code patterns

## Stop Condition

After completing a user story, check if ALL stories have `passes: true`.

If ALL stories are complete and passing, reply with:
<promise>COMPLETE</promise>

If there are still stories with `passes: false`, end your response normally (another iteration will pick up the next story).

## Important

- Work on ONE story per iteration
- Commit frequently
- Keep CI green
- Read the Codebase Patterns section in progress.txt before starting
