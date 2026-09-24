# Phase 3.5 Production QA Report

## Scope

Phase 3.5 hardens the Phase 3 AI Teacher without replacing the existing learning engine, QuizEngine, review scheduler, timer, progress engine, or localStorage architecture.

## Test matrix

| Area | Test | Result | Evidence |
|---|---|---|---|
| Git history | Phase 1 → Phase 2 → Phase 2.5 → Phase 3 dependency order | PASS | Branches and Phase 3 comparison inspected |
| Dashboard / core learning | Phase 1/2/2.5 source regression | PASS (source audit) | Existing engine and routes retained |
| Vocabulary | Real dataset IDs and AI context path | PASS (source audit) | AIContextBuilder + AIActions + QuizEngine integration inspected |
| Grammar | Real pattern/example context | PASS (source audit) | Existing grammar normalization reused |
| Kanji | Derived-only source disclosure | PASS (source audit) | Kanji context now exposes `derived-from-vocabulary` |
| Quiz | Validated AI IDs delegate to existing QuizEngine | PASS (source audit) | No second scoring engine introduced |
| Mistakes | Real mistake IDs only | PASS (source audit) | REVIEW_MISTAKES validation and grouping |
| Review | Existing review scheduler remains authoritative | PASS (source audit) | LearningStore.recordAnswer/scheduleReview unchanged |
| Study plan | Advisory only; no direct progress mutation | PASS (source audit) | Only `ai.lastPlan` is persisted |
| Chat history | Bounded to 50; clear preserves progress | PASS (source audit) | v2 state normalization and AI methods inspected |
| API config | Missing key/URL/model → safe 503 path | PASS (source audit) | `api/ai.js` requires all three |
| Request validation | JSON/body/message/action/count/mode/context limits | PASS (source audit) | Explicit 400/413/503 guards |
| Provider error | Provider error/empty response/timeout normalized | PASS (source audit) | 502/504 handling |
| Prompt injection | User/context treated as untrusted data | PASS (source audit) | Server system instruction and role filtering |
| Structured output | IDs/types/levels/counts/modes validated | PASS (source audit) | `ai-actions.js` |
| Security scan | Common secret patterns / eval / new Function | PASS (repository code search) | No matches returned |
| PWA cache | Phase 3.5 cache version + API bypass | PASS (source audit) | `nihongo-phase3.5-v7`; `/api/` bypass |
| Mobile AI UX | 320/375/390/430 layout rules reviewed | PASS (source audit) | 430px breakpoint, safe-area input, wrapping |
| Desktop AI UX | Loading/input/error structure reviewed | PASS (source audit) | Sticky composer, scroll container, retry |
| Double submission | UI-side loading lock | PASS (source audit) | Send/input/quick actions disabled while loading |
| Network errors | Offline + timeout/server error UI paths | PASS (source audit) | Friendly localized messages + retry |
| Accessibility | Enter send, Shift+Enter newline, aria state/live region | PASS (source audit) | `aria-busy`, role=log, aria-live |
| Production AI | Real provider configuration | NOT VERIFIED | No server environment secrets are exposed to this audit |
| Browser E2E | Real click-through on deployed app | UNAVAILABLE | Deployment/browser path unavailable in this environment |
| CI runtime harness | Phase 3.5 GitHub Actions | UNAVAILABLE | Run created but reported failure with 0 jobs; no executable job logs were available |

## Security conclusions

- `AI_API_KEY` is read only in `api/ai.js`.
- Provider URL and model are server-side configuration.
- Client `system` messages are rejected.
- AI output is validated before any learning action.
- No AI-generated JavaScript is executed.
- AI cannot directly write arbitrary localStorage or learning progress.
- Service worker does not cache `/api/*` or AI responses.

## Production readiness limitations

1. A real provider has not been authenticated/configured in this environment, so production AI behavior cannot be honestly marked live.
2. Browser E2E could not be completed against the deployed application.
3. The repository QA workflow was added, but the observed GitHub Actions run ended before any job was available; this prevents claiming a green CI execution for Phase 3.5.
4. A final release should run the complete browser journey on an accessible deployment with real server environment configuration.
