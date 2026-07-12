/**
 * Media Playback Context Adapter
 * Normalizes raw playback histories into unified CCP music signals.
 */

/**
 * Parses a raw media history log string or a telemetry track frame object.
 * @param {Object|string} rawPlayback - Input media playback detail data
 * @returns {Object} Standardized CCP context metadata payload
 */
export function parseMediaPlayback(rawPlayback) {
  let trackName = "Unknown Track";
  let artistName = "Unknown Artist";
  let contextUri = "";
  let durationMs = 0;
  let timestamp = new Date().toISOString();

  // Support parsing either a direct raw track title string or structured JSON telemetry
  if (typeof rawPlayback === "string") {
    const parts = rawPlayback.split(" - ");
    if (parts.length >= 2) {
      artistName = parts[0].trim();
      trackName = parts[1].trim();
    } else {
      trackName = rawPlayback.trim();
    }
  } else if (rawPlayback && typeof rawPlayback === "object") {
    // Extract property variables matching standard media streaming webhook structures (e.g. Spotify)
    trackName = rawPlayback.track_name || rawPlayback.track?.name || trackName;
    artistName = rawPlayback.artist_name || rawPlayback.track?.artists?.[0]?.name || artistName;
    contextUri = rawPlayback.context_uri || rawPlayback.context?.uri || "";
    durationMs = Number(rawPlayback.duration_ms || rawPlayback.track?.duration_ms || 0);
    
    if (rawPlayback.played_at || rawPlayback.timestamp) {
      timestamp = new Date(rawPlayback.played_at || rawPlayback.timestamp).toISOString();
    }
  }

  return {
    schema_version: "memact.ccp_observation.v1",
    event_type: "media_playback",
    category: "music",
    title: `Listened to ${trackName} by ${artistName}`,
    evidence: {
      track_title: trackName,
      artist: artistName,
      duration_ms: durationMs,
      streaming_context_uri: contextUri
    },
    occurred_at: timestamp
  };
}