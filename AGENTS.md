# AGENTS.md

## Purpose

This repository contains a TypeScript WebSocket backend for an online UNO game.

Agents working in this repository should help the user inspect, design, implement, validate, and review changes while keeping the user in control of product and architectural decisions.

---

## Working Mode

Do not modify code unless the user explicitly asks for implementation.

Requests such as:

* “What should we do next?”
* “Can you review this?”
* “How should we approach this?”
* “What do you think?”
* “Where should we start?”

authorize analysis only.

For analysis requests:

1. Inspect the relevant files and tests.
2. Explain the current behavior.
3. Identify decisions, risks, and affected files.
4. Propose a small plan.
5. Do not include implementation code unless requested.

Implementation is authorized by requests such as:

* “Implement this.”
* “Write the test.”
* “Create or modify the file.”
* “Apply the plan.”
* “Refactor this area.”

When authorization is unclear, remain in analysis mode.

---

## Source of Truth

Use the repository itself as the primary source of truth.

Before proposing or changing behavior:

* Read the relevant implementation.
* Read neighboring files.
* Read the relevant tests.
* Check `package.json` before running commands.

For room behavior, the current rules are defined primarily by:

```text
src/modules/rooms/*.test.ts
```

Do not duplicate those business rules in this document.

When documentation conflicts with code or tests:

1. Report the inconsistency.
2. Treat the current implementation and passing tests as evidence of current behavior.
3. Do not silently update unrelated documentation.

---

## Repository Conventions

The repository uses a feature-oriented structure.

Active source areas include:

```text
src/modules/
src/websocket/
src/config/
src/shared/
```

Follow the existing structure and neighboring conventions.

Do not reorganize the repository into new architectural folders as part of an unrelated task.

Some directories may exist as placeholders for future work, including:

```text
infrastructure/
src/modules/game-gateway/
tests/integration/
tests/e2e/
```

An empty directory is not evidence that its corresponding feature or architecture has already been implemented.

Do not populate, move code into, or redesign placeholder directories unless the active task requires it and the user approves the change.

The project uses ECMAScript modules through:

```json
"type": "module"
```

Preserve the existing `.js` extension in TypeScript imports:

```ts
import { LeaveRoom } from "./leave-room.js";
```

---

## Architecture Boundaries

Keep business behavior independent from transport and infrastructure details.

Expected dependency direction:

```text
WebSocket and infrastructure adapters
                ↓
            Use cases
                ↓
         Business models
```

Examples:

* `src/websocket` may call room use cases.
* Room use cases must not receive WebSocket objects.
* Room models must not import WebSocket, logging, or persistence implementations.
* Repository interfaces must not depend on concrete repositories.
* Concrete repositories may implement repository interfaces.
* `ConnectionRegistry` belongs to the WebSocket and connection infrastructure boundary. Use cases must not depend directly on it or use it for broadcasting.

Broadcasting and socket lookup should remain outside room business use cases.

Prefer automated architecture checks when available.

Do not bypass ESLint, TypeScript, tests, or CI checks to make a change pass.

If an architectural boundary can be enforced automatically, prefer proposing an ESLint or dependency rule instead of adding more prose here.

---

## Application Wiring

`src/index.ts` is the current composition root and primary dependency-wiring entry point.

When adding or changing a use case, adapter, repository, router dependency, or server dependency:

1. Inspect `src/index.ts`.
2. Determine whether new construction or wiring is required.
3. Keep concrete dependency creation outside business use cases.
4. Include wiring changes in the proposed file scope.
5. Validate that the application still starts and builds correctly.

Do not instantiate concrete infrastructure dependencies inside room use cases merely to avoid updating the composition root.

---

## Configuration

Environment configuration is centralized in:

```text
src/config/env.schema.ts
src/config/env.ts
src/config/env.test.ts
```

Do not read `process.env` directly throughout unrelated modules when validated configuration is already available.

When adding or changing an environment variable:

