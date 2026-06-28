# Dependency Updates

Run this **after each release**.

## Node.js

Update Node.js to the latest LTS: [nodejs.org](https://nodejs.org/en/download)

## npm Packages

```bash
npm outdated                # see what's behind
npx npm-check-updates -u    # bump package.json to latest
npm install                 # install them
```

Then build, lint, format, and test. Fix anything that breaks.

## GitHub Actions

Check GitHub Actions workflows and update them.

## Open a PR

Commit, push, and open a pull request against `main`.
