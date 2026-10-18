# Teardown report

Every session ends with one report. Save it as `~/learning-journal/teardowns/<YYYY-MM-DD>-<target-slug>.md` and show it in chat. The report must make sense to someone who never saw the session, including the weakest available AI model. The writing rules and readability test are adapted from write-a-prd-kunal.

## Sections, in this order

Every section opens with a sentence that states its point. No section depends on another one to be understood.

| Section | What it says |
|---|---|
| Answer | The answer to the driving question in 1–2 sentences, with a number where there is one ("Cursor shows suggestions in about 100 ms because…"). |
| Start here | What was studied and why, how the report's parts fit, and one user action traced from start to finish through the target. |
| Glossary | Every technical term in the report, each explained in everyday words. It goes near the top, so no term is used before it is explained. |
| How it works | A Mermaid flowchart of the main flow, followed by one sentence explaining it. Label each step observed, inferred or unknown. |
| Your guess vs what we found | What the user predicted, what was right, what was missed, and why the difference matters. |
| Product lens | The steal / study / skip table from product-lens.md, with one plain sentence per row, and then the "smallest version you could build" paragraph. |
| Concepts | One subsection per concept taught: plain words → how it works → technical → where it shows up in this target → three resources (start / deep / mastery) with what to take from each. |
| Novel algorithms | Only if any were found: plain words, closest textbook algorithm, pseudocode, complexity, evidence. |
| Open questions | Each unknown on one line, with the evidence or tool that would answer it. |
| Next | One resource to study and one target to tear down next, each with a one-sentence reason. |

## Writing rules

- **Lead with the point.** The first sentence of the report and of each section states the answer or finding, with its number where there is one.
- **Make every section standalone.** Repeat the context a reader needs. Never write "see above", "as mentioned" or "below".
- **Use specifics, not adjectives.** Give numbers with units, names, file or function names, and exact UI text. Replace "fast", "efficient" and "clever" with what was measured or seen.
- **Plain words before the term.** Explain every technical idea in everyday words first, then give the term. Do this the first time it appears in each section.
- **Define ordinary words that carry a technical meaning.** Words like sync, merge, conflict, cache, register, latency and "constant time" go in the Glossary too. Each definition holds one idea and uses no undefined term.
- **Gloss technical terms even in the Technical rung.** The first time a term like "O(n)" or "register" appears, add a few plain words in brackets ("constant time, meaning the cost does not grow as the file grows").
- **Answer and Start here come before the Glossary,** so explain every term in them inline the first time ("a property, one setting of an object such as its position or colour").
- **Give a concrete example for every mechanism.** Don't write "it adjusts each change". Show it: "Asha deletes word 3 while Ben types at word 5, so Ben's edit shifts to word 4."
- **Back up every "rarely", "usually" or "often"** with the reason in the same sentence.
- **Introduce every person, tool and product in one phrase** the first time it is named ("REA, the reverse-engineering tool used for this teardown"; "Martin Kleppmann, a Cambridge researcher who wrote *Designing Data-Intensive Applications*").
- **Say why in the same sentence.** Never write "this matters" or "the difference is important" without giving the reason right there.
- **Links in Concepts and Next are allowed.** Each link still says in plain words what the reader will learn from it, and why it comes at that tier.
- **Gloss every ID on first use in a section.** An evidence ID or function address gets a few plain words beside it ("E-12, the call that saves the draft").
- **Keep sentences short and plain.** Sentences stay under 25 words, and paragraphs at three sentences or fewer. Use bullets only for parallel items.
- **Pick the right shape.** Use tables to compare items on several attributes, numbered lists for steps in order, and flowcharts for flows that branch or loop.
- **Say what is unknown.** Never write a guess as fact. Label it inferred, or put it in Open questions.
- **Label proposals.** Anything the agent suggested, rather than found or the user decided, is marked "Proposed".

## Readability test

The report passes only when the weakest available model reads it cold, understands it and finds it easy. Run this test after drafting, and again after every major revision.

1. **Pick the reader.** Use the weakest model available as a sub-agent with no prior context. In Claude Code that is Haiku: the Agent tool with `model: "haiku"`. Give it only the report's text and tell it not to open any other file. Use a fresh agent for every run.
2. **Write 7 to 10 comprehension questions** whose answers you know. Cover the answer to the driving question, how the main flow works, one steal and one skip verdict and why, what happens in one edge case found in the teardown, and two or three key terms "in your own words". Ask for each answer in 1–3 sentences with the line number where it was found.
3. **Ask for a difficulty report:**
   - hard passages (line, short quote, why);
   - every term used before it was explained, or never explained;
   - every pointer instead of a fact ("see", "as above", "below", an unglossed ID);
   - a readability score from 1 (impossible) to 10 (easy for a newcomer), with one sentence of reasoning.
4. **Grade it.** The report passes when every question is answered correctly with the right line, the score is 8 or higher, and no unexplained terms or pointers are listed.
5. **If it fails,** fix what the report names, then re-run with a fresh agent. Usual fixes: expand Start here, add missing terms to the Glossary, rewrite each flagged passage with the point first, state each missed answer plainly where a reader would look for it, and replace each pointer with the fact itself. Never change a finding, number or verdict to make the report read more easily. Stop after three failed runs and say what still fails.
6. **Record the result** at the bottom of the report under `Readability`: the score, the number of questions answered correctly, and anything you could not fix. If no sub-agent is available, say "Readability test not run" and why. Never claim it passed.
