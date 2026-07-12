/**
 * Developer Commit Activity Adapter
 * Normalizes raw git commit payloads into structured CCP context objects.
 */

const RECOGNIZED_TECH_KEYWORDS = [
  { term: "react", token: "React", domain: "frontend" },
  { term: "vue", token: "Vue", domain: "frontend" },
  { term: "next.js", token: "Next.js", domain: "frontend" },
  { term: "node", token: "Node.js", domain: "backend" },
  { term: "python", token: "Python", domain: "backend" },
  { term: "rust", token: "Rust", domain: "systems" },
  { term: "docker", token: "Docker", domain: "devops" },
  { term: "kubernetes", token: "Kubernetes", domain: "devops" },
  { term: "aws", token: "AWS", domain: "cloud" }
];

/**
 * Parses a raw git commit log text or webhook frame payload object.
 * @param {Object|string} rawCommit - The input commit data string or object structure
 * @returns {Object} Structured CCP frame properties mapping token metadata descriptors
 */
export function parseCommitActivity(rawCommit) {
  let message = "";
  let author = "unknown";
  let hash = "unknown";
  let timestamp = new Date().toISOString();

  // Handle either raw text lines or structured JSON objects cleanly
  if (typeof rawCommit === "string") {
    message = rawCommit;
  } else if (rawCommit && typeof rawCommit === "object") {
    message = rawCommit.message || rawCommit.commit?.message || "";
    author = rawCommit.author || rawCommit.commit?.author?.name || "unknown";
    hash = rawCommit.hash || rawCommit.sha || "unknown";
    if (rawCommit.timestamp || rawCommit.commit?.author?.date) {
      timestamp = new Date(rawCommit.timestamp || rawCommit.commit?.author?.date).toISOString();
    }
  }

  const normalizedMessage = message.toLowerCase();
  const technologiesDetected = [];
  const domainTags = new Set();

  // Run taxonomy scanning matrix extraction rules
  for (const item of RECOGNIZED_TECH_KEYWORDS) {
    if (normalizedMessage.includes(item.term)) {
      technologiesDetected.push(item.token);
      domainTags.add(item.domain);
    }
  }

  // Set an operational signal type category classification classification token
  const category = technologiesDetected.length > 0 ? "developer_work" : "general";

  return {
    schema_version: "memact.ccp_observation.v1",
    event_type: "developer_commit",
    category,
    title: `Commit activity: ${message.split("\n")[0].slice(0, 60)}`,
    evidence: {
      commit_hash: hash,
      author,
      raw_message: message,
      technologies: [...new Set(technologiesDetected)],
      domains: [...domainTags]
    },
    occurred_at: timestamp
  };
}