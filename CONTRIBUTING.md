# Contributing

Thank you for considering contributing to the Pactus JS SDK!

## Before You Contribute

1. Check existing issues to see if your change is already tracked.
2. For significant changes, open an issue first to discuss it with the maintainers.

## Development Workflow

1. Fork and clone the repository.
2. Create a branch: `git checkout -b feat/my-change`.
3. Follow the [development guide](docs/development.md) for setup, scripts, and tests.
4. Make your changes with tests.
5. Commit using [Conventional Commits](https://www.conventionalcommits.org): `type(scope): description`.
6. Open a pull request against `main`.

## Commit Messages

- Format: `type(scope): description`
- Types: `fix`, `feat`, `docs`, `test`, `build`, `ci`, `perf`, `refactor`, `style`, `chore`.
- Keep the subject short, lowercase, no ending punctuation.

Examples:

- `feat(wallet): add multi-signature transaction support`
- `fix(storage): handle empty string values in localStorage`
- `test(encrypter): cover argon2 parameter edge cases`

## Update Dependencies

Keep dependencies up to date. Follow the [dependency updates guide](docs/dependency-updates.md).
