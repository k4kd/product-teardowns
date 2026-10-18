# Teaching formats

All callouts use a divider, a bold heading `✦ <Type>: <description>`, and blank lines around the content, rendered as plain Markdown. The labels are `Build checkpoint`, `Concept`, `Why this matters`, `Novel algorithm` and `System check`. Ask reasoning questions as normal paragraphs, and wait for the answer.

## The concept ladder

Climb only as high as the user's level for that topic needs: beginners get every rung, and advanced users can start at rung 3. The user can say "lighter" or "deeper".

---

**✦ Concept: <name>**

1. **Plain English.** One analogy from everyday life, with no jargon. ("A cache is keeping the milk in the fridge instead of driving to the store each time.")
2. **How it works.** The mechanism in 3–6 sentences, defining each new term in bold on first use. A small ASCII diagram if it helps, with unknown parts left as `?`.
3. **Technical.** Precise vocabulary, trade-offs, complexity (time/space/latency/cost), failure modes and when *not* to use it.
4. **In this target.** Where it shows up, with REA evidence IDs and each claim labelled observed, inferred or unknown.
5. **Go deeper.** Start / Deep / Mastery, one link each from curriculum.md, with a one-line note on what to take from each (for example "watch lecture 4 only").

**✦ Why this matters** (optional): one or two sentences on how this choice affects a product the user might build.

---

## Novel algorithm

Use this for anything the target does that isn't the textbook version: a custom diff, a CRDT variant, a ranking formula, a compression trick, a scheduler, a clever cache key.

---

**✦ Novel algorithm: <what it does>**

- **Plain English:** what problem it solves and the trick, as an analogy.
- **Closest textbook algorithm:** name it, and say what this one changes and why that change probably helps (inferred unless the evidence proves it).
- **Pseudocode:** 5–15 lines, in the target's terms.
- **Complexity and trade-offs:** time, space, and what it gives up.
- **Evidence:** the functions and addresses or modules with evidence IDs, and a clear line between what REA observed and what you reconstructed.
- **Go deeper:** the paper or canonical source for the textbook version.

---

## System check

At the end of a teardown, use one ASCII diagram of the whole flow (user action → components → data stores → back) that ties together the concepts taught. Then ask the user to walk through the flow aloud and point out where each concept lives.

## Journal templates (`~/learning-journal/`)

### profile.md
```markdown
# Learner Profile

## Levels
Systems/infra: [Beginner / Intermediate / Advanced]
Algorithms: [..]
Code: [..]
Default depth: [answer]

## Goal
[what they want to be able to do in a year]

## Strong
None yet.

## Developing
None yet.

## Revisit
None yet.
```

### progress.md
```markdown
# Learning Progress

## <Concept>
- Introduced: <date> via <target>
- Demonstrated: <their reasoning, briefly> (<date>)
- Needs reinforcement: <gap>
- Resources assigned: <links>
```
Each concept gets its own section, which is updated in place and never duplicated.

### teardowns.md
```markdown
# Teardowns

- <date> · <target> · Q: <driving question> · Lesson: <top lesson> · [report](teardowns/<YYYY-MM-DD>-<target-slug>.md)
```
