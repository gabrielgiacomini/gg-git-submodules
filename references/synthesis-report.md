# Local Config Patterns for Submodule Branch Overrides

## Research question

What official Git-supported patterns exist for local or worktree-scoped submodule branch overrides,
and do those patterns provide a supported alternative to making `.gitmodules` a gitignored local file?

## Short answer

Yes. Git officially supports local and worktree-scoped submodule branch overrides, but not as a
replacement for the tracked `.gitmodules` path/url manifest.

The supported pattern is:

1. Keep `.gitmodules` as the tracked superproject manifest for submodule path/url data and
   distributed branch hints.
2. Override `submodule.<name>.branch` locally in `.git/config` when a repo-local override is needed.
3. If true per-worktree overrides are needed, enable `extensions.worktreeConfig` and write
   `submodule.<name>.branch` with `git config --worktree`, which stores the value in `config.worktree`.

## Primary findings

### 1. `.gitmodules` remains the official tracked manifest for submodule path/url metadata

Official Git docs say `.gitmodules` is the top-level working-tree file for submodules and that
`submodule.<name>.path` and `submodule.<name>.url` are required keys.

Implications:
- There is no official alternate tracked file that replaces `.gitmodules` for path/url mapping.
- If `.gitmodules` is absent from a fresh clone, Git loses the native mapping source for
  submodule bootstrap.

Sources: `gitmodules.md`, `gitsubmodules.md`

### 2. Git officially supports local branch override in `.git/config`

Official docs state that `submodule.<name>.branch` in `.git/config` overrides the value found in
`.gitmodules`, and `git submodule update --remote` consults `.gitmodules` or `.git/config`, with
`.git/config` taking precedence.

Implications:
- If the only need is "use a different tracking branch in this local checkout", the official
  solution is local Git config, not rewriting tracked `.gitmodules`.
- This override path only affects `git submodule update --remote` and similar config-driven behavior.

Sources: `git-config.md`, `git-submodule.md`, `gitmodules.md`

### 3. Git officially supports worktree-specific overrides through `config.worktree`

Official docs state:
- `git config --worktree` reads from or writes to `config.worktree` when `extensions.worktreeConfig`
  is enabled.
- In worktree-config mode, `config.worktree` is read after `.git/config`.
- `git-worktree` documents enabling `extensions.worktreeConfig` and storing per-worktree settings
  in the path returned by `git rev-parse --git-path config.worktree`.

Implications:
- True worktree-specific submodule branch overrides are officially supported.
- The supported storage location is `config.worktree`, not a gitignored `.gitmodules`.

Sources: `git-config.md`, `git-worktree.md`, `gitrepository-layout.md`

### 4. Worktree-local override was verified locally

Local scratch verification confirmed the doc-backed behavior:
- Main worktree: `submodule.demo.branch = main` in `.git/config`.
- Linked worktree: `submodule.demo.branch = feature` in `.git/worktrees/<id>/config.worktree`.
- `git config --show-origin --get submodule.demo.branch` resolved to:
  - `.git/config` in the main worktree.
  - `config.worktree` in the linked worktree.

`submodule.<name>.branch` can differ per linked worktree without touching tracked `.gitmodules`,
as long as the repo enables `extensions.worktreeConfig`.

### 5. This does not replace what `.gitmodules` is for

Official docs for `git submodule init` describe `.gitmodules` as the template source for
submodule initialization into `.git/config`. Plain `git submodule update --init` still follows the
superproject's recorded gitlink SHA behavior.

Implications:
- Local or worktree-scoped branch overrides do not remove gitlink merge behavior.
- Replacing `.gitmodules` with a gitignored local file would still break native bootstrap unless
  another tracked manifest and generator were added.

### 6. `git submodule set-branch` is not the per-worktree solution

`git submodule set-branch` records the branch in `.gitmodules` for `update --remote`. It is aligned
with tracked/distributed branch defaults — not the right tool when the goal is "different value in
each worktree without tracked drift".

## Decision Rule

| Intent | Configuration layer |
|--------|-------------------|
| Shared distributed default | Tracked `.gitmodules` |
| Local checkout override | `.git/config` via `git config submodule.<name>.branch` |
| Per-worktree override | `config.worktree` via `git config --worktree submodule.<name>.branch` |

## Practical recommendation

If the repo wants different submodule branch targets per worktree without tracked `.gitmodules` drift:

1. Keep `.gitmodules` tracked and canonical for path/url data.
2. Stop treating `.gitmodules` as the per-worktree branch carrier.
3. Store per-worktree `submodule.<name>.branch` overrides in:
   - `.git/config` when repo-local is enough.
   - `config.worktree` via `git config --worktree` when linked worktrees need different values.
4. Update repo scripts that currently parse `.gitmodules` for branch behavior so they resolve the
   effective branch from Git config precedence instead.

## Confidence and limits

**Confidence**: high. Core conclusions are grounded in official Git docs and locally verified.

**Limits**:
- Config-based branch overrides are about `update --remote` branch tracking behavior; they do not
  change the superproject gitlink model.
- Repo-specific adoption still requires an implementation pass because current scripts read
  `.gitmodules` directly in some flows.

## Limitations

Moving branch intent out of tracked `.gitmodules` can reduce one merge-drift surface, but it does
not solve:
- Gitlink SHA merge conflicts in the superproject.
- Native bootstrap requirements for submodule path and URL mapping.
- Repo-local scripts that incorrectly assume `.gitmodules` is the only source of effective branch intent.
