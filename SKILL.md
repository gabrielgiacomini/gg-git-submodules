---
name: git-submodules
description: when configuring git submodules — branch overrides, .git/config vs config.worktree, update --remote semantics, .gitmodules drift. MCP-compatible. Not for flat repos.
---

# GG → Git Submodules → Config

> **Snapshot age:** collected 2026-03-21 (~43 days old as of today).
> Verify release-sensitive answers with `references/update-workflow.md` before responding with high confidence.

## Overview

Use this skill when the task is about Git's supported submodule configuration model rather than a single ad hoc command:

- whether `.gitmodules` should remain tracked,
- how `submodule.<name>.path`, `.url`, and `.branch` are supposed to work,
- when to use `.git/config` versus `config.worktree`,
- how linked worktrees can carry different submodule branch overrides,
- how `git submodule update --remote` differs from plain `git submodule update --init`,
- or how to migrate a repo away from tracked branch drift without inventing unsupported local hacks.

This skill bundles a 2026-03-21 official Git documentation capture plus a focused synthesis report about local and worktree-scoped submodule branch overrides. Use the bundled snapshot first instead of relying on memory.

For a direct command lookup, see [Quick Commands](#quick-commands) below.

## When to Use This Skill

**TRIGGER when:**

- The user asks about `.gitmodules` tracking, gitignore policy, or config layer precedence.
- A submodule branch override is not behaving as expected and the cause is unclear.
- The repo uses linked worktrees and needs per-worktree submodule branch state.
- The task involves `git submodule update --remote` vs gitlink SHA semantics.
- The repo needs to migrate away from tracked `.gitmodules` branch drift.

**SKIP when:**

- The task is a generic `git clone --recurse-submodules` or basic submodule add question covered by `git submodule --help`.
- The task is about a specific repo's prepared-worktree workflow rather than generic Git submodule rules (consult that repo's worktree workflow skill instead).

## Quick Commands

Inspect the tracked manifest:

```bash
git config -f .gitmodules --get-regexp '^submodule\..*\.(path|url|branch)$'
```

Inspect the effective winning value and its source:

```bash
git config --show-origin --get submodule.<name>.branch
```

Set a repo-local branch override:

```bash
git config submodule.<name>.branch <branch>
```

Enable worktree-local config and set a per-worktree override:

```bash
git config extensions.worktreeConfig true
git config --worktree submodule.<name>.branch <branch>
git rev-parse --git-path config.worktree
```

For the full command surface, see `quick-reference.md`.

## Common Misconceptions

| # | Misconception | Correction | Key concept |
|---|---------------|------------|-------------|
| 1 | "I can gitignore `.gitmodules` to keep branch changes local" | `.gitmodules` is required for bootstrap; put branch intent in `.git/config` instead | Config layer precedence |
| 2 | "My branch override isn't working — I set it in `.gitmodules`" | Branch overrides in `.gitmodules` only affect `update --remote`, not `update --init`; and `.git/config` takes precedence anyway | `submodule.<name>.branch` precedence |
| 3 | "`git submodule set-branch` is how I set a per-worktree branch" | `set-branch` writes to tracked `.gitmodules`; use `git config --worktree` with `extensions.worktreeConfig` for per-worktree state | `git config --worktree` |
| 4 | "I need to hardcode `.git/worktrees/<id>/config.worktree` in my scripts" | Use `git rev-parse --git-path config.worktree` to resolve the path portably | `git rev-parse --git-path` |
| 5 | "Branch overrides let each worktree check out a different submodule commit" | Branch overrides only affect `update --remote`; gitlink SHAs still control which commit is checked out by `update --init` | Gitlink SHA vs `update --remote` |
| 6 | "Gitlink SHA and branch override work together" | Branch overrides affect update --remote, not the gitlink SHA | Separate concerns |

## Command Decision Guide

| Scenario | Recommended command |
|----------|---------------------|
| Inspect effective submodule branch and source | `git config --show-origin --get submodule.<name>.branch` |
| Set shared default branch hint (tracked) | `git submodule set-branch --branch <branch> -- <path>` |
| Set repo-local branch override | `git config submodule.<name>.branch <branch>` |
| Set per-worktree branch override | `git config --worktree submodule.<name>.branch <branch>` |
| Update submodule to superproject gitlink | `git submodule update --init -- <path>` |
| Update submodule to latest tracking branch | `git submodule update --remote -- <path>` |
| Resolve `config.worktree` path portably | `git rev-parse --git-path config.worktree` |

