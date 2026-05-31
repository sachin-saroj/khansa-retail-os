# Contributing to Khansa Retail OS

First off, thank you for considering contributing to Khansa! It's people like you that make Khansa such a great tool for local businesses.

## Code of Conduct
By participating in this project, you are expected to uphold a welcoming and inclusive environment for everyone.

## Filing Issues
Before filing a new issue, please ensure the bug or feature hasn't already been reported.
- Use a clear and descriptive title.
- Describe the exact steps for reproduction.

## Local Development Setup
1. Fork the repository and clone it locally.
2. Run database setup: `createdb khansa_retail_os`
3. Setup backend: `cd server && npm install && npm run migrate`
4. Setup frontend: `cd client && npm install`
5. Create a new branch: `git checkout -b <branch-type>/<short-description>`

## Branch Naming Rules
- `feature/` - for new features
- `fix/` - for bug fixes
- `docs/` - for documentation
- `refactor/` - for refactoring code
- `test/` - for adding tests

## Commit Message Conventions
We follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests

## Pull Request Process
1. Ensure your code passes all linting (`npm run lint` if available).
2. Update the README.md with details of changes, this includes new environment variables, exposed ports, etc.
3. Submit a PR against the `main` branch.
4. Request review from at least one core contributor.

## Testing Requirements
- Ensure no regressions occur in the API by validating database models and routes.
- Frontend components should be manually verified across both Light/Dark modes and English/Hindi localizations.
- Review any newly written SQL queries for potential race conditions or injections.