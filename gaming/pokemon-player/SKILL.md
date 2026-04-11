---
name: pokemon-player
description: Play Pokemon games autonomously via headless emulation. Starts a game server, reads structured game state from RAM, makes strategic decisions, and sends button inputs — all from the terminal.
tags: [gaming, pokemon, emulator, pyboy, gameplay, gameboy]
---
# Pokemon Player

Play Pokemon games via headless emulation using the `pokemon-agent` package.

## When to Use
- User says "play pokemon", "start pokemon", "pokemon game"
- User asks about Pokemon Red, Blue, Yellow, FireRed, etc.
- User wants to watch an AI play Pokemon
- User references a ROM file (.gb, .gbc, .gba)

## Startup Procedure

### 1. First-time setup (clone, venv, install)
The repo is NousResearch/pokemon-agent on GitHub. Clone it, then
set up a Python 3.10+ virtual environment. Use uv (preferred for speed)
to create the venv and install the package in editable mode with the
pyboy extra. If uv is not available, fall back to python3 -m venv + pip.

On this machine it is already set up at /home/teknium/pokemon-agent
with a venv ready — just cd there and source .venv/bin/activate.

You also need a ROM file. Ask the user for theirs. On this machine
one exists at roms/pokemon_red.gb inside that directory.
NEVER download or provide ROM files — always ask the user.

### 2. Start the game server
From inside the pokemon-agent directory with the venv activated, run
pokemon-agent serve with --rom pointing to the ROM and --port 9876.
Run it in the background with &.
To resume from a saved game, add --load-state with the save name.
Wait 4 seconds for startup, then verify with GET /health.

### 3. Set up live dashboard for user to watch
Use an SSH reverse tunnel via localhost.run so the user can view
the dashboard in their browser. Connect with ssh, forwarding local
port 9876 to remote port 80 on nokey@localhost.run. Redirect output
to a log file, wait 10 seconds, then grep the log for the .lhr.life
URL. Give the user the URL with /dashboard/ appended.
The tunnel URL changes each time — give the user the new one if restarted.

## Save and Load

### When to save
- Every 15-20 turns of gameplay
- ALWAYS before gym battles, rival encounters, or risky fights
- Before entering a new town or dungeon
- Before any action you are unsure about

### How to save
POST /save with a descriptive name. Good examples:
before_brock, route1_start, mt_moon_entrance, got_cut

### How to load
POST /load with the save name.

### List available saves
GET /saves returns all saved states.

### Loading on server startup
Use --load-state flag when starting the server to auto-load a save.
This is faster than loading via the API after startup.

## The Gameplay Loop

### Step 1: OBSERVE — check state AND take a screenshot
GET /state for position, HP, battle, dialog.
GET /screenshot and save to /tmp/pokemon.png, then use vision_analyze.
Always do BOTH — RAM state gives numbers, vision gives spatial awareness.

### Step 2: ORIENT
- Dialog/text on screen → advance it
- In battle → fight or run
- Party hurt → head to Pokemon Center
- Near objective → navigate carefully

### Step 3: DECIDE
Priority: dialog > battle > heal > story objective > training > explore

### Step 4: ACT — move 2-4 steps max, then re-check
POST /action with a SHORT action list (2-4 actions, not 10-15).

### Step 5: VERIFY — screenshot after every move sequence
Take a screenshot and use vision_analyze to confirm you moved where
intended. This is the MOST IMPORTANT step. Without vision you WILL get lost.

### Step 6: RECORD progress to memory with PKM: prefix

### Step 7: SAVE periodically

## Action Reference
- press_a — confirm, talk, select
- press_b — cancel, close menu
- press_start — open game menu
- walk_up/down/left/right — move one tile
- hold_b_N — hold B for N frames (use for speeding through text)
- wait_60 — wait about 1 second (60 frames)
- a_until_dialog_end — press A repeatedly until dialog clears

## Critical Tips from Experience

### USE VISION CONSTANTLY
- Take a screenshot every 2-4 movement steps
- The RAM state tells you position and HP but NOT what is around you
- Ledges, fences, signs, building doors, NPCs — only visible via screenshot
- Ask the vision model specific questions: "what is one tile north of me?"
- When stuck, always screenshot before trying random directions

### Warp Transitions Need Extra Wait Time
When walking through a door or stairs, the screen fades to black during
the map transition. You MUST wait for it to complete. Add 2-3 wait_60
actions after any door/stair warp. Without waiting, the position reads
as stale and you will think you are still in the old map.