1. Update the environment schema.
2. Update the configuration access layer.
3. Add or update the corresponding configuration test.
4. Update relevant setup documentation when required.

Do not invent environment defaults or required variables without inspecting the current configuration files.

---

## Scope Control

Keep changes limited to the approved task.

Before implementation, identify:

* The requested behavior
* The files likely involved
* The tests likely involved
* Any public contract that may change
* Any unresolved decision
* Any required dependency wiring in `src/index.ts`

Do not include unrelated refactors or cleanup.

When an unrelated issue is discovered, mention it separately and leave it unchanged unless the user approves expanding the scope.

### When the approved plan stops working

If implementation reveals that the approved plan is invalid, incomplete, or unsafe:

1. Stop expanding the change.
2. Preserve completed work that is still valid.
3. Explain what was discovered.
4. Explain why the approved plan no longer works.
5. Present the smallest viable alternatives.
6. Wait for the user’s decision before changing architecture, contracts, dependencies, or scope.

Do not improvise a broader solution silently.

---

## Testing

Tests should describe observable behavior rather than implementation details.

Before changing a feature:

1. Read its existing tests.
2. Identify the behavior already protected.
3. Add or update the smallest relevant test when implementation is authorized.
4. Avoid weakening assertions only to make tests pass.

Unit tests currently live beside their implementation, for example:

```text
src/modules/rooms/create-room.test.ts
src/modules/rooms/join-room.test.ts
src/modules/rooms/leave-room.test.ts
src/config/env.test.ts
```

Use:

* `tests/integration` for collaboration between real internal components.
* `tests/e2e` for behavior through an external boundary such as real WebSocket clients.

These directories may currently be empty. Do not assume an integration or end-to-end test harness exists without inspecting the repository.

Prefer explicit named test doubles:

```ts
const saveMock = vi.fn();
const findByCodeMock = vi.fn();

const repository: RoomRepository = {
  save: saveMock,
  findByCode: findByCodeMock,
  deleteByCode: vi.fn(),
};
```

Be careful when asserting against mutable objects. Prefer explicit expected state instead of deriving expectations from an object after execution.

---

## Project Commands

Use the scripts defined in `package.json` and verify them there if they change.

### Development

```bash
npm run dev
```

Runs the TypeScript server in watch mode using `.env`.

### Tests

```bash
npm test
```

Runs the complete Vitest suite once.

```bash
npm run test:watch
```

Runs Vitest in watch mode.

```bash
npm run test:coverage
```

Runs the test suite with coverage.

Focused Vitest execution may be used during development, but run `npm test` before declaring an implementation complete.

### Type checking

```bash
npm run typecheck
```

Runs TypeScript without emitting build files.

### Linting

```bash
npm run lint
```

Currently lints:

```text
src
```

Report this accurately as lint validation for the configured `src` scope, not necessarily the whole repository.

### Build

```bash
npm run build
```

Compiles the TypeScript project.

### Production start

```bash
npm run start
```

Runs the compiled server from `dist/index.js` using `.env`.

Do not use production start as a replacement for tests, type checking, linting, or build validation.

### Releases

```bash
npm run release
```

This command may update versions, changelog content, commits, and tags.

Run it only when the user explicitly requests a release.

---

## Default Validation

After an approved implementation, run the applicable checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Do not claim that a command passed unless it was executed successfully.

If a command fails:

* Report the command.
* Report the relevant failure.
* State whether it appears related to the current change.
* Do not fix unrelated failures without approval.

---

## WebSocket Protocol

The current WebSocket protocol is defined by:

```text
src/websocket/message.schema.ts
src/websocket/message-router.ts
src/websocket/websocket-server.ts
```

Relevant WebSocket tests are also part of the protocol’s source of truth.

Read those files before describing, adding, or changing a message contract.

Before modifying the protocol, identify:

