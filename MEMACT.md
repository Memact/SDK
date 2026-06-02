# Memact Contributor Handoff

Memact is a playground where apps personalize using context the user can actually see and control.

It is still a playground, even if the old Playground repo is no longer the main place to contribute.

The current contribution path is Context, formerly Schema: app categories, context shapes, examples, prompts, and tests.

Apps send context. App categories give it shape. Wiki gives users control.

## The idea

Most apps personalize quietly. They guess from clicks, isolated profiles, and hidden assumptions.

Memact does something different. Apps can send or propose context, but the user gets a Wiki where that context can be reviewed, edited, rejected, deleted, or shared.

If a music app notices a user keeps replaying Brazilian phonk, it can propose something readable:

"Prefers Brazilian phonk, especially high-energy tracks."

The user can accept it, edit it, or reject it.

## What contributors do now

Pick an app category and define how context should work there.

Examples: music, video-streaming, movie-booking, shopping, learning, news-articles, fitness, travel, food-delivery, creator-tools, productivity, and AI assistants.

Contributors can add context fields, messy app context examples, expected Wiki outputs, normalization rules, entry templates, prompts, access suggestions, and tests.

## Parts

- Access handles consent, apps, API keys, scopes, and permissions.
- Wiki is where users add, edit, approve, reject, delete, and share context.
- Context defines app category rules and proposal templates.
- Memory stores accepted context, history, retrieval, and app-safe summaries.
- Contracts defines shared shapes.
- SDK lets apps connect to Memact.

## Rules

- Default visibility should be private.
- Apps should not get full Wiki access.
- Apps should only get relevant category context with permission.
- User-added context is stronger than app-proposed context.
- Important app writes should require approval.
- Keep user-facing copy simple.
- Do not bring back Capture, Inference, or Intent as core product language.

## Best explanation

Memact is a playground for user-controlled app context.

Apps bring context. Categories organize it. Wiki keeps the user in charge.
