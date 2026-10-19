# Product lens

This file says which parts of a teardown are worth the user's time. It uses build-products-kunal's view of a product: what a solo builder shipping with AI has to get right. Only include rows where the teardown found something. Leave a row out when there's no evidence, and never guess to fill the table.

## The table

| Area | What they did (observed / inferred) | Verdict | Why |
|---|---|---|---|
| Accounts & access | auth provider, session/token handling, roles | steal / skip | |
| Data | what is stored where, local vs server, retention, deletion | | |
| Payments | hosted checkout vs custom, licensing checks | | |
| Errors | retries, offline behaviour, what the user sees | | |
| Cost control | rate limits, caching, batching, model/API choice | | |
| Secrets | keys in the bundle? env? fetched at runtime? | | |
| Backups & recovery | sync, conflict handling, undo | | |
| Performance & scale | the trick that makes it fast; what it would cost at 10× | | |
| Stack | frameworks, services, build tooling | | |
| Minimal vs over-built | what was clever-small, what looks like bloat | | |

**Verdicts:**
- **Steal:** a good pattern the user can copy into their own products. Every steal row also goes into build-products-kunal's lessons file.
- **Skip:** accidental complexity, legacy code or scale the user doesn't need. Say what the smaller option is.

Deep ideas worth learning properly are not a verdict here. They become new concepts in the doc.

**Red flags to call out plainly:** secrets shipped in a client bundle, card data handled directly, wide-open storage rules, unbounded paid-API calls. If one shows up, describe it as a lesson and as evidence. Don't give a how-to for exploiting it.

## Smallest version you could build

End with one paragraph that applies the build-products minimal ladder to the target. If the user rebuilt the core job, what is the least that works? Which managed services would they use, what would they cut, and which one or two concepts would they actually need to master?