**Rule of thumb:** Use `.git/config` for local overrides and `config.worktree` only when linked worktrees need different values; keep `.gitmodules` canonical for path and URL data.

## Git Submodules Quality Checklist

Use this checklist before and during any submodule configuration operation.

| # | Checklist Item | Why It Matters | Gate |
|---|---------------|---------------|------|
| 1 | **Config layers understood** — .gitmodules vs .git/config precedence known | Correct override placement | Pre-op |
| 2 | **Branch override scope** — .gitmodules vs --worktree vs repo-local | Correct persistence | Draft |
| 3 | **Gitlink vs remote** — SHA controls checkout, branch affects update | Separate concerns | Draft |
| 4 | **Worktree config enabled** — extensions.worktreeConfig true if needed | Per-worktree isolation | Draft |
| 5 | **Path resolution** — git rev-parse --git-path used | Portability | Draft |
| 6 | **Bootstrap preserved** — .gitmodules kept for new clones | Clone compatibility | Draft |
| 7 | **Migration safe** — .gitmodules drift removed cleanly | Clean state | Closeout |
| 8 | **Verify effective value** — git config --show-origin checked | Confirmation | Closeout |

### Quality Tiers

| Tier | Criteria | Use When |
|------|----------|----------|
| **Minimal** | Items 1-3, 8 | Quick inspection |
| **Standard** | Items 1-5, 8 | Submodule configuration |
| **Full** | All 8 items | Migration or complex setup |

### Pre-Op Verification

```
□ Config layer precedence understood
□ .gitmodules vs .git/config role clear
□ Worktree scope determined
□ Gitlink SHA semantics understood
```

## Git Submodules Consistency Validator

Before finalizing, verify:

### Consistency Check Matrix

| Check | What to Verify | How to Fix |
|-------|---------------|------------|
| **Override vs Layer** | Branch override in correct config layer | Move to .git/config |
| **Worktree vs Global** | Per-worktree overrides use --worktree | Enable worktreeConfig |
| **Gitlink vs Remote** | SHA for checkout, branch for update | Separate concerns |
| **Path vs Hardcode** | Use git rev-parse --git-path | Fix hardcoded paths |

### Red Flags (Never Present)

- [ ] Branch override in .gitmodules (not effective)
- [ ] Hardcoded .git/worktrees/<id>/config.worktree path
- [ ] Missing extensions.worktreeConfig for per-worktree state
- [ ] Gitlink SHA confused with branch override
- [ ] .gitmodules removed (breaks bootstrap)

## Non-Negotiable Policy

1. Treat `.gitmodules` as the canonical tracked manifest for submodule path and URL metadata unless a repo has an explicit, separately tracked replacement layer. Do not recommend a hidden local `.gitmodules` as if Git natively supports that pattern.
2. Use `snapshot.md` to locate the right reference file before broad reading.
3. Never reconstruct shell commands, CLI flags, or config steps from memory — always read the relevant reference file first.
4. Distinguish the three relevant configuration layers: tracked `.gitmodules`, repo-local `.git/config`, and worktree-local `config.worktree`.
5. Be explicit that `submodule.<name>.branch` overrides affect branch-aware operations such as `git submodule update --remote`; they do not replace superproject gitlink SHA behavior.
6. Recommend `git config submodule.<name>.branch ...` for repo-local overrides and `git config --worktree ...` only when `extensions.worktreeConfig` is enabled. Treat `git submodule set-branch` as a tracked default-setting tool, not as the solution for hidden per-worktree branch state.
7. Use `git rev-parse --git-path config.worktree` when the physical worktree-config path matters; do not hardcode internal `.git/worktrees/...` layouts in guidance unless the exact storage path is the subject.
8. Load only the subset of `references/` the task requires. Do not read every file by default. For any answer about version-specific behavior, treat the bundled 2026-03-21 snapshot as potentially stale and verify with `references/update-workflow.md` or research skills before stating specifics.

## Workflow

### 1. Classify the request

Classify the task as one of:

