# Curriculum

These tracks are the path to mastery. For each concept you teach, pick one **Start** (gentle, intuition-first), one **Deep** (a proper course or book) and one **Mastery** resource (the primary source, a paper or the hardest canonical text) from the matching track. Add new sources only if they are canonical and you have checked that the link loads. Every link here returned HTTP 200 on 2026-10-18.

The bar for a source is Karpathy's Zero to Hero: built from first principles by someone who has done the work, free or canonical, and still worth it in five years.

## Reverse engineering
*Why it matters:* this is the meta-skill. It lets you read any product's design straight from what it ships.
- Start: [LiveOverflow (YouTube)](https://www.youtube.com/@LiveOverflow): binary exploitation and RE, explained from scratch
- Start: [Malware Unicorn RE101](https://malwareunicorn.org/workshops/re101.html)
- Deep: [OpenSecurityTraining2](https://p.ost2.fyi/): x86-64 assembly (Arch1001) → RE courses
- Deep: [pwn.college](https://pwn.college/): hands-on, graded dojo
- Mastery: [Ghidra](https://ghidra-sre.org/) docs plus the [REA repo](https://github.com/morluto/rea) source

## How computers work
*Why it matters:* every performance or security trick bottoms out here.
- Start: [Ben Eater](https://eater.net/): builds a computer on breadboards
- Start: [cpu.land](https://cpu.land/): how a program actually runs
- Deep: [Nand2Tetris](https://www.nand2tetris.org/): from logic gates to an OS
- Mastery: [CS:APP (CMU 15-213 textbook)](https://csapp.cs.cmu.edu/)

## Networking and the web
*Why it matters:* every product is mostly messages moving between machines.
- Start: [Julia Evans' zines](https://wizardzines.com/) and [blog](https://jvns.ca/)
- Start: [Explained from First Principles](https://explained-from-first-principles.com/): the internet and TLS
- Deep: [High Performance Browser Networking](https://hpbn.co/) (Ilya Grigorik, free)
- Deep: [web.dev Learn Performance](https://web.dev/learn/performance)
- Mastery: [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/): sockets from the metal

## Databases and storage
*Why it matters:* your data model is the hardest thing to change later.
- Start: [Use The Index, Luke](https://use-the-index-luke.com/)
- Deep: [CMU 15-445 Database Systems](https://15445.courses.cs.cmu.edu/) (Andy Pavlo; lectures on YouTube)
- Mastery: [SQLite architecture](https://www.sqlite.org/arch.html), then read the source

## Distributed systems
*Why it matters:* the moment you have two servers, or a phone plus a server, you have one.
- Start: [Martin Kleppmann's Distributed Systems lectures](https://www.youtube.com/playlist?list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB) (Cambridge)
- Deep: [Designing Data-Intensive Applications](https://dataintensive.net/), the single most important book on this list
- Deep: [MIT 6.5840 (6.824) Distributed Systems](https://pdos.csail.mit.edu/6.824/): labs build Raft
- Mastery: [Raft](https://raft.github.io/), [Dynamo paper](https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf), [GFS paper](https://research.google/pubs/the-google-file-system/), [Jepsen analyses](https://jepsen.io/analyses)

## System design
*Why it matters:* choosing the parts and how they talk is the job of whoever owns the product.
- Start: [ByteByteGo (YouTube)](https://www.youtube.com/@ByteByteGo) and [newsletter](https://blog.bytebytego.com/)
- Deep: [System Design Primer](https://github.com/donnemartin/system-design-primer)
- Mastery: [The Architecture of Open Source Applications](https://aosabook.org/en/); engineering posts such as [Discord: trillions of messages](https://discord.com/blog/how-discord-stores-trillions-of-messages), the [Cloudflare blog](https://blog.cloudflare.com/) and the [Fly.io blog](https://fly.io/blog/)

## Performance and observability
*Why it matters:* "it's slow" becomes a fixable fact once you can measure it.
- Start: [Brendan Gregg's site](https://www.brendangregg.com/): flame graphs, USE method
- Mastery: [Systems Performance, 2nd ed.](https://www.brendangregg.com/systems-performance-2nd-edition-book.html)

## Algorithms and data structures
*Why it matters:* this is the vocabulary for every "novel algorithm" you will find.
- Start: [3Blue1Brown](https://www.3blue1brown.com/): intuition for the math
- Deep: [MIT 6.006 Introduction to Algorithms](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/)
- Deep: [Algorithms, 4th ed. (Sedgewick)](https://algs4.cs.princeton.edu/home/)
- Mastery: [Jeff Erickson's *Algorithms*](https://jeffe.cs.illinois.edu/teaching/algorithms/) (free)

## Real-time sync and collaboration
*Why it matters:* this is what makes Figma, Linear and Notion feel instant, and it's the hardest part to copy.
- Start: [How Figma's multiplayer works](https://www.figma.com/blog/how-figmas-multiplayer-technology-works/)
- Deep: [Local-first software (Ink & Switch)](https://www.inkandswitch.com/local-first/) and [crdt.tech](https://crdt.tech/)
- Mastery: [Kleppmann, "CRDTs: the hard parts"](https://martin.kleppmann.com/2020/07/06/crdt-hard-parts-hydra.html)

## Compilers, runtimes and bundlers
*Why it matters:* every JS/Electron app you tear down went through one of these, and knowing them makes minified code readable.
- Start: [Crafting Interpreters](https://craftinginterpreters.com/) (free online)
- Mastery: [V8 blog](https://v8.dev/blog): how the JS engine really works

## AI and ML systems
*Why it matters:* most new products wrap a model, so knowing what's inside tells you what's cheap and what's hard.
- Start: [Karpathy, Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI)
- Deep: [Karpathy, Neural Networks: Zero to Hero](https://karpathy.ai/zero-to-hero.html), the benchmark for this whole list
- Deep: [Let's build GPT](https://www.youtube.com/watch?v=kCc8FmEb1nY) and [Let's build the GPT Tokenizer](https://www.youtube.com/watch?v=zduSFxRajkE)
- Mastery: [Let's reproduce GPT-2 (124M)](https://www.youtube.com/watch?v=l8pRSuU81PU); [Dive into Deep Learning](https://d2l.ai/)

## Security
*Why it matters:* a teardown shows you the mistakes before you make them yourself.
- Start: [OWASP Top 10](https://owasp.org/www-project-top-ten/), the same checklist build-products-kunal uses
- Deep / Mastery: [PortSwigger Web Security Academy](https://portswigger.net/web-security) (free labs)

## Maps for the whole journey
- [Teach Yourself CS](https://teachyourselfcs.com/): the canonical self-taught path
- [OSSU Computer Science](https://github.com/ossu/computer-science): a full free degree
- [The Missing Semester (MIT)](https://missing.csail.mit.edu/): shell, git, tooling
- [roadmap.sh](https://roadmap.sh/): visual maps
