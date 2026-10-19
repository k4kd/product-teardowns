---
name: product-teardowns-feed
description: Stage of product-teardowns. Turns a teardown's steal verdicts, red flags and non-functional lessons into generic, de-duplicated rules in the user's build-products-kunal repo (their own fork, or the original for its owner), pushes it, and, if the user chose to share, opens a pull request to the original. Run by the product-teardowns orchestrator as a subagent.
license: MIT
metadata:
  author: kunal
  version: "1.1.0"
---

# Feed stage

This is how every teardown makes build-products-kunal ship better products.

**Config:** read `~/.product-teardowns/config.json` (format and defaults in the orchestrator's `references/contracts.md`). `<repo>` below means its `buildProductsPath`.

**Input:** `<run>/target.md`, `<run>/doc.md` (the "Worth stealing" section), `<run>/findings/index.md` (its Lessons for builders section), and `<repo>/skills/build-products-kunal/references/lessons-from-teardowns.md`. **Output:** the updated lessons file, and `<run>/lessons.md` listing what changed.

## 1. Pull
`git -C <repo> pull --rebase --autostash --quiet`. If the repo is missing, stop and say that setup should be re-run.

## 2. Turn findings into rules
Take every steal, every red flag and every non-functional lesson. Rewrite each one as a **generic rule a builder can apply** to their own product, in one or two plain sentences, ending with "(from <product>)":
- Yes: "Compute the price on the server, and let the browser send only what was chosen plus a signed price token. (from srimandir)"
- No: "Sri Mandir's cart sends price_token to /v2/cart." That's a fact about one product, not a rule.

A skip becomes a rule when it carries a lesson ("Start with one analytics tool; every extra vendor slows the page and adds risk").

## 3. Merge, never duplicate
File each rule under its lesson heading (the list in the contracts). Before adding a rule, read every rule under that heading:
- **Same idea already there:** add the product to its "(from …)" list, and sharpen the wording only if the new evidence adds something.
- **Contradicts an existing rule:** keep both, and add one sentence saying when each applies.
- **New:** add it. Replace a heading's "No new rules yet." line with the first real rule.

## 4. Public repo: keep it clean
The repo, and any pull request, may be **public**. Write generic patterns only: no secrets, keys or tokens, no exploit steps, no target code, no internal URLs, and nothing about the user or their journal. A red flag becomes a defensive rule ("Never ship API keys in a frontend bundle"), never a description of how to abuse it.

## 5. Commit and push
Write `<run>/lessons.md`: the added, merged and unchanged counts, then the rules themselves. If nothing changed, skip the rest and say so.

Commit on the default branch and push:
`git -C <repo> add skills/build-products-kunal/references/lessons-from-teardowns.md && git -C <repo> commit -m "Lessons from <product>" && git -C <repo> push`.
If the push is rejected, `pull --rebase --autostash` and push again. Never force-push.

## 6. Share with the author (optional)
Only if `shareLessons` is true **and** the user isn't the owner of `buildProductsUpstream` (`gh api user -q .login` ≠ the part before the `/`):
1. `git -C <repo> push origin HEAD:refs/heads/lessons/<slug>`. Here `<slug>` is the run's `publish.json` slug, which is unique per doc.
2. `gh pr create --repo <buildProductsUpstream> --head <login>:lessons/<slug> --base main --title "Lessons from <product>" --body-file <run>/lessons.md`.
3. If the pull request already exists, or `gh` fails, say so. The lessons are still safe in the user's fork.

Reply with: whether the push worked, and the pull request's URL if one was opened.
