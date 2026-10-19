---
name: product-teardowns-setup
description: Stage of product-teardowns. Checks that the learning journal, learner profile, ledger, REA (updated to the latest GitHub version each run, with a local fallback), write-a-prd-kunal and the user's build-products-kunal repo are all in place before a teardown, and fixes what is missing. Run by the product-teardowns orchestrator, not on its own.
license: MIT
metadata:
  author: kunal
  version: "1.1.0"
---

# Setup stage

First-time setup is the `npx github:k4kd/product-teardowns` script (`bin/setup.mjs` in the repo). It logs the user into GitHub and creates everything in *their own* GitHub account. This stage runs at the start of every session, checks that everything is still in place, and updates REA. Formats, including `~/.product-teardowns/config.json`, are in the orchestrator's `references/contracts.md`.

Read `~/.product-teardowns/config.json` first (use the contract's defaults if it's missing). Then run the checks in order, and stop at the first one you can't fix:

1. **Journal repo.** `~/learning-journal/` exists, is a git repo and has an `origin` remote. Run `git -C ~/learning-journal pull --rebase --autostash --quiet`. If the pull fails, say so and continue on the local copy, and never discard local changes. If the folder is missing or has no remote, tell the user to run `npx github:k4kd/product-teardowns`, and stop.
2. **profile.md.** If it's missing, ask five questions, one at a time: the user's level in systems/infra, in algorithms and in code (beginner / intermediate / advanced each), what they want to be able to do in a year, and how deep explanations should go. Write it from the contract template. Never overwrite an existing profile.
3. **ledger.md and teardowns.md.** If either is missing, create it from the contract template.
4. **REA, latest version.** Run `node <this skill's folder>/scripts/update-rea.mjs`. It fetches `github.com/morluto/rea` into a local clone, builds any new commit in a staging copy, swaps it in only if the build works, refreshes the reverse-engineer-anything skill from the build, and logs every attempt to `~/.product-teardowns/rea-update.log`. If GitHub is unreachable or the repo is gone, it keeps the last good local build. Report its `status` in a few words:
   - `updated`: a new REA was built. The MCP server already running in this session is still the old one. It switches next session, or after `/mcp` reconnects `rea`.
   - `unchanged` or `fallback`: carry on with the current build. For `fallback`, include the detail.
   - `unavailable`: there's no local build and GitHub can't be reached. Use the registered REA if its tools work, otherwise suggest `npx rea-agents@latest setup`.

   Then check that the REA MCP tools (`mcp__rea__*`) are available. If `claude mcp list` shows `rea` still running from `npx` while a local build exists, suggest re-running the npx setup to switch it. Don't change the MCP config yourself. Without any REA tools, teardowns can continue on source alone, but only if the user agrees.
5. **write-a-prd-kunal.** The style stage loads it. If it isn't installed, suggest `npx skills add k4kd/write-a-prd-kunal -g`. Docs are still written without it, but with only the style stage's own rules.
6. **build-products-kunal.** `buildProductsPath` from the config exists, is a git repo, and has `skills/build-products-kunal/`. Run `git -C <path> pull --rebase --autostash --quiet`. If it's missing, tell the user to re-run the npx setup, which clones the repo, or forks it for anyone but its owner.

Report in one line: what was fixed or updated, and anything still missing.
