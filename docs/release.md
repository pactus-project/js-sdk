


# Release Process

To ensure a successful release and publication of the Pactus SDK.
Please carefully follow the instructions provided below:

## 1. Preparing Your Environment

Before proceeding with the release process,
ensure that your `origin` remote is pointing to the original repository and not your local fork.

```bash
git remote -vv
```

It is recommended to re-clone the project in a location other than your current working directory.
Also, make sure that you have set up GPG for your GitHub account.

## 2. Fetch the Latest Code

Ensure that your local repository is up-to-date with the Pactus main repository:

```bash
git checkout main
git pull
git fetch --tags
```

## 3. Decide the Version Bump

This project follows [Semantic Versioning](https://semver.org/):

| Version bump | Example       |
| ------------ | ------------- |
| **patch**    | 1.2.3 → 1.2.4 |
| **minor**    | 1.2.3 → 1.3.0 |
| **major**    | 1.2.3 → 2.0.0 |

Review the commits since the last tag and decide the next version.
Create environment variable for the release version, which will be used in subsequent commands throughout this document.
Keep your terminal open for further steps.

```bash
VERSION="x.y.z"
```

## 4. Update the Version

Now, it is time to update the version. The version is managed differently for each project.

### NodeJS

Update the `version` field in `package.json` (and `package-lock.json`):

```bash
npm version ${VERSION} --no-git-tag-version
```

Avoid manual updates.
The `--no-git-tag-version` flag prevents `npm version` from creating its own tag.
You'll create the tag manually in the next step for full control.

## 5. Update Changelog

Use [Commitizen](https://github.com/commitizen-tools/commitizen) to update the CHANGELOG. Execute the following command:

```bash
# Install Commitizen first if needed: pipx install commitizen
PRV_TAG=$(git describe --tags --abbrev=0)
[ "$PRV_TAG" != "v${VERSION}" ] || { echo "error: v${VERSION} already tagged"; exit 1; }
GITHUB_URL=$(git remote get-url origin | sed -E 's#git@github.com:#https://github.com/#; s#\.git$##')
cz changelog --incremental --unreleased-version v${VERSION}
perl -i -pe "s|## v${VERSION} |## [${VERSION}](${GITHUB_URL}/compare/${PRV_TAG}...v${VERSION}) |g" CHANGELOG.md
perl -i -pe "s|\(#([0-9]+)\)|([#\1](${GITHUB_URL}/pull/\1))|g" CHANGELOG.md
grep -q "compare/${PRV_TAG}...v${VERSION}" CHANGELOG.md || { echo "error: compare link not rewritten"; exit 1; }
```

Occasionally, you may need to make manual updates to the [CHANGELOG](../CHANGELOG.md).

## 6. Create a Release PR

Generate a new PR against the base branch.
It's better to use [GitHub CLI](https://github.com/cli/cli/) to create the PR, but manual creation is also an option.

```bash
git checkout -b releasing_${VERSION}
git add package.json package-lock.json CHANGELOG.md
git commit -m "chore(release): releasing version ${VERSION}"
git push origin HEAD
gh pr create --title "chore(release): releasing version ${VERSION}" --body "Releasing version ${VERSION}" --base main
```

Wait for the PR to be approved and merged into the main branch.

## 7. Tagging the Release

Create a Git tag and sign it using your [GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/about-commit-signature-verification) with the following commands:

```bash
git checkout main
git pull
git tag -s -a v${VERSION} -m "Version ${VERSION}"
```

Inspect the tag information:

```bash
git show v${VERSION}
```

## 8. Push the Tag

Now, push the tag to the repository:

```bash
git push origin v${VERSION}
```

Pushing the tag triggers the publish workflow, which builds, tests, and publishes the package to npm.

## 9. Verify

Once the tag is pushed, the [publish workflow](../.github/workflows/publish.yml) runs automatically.
Check its status under the **Actions** tab on GitHub.

After the workflow completes, verify the package is available:

```bash
npm view @pactus/sdk version
```