- `.gitmodules` tracking or gitignore policy,
- local branch override in a normal checkout,
- true linked-worktree override,
- submodule bootstrap or initialization behavior,
- `update --remote` versus gitlink SHA semantics,
- repo migration away from tracked branch drift,
- or documentation refresh.

### 2. Load the minimum useful references

For diagnostic requests ("why isn't my override working?"), run the inspection commands first before loading any reference files.

| Task type | Load these files | Skip |
|-----------|-----------------|------|
| `.gitmodules` tracking or gitignore policy | `synthesis-report.md`, `gitmodules.md`, `gitsubmodules.md` | worktree files |
| Local branch override | `synthesis-report.md`, `git-config.md`, `git-submodule.md` | worktree files |
| True linked-worktree override | `synthesis-report.md`, `git-config.md`, `git-worktree.md`, `gitrepository-layout.md` | `gitsubmodules.md` |
| Submodule bootstrap or init | `gitmodules.md`, `gitsubmodules.md`, `git-submodule.md` | config/worktree files |
| `update --remote` vs gitlink SHA | `git-submodule.md`, `gitmodules.md`, `git-config.md` | worktree files |
| Repo migration away from tracked drift | `synthesis-report.md`, all man pages | none |
| Documentation refresh | `snapshot.md`, `update-workflow.md` | all man pages |
| Diagnostic / inspection-first | `quick-reference.md` — first run: `git config --show-origin --get-regexp '^submodule\..*\.branch$'` and `git config -f .gitmodules --get-regexp '^submodule\..*\.(path\|url\|branch)$'` before recommending any changes | — |

Load only the subset the task needs.

### 3. Choose the right configuration layer

- Tracked and distributed default: keep or edit `.gitmodules`, or use `git submodule set-branch` when the goal is a shared branch hint for `git submodule update --remote`.
- Repo-local override: use `git config submodule.<name>.branch <branch>`.
- Worktree-local override: enable `extensions.worktreeConfig`, then use `git config --worktree submodule.<name>.branch <branch>`.
- Bootstrap and mapping: keep `.gitmodules` available because Git still uses it as the path and URL template source.

If the user wants to remove tracked `.gitmodules` drift, the default recommendation is not "gitignore `.gitmodules`". The default recommendation is to keep `.gitmodules` canonical and move per-checkout or per-worktree branch intent into Git config precedence.

### 4. Recommend commands explicitly

Use explicit commands instead of vague prose:

```bash
git config submodule.<name>.branch <branch>
git config --show-origin --get submodule.<name>.branch
git config --show-origin --get-regexp '^submodule\..*\.branch$'

git config extensions.worktreeConfig true
git config --worktree submodule.<name>.branch <branch>
git rev-parse --git-path config.worktree

git submodule update --remote -- <path>
git submodule update --init -- <path>

git submodule set-branch --branch <branch> -- <path>
```

Always explain what each command changes: local config, worktree-local config, tracked `.gitmodules`, or recorded gitlink SHAs.

### 5. Validate the recommendation

When validating behavior:

- inspect the effective branch source with `git config --show-origin --get ...`,
- confirm whether `.gitmodules` still contains required `path` and `url` keys,
- distinguish `git submodule update --remote` from plain `git submodule update --init`,
- and check whether the superproject gitlink changed after the update.

If the task is repo-specific, also inspect whether local scripts read `.gitmodules` directly or already resolve Git config precedence.

### 6. Report the outcome

Always report:

- which configuration layer should own the value,
- whether `.gitmodules` remains tracked,
- and whether `extensions.worktreeConfig` is required.

Include when relevant: whether the recommendation affects only branch-tracking behavior or also gitlink commits, whether the answer relies on the bundled snapshot or required a refresh, and any residual risks such as bootstrap breakage or hidden local state.

## Common Pitfalls

1. **Gitignoring `.gitmodules` to hide branch changes.**
   `.gitmodules` is required for submodule bootstrap on fresh clones. Hiding it breaks initialization. Keep `.gitmodules` tracked for path/url data and move branch intent into `.git/config` or `config.worktree`. See `synthesis-report.md`.

2. **Using `git submodule set-branch` for per-worktree overrides.**
   `set-branch` writes to tracked `.gitmodules`, which creates distributed drift. For per-worktree state, enable `extensions.worktreeConfig` and use `git config --worktree`. See `git-submodule.md`.

