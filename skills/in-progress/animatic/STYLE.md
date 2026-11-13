# The style guide

An animatic is watched once, start to finish, at the speed of the voice. The viewer cannot pause to study a frame or scroll back to a definition. Every rule here follows from that.

## Reveals build credit. A Cut spends it.

Two things can happen between one moment and the next:

- A **Reveal** develops what is already on screen: one box appears on a diagram, a label changes, the terminal gains its next line, the editor scrolls on with the previous function still in shot.
- A **Cut** replaces what is on screen with something new.

Reveals bank credit: the viewer knows where they are, so they can listen. A Cut spends it: for a second they are lost, reading a new screen while the voice runs on. Spend Cuts faster than you bank them and the video reads as jagged, then bamboozling. **Cut once per idea, and Reveal inside it.**

The pace to aim at: about three lines between Cuts, and a Cut every 20 to 30 seconds. A well-paced six-minute explainer runs about 40 moments and 11 Cuts. One diagram that gains a box at a time can carry a whole idea, and a single relocation (one box moved out of another, an arrow drawn to it) can tell a whole argument without a Cut.

Each Reveal keeps enough of the frame before it for the viewer to see where they have come from:

- **Code**: scroll rather than jump. Two frames of one file overlap, so the code just discussed is still in shot. Then light the next line.
- **Terminal**: the command, then the same terminal with its output below it. The scrollback stays where it was.
- **Browser**: the same page with one panel opened, one field filled, one line typed.
- **Diagram**: one box, one arrow, one highlight at a time.

**Build the final frame first, then reveal it in pieces.** On a generated frame, a Reveal is the next entry with a new `show` or `lit` (FRAMES.md). On a page of your own, the next Reveal is a copy of the page with one thing changed, the later boxes hidden with `style="visibility:hidden"` so the layout keeps still as they appear.

## It has to work on radio

A viewer looking away must still get it. **The line carries the meaning; the frame is an aid to it.** Write each line so it stands alone, then make the frame agree with it.

- **Read the artifact out loud.** Whatever the viewer is looking at (a heading, a config key, an error, a test name) is spoken in the line, in the words on the screen. "This one is the interesting bit" names nothing. The quote is the moment. Give a quoted name a lead-in so it stays apart from the sentence: "the test called counts each API key separately".
- **Name every member of a set.** A line that says "three files change" owes the viewer three moments, one per file, each named. Reveal them one at a time on one frame.
- **Define a noun the first time it is spoken.** A term new to the viewer gets a moment of its own before it is used. A clause tucked inside another sentence is not a definition.
- **Show the mechanism before the artifact.** The command, the rule or the function goes on screen first, and the file it produces after.
- **Light exactly one thing: the words the line quotes.** Set `lit` on a generated frame; on a page of your own, use `.l.here` (with `.code--spotlight` on the block) for a code line, `.spot` for words in prose, `.node.lit` for a box. Two lit things on one frame, or a line naming two things on a frame lighting one, is really two moments. A frame with nothing lit is an **overview**, and its line talks about the whole frame ("six files change; here's the order to read them").

**A reaction is as long as the thing it reacts to.** Opening a file with six headings and spending one line on it is a mention. Budget one moment per heading, and a second wherever the file gives you a sentence worth quoting.

**Show the decisions, not the legwork.** When a frame shows an agent or a script at work, its reads, greps and test runs are legwork. The viewer needs the decisions: the question asked, the claim and its evidence, the file written, the thing that broke. A run of legwork gets one clause at most, inside the moment it leads to: "it reads the config and the last two commits, and comes back with this."

## The lines

- **Speak, don't write.** A line is said aloud by a voice that reads exactly what it is given. Use contractions, short sentences and the first person ("I", "we", "you"). Spell symbols and paths the way a person says them: "package dot json", "the dash dash only flag", "four twenty-nine". Keep code punctuation, URLs and markdown out of the line: the voice reads them literally.
- **The voice is the user's.** If the user has written or recorded anything (a README, a blog post, a transcript, the PR body itself), read some of it first and match its sentence length, its asides and how it opens a point. A line written from a summary alone is correct, flat and unlike anyone.
- **The why, up front.** By the second moment the viewer hears who was hurt or helped, and how ("one busy customer was blocking everyone else"). A rule, a feature or a mechanism is not a why; its consequence is. "The limiter wasn't counting per key" is the mechanism; "a fresh key was blocked by someone else's traffic" is the why.
- **Plain words.** Use the project's own terms, and name everything else with a plain noun the viewer half-knows already. A phrase you coin is a term the viewer must learn and nobody defined.
- **Say each fact once**, at the moment it is decided or used.
- **One line per moment**: one to three sentences, about 5 to 15 seconds spoken. Longer, and the frame goes stale under it; shorter, and the frames flicker.

## The frames

- **The stylesheet is the contract** ([`kit/README.md`](kit/README.md)). Every font, colour and size comes from a kit class; that is what makes forty frames read as one video.
- **Keep the words off the frame.** A frame carries two to four words of its own: a label on a box, a two-word title, often nothing. The sentence belongs in the line. Prefer fewer, larger elements.
- **Text that is not code is 50 characters wide at most**, and as short as you can make it. Code and terminal output show the real thing at its real width.
- **Real content only.** The real file, the real diff, the real output, copied from the source: every ID, argument, path, flag and number. Code that does not exist misleads the viewer, and placeholder boxes cannot be judged for density.
- **Real line numbers.** An excerpt keeps the file's real line numbers and nesting. A `code` frame from the saved diff or file does this for you, folding what it skips. On a page of your own, mark skipped lines with a fold (`.l.fold`) in place of renumbering or dropping a parent key, and wrap a line too long for the frame onto a `.l.bare` continuation.
- **28px is the floor** for anything the viewer must read; code is 30px. A frame that does not fit at those sizes holds too much: split the moment.
- **Fill the frame.** It is often watched at half size, inline in a PR or a doc. A diagram, a list or a card spans at least half the frame's width; a short list of four items is set large, filling the dark field around it.

## The sheet checklist

Read the contact sheet for these, in order:

1. **Cuts.** Count the places where the next frame shares nothing with the one before. More than one per idea: fold the extra Cuts into Reveals.
2. **Density.** A frame with more than one thing to read, or text past 50 characters: split it or cut words.
3. **The lit thing.** Each frame lights exactly one thing, the words its line quotes, or is an overview. (`build` warns on two lit things, and on a `lit` that matches nothing.)
4. **Line against frame.** Read each line under its tile: does the frame show what the line says, at that moment?
5. **Invented detail.** Every ID, argument, path, flag and number on a terminal or code frame is in the source. A plausible session ID or command argument you made up is a false claim on screen.
6. **Fill.** Title cards and diagrams span at least half the tile's width.
7. **Cut-off edges.** Code or text clipped at the bottom or right of a tile. (`build` warns on these.)

## Feedback

The user names positions ("number 4") and a feeling. Change the moments they name and keep the plan around them. Keep every moment that is still true, and rewrite the lines on each side of a seam so it still flows.

- **Too dense**: the frame holds too much, the line holds too much, or one moment is really two. Splitting it is a legitimate fix; say so before you do it.
- **Too fast**, **jagged**, **bamboozling**: Cuts are spent faster than credit comes in. Reveal instead: take the page before, change one thing. Say so before you fold a run of Cuts into one screen.
- **Thin**, **too quick**: add moments, one per thing worth reading out.
- **Wording only**: change `"say"`; the frame is untouched. **Frame only**: change the page; the line is untouched, and its speech is not regenerated.
