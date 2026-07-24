import test from "node:test"
import assert from "node:assert/strict"
import { parseMediaPlayback } from "../src/adapters/media-adapter.mjs"

test("parseMediaPlayback splits a raw text log string correctly into artist and track", () => {
  const rawLog = "Daft Punk - One More Time";
  const result = parseMediaPlayback(rawLog);

  assert.equal(result.schema_version, "memact.ccp_observation.v1");
  assert.equal(result.category, "music");
  assert.equal(result.evidence.artist, "Daft Punk");
  assert.equal(result.evidence.track_title, "One More Time");
});

test("parseMediaPlayback falls back cleanly if string format lacks standard delimiter", () => {
  const rawLog = "Ambient White Noise Soundscape Loops";
  const result = parseMediaPlayback(rawLog);

  assert.equal(result.evidence.artist, "Unknown Artist");
  assert.equal(result.evidence.track_title, "Ambient White Noise Soundscape Loops");
});

test("parseMediaPlayback normalizes structured Spotify webhook payload data structures", () => {
  const payloadMock = {
    played_at: "2026-07-12T07:30:00Z",
    context_uri: "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO",
    track: {
      name: "Starboy",
      duration_ms: 230453,
      artists: [{ name: "The Weeknd" }]
    }
  };

  const result = parseMediaPlayback(payloadMock);
  assert.equal(result.evidence.track_title, "Starboy");
  assert.equal(result.evidence.artist, "The Weeknd");
  assert.equal(result.evidence.duration_ms, 230453);
  assert.equal(result.evidence.streaming_context_uri, "spotify:playlist:37i9dQZF1DX4sWSpwq3LiO");
  assert.equal(result.occurred_at, "2026-07-12T07:30:00.000Z");
});