# Teardown report

Every teardown session ends with one report. Save it as `~/learning-journal/teardowns/<YYYY-MM-DD>-<target-slug>.md` and show it in chat. GitHub renders the Mermaid diagrams when the journal syncs.

The report is written for a curious person, not an engineer. It reads like a friend explaining what they found over coffee: one clear story from start to end. The writing rules and readability test are adapted from write-a-prd-kunal.

## The one rule that shapes everything

**Nothing appears out of thin air.** Every idea, term, component, person or tool is introduced in everyday words at the moment the reader first needs it, never earlier and never later. There is no glossary, no "see above", no "as we'll see", no "section 3" and no IDs to look up. If the reader would need to scroll back or jump ahead to understand a sentence, rewrite the sentence.

## The story, in this order

Each part builds only on what came before it. Use these headings, in plain words.

1. **The short version.** 2–3 sentences anyone could repeat to a friend: what it is, how it does its main trick, and the most surprising thing found.

2. **The story.** This is a written explanation of 4–8 short paragraphs, with no diagrams yet. It starts with the problem the product solves, in human terms ("you want your AI assistant to answer you on WhatsApp, Slack and Telegram without building three bots"). Then it describes the big idea of how the product solves it, using an everyday comparison ("it works like a hotel front desk: every guest walks in through different doors, but one desk handles them all"). Then it names the main parts and what each one does, introducing each part by name only when the story reaches it. This section is the foundation, so everything later builds on it.

3. **The big picture.** A system architecture diagram, introduced with one sentence ("Here are the parts from the story and how they connect"), followed by a 2–4 sentence walk through it. Every box uses a name the story already introduced.

4. **Follow one real action.** Pick one thing a user actually does ("you send 'what's on my calendar?' on Telegram"). Show it twice:
   - a **user flow**: what the person sees and does, step by step;
   - a **data flow**: what moves between the parts, in what order, and what it looks like at each hop ("the message is now a small JSON object, a labelled list of fields, with the text, the sender and the channel").

   Narrate each diagram in plain sentences.

5. **The clever parts.** Cover 1–3 concepts or algorithms, each one a mini-story with these beats:
   - **Start with something familiar:** an everyday situation with the same shape as the problem ("a restaurant kitchen where orders pile up faster than the chef can cook").
   - **The problem it solves here,** in this product's terms.
   - **How it works, shown:** a flow diagram of the logic. For an algorithm, add a **step-by-step trace table** that shows how each variable or piece of data changes on a small real example.
   - **Now the real words:** the technical terms, each tied to the familiar version ("engineers call that pile of orders a *queue*"). Then trade-offs, cost and when it breaks.
   - **Where we saw it:** the files, functions or behaviour in the target, in plain words, with how sure we are (seen in the code / our best guess / not known).
   - **If you want to master this:** 3 resources (start, deeper, mastery), each with one sentence saying what you'll get from it.

6. **What you guessed vs what we found.** Skip this if there was no guess. Say what was right, what was missed, and why the real design makes sense. Be kind and specific.

7. **If you built something like this.** The steal / study / skip table from product-lens.md, with each row explained in one plain sentence. Then 3–5 sentences on the smallest version you could build.

8. **What we still don't know.** Each open question on one line, with what would answer it.

9. **What to do next.** One thing to study and one thing to take apart next, each with a reason.

10. **Where this came from.** This is the only reference list, and the story never points to it. List the target and version, the REA evidence IDs, and the files read. A reader can skip it and miss nothing.

## Diagrams

Use a diagram wherever a picture is clearer than words, and always pair it with plain sentences. Use Mermaid so the diagrams render on GitHub, and keep each one to 12 boxes or fewer. Split it if it's bigger.

