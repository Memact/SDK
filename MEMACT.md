# Memact Contributor Handoff

Memact is where users see what apps know about them and control it.

The SDK is what apps use from server-side code.

## The idea

Most apps personalize quietly. They guess from clicks, isolated profiles, and
hidden assumptions.

Memact gives apps a better path. An app can ask first, suggest memory with
evidence, and later read only the memory the user allowed.

If a music app notices a user keeps replaying Brazilian phonk, it can suggest:

```text
Prefers Brazilian phonk, especially high-energy tracks.
```

The user can accept it, edit it, or reject it.

## What the SDK should make easy

- Request access.
- Suggest memory.
- Send specific app activity when a clean suggestion is not ready.
- Read allowed memory summaries.
- Fetch Context category rules.

## Parts

- Access handles consent, apps, API keys, scopes, and permissions.
- Yourself is where users add, edit, approve, reject, delete, and share memory.
- Context defines app category rules and memory suggestion templates.
- Memory stores accepted memory, history, retrieval, and app-safe summaries.
- Contracts defines shared shapes.
- SDK lets apps connect to Memact.

## Rules

- Keep API keys server-side.
- Default visibility should be private.
- Apps should not get full Yourself access.
- Apps should only get relevant category memory with permission.
- User-added memory is stronger than app-proposed memory.
- Important app writes should require approval.
- Activity is not identity.
- Do not bring back Capture, Inference, Playground, or Intent as core product language.

## Best explanation

Apps suggest memory. Users decide what stays. Apps read only what they are allowed to use.
