# reverse-learn-kunal

An Agent Skill for learning engineering by reverse engineering real products.

Point it at something that ships, such as an app, a binary, an Electron `.asar`, an APK or a website, and ask how it does something. It:

1. asks you to **predict** how it works first,
2. **tears it down** with [REA](https://github.com/morluto/rea), keeping evidence and guesses separate,
3. **judges** what's worth your attention through the [build-products-kunal](https://github.com/k4kd/build-products-kunal) lens (steal / study / skip),
4. **teaches** the infra, system-design and novel-algorithm concepts behind it, in plain English first and then technical terms,
5. links **mastery-level resources** (Karpathy Zero to Hero, DDIA, MIT/CMU courses) for each concept,
6. ends with a **story-style report** in everyday language, with a written explanation, then architecture, user-flow, data-flow and algorithm diagrams, checked to be readable by the weakest model (Haiku) and saved in your journal,
7. **logs** what you learned in `~/learning-journal/`, so later sessions build on earlier ones.

The learning loop is adapted from VibeWise: you reason first, and the AI gives feedback.

## Requirements

- The `reverse-engineer-anything` skill and the REA MCP server (`npx -y rea-agents mcp`) for teardowns. See the [REA README](https://github.com/morluto/rea).
- Teaching, the product lens and the journal work without them, for example on ordinary source repos.

## Install on a new device

Both repos are private, so first log in to GitHub on the device (`gh auth login`).

```bash
# 1. The skill: clone it once, then link it into each agent's skills folder
git clone https://github.com/k4kd/reverse-learn-kunal.git ~/code/reverse-learn-kunal
ln -s ~/code/reverse-learn-kunal/skills/reverse-learn-kunal ~/.claude/skills/reverse-learn-kunal   # Claude Code
ln -s ~/code/reverse-learn-kunal/skills/reverse-learn-kunal ~/.codex/skills/reverse-learn-kunal    # Codex (other agents: their skills dir)

# 2. The journal (the skill also clones this itself on first use)
git clone https://github.com/k4kd/learning-journal.git ~/learning-journal
```

Update with `git -C ~/code/reverse-learn-kunal pull`. The journal pulls at the start of every session and pushes at the end, so progress follows you between devices.

`npx skills add k4kd/reverse-learn-kunal -g` also works if your git credentials can read private repos. It makes a copy, though, so curriculum additions won't sync back.

## Use

- "Run reverse-learn-kunal on openclaw" (just a name: it finds and fetches the target itself, without running it)
- "Use reverse-learn-kunal on /Applications/Linear.app. How does it sync so fast?"
- "Tear down this APK and teach me how its offline mode works."
- "Quiz me" (reviews concepts from your journal without a new target)

## Layout

```
skills/reverse-learn-kunal/
  SKILL.md
  references/teaching.md      # concept ladder, callouts, journal templates
  references/product-lens.md  # steal / study / skip table
  references/report.md        # final report: structure, writing rules, Haiku readability test
  references/curriculum.md    # tracks → start / deep / mastery resources
```

## License

MIT. It builds on REA (MIT), VibeWise (MIT) and build-products-kunal (MIT).
