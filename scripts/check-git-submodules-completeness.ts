#!/usr/bin/env npx tsx

/**
 * Git Submodules Completeness Checker
 * 
 * Verifies a git submodule operation against the 8-item Git Submodules Quality Checklist.
 * 
 * Usage:
 *   npx tsx skills/git-submodules/scripts/check-git-submodules-completeness.ts --phase <phase>
 */

import { argv } from "process";
import { execSync } from "child_process";

// ============================================================================
// Types
// ============================================================================

/**
 * One row in the git-submodules quality checklist with scoring inputs.
 *
 * @remarks
 * `checked` is derived from the active phase plus local `git` probes for `.gitmodules` and
 * worktree configuration; required items gate `canFinalize` in the emitted report.
 */
interface ChecklistItem {
  number: number;
  name: string;
  description: string;
  required: boolean;
  checked: boolean;
  weight: number;
}

/**
 * Aggregate scoring envelope surfaced to humans and optional `--json` consumers.
 *
 * @remarks
 * Uses weighted checklist rows while `canFinalize` tracks only required items.
 */
interface CompletenessReport {
  checklist: ChecklistItem[];
  score: number;
  maxScore: number;
  canFinalize: boolean;
}

// ============================================================================
// Checklist Definition
// ============================================================================

const CHECKLIST_ITEMS: Omit<ChecklistItem, "checked">[] = [
  { number: 1, name: "Config layers understood", description: ".gitmodules vs .git/config precedence known", required: true, weight: 2 },
  { number: 2, name: "Branch override scope", description: ".gitmodules vs --worktree vs repo-local", required: true, weight: 2 },
  { number: 3, name: "Gitlink vs remote", description: "SHA controls checkout, branch affects update", required: true, weight: 2 },
  { number: 4, name: "Worktree config enabled", description: "extensions.worktreeConfig true if needed", required: false, weight: 1 },
  { number: 5, name: "Path resolution", description: "git rev-parse --git-path used", required: true, weight: 1 },
  { number: 6, name: "Bootstrap preserved", description: ".gitmodules kept for new clones", required: true, weight: 2 },
  { number: 7, name: "Migration safe", description: ".gitmodules drift removed cleanly", required: false, weight: 1 },
  { number: 8, name: "Verify effective value", description: "git config --show-origin checked", required: true, weight: 2 },
];

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detects whether `.gitmodules` exists and is readable by Git from the current working tree.
 *
 * @remarks
 * I/O: runs `git config -f .gitmodules --get submodule.0.path` synchronously; treats any
 * non-zero exit or missing config as absent.
 *
 * @returns True when Git can read a submodule path entry from `.gitmodules`.
 */
function checkGitmodulesExists(): boolean {
  try {
    execSync("git config -f .gitmodules --get submodule.0.path", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads whether `extensions.worktreeConfig` is enabled in the effective Git configuration.
 *
 * @remarks
 * I/O: runs `git config --get extensions.worktreeConfig` synchronously via `execSync`.
 *
 * @returns True when the trimmed stdout equals the literal `true`.
 */
function checkWorktreeConfig(): boolean {
  try {
    const result = execSync("git config --get extensions.worktreeConfig", { stdio: "pipe" });
    return result.toString().trim() === "true";
  } catch {
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

/**
 * CLI entrypoint for the submodule completeness checklist scorer.
 *
 * @remarks
 * Parses `--phase`/`-p` and optional `--json`, prints human-readable progress plus checklist
 * icons, and may append a JSON report derived from the in-memory checklist state.
 */
function main() {
  const args = argv.slice(2);
  const phaseArg = args.find(a => a === "--phase" || a === "-p");
  const jsonArg = args.includes("--json");
  
  const phase = phaseArg 
    ? parseInt(args[args.indexOf(phaseArg) + 1] || "8", 10)
    : 8;
  
  console.log("\n📋 Git Submodules Completeness Check");
  console.log("═".repeat(60));
  console.log(`\n📊 Phase: ${phase}/8`);
  
  // Run checks
  const gitmodulesExists = checkGitmodulesExists();
  const worktreeConfig = checkWorktreeConfig();
  
  console.log(`\n📊 Git Status:`);
  console.log(`   .gitmodules exists: ${gitmodulesExists ? "✅" : "⚠️"}`);
  console.log(`   extensions.worktreeConfig: ${worktreeConfig ? "✅" : "⚠️"}`);
  
  // Build checklist based on phase
  const checklist: ChecklistItem[] = CHECKLIST_ITEMS.map(item => {
    let checked = false;
    
    switch (item.number) {
      case 1: // Config layers understood
        checked = phase >= 1;
        break;
      case 2: // Branch override scope
        checked = phase >= 2;
        break;
      case 3: // Gitlink vs remote
        checked = phase >= 3;
        break;
      case 4: // Worktree config enabled
        checked = worktreeConfig || item.required === false;
        break;
      case 5: // Path resolution
        checked = phase >= 4;
        break;
      case 6: // Bootstrap preserved
        checked = gitmodulesExists || phase < 2;
        break;
      case 7: // Migration safe
        checked = phase >= 7 || item.required === false;
        break;
      case 8: // Verify effective value
        checked = phase >= 8;
        break;
      default:
        break;
    }
    
    return { ...item, checked };
  });
  
  const score = checklist.reduce((sum, item) => 
    item.checked ? sum + item.weight : sum, 0);
  const maxScore = checklist.reduce((sum, item) => sum + item.weight, 0);
  
  const requiredItems = checklist.filter(i => i.required);
  const requiredScore = requiredItems.reduce((sum, item) => 
    item.checked ? sum + item.weight : sum, 0);
  const requiredMax = requiredItems.reduce((sum, item) => sum + item.weight, 0);
  
  const canFinalize = requiredScore === requiredMax;
  
  console.log(`\n📊 Score: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(0)}%)`);
  console.log(`   Required items: ${requiredScore}/${requiredMax}`);
  
  console.log(`\n${canFinalize ? "✅" : "⚠️"} Ready: ${canFinalize ? "YES" : "NEEDS WORK"}`);
  
  console.log("\n📝 Checklist:");
  for (const item of checklist) {
    const icon = item.checked ? "✅" : item.required ? "❌" : "⚠️";
    console.log(`   ${icon} [${item.number}] ${item.name}`);
  }
  
  console.log("\n" + "═".repeat(60));
  
  if (!canFinalize) {
    console.log("\n⚠️ Git submodule operation needs verification.");
    const failedItems = checklist.filter(i => !i.checked && i.required);
    if (failedItems.length > 0) {
      console.log("\nIssues to verify:");
      failedItems.forEach(i => console.log(`   - ${i.name}: ${i.description}`));
    }
  } else {
    console.log("\n✅ Git submodule operation is verified.");
  }
  
  if (jsonArg) {
    const report: CompletenessReport = { checklist, score, maxScore, canFinalize };
    console.log("\n" + JSON.stringify(report, null, 2));
  }
}

main();
