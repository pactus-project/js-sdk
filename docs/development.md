# Development Guide

## Prerequisites

- Node.js 18+

## Setup

```bash
git clone https://github.com/pactus-project/js-sdk.git
cd js-sdk
npm install
```

## Scripts

| Command                 | Description                             |
| ----------------------- | --------------------------------------- |
| `npm run build`         | Compile TypeScript to `dist/`           |
| `npm run watch`         | Rebuild on file changes                 |
| `npm run type-check`    | Type-check without emitting files       |
| `npm test`              | Run all tests                           |
| `npm run test:coverage` | Run tests with coverage report          |
| `npm run lint`          | Check for linting errors                |
| `npm run lint:fix`      | Auto-fix linting errors                 |
| `npm run format`        | Format code with Prettier               |
| `npm run format:check`  | Check formatting without changing files |
| `npm run clean`         | Remove `dist/`                          |

## Running Tests

```bash
npm test                 # single run
npm test -- --watch      # watch mode
npm test -- -t "wallet"  # filter by test name
```

Tests use Jest. Each module has a corresponding `*.test.ts` file alongside it.

## Before Submitting

```bash
npm run type-check
npm run lint
npm run format:check
npm test
npm run build
```

## Code Guidelines

- Follow clean code principles and TypeScript best practices.
- Keep type safety; do not weaken types to silence errors.
- Write tests for new behavior. A bug fix should include a test that fails without the fix.
- Document public APIs with JSDoc.
- Keep formatting consistent (`npm run lint` and Prettier).
