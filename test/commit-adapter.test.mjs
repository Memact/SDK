import test from "node:test"
import assert from "node:assert/strict"
import { parseCommitActivity } from "../src/adapters/commit-adapter.mjs"

test("parseCommitActivity maps raw text log and extracts tech stacks correctly", () => {
  const sampleLog = "feat: implement hooks system using react and node server paths";
  const result = parseCommitActivity(sampleLog);

  assert.equal(result.schema_version, "memact.ccp_observation.v1");
  assert.equal(result.category, "developer_work");
  assert.deepEqual(result.evidence.technologies, ["React", "Node.js"]);
  assert.deepEqual(result.evidence.domains, ["frontend", "backend"]);
});

test("parseCommitActivity falls back to general category if no tech keywords match", () => {
  const sampleLog = "docs: update readme text formatting rules";
  const result = parseCommitActivity(sampleLog);

  assert.equal(result.category, "general");
  assert.equal(result.evidence.technologies.length, 0);
});

test("parseCommitActivity normalizes full GitHub webhook payloads", () => {
  const webhookMock = {
    sha: "abcd1234efgh",
    commit: {
      message: "fix: resolve security flaw using rust backend logic",
      author: { name: "Annu Kumar", date: "2026-07-12T00:00:00Z" }
    }
  };

  const result = parseCommitActivity(webhookMock);
  assert.equal(result.evidence.commit_hash, "abcd1234efgh");
  assert.equal(result.evidence.author, "Annu Kumar");
  assert.deepEqual(result.evidence.technologies, ["Rust"]);
  // FIXED: Adjusted string comparison token layout to match standard millisecond formatting passes
  assert.equal(result.occurred_at, "2026-07-12T00:00:00.000Z");
});