### Building Exit Trap
When you exit a building, you appear directly IN FRONT of the door.
If you walk north, you go right back inside. ALWAYS sidestep first
by walking left or right 2 tiles, then proceed in your intended direction.

### Dialog Handling
Gen 1 text scrolls slowly letter-by-letter. To speed through dialog,
hold B for 120 frames then press A. Repeat as needed. Holding B makes
text display at max speed. Then press A to advance to the next line.
The a_until_dialog_end action checks the RAM dialog flag, but this flag
does not catch ALL text states. If dialog seems stuck, use the manual
hold_b + press_a pattern instead and verify via screenshot.

### Ledges Are One-Way
Ledges (small cliff edges) can only be jumped DOWN (south), never climbed
UP (north). If blocked by a ledge going north, you must go left or right
to find the gap around it. Use vision to identify which direction the
gap is. Ask the vision model explicitly.

### Navigation Strategy
- Move 2-4 steps at a time, then screenshot to check position
- When entering a new area, screenshot immediately to orient
- Ask the vision model "which direction to [destination]?"
- If stuck for 3+ attempts, screenshot and re-evaluate completely
- Do not spam 10-15 movements — you will overshoot or get stuck

### Running from Wild Battles
On the battle menu, RUN is bottom-right. To reach it from the default
cursor position (FIGHT, top-left): press down then right to move cursor
to RUN, then press A. Wrap with hold_b to speed through text/animations.

### Battling (FIGHT)
On the battle menu FIGHT is top-left (default cursor position).
Press A to enter move selection, A again to use the first move.
Then hold B to speed through attack animations and text.

## Battle Strategy

### Decision Tree
1. Want to catch? → Weaken then throw Poke Ball
2. Wild you don't need? → RUN
3. Type advantage? → Use super-effective move
4. No advantage? → Use strongest STAB move
5. Low HP? → Switch or use Potion

### Gen 1 Type Chart (key matchups)
- Water beats Fire, Ground, Rock
- Fire beats Grass, Bug, Ice
- Grass beats Water, Ground, Rock
- Electric beats Water, Flying
- Ground beats Fire, Electric, Rock, Poison
- Psychic beats Fighting, Poison (dominant in Gen 1!)

### Gen 1 Quirks
- Special stat = both offense AND defense for special moves
- Psychic type is overpowered (Ghost moves bugged)
- Critical hits based on Speed stat
- Wrap/Bind prevent opponent from acting
- Focus Energy bug: REDUCES crit rate instead of raising it

## Memory Conventions
| Prefix | Purpose | Example |
|--------|---------|---------|
| PKM:OBJECTIVE | Current goal | Get Parcel from Viridian Mart |
| PKM:MAP | Navigation knowledge | Viridian: mart is northeast |
| PKM:STRATEGY | Battle/team plans | Need Grass type before Misty |
| PKM:PROGRESS | Milestone tracker | Beat rival, heading to Viridian |
| PKM:STUCK | Stuck situations | Ledge at y=28 go right to bypass |
| PKM:TEAM | Team notes | Squirtle Lv6, Tackle + Tail Whip |

## Progression Milestones
- Choose starter
- Deliver Parcel from Viridian Mart, receive Pokedex
- Boulder Badge — Brock (Rock) → use Water/Grass
- Cascade Badge — Misty (Water) → use Grass/Electric
- Thunder Badge — Lt. Surge (Electric) → use Ground
- Rainbow Badge — Erika (Grass) → use Fire/Ice/Flying
- Soul Badge — Koga (Poison) → use Ground/Psychic
- Marsh Badge — Sabrina (Psychic) → hardest gym
- Volcano Badge — Blaine (Fire) → use Water/Ground
- Earth Badge — Giovanni (Ground) → use Water/Grass/Ice
- Elite Four → Champion!

## Stopping Play
1. Save the game with a descriptive name via POST /save
2. Update memory with PKM:PROGRESS
3. Tell user: "Game saved as [name]! Say 'play pokemon' to resume."
4. Kill the server and tunnel background processes

## Pitfalls
- NEVER download or provide ROM files
- Do NOT send more than 4-5 actions without checking vision
- Always sidestep after exiting buildings before going north
- Always add wait_60 x2-3 after door/stair warps
- Dialog detection via RAM is unreliable — verify with screenshots
- Save BEFORE risky encounters
- The tunnel URL changes each time you restart it
