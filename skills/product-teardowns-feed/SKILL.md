---
name: product-teardowns-feed
description: Stage of product-teardowns, every mode. Turns one mode's lessons from a teardown into generic, de-duplicated rules in the matching build-products skill (technical → build-products-kunal, product → build-products-pm-kunal, design → build-products-design-kunal). There is one version of those skills, in k4kd/build-products-kunal - its owner commits directly, contributors open a small, reviewable pull request against the latest version, and users who chose not to contribute skip this stage. Run by the product-teardowns orchestrator as a subagent, once per mode.
license: MIT
metadata:
  author: kunal
  version: "3.0.0"
---

# Feed stage

This is how every teardown makes the build-products skills ship better products. You run for **one mode**, named in your prompt.

**There is one version of the build-products skills: the one in `buildProductsUpstream` (k4kd/build-products-kunal).** Users never keep their own copy. Read `~/.product-teardowns/config.json` (format and defaults in the orchestrator's `references/contracts.md`). `<repo>` below means its `buildProductsPath`, a local clone of the upstream repo.

**Who you're running for** (`gh api user -q .login` against the owner, the part of `buildProductsUpstream` before the `/`):
- **The owner:** edit, commit and push to `main` directly (steps 1–5).
- **A contributor** (`contribute` is true; read `shareLessons` if `contribute` is missing): make the change on a fresh branch from the latest upstream and open a pull request. The owner reviews and merges it at their discretion (steps 1–4, then 6).
- **Anyone else:** stop. Say "skipped: not contributing" and write nothing. The lessons stay in the user's journal doc.

| Mode | Target skill | Lessons file | Where the lessons come from |
|---|---|---|---|
| technical | build-products-kunal | `<repo>/skills/build-products-kunal/references/lessons-from-teardowns.md` | `<mdir>/doc.md` "Worth stealing" + `findings/index.md` Lessons for builders |
| product | build-products-pm-kunal | `<repo>/skills/build-products-pm-kunal/references/lessons-from-teardowns.md` | `<mdir>/doc.md` decisions, "Worth stealing" and "What's publicly known to have worked" + `findings/product-evidence.md` |
| design | build-products-design-kunal | `<repo>/skills/build-products-design-kunal/references/lessons-from-teardowns.md` | `<mdir>/doc.md` decisions and "Worth stealing" + `findings/design-evidence.md` (including dark patterns to avoid) |

**Input:** `<run>/target.md`, the sources in the row for your mode, and that lessons file. **Output:** the updated lessons file, and `<mdir>/lessons.md` listing what changed.

## 1. Start from the latest version
`git -C <repo> fetch --quiet origin` and `git -C <repo> checkout --quiet main && git -C <repo> pull --ff-only --quiet origin main`. If `main` has local changes, stop and say so; never discard them.
- **Owner:** work on `main`.
- **Contributor:** `git -C <repo> checkout -b lessons/<mode>-<slug> origin/main`, where `<slug>` is the slug in `<mdir>/publish.json`. If that branch already exists, add `-2`, `-3` and so on.

If the repo or the target skill folder is missing, stop and say that setup should be re-run.

## 2. Turn findings into rules
Take every steal, every red flag and every lesson for your mode. Rewrite each one as a **generic rule someone building a product can apply**, in one or two plain sentences, ending with "(from <product>)". Product and design rules also state their **conditions** (when the rule holds), because a pattern that worked for one product can fail for another.
- Technical, yes: "Compute the price on the server, and let the browser send only what was chosen plus a signed price token. (from srimandir)"
- Product, yes: "Let people browse and start a purchase as a guest, and ask for an account only after they've seen value. Works when the first session can show value without personal data. (from srimandir)"
- Design, yes: "Ask only what payment needs before the pay step, and collect the rest after it succeeds. Each field before paying adds friction at the moment of highest drop-off. (from srimandir)"
- No: "Sri Mandir's cart sends price_token to /v2/cart." That's a fact about one product, not a rule.

A skip becomes a rule when it carries a lesson ("Start with one analytics tool; every extra vendor slows the page and adds risk"). A product rule that rests on a number keeps the number, its source and date in brackets.

## 3. Merge with the smallest possible diff
The change has to be easy to review. Touch **only** the lessons file for your mode, and inside it **only** the lines that change:
- **Same idea already there:** add the product to that rule's "(from …)" list. Change nothing else on the line unless the new evidence really sharpens it.
- **Contradicts an existing rule:** leave the old rule as it is, and add the new one right after it, with one sentence saying when each applies.
- **New:** append it as the last bullet under its lesson heading (the list for your mode in the contracts). Replace a heading's "No new rules yet." line with the first real rule.
- **Never** reorder, reflow, reformat or re-word other rules, change headings, fix unrelated typos, or touch any other file. If something else looks wrong, mention it in the pull request body instead.

Check with `git -C <repo> diff --stat`: one file changed, and only additions or single-line edits.

## 4. Public repo: keep it clean
The repo, and any pull request, may be **public**. Write generic patterns only: no secrets, keys or tokens, no exploit steps, no target code, no internal URLs, no non-public numbers, and nothing about the user or their journal. A red flag becomes a defensive rule ("Never ship API keys in a frontend bundle"), never a description of how to abuse it.

## 5. Commit (and, for the owner, push)
Write `<mdir>/lessons.md`: the added, merged and unchanged counts, then each changed rule with the evidence behind it (the doc section and the finding). If nothing changed, switch back to `main`, delete any branch you created, and say so.

`git -C <repo> add <the lessons file> && git -C <repo> commit -m "Lessons from <product> (<mode>)"`.
- **Owner:** `git -C <repo> push origin main`. If the push is rejected, `pull --rebase` and push again. Never force-push.

## 6. Contributor: open the pull request
1. **A fork to carry the pull request.** GitHub needs one for people who can't push to the upstream. It's never used for anything else, and the user doesn't maintain it. If `git -C <repo> remote get-url fork` fails, run `gh repo fork <buildProductsUpstream> --remote --remote-name fork` from inside `<repo>`.
2. `git -C <repo> push --quiet fork lessons/<mode>-<slug>`.
3. `gh pr create --repo <buildProductsUpstream> --head <login>:lessons/<mode>-<slug> --base main --title "Lessons from <product> (<mode>)" --body-file <mdir>/lessons.md`.
4. `git -C <repo> checkout --quiet main`, so the local clone always matches the upstream.
5. If `gh` fails, say so. The commit is still on the local branch, and the next run can push it.

Reply with: what changed (counts), whether it was pushed (owner) or the pull request's URL (contributor), or "skipped: not contributing".
