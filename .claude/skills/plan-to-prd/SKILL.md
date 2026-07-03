---
name: plan-to-prd
description: Convert an implementation plan document into a Ralph PRD (prd.json + per-task markdown files). Use when asked to prepare a plan for Ralph, create a prd.json from a plan, set up Ralph for a plan, or convert a plan document to Ralph format. Accepts a plan document path as argument (e.g., "/plan-to-prd docs/plans/my-plan.md").
---

# Plan-to-PRD Converter

Convert a structured implementation plan into Ralph's split-file PRD format: a lightweight `prd.json` index + individual task markdown files preserving full fidelity.

## Input Requirements

The plan document must use `### Task N:` headings to delimit tasks. Everything before the first task heading is treated as plan context/metadata.

## Procedure

### 1. Read and Parse the Plan Document

Read the file passed as the skill argument. Identify:
- **Plan header**: everything before the first `### Task` heading (contains goal, architecture, tech stack, etc.)
- **Task sections**: split at each `### Task N:` boundary through the next `### Task` or end of file
- **Metadata**: extract from the header:
  - `project`: from the `# Title` heading (strip "Implementation Plan" suffix if present)
  - `description`: from the `**Goal:**` line or first paragraph after the title
  - `sourceDocument`: the path to the original plan file (relative to project root)

### 2. Derive Branch Name

Slugify the project name: lowercase, replace spaces with hyphens, prefix with `ralph/`.
Example: "Network Graph" -> `ralph/network-graph`

### 3. Create Task Files

Create directory `.ralph/tasks/` if it doesn't exist.

For each `### Task N: Title` section:
1. Generate filename: `task-NN-slug.md` where NN is zero-padded task number and slug is the kebab-case title
   - Example: `### Task 3: Add ELB Listener Collector` -> `task-03-elb-listener-collector.md`
2. Write the full markdown content of that section verbatim (include the `### Task N:` heading)
3. Prepend a context block at the top of each task file:

```markdown
<!-- Plan: {sourceDocument} | Project: {project} | Branch: {branchName} -->
```

This gives the agent minimal context without duplicating the full plan header.

### 4. Create plan-context.md

Write `.ralph/tasks/plan-context.md` containing the plan header (everything before Task 1). This file is available for the agent to read if it needs architectural context, but is NOT read by default on every iteration.

### 5. Generate prd.json

Write `.ralph/prd.json`:

```json
{
  "project": "{project}",
  "branchName": "ralph/{slug}",
  "description": "{description}",
  "sourceDocument": "{relative path to original plan}",
  "userStories": [
    {
      "id": "TASK-01",
      "title": "{task title}",
      "taskFile": ".ralph/tasks/task-01-{slug}.md",
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

### 6. Update .ralph/CLAUDE.md

Replace `.ralph/CLAUDE.md` with the template from [references/claude-md-template.md](references/claude-md-template.md). Read the template and write it to `.ralph/CLAUDE.md`.

### 7. Initialize Progress File

Create `.ralph/progress.txt` if it doesn't exist:

```
# Ralph Progress Log
Started: {current date/time}
---
```

### 8. Summary

Print a summary of what was created:
- Number of tasks extracted
- List of task files with IDs and titles
- Branch name
- Reminder to run `./ralph.sh --tool claude` to start execution