| What you're showing | Diagram |
|---|---|
| System architecture: the parts and what connects them | `flowchart LR`, with `subgraph` for groups such as "on your laptop" and "in the cloud" |
| User flow: what the person does and sees | `flowchart TD`, with decision diamonds for choices |
| Data flow: messages between parts, in order | `sequenceDiagram` |
| Something that changes state (connected, waiting, retrying) | `stateDiagram-v2` |
| Algorithm logic | `flowchart TD`, plus a trace table |

A **trace table** has one row per step and one column per variable, run on a tiny real example:

| Step | What happens | `queue` | `current` | `done` |
|---|---|---|---|---|
| 1 | Two messages arrive | [A, B] | none | [] |
| 2 | Take the first one | [B] | A | [] |
| 3 | Finish A, take the next | [] | B | [A] |

Label each box and arrow in plain words ("sends your message", not `POST /v1/ingest`). Put the technical name in brackets only after the story has introduced it. Mark guessed parts of a diagram with "(guess)".

## Writing rules

- **Talk like a person.** Use everyday language, "you" and "we", and short sentences (under 20 words is best, 25 at most). Keep paragraphs to 3 sentences or fewer.
- **Familiar before technical.** For every hard idea, start with an everyday comparison, then show how it works, then give the real terms. Never lead with jargon.
- **Introduce everything in one phrase when it first appears.** That includes people ("Martin Kleppmann, a Cambridge researcher who wrote the standard book on this"), tools ("REA, the tool we used to take the app apart") and parts of the product.
- **Define ordinary words that have a technical meaning here,** such as sync, merge, gateway, queue, cache, token, latency and "constant time", right where they appear.
- **Show, don't describe.** Give a concrete example for every mechanism, with real-looking values ("Asha's message 'hi' becomes `{text: 'hi', from: 'asha', channel: 'telegram'}`").
- **Use specifics, not adjectives.** Give numbers with units, names and exact on-screen text. Replace "fast" and "clever" with what was measured or seen.
- **Give the reason in the same sentence.** Never write "this matters", "usually" or "rarely" without the why.
- **Be honest about certainty, in plain words:** "we saw this in the code", "our best guess", "we couldn't find out". Never present a guess as fact.
- **No pointers.** No glossary, no "see", "above", "below", "earlier" or "later", no section numbers, no bare IDs. Evidence IDs live only in "Where this came from".

## Readability test

The report passes only when the weakest available model reads it cold, understands it and finds it easy. Run the test after drafting, and again after every major revision.

1. **Pick the reader.** Use the weakest model available as a sub-agent with no prior context. In Claude Code that is Haiku: the Agent tool with `model: "haiku"`. Give it only the report and tell it not to open any other file. Use a fresh agent for every run.
2. **Ask 7 to 10 comprehension questions** whose answers you know. Cover what the product is, the big idea, the parts and how they connect, one real action from start to finish, how one clever part works (including what a variable holds at one step of the trace), one steal and one skip and why, and two key terms "in your own words". Ask for 1–3 sentence answers with line numbers.
3. **Ask for a difficulty report:**
   - hard passages (line, short quote, why);
   - anything that **appeared out of thin air**: used before it was introduced, or never introduced;
   - any **cross-reference** or pointer ("see", "above", "below", "earlier", "later", an ID or section number) outside "Where this came from";
   - any diagram that was confusing, or that used a name the text hadn't introduced;
   - whether it **read as one story** from start to end (yes/no, and where it broke);
   - a readability score from 1 (impossible) to 10 (easy for a curious non-engineer), with one sentence of reasoning.
4. **Grade it.** It passes when every answer is correct with the right line, the score is 8 or higher, it read as one story, and nothing appeared out of thin air or pointed elsewhere.
5. **If it fails,** fix exactly what the report names, then re-run with a fresh agent. Never change a finding, number or verdict to make the report read more easily. Stop after three failed runs and say what still fails.
6. **Record the result** as the last line of "Where this came from": the score, how many answers were correct, and anything still unfixed. If no sub-agent is available, write "Readability test not run" and why. Never claim it passed.