3. **Expecting `submodule.<name>.branch` to change the commit checked out by `update --init`.**
   Branch overrides only affect `update --remote`. `update --init` always follows the superproject gitlink SHA. See `git-submodule.md`.

4. **Setting `git config --worktree` without enabling `extensions.worktreeConfig`.**
   When the extension is disabled, `--worktree` falls back to `.git/config`. Verify with `git config --show-origin`. See `git-config.md`.

5. **Hardcoding `.git/worktrees/<id>/config.worktree` in scripts.**
   The worktree ID is an implementation detail. Use `git rev-parse --git-path config.worktree` for portability. See `git-worktree.md`.

6. **Assuming submodule branch overrides are shared across worktrees.**
   `.git/config` is shared across all worktrees. To get per-worktree values, you must use `config.worktree` via `git config --worktree`. See `git-worktree.md`.

## Troubleshooting

| Symptom | Likely cause | Fix | Reference |
|---------|--------------|-----|-----------|
| `submodule.<name>.branch` override has no effect | The override is in `.gitmodules` but `.git/config` takes precedence, or the command used was `update --init` instead of `update --remote` | Inspect with `git config --show-origin --get submodule.<name>.branch` and use the correct update command | `git-config.md`, `git-submodule.md` |
| `git config --worktree` writes to `.git/config` | `extensions.worktreeConfig` is not enabled | Run `git config extensions.worktreeConfig true` in the main worktree first | `git-config.md` |
| Submodule fails to initialize on fresh clone | `.gitmodules` is missing, gitignored, or lacks required `path`/`url` keys | Restore `.gitmodules` and ensure it contains `submodule.<name>.path` and `submodule.<name>.url` | `gitmodules.md` |
| Linked worktree loses submodule branch override after `git submodule update --init` | `update --init` follows the gitlink SHA, not the tracking branch | Distinguish between `--init` and `--remote`; the override only affects `--remote` | `git-submodule.md` |
| Conflicting branch hints after merge | `.gitmodules` drift from multiple contributors setting different branch defaults | Move local intent to `.git/config` or `config.worktree` and keep `.gitmodules` canonical | `synthesis-report.md` |

## Local Corpus Layout

All reference files live directly in `references/` — no subfolders. Total: 9 files.

### Curated orientation files

- `references/snapshot.md` — corpus overview: what is captured, when, topic navigation.
- `references/synthesis-report.md` — main synthesized analysis of local config patterns, including decision rules and limitations.
- `references/update-workflow.md` — how to refresh this corpus when Git docs change.

### Quick reference

- `references/quick-reference.md` — first-load cheat sheet for inspection commands, config scopes, and submodule update semantics.

### Verbatim Git man-page captures (2026-03-21)

Each file has frontmatter with `source_url` and `captured_at`.

- `references/gitmodules.md` — `.gitmodules` format, required keys, distributed branch hint semantics.
- `references/gitsubmodules.md` — high-level submodule concepts, active submodules, superproject relationships.
- `references/git-submodule.md` — `update --remote`, `set-branch`, `init`, and command semantics.
- `references/git-config.md` — focused extract of config scopes, submodule variables, `extensions.worktreeConfig`, and precedence.
- `references/git-worktree.md` — linked worktrees, `git config --worktree`, `rev-parse --git-path config.worktree`.
- `references/gitrepository-layout.md` — on-disk layout including `.git/worktrees/<id>/config.worktree` and repository format versions.

Use the verbatim man-page files as the primary source and `synthesis-report.md` as the starting synthesis. For routine lookups, load `quick-reference.md` first.

## Cross-Skill Coordination

Use together with:

- A web-research skill or Firecrawl CLI when the bundled Git docs need a newer capture.
- A host-repo skills-manager skill when the parent repo's skill tooling itself needs structural updates.
- The target repo's worktree workflow skill when these Git rules need to be applied to a specific prepared-worktree workflow rather than answered generically.

See [Local Corpus Layout](#local-corpus-layout) for the full file index.

## Temporary Files

If this skill needs to create temporary files, place them under `.tmp/git-submodules/YYYY-MM-DD-{subject}`. The root `.tmp/` directory is already gitignored. Do not create top-level dotfile temp directories.
