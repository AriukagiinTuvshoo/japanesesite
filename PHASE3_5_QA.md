# Phase 3.6 Production Verification Report

## Scope

Phase 3.6 verifies the actual Phase 3.5 repository state without replacing the static PWA architecture, QuizEngine, review scheduler, progress engine, timer, or local learning state.

## Verification layers

| Layer | Result | Evidence |
|---|---|---|
| Repository / branch | PASS | phase-3.5-production-qa, HEAD verified |
| Local npm scripts | UNAVAILABLE — NOT VERIFIED | No package.json exists in the repository |
| API runtime contract | PASS | Direct Node runtime harness executed locally for configuration, validation, provider error, prompt-injection boundary and normalized responses |
| AI action validator runtime | PASS | Direct Node runtime harness executed against ai-actions.js with real-style IDs and invalid cases |
| Repository QA harness | PASS | GitHub Actions run 36003559910 completed successfully |
| JavaScript syntax | PASS | CI node --check passed for application and API JS files |
| Manifest | PASS | CI JSON parse passed |
| Local asset audit | PASS | CI found no missing local referenced assets |
| Security source scan | PASS | CI secret-pattern / eval / new Function checks passed |
| Production AI provider | NOT VERIFIED | Production environment credentials/configuration are not exposed to this verification environment |
| Browser E2E | UNAVAILABLE — NOT VERIFIED | No browser automation is available in this environment |
| Vercel deployment | NOT VERIFIED / BLOCKED | Current GitHub status is Vercel: failure with the build-rate-limit target |

## API verification

The secure API boundary was verified for:

- missing AI_API_KEY -> 503
- missing AI_PROVIDER_URL -> 503
- missing AI_MODEL -> 503
- malformed JSON -> 400
- invalid action -> 400
- excessive message history -> 400
- oversized request -> 413
- oversized context -> 400
- invalid JLPT level -> 400
- invalid content type -> 400
- invalid question count -> 400
- invalid quiz mode -> 400
- duplicate candidate IDs -> 400
- client-provided system role -> 400
- provider failure -> 502
- malformed provider response -> 502
- provider timeout -> 504
- successful mocked provider response -> 200

The server does not execute AI-generated actions. Dataset membership for AI output remains enforced by the browser-side AIActions validator before existing learning systems are invoked.

## AI action validation

Runtime verification covered:

- supported action whitelist
- invalid action rejection
- real dataset ID acceptance
- nonexistent dataset ID rejection
- duplicate quiz IDs rejection
- valid quiz modes
- quiz count 1-10
- JLPT level validation
- study-plan minutes 1-60
- duplicate study-plan content rejection
- real mistake ID validation
- duplicate mistake ID rejection

Study plans remain advisory and do not directly change learning progress.

## Learning-state regression

The QA harness verified:

- nihongo-learning-state-v2 loads
- AI state exists inside the same v2 state
- AI chat history is capped at 50 messages
- real quiz mistakes are recorded
- real N5 vocabulary / grammar / derived Kanji datasets are available
- validated AI quiz IDs produce questions through the existing QuizEngine
- ai.lastPlan persists without mutating progress
- clear AI chat history preserves learning progress
- target JLPT context works for N5-N1

Timer and review scheduling were inspected at source level and were not rewritten by Phase 3.6.

## Security verification

- API credentials are read only in api/ai.js.
- No API secret is placed in frontend code, localStorage, manifest or service worker.
- Client system messages are rejected.
- User/context data is treated as untrusted input by the server prompt.
- Provider credentials are not copied into the provider prompt.
- Provider/internal errors are normalized before reaching the client.
- No eval() or new Function() execution is present in the checked application source.
- AI output is validated before invoking the existing learning engine.
- AI does not directly mutate arbitrary localStorage or learning progress.

## PWA verification

Verified in source and CI:

- cache: nihongo-phase3.5-v7
- static learning assets remain in the cache
- /api/* bypasses the service-worker fetch handler
- POST requests are not cached
- AI response caching is disabled on the client request
- manifest is valid

Actual offline click-through remains UNAVAILABLE — NOT VERIFIED.

## CI verification

The Phase 3.5 workflow originally produced a failed run with zero jobs. Phase 3.6 identified the actual cause: the manifest validation command contained a colon inside an unquoted YAML scalar.

That workflow was corrected, and the latest run:

- workflow: Phase 3.5 production QA
- run: 36003559910
- commit: 978859ef3f7a01f49dadb90bcaa726cc1aff088f
- result: SUCCESS
- executable job: qa

The QA harness itself originally failed because its Node sandbox did not provide browser-like DOM elements. That harness was corrected; the next run passed.

## Previously identified regression items

| Item | Result |
|---|---|
| Missing model -> 503 | PASS |
| Client system injection blocked | PASS |
| Request limits | PASS |
| Quiz/action validation | PASS |
| Study-plan duplicate rejection | PASS |
| Mistake duplicate/empty validation | PASS |
| Context summary avoids repeated state reload | PASS |
| Double-submit protection | SOURCE VERIFIED |
| Retry UX | SOURCE VERIFIED |
| Explain Retry context preservation | SOURCE VERIFIED |
| Mixed mistake review | SOURCE VERIFIED |
| Mobile AI composer | SOURCE VERIFIED |
| /api service-worker caching bypass | PASS |
| Six-item mobile navigation | SOURCE VERIFIED |
| Kanji derived-only context | PASS |

## Production limitations

1. Real production provider credentials/configuration are not available for verification.
2. Browser E2E is UNAVAILABLE — NOT VERIFIED.
3. Current Vercel status for the Phase 3.6 commit is failure and points to the free deployment-rate-limit target, so the deployed build could not be used for browser verification.
4. No package.json exists, so npm test/lint/typecheck/build commands are not available.

## Release interpretation

Source-level, direct runtime, and CI verification now provide substantial evidence that the Phase 3.5 code path is internally consistent. Production provider behavior, browser E2E, and deployment runtime remain unverified.
