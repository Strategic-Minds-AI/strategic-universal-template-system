// Artifact system — SHA-256 checksums and immutable output manifests.
// Uses Web Crypto SubtleCrypto (available in browsers and workers).

export async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function byteSize(text) {
  return new TextEncoder().encode(text).length;
}

// Build an artifact record from inline content.
export async function makeArtifact({ run_id, step_key, name, path, content, media_type, metadata, dependencies }) {
  const sha = await sha256(content || "");
  return {
    run_id,
    step_key,
    name,
    path: path || name,
    media_type: media_type || "text/plain",
    content: content || "",
    sha256: sha,
    size_bytes: byteSize(content || ""),
    metadata: metadata || {},
    dependencies: dependencies || [],
    validation_state: "unvalidated",
  };
}

// Build an output manifest (schema-compliant) from artifact records.
export function buildManifest(run_id, artifacts) {
  return {
    run_id,
    artifacts: artifacts.map((a) => ({
      artifact_id: a.sha256,
      sha256: a.sha256,
      media_type: a.media_type,
      path: a.path,
    })),
  };
}

// Verify an artifact's content matches its declared checksum.
export async function verifyChecksum(artifact) {
  const sha = await sha256(artifact.content || "");
  return { valid: sha === artifact.sha256, computed: sha, declared: artifact.sha256 };
}