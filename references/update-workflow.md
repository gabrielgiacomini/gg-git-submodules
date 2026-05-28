# Updating This Skill

Use this workflow when Git documentation or supported submodule-config behavior may have changed
and this skill needs a newer snapshot.

## When to refresh

Refresh when:
- The user asks for Git behavior beyond the 2026-03-21 snapshot.
- `extensions.worktreeConfig` or `git config --worktree` semantics may have changed.
- Submodule branch precedence or `update --remote` behavior appears different.
- `.gitmodules` requirements or bootstrap semantics appear different.
- New official Git docs are needed beyond the current bundled set.

**Recommended cadence:** Re-run this workflow if the capture date exceeds 90 days or a new major
Git version is released.

## Refresh workflow

### 1. Verify Firecrawl is ready

```bash
firecrawl --status
```

### 2. Open a timestamped research session

```bash
npm run research:session:init -- --query "Official Git submodule config and worktree override refresh"
```

### 3. Create output folders inside the new session

```bash
SESSION_DIR=".researches/<timestamp>"
mkdir -p "$SESSION_DIR/documentation/markdown"
mkdir -p "$SESSION_DIR/firecrawl/raw"
mkdir -p "$SESSION_DIR/firecrawl/reports"
```

### 4. Scrape the official Git pages

```bash
GIT_DOC_URLS=(
  "https://git-scm.com/docs/gitmodules"
  "https://git-scm.com/docs/gitsubmodules"
  "https://git-scm.com/docs/git-config"
  "https://git-scm.com/docs/git-submodule"
  "https://git-scm.com/docs/git-worktree"
  "https://git-scm.com/docs/gitrepository-layout"
)

for url in "${GIT_DOC_URLS[@]}"; do
  slug="$(basename "$url")"
  firecrawl scrape "$url" \
    --only-main-content --format markdown \
    -o "$SESSION_DIR/documentation/markdown/${slug}.md"
done
```

### 5. Refresh search provenance

```bash
firecrawl search "site:git-scm.com/docs submodule.<name>.branch .git/config overrides .gitmodules" \
  --limit 8 --scrape --scrape-formats markdown --json \
  -o "$SESSION_DIR/firecrawl/raw/search-submodule-branch-config.json"

firecrawl search "site:git-scm.com/docs extensions.worktreeConfig git config --worktree config.worktree" \
  --limit 8 --scrape --scrape-formats markdown --json \
  -o "$SESSION_DIR/firecrawl/raw/search-config-worktree.json"

firecrawl search "site:git-scm.com/docs git-worktree config.worktree rev-parse --git-path config.worktree" \
  --limit 8 --scrape --scrape-formats markdown --json \
  -o "$SESSION_DIR/firecrawl/raw/search-git-worktree-config.json"
```

### 6. Rebuild the report artifacts

Write a new `firecrawl/reports/official-git-submodule-local-config-patterns.md` that covers:
- Whether `.gitmodules` remains canonical.
- Whether `.git/config` overrides `.gitmodules`.
- Whether worktree-local config is officially supported.
- What still depends on gitlink SHA behavior.

### 7. Mirror into `references/`

Copy the new verbatim man-page captures to `references/`, overwriting the prior set:

```bash
for f in "$SESSION_DIR/documentation/markdown/"*.md; do
  slug="$(basename "$f")"
  cp "$f" "references/$slug"
done
```

Update these files with the new snapshot date and findings:
- `references/snapshot.md`
- `references/synthesis-report.md`
- `references/update-workflow.md` (if the refresh procedure itself changed)
- `SKILL.md` — update snapshot date in description frontmatter and Non-Negotiable Policy

## Update rules

- Prefer official Git docs over secondary commentary.
- Keep the snapshot date explicit in `snapshot.md` and `SKILL.md`.
- If new docs materially change the supported pattern, update the Non-Negotiable Policy section in
  `SKILL.md` rather than burying the change in a reference note.
- After mirroring, trim `git-config.md` to submodule and worktree-relevant sections only (keep
  NAME/SYNOPSIS/DESCRIPTION, COMMANDS, relevant OPTIONS, FILES, SCOPES, EXAMPLES, CONFIGURATION FILE
  syntax, and the `submodule.*` and `extensions.worktreeConfig` VARIABLES sections).

## Validation after refresh

```bash
# In a parent repo with skill-manager compatibility commands:
npm run skills:manager:validate -- skills/git-submodules
npm run check:skills-assets
npm run skills:sync
npm run check:guidance-skills-alignment
npm run check:skills-naming

# In this standalone repo, validate manually:
# - Ensure SKILL.md frontmatter is present and correct
# - Ensure agents/openai.yaml matches SKILL.md description
# - Ensure assets/ contains icon files if required by the target IDE
```
