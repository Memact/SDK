# Memact

Memact is a user-controlled context layer for app personalization.

Apps send context. App categories give it shape. Wiki gives users control.

## Current core

- Access: consent, apps, API keys, scopes, and permissions.
- Wiki: user-facing context where users add, edit, approve, reject, delete, and share context.
- Schema: app category schemas.
- Memory: accepted context, history, retrieval, and app-safe summaries.
- Contracts: shared shapes.
- SDK: app integration.

## Open-source contribution model

Contributors mainly work on app category schemas.

Pick an app category and define how context should work there.

Examples: music, video-streaming, movie-booking, shopping, learning, news-articles, fitness, travel, food-delivery, creator-tools, productivity, and AI assistants.

Contributor work can include category schemas, useful context fields, example app context dumps, normalization rules, Wiki entry templates, user prompts, access suggestions, and tests.

## Contributor assignments

1. Category schema contributor.
2. Context example contributor.
3. Normalization contributor.
4. User prompt contributor.
5. Entry template contributor.
6. Access suggestion contributor.
7. Test contributor.

## Rules

- Default visibility should be private.
- Apps should only get relevant category context with permission.
- User-added context is stronger than app-proposed context.
- Important app writes should require approval.
- Keep user-facing copy simple.
- Do not bring back Capture, Inference, or Intent as core product language.
