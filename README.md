# reverse-learn-kunal

An Agent Skill for learning engineering by reverse engineering real products.

Point it at something that ships, such as an app, a binary, an Electron `.asar`, an APK or a website, and ask how it does something. It:

1. asks you to **predict** how it works first,
2. **tears it down** with [REA](https://github.com/morluto/rea), keeping evidence and guesses separate,
3. **judges** what's worth your attention through the [build-products-kunal](https://github.com/k4kd/build-products-kunal) lens (steal / study / skip),
4. **teaches** the infra, system-design and novel-algorithm concepts behind it, in plain English first and then technical terms,
5. links **mastery-level resources** (Karpathy Zero to Hero, DDIA, MIT/CMU courses) for each concept,
6. **logs** what you learned in `~/learning-journal/`, so later sessions build on earlier ones.

The learning loop is adapted from VibeWise: you reason first, and the AI gives feedback.

## Requirements

- The `reverse-engineer-anything` skill and the REA MCP server (`npx -y rea-agents mcp`) for teardowns. See the [REA README](https://github.com/morluto/rea).
- Teaching, the product lens and the journal work without them, for example on ordinary source repos.

## Install

```bash
npx skills add k4kd/reverse-learn-kunal -g
```

## Use

- "Use reverse-learn-kunal on /Applications/Linear.app. How does it sync so fast?"
- "Tear down this APK and teach me how its offline mode works."
- "Quiz me" (reviews concepts from your journal without a new target)

## Layout

```
skills/reverse-learn-kunal/
  SKILL.md
  references/teaching.md      # concept ladder, callouts, journal templates
  references/product-lens.md  # steal / study / skip table
  references/curriculum.md    # tracks → start / deep / mastery resources
```

## License

MIT. It builds on REA (MIT), VibeWise (MIT) and build-products-kunal (MIT).