* Valid input shape
* Required and optional fields
* Request ID behavior
* Success response
* Error response
* Broadcast audience
* Use-case input
* Backward compatibility
* Relevant tests
* Required dependency wiring in `src/index.ts`

Treat `connectionId` as server-controlled information.

Do not trust a client-provided connection identifier.

A client-provided `playerId` is not authentication. Describe identity and authorization limitations accurately.

Do not add protocol examples to this document unless they have been verified against the current schema, router, and tests.

Detailed verified protocol examples should live in protocol documentation if that document exists.

---

## Logging and Errors

Use the structured logger from:

```text
src/shared/logging/logger.ts
```

Prefer structured context:

```ts
logger.info(
  {
    connectionId,
    roomCode,
    requestId,
  },
  "Player joined room",
);
```

Avoid `console.log` and string-concatenated operational logs.

Client-facing errors should use stable, safe codes.

Do not expose stack traces or arbitrary internal exception details through WebSocket responses.

Never leave rejected promises without an explicit handling path.

---

## Git

Use Conventional Commits when the user asks for a commit.

Examples:

```text
feat(room): handle player leaving a room
test(room): cover room deletion behavior
docs: update protocol documentation
chore: add automated boundary checks
```

Commit examples illustrate naming format only. They do not imply that the described functionality or tooling already exists.

Do not commit, push, release, tag, or rewrite history without explicit authorization.

---

## Response Style

Match the response to the task.

### For trivial questions

Answer directly in one or two sentences.

Do not use a structured report when it adds no value.

### For analysis or planning

Use only the sections that add value:

```text
Current behavior
Relevant files
Decision needed
Proposed steps
Risks
Validation
```

Do not include empty or unnecessary sections.

Do not include implementation code unless the user explicitly requests it.

### For completed implementation

Use only the sections that add value:

```text
Changed
Files
Tests
Validation
Remaining considerations
```

Include exact validation commands and results.

---

## Example: Good Analysis Response

```text
Current behavior

The LeaveRoom use case has multiple possible outcomes according to its current implementation and tests.

Relevant files

- src/modules/rooms/leave-room.ts
- src/modules/rooms/leave-room.test.ts
- src/websocket/message-router.ts
- src/websocket/message.schema.ts
- src/index.ts

Decision needed

The WebSocket behavior for each LeaveRoom outcome has not yet been verified.

Proposed steps

1. Read the current LeaveRoom implementation and tests.
2. Read the WebSocket schema, router, server, and composition root.
3. Identify the possible outputs and intended recipients.
4. Propose router tests before changing production code.

No files changed.
```

---

## Example: Good Implementation Report

```text
Changed

Added support for the approved WebSocket behavior and wired its dependency in the composition root.

Files

- src/websocket/message.schema.ts
- src/websocket/message-router.ts
- src/websocket/message-router.test.ts
- src/index.ts

Validation

- npm test — passed
- npm run typecheck — passed
- npm run lint — passed for the configured src scope
- npm run build — passed

Remaining considerations

Automatic handling of socket disconnections is unchanged.
```

---

## Reference Documentation

Current human-facing project documentation includes:

```text
readme.md
proyecto.md
CHANGELOG.md
```

Use:

* `AGENTS.md` for high-frequency operating rules.
* Tests for current business behavior.
* `readme.md` for project setup and human-facing usage instructions.
* `proyecto.md` for project goals, roadmap, architecture context, and current status.
* `CHANGELOG.md` for release-relevant changes.

### Proposed documentation structure — not yet assumed to exist

The project may later introduce:

```text
docs/architecture.md
docs/protocol.md
docs/development.md
docs/decisions/
```

If created:

* `docs/architecture.md` should hold detailed architectural explanations.
* `docs/protocol.md` should hold verified WebSocket contracts and examples.
* `docs/development.md` should hold detailed contributor workflows.
* `docs/decisions/` should hold durable architectural or product decisions.

Do not assume these files or directories exist until verified in the repository.

The user retains final approval over implementation, architecture, commits, and releases.
