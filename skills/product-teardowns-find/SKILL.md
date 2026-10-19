---
name: product-teardowns-find
description: Stage of product-teardowns. Turns a product name or link into one exact, local, studyable target (fetched without running it) and writes target.md, asking the user when the name is ambiguous. Run by the product-teardowns orchestrator, not on its own.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Find stage

**Input:** what the user said (a name, a repo link, a URL or a path). **Output:** `<run>/target.md` (format in the orchestrator's `references/contracts.md`), with the product fetched into `~/teardowns/<slug>/`.

This stage runs in the main conversation, because it may need to ask the user something.

## 1. Work out what it is
Stop at the first step that gives one clear answer:
1. **A link or path was given:** use it. For a repo link, also check the package registry for what actually ships (a repo's package often publishes a built bundle).
2. **It's already on this machine:** check `/Applications`, `which <name>`, `npm ls -g`, `pip show <name>`, and `~/teardowns/`.
3. **It's public:** search the web, `npm view <name>`, `pip index versions <name>` and `gh repo view` / `gh search repos <name> --sort stars --limit 5`.

## 2. Clarify if it's ambiguous
Ask the user (one question, with options) when any of these is true:
- several products share the name (an npm package and a different GitHub project, a fork and the original);
- the name matches an app and its library or SDK;
- the official repo and the shipped artifact may differ (for example, an open-core product);
- it's closed source and not installed. Then offer to study its public website and network behaviour instead.

For each option, give a one-line description, its stars or downloads, and its owner. Never guess when two candidates are plausible.

## 3. Fetch it without running it
Put everything under `~/teardowns/<slug>/`, and never run its code or install scripts:
- Source repo: `git clone --depth 1 <repo> ~/teardowns/<slug>/src`, then record `git -C … rev-parse HEAD`.
- npm package: `cd ~/teardowns/<slug> && npm pack <name>@latest && tar xzf <name>-*.tgz` (this unpacks into `package/` and never runs install scripts).
- Python package: never use `pip download`, because it can run setup.py. Read `https://pypi.org/pypi/<name>/json`, take the sdist URL (or the wheel's, if there's no sdist) for the latest version, `curl -L -o` it into `~/teardowns/<slug>/`, check its sha256 against the JSON, then unpack it with `tar xzf` or `unzip`.
- Desktop app or APK: ask the user to install it or hand you the file. Never download from unofficial mirrors.
- Website: no fetch. Record the URL. The teardown stage uses REA's web tools on it.

If a fetch was done in an earlier run, reuse it, unless the version has changed and the user wants the new one.

## 4. Check permission, once, in plain words
Open source (note the licence) and public websites can be studied. For anything else, confirm that the user owns it or is allowed to study it.

## 5. Write target.md
Fill in every field from the contract, with the exact version, commit or build ID.
