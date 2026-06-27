# Contributing

Thank you for considering contributing to the Pactus JS SDK!

## Before You Contribute

1. Check existing issues to see if your change is already tracked.
2. For significant changes, open an issue first to discuss it with the maintainers.

## Development Workflow

1. Fork and clone the repository.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Install dependencies: `npm install`.
4. Make your changes, with tests.
5. Make sure everything passes:
   ```bash
   npm run type-check
   npm run lint
   npm run build
   npm test
   ```
6. Commit using Conventional Commits and open a pull request.

## Code Guidelines

- Follow clean code principles and TypeScript best practices.
- Keep type safety; do not weaken types to silence errors.
- Write tests for new behavior. A bug fix should include a test that fails without the fix.
- Document public APIs with JSDoc.
- Keep formatting consistent (`npm run lint` and Prettier).

## Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

- Format: `type(scope): description`
- Types: `fix`, `feat`, `docs`, `test`, `build`, `ci`, `perf`, `refactor`, `style`, `chore`.
- Keep the subject under 50 characters, lowercase, imperative mood, no ending punctuation.

Examples:

- `feat(wallet): add multi-signature transaction support`
- `fix(storage): handle empty string values in localStorage`
- `test(encrypter): cover argon2 parameter edge cases`

## Releases

This package is published to npm as `@pactus/wallet-sdk`. Maintainers publish a new version by
bumping the version in `package.json` and creating a GitHub Release, which triggers the publish
workflow.
