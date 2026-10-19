---
name: product-teardowns-publish
description: Stage of product-teardowns. Deterministically publishes a finished run into the private learning journal - fills in the readability result, copies the doc, appends ledger rows and the index line, raises levels by the level rule, then commits and pushes. Run by the product-teardowns orchestrator, not on its own.
license: MIT
metadata:
  author: kunal
  version: "1.0.0"
---

# Publish stage

All of this stage is one script, so it behaves the same way every time:

```bash
node <this skill's folder>/scripts/publish.mjs --run ~/teardowns/<slug>/run/<mode>
```

It reads `publish.json`, `doc.md` and the highest-numbered `readability-<n>.md` from the mode folder (formats in the orchestrator's `references/contracts.md`). Then it:
1. replaces the doc's `- Readability: …` line (pending, or a result from an earlier publish) with the last run's verdict, score and answers, in both the run folder and the journal;
2. pulls the journal, then copies the doc to `~/learning-journal/<mode>/teardowns/<slug>.md` (the mode comes from publish.json);
3. appends one `<mode>/ledger.md` row per new concept (creating that ledger on the mode's first publish), skipping any concept already in the ledger (case-insensitive);
4. appends the `<mode>/teardowns.md` index line, once per doc;
5. recounts the ledger per area and raises levels in `profile.md` by the level rule, adding a Level history line for each rise (a level never drops);
6. commits only those files and pushes with `-u origin HEAD`. If the push is rejected, it pulls with `--rebase` and pushes again. It never force-pushes.

It prints a JSON summary (`doc`, `added`, `raised`, `readability`, `pushed`). Exit code 0 means it worked, 1 means bad input or a git error (the message says which), and 2 means it saved locally but the push failed. Report the summary in one line. It's safe to re-run: nothing is duplicated.

Target code never goes through this script. Only journal files are committed.

**Changing this stage:** edit `scripts/publish.mjs`, then run `node scripts/publish.test.mjs`, which must print "self-check passed".
