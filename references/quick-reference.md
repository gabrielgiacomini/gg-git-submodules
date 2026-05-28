---
source_url: https://git-scm.com/docs/git-config
captured_at: 2026-03-21
title: Quick Reference — Submodule-Relevant Git Config
---

# Quick Reference — Submodule-Relevant Git Config

This file covers the `git config` flags, scopes, and keys most frequently used when diagnosing submodule branch override and worktree-local config issues. For the complete man page, see `git-config.md`.

## Config precedence

Git reads configuration in this order; last value wins:

1. `$(prefix)/etc/gitconfig` (`--system`)
2. `~/.gitconfig` or `$XDG_CONFIG_HOME/git/config` (`--global`)
3. `.git/config` (`--local`, default for writes)
4. `.git/worktrees/<id>/config.worktree` (`--worktree`, only when `extensions.worktreeConfig` is enabled)
5. Command-line `-c` options and `GIT_CONFIG_*` env vars (`command` scope)

For submodule branch overrides, this means `.git/config` overrides `.gitmodules`, and `config.worktree` overrides `.git/config`.

## Inspection commands

| Command | Purpose |
|---------|---------|
| `git config --show-origin --get submodule.<name>.branch` | Show the effective branch and which file owns it. |
| `git config --show-origin --get-regexp '^submodule\..*\.branch$'` | List all submodule branch settings with origins. |
| `git config --show-scope --get submodule.<name>.branch` | Show the scope (local, worktree, etc.) of the effective value. |
| `git config -f .gitmodules --get-regexp '^submodule\..*\.(path\|url\|branch)$'` | Inspect the tracked manifest. |
| `git rev-parse --git-path config.worktree` | Resolve the worktree config path portably. |
| `git worktree list` | Show linked worktrees and their paths. |

## Config scopes

| Scope | File | Flag |
|-------|------|------|
| system | `$(prefix)/etc/gitconfig` | `--system` |
| global | `~/.gitconfig` or `$XDG_CONFIG_HOME/git/config` | `--global` |
| local | `.git/config` | `--local` (default) |
| worktree | `.git/worktrees/<id>/config.worktree` | `--worktree` |
| command | env vars / `-c` | `-c` |

## Key configuration variables

| Variable | Scope | Purpose |
|----------|-------|---------|
| `submodule.<name>.branch` | `.gitmodules`, `.git/config`, `config.worktree` | Remote branch used by `git submodule update --remote`. |
| `submodule.<name>.update` | `.gitmodules`, `.git/config` | Update procedure: `checkout`, `rebase`, `merge`, `none`. |
| `submodule.<name>.path` | `.gitmodules` (required) | Where the submodule is checked out. |
| `submodule.<name>.url` | `.gitmodules` (required) | Clone URL for the submodule. |
| `submodule.<name>.active` | `.git/config` | Whether the submodule is active. |
| `extensions.worktreeConfig` | `.git/config` | Enables per-worktree `config.worktree`. |

## Setting overrides

```bash
# Repo-local override (affects all worktrees unless worktreeConfig is enabled)
git config submodule.<name>.branch <branch>

# Worktree-local override (requires extensions.worktreeConfig)
git config extensions.worktreeConfig true
git config --worktree submodule.<name>.branch <branch>

# Verify which file wins
git config --show-origin --get submodule.<name>.branch
```

## Submodule update semantics

| Command | Behavior |
|---------|----------|
| `git submodule update --init -- <path>` | Checks out the gitlink SHA recorded in the superproject. |
| `git submodule update --remote -- <path>` | Fetches and checks out the tip of the tracking branch configured in `submodule.<name>.branch`. |
| `git submodule set-branch --branch <branch> -- <path>` | Writes the branch hint to `.gitmodules` (tracked/distributed). |

## Worktree-specific notes

- `git config --worktree` without `extensions.worktreeConfig` falls back to `.git/config`.
- `core.bare` and `core.worktree` should not be shared across worktrees; move them to `config.worktree` when `extensions.worktreeConfig` is enabled.
- Use `git rev-parse --git-path config.worktree` instead of hardcoding `.git/worktrees/<id>/config.worktree`.

## Active submodules

A submodule is active if any of the following is true (evaluated in order):

1. `submodule.<name>.active` is set to `true`.
2. The submodule path matches the pathspec in `submodule.active`.
3. `submodule.<name>.url` is set.

Only active submodules are updated by default. Example:

```ini
[submodule "foo"]
  active = false
  url = https://example.org/foo
[submodule "bar"]
  active = true
```

In this example, `bar` is active because of its explicit `active = true`. `foo` is inactive because `active = false` takes precedence over `url`.

## Common inspection one-liners

```bash
# Show all submodule branch settings and their origins
git config --show-origin --get-regexp '^submodule\..*\.branch$'

# Show whether extensions.worktreeConfig is enabled
git config --get extensions.worktreeConfig

# List all active submodules
git config --get-regexp '^submodule\..*\.active$'

# Show the path of the current worktree's config.worktree
git rev-parse --git-path config.worktree
```

## Migration checklist: removing tracked `.gitmodules` drift

1. Keep `.gitmodules` tracked with canonical `path` and `url` values.
2. Remove per-checkout branch hints from `.gitmodules`.
3. Set repo-local overrides with `git config submodule.<name>.branch <branch>`.
4. For per-worktree overrides, enable `extensions.worktreeConfig` and use `git config --worktree`.
5. Update any repo scripts that parse `.gitmodules` for branch data to use `git config --show-origin` instead.

> Source: `git-config.md`, `git-submodule.md`, `git-worktree.md`.
