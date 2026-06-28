# How to Update Dependencies

Update dependencies **right after each release**. Doing it after a release means you can
aggressively bump everything to the latest stable versions without worrying about
breaking the release. If something breaks, you have the whole release cycle to fix it.

---

## 1. Node.js Modules

### Step 1 — Check What Is Outdated

```bash
npm outdated
```

This prints a table of packages that have newer versions available.

### Step 2 — Update Everything to Latest

```bash
npx npm-check-updates -u
npm install
```

> If `npm-check-updates` is not installed, run `npm install -g npm-check-updates` first.

This bumps every dependency in `package.json` to its latest stable version and installs it.

### Step 3 — Verify Nothing Is Broken

```bash
npm run clean
npm install
npm run build
npm run type-check
npm run lint
npm run format:check
npm test
```

All commands must pass. If a test fails or a package introduced a breaking change, read its
changelog and fix the issue.

### Step 4 — Commit

```bash
git add package.json package-lock.json
git commit -m "chore(deps): update npm dependencies to latest"
```

---

## 2. GitHub Actions

### Step 1 — Find the Actions You Use

Look at the workflow files in `.github/workflows/`. The actions are referenced like this:

```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

### Step 2 — Check for Newer Major Versions

Visit the releases page for each action:

- [actions/checkout](https://github.com/actions/checkout/releases)
- [actions/setup-node](https://github.com/actions/setup-node/releases)

### Step 3 — Bump to the Latest Major Version

Edit each workflow file and update the version tag (e.g., `v4` → `v5`).

### Step 4 — Verify and Commit

Push your branch and check that CI passes on GitHub. Then commit:

```bash
git add .github/workflows/
git commit -m "chore(ci): bump GitHub Actions to latest major versions"
```

---

## 3. After-Release Checklist

Run through this list right after publishing a release:

1. [ ] Run `npm outdated` and bump all npm packages to latest
2. [ ] Bump GitHub Actions to the latest major versions
3. [ ] Run `npm run type-check`
4. [ ] Run `npm run lint`
5. [ ] Run `npm run format:check`
6. [ ] Run `npm test`
7. [ ] Run `npm run build`
8. [ ] Commit and push
