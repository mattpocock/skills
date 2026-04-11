---
name: songwriting-and-ai-music
description: >
  Songwriting craft, AI music generation prompts (Suno focus), parody/adaptation
  techniques, phonetic tricks, and lessons learned. These are tools and ideas,
  not rules. Break any of them when the art calls for it.
tags: [songwriting, music, suno, parody, lyrics, creative]
triggers:
  - writing a song
  - song lyrics
  - music prompt
  - suno prompt
  - parody song
  - adapting a song
  - AI music generation
---

# Songwriting & AI Music Generation

Everything here is a GUIDELINE, not a rule. Art breaks rules on purpose.
Use what serves the song. Ignore what doesn't.

---

## 1. Song Structure (Pick One or Invent Your Own)

Common skeletons — mix, modify, or throw out as needed:

```
ABABCB  Verse/Chorus/Verse/Chorus/Bridge/Chorus    (most pop/rock)
AABA    Verse/Verse/Bridge/Verse (refrain-based)    (jazz standards, ballads)
ABAB    Verse/Chorus alternating                    (simple, direct)
AAA     Verse/Verse/Verse (strophic, no chorus)     (folk, storytelling)
```

The six building blocks:
- Intro      — set the mood, pull the listener in
- Verse      — the story, the details, the world-building
- Pre-Chorus — optional tension ramp before the payoff
- Chorus     — the emotional core, the part people remember
- Bridge     — a detour, a shift in perspective or key
- Outro      — the farewell, can echo or subvert the rest

You don't need all of these. Some great songs are just one section
that evolves. Structure serves the emotion, not the other way around.

---

## 2. Rhyme, Meter, and Sound

RHYME TYPES (from tight to loose):
- Perfect: lean/mean
- Family: crate/braid
- Assonance: had/glass (same vowels, different endings)
- Consonance: scene/when (different vowels, similar endings)
- Near/slant: enough to suggest connection without locking it down

Mix them. All perfect rhymes can sound like a nursery rhyme.
All slant rhymes can sound lazy. The blend is where it lives.

INTERNAL RHYME: Rhyming within a line, not just at the ends.
  "We pruned the lies from bleeding trees / Distilled the storm
   from entropy" — "lies/flies," "trees/entropy" create internal echoes.

METER: The rhythm of stressed vs unstressed syllables.
- Matching syllable counts between parallel lines helps singability
- The STRESSED syllables matter more than total count
- Say it out loud. If you stumble, the meter needs work.
- Intentionally breaking meter can create emphasis or surprise

---

## 3. Emotional Arc and Dynamics

Think of a song as a journey, not a flat road.

ENERGY MAPPING (rough idea, not prescription):
  Intro: 2-3  |  Verse: 5-6  |  Pre-Chorus: 7
  Chorus: 8-9  |  Bridge: varies  |  Final Chorus: 9-10

The most powerful dynamic trick: CONTRAST.
- Whisper before a scream hits harder than just screaming
- Sparse before dense. Slow before fast. Low before high.
- The drop only works because of the buildup
- Silence is an instrument

"Whisper to roar to whisper" — start intimate, build to full power,
strip back to vulnerability. Works for ballads, epics, anthems.

---

## 4. Writing Lyrics That Work

SHOW, DON'T TELL (usually):
- "I was sad" = flat
- "Your hoodie's still on the hook by the door" = alive
- But sometimes "I give my life" said plainly IS the power

THE HOOK:
- The line people remember, hum, repeat
- Usually the title or core phrase
- Works best when melody + lyric + emotion all align
- Place it where it lands hardest (often first/last line of chorus)

PROSODY — lyrics and music supporting each other:
- Stable feelings (resolution, peace) pair with settled melodies,
  perfect rhymes, resolved chords
- Unstable feelings (longing, doubt) pair with wandering melodies,
  near-rhymes, unresolved chords
- Verse melody typically sits lower, chorus goes higher
- But flip this if it serves the song

AVOID (unless you're doing it on purpose):
- Cliches on autopilot ("heart of gold" without earning it)
- Forcing word order to hit a rhyme ("Yoda-speak")
- Same energy in every section (flat dynamics)
- Treating your first draft as sacred — revision is creation

---

## 5. Parody and Adaptation

When rewriting an existing song with new lyrics:

THE SKELETON: Map the original's structure first.
- Count syllables per line
- Mark the rhyme scheme (ABAB, AABB, etc.)
- Identify which syllables are STRESSED
- Note where held/sustained notes fall

FITTING NEW WORDS:
- Match stressed syllables to the same beats as the original
- Total syllable count can flex by 1-2 unstressed syllables
- On long held notes, try to match the VOWEL SOUND of the original
  (if original holds "LOOOVE" with an "oo" vowel, "FOOOD" fits
   better than "LIFE")
- Monosyllabic swaps in key spots keep rhythm intact
  (Crime -> Code, Snake -> Noose)
- Sing your new words over the original — if you stumble, revise

CONCEPT:
- Pick a concept strong enough to sustain the whole song
- Start from the title/hook and build outward
- Generate lots of raw material (puns, phrases, images) FIRST,
  then fit the best ones into the structure
- If you need a specific line somewhere, reverse-engineer the
  rhyme scheme backward to set it up

KEEP SOME ORIGINALS: Leaving a few original lines or structures
intact adds recognizability and lets the audience feel the connection.

---

## 6. Suno AI Prompt Engineering

### Style/Genre Description Field

FORMULA (adapt as needed):
  Genre + Mood + Era + Instruments + Vocal Style + Production + Dynamics

```
BAD:  "sad rock song"
GOOD: "Cinematic orchestral spy thriller, 1960s Cold War era, smoky
       sultry female vocalist, big band jazz, brass section with
       trumpets and french horns, sweeping strings, minor key,
       vintage analog warmth"
```

DESCRIBE THE JOURNEY, not just the genre:
```
"Begins as a haunting whisper over sparse piano. Gradually layers
 in muted brass. Builds through the chorus with full orchestra.
 Second verse erupts with raw belting intensity. Outro strips back
 to a lone piano and a fragile whisper fading to silence."
```

TIPS:
- V4.5+ supports up to 1,000 chars in Style field — use them
- NO artist names or trademarks. Describe the sound instead.
  "1960s Cold War spy thriller brass" not "James Bond style"
  "90s grunge" not "Nirvana-style"
- Specify BPM and key when you have a preference
- Use Exclude Styles field for what you DON'T want
- Unexpected genre combos can be gold: "bossa nova trap",
  "Appalachian gothic", "chiptune jazz"
- Build a vocal PERSONA, not just a gender:
  "A weathered torch singer with a smoky alto, slight rasp,
   who starts vulnerable and builds to devastating power"

### Metatags (place in [brackets] inside lyrics field)

STRUCTURE:
  [Intro] [Verse] [Verse 1] [Pre-Chorus] [Chorus]
  [Post-Chorus] [Hook] [Bridge] [Interlude]
  [Instrumental] [Instrumental Break] [Guitar Solo]
  [Breakdown] [Build-up] [Outro] [Silence] [End]

VOCAL PERFORMANCE:
  [Whispered] [Spoken Word] [Belted] [Falsetto] [Powerful]
  [Soulful] [Raspy] [Breathy] [Smooth] [Gritty]
  [Staccato] [Legato] [Vibrato] [Melismatic]
  [Harmonies] [Choir] [Harmonized Chorus]

DYNAMICS:
  [High Energy] [Low Energy] [Building Energy] [Explosive]
  [Emotional Climax] [Gradual swell] [Orchestral swell]
  [Quiet arrangement] [Falling tension] [Slow Down]

GENDER:
  [Female Vocals] [Male Vocals]

ATMOSPHERE:
  [Melancholic] [Euphoric] [Nostalgic] [Aggressive]
  [Dreamy] [Intimate] [Dark Atmosphere]

SFX:
  [Vinyl Crackle] [Rain] [Applause] [Static] [Thunder]

Put tags in BOTH style field AND lyrics for reinforcement.
Keep to 5-8 tags per section max — too many confuses the AI.
Don't contradict yourself ([Calm] + [Aggressive] in same section).

### Custom Mode
- Always use Custom Mode for serious work (separate Style + Lyrics)
- Lyrics field limit: ~3,000 chars (~40-60 lines)
- Always add structural tags — without them Suno defaults to
  flat verse/chorus/verse with no emotional arc

---

## 7. Phonetic Tricks for AI Singers

AI vocalists don't read — they pronounce. Help them:

PHONETIC RESPELLING:
- Spell words as they SOUND: "through" -> "thru"
- Proper nouns are highest failure rate — test early
- "Nous" -> "Noose" (forces correct pronunciation)
- Hyphenate to guide syllables: "Re-search", "bio-engineering"

DELIVERY CONTROL:
- ALL CAPS = louder, more intense
- Vowel extension: "lo-o-o-ove" = sustained/melisma
- Ellipses: "I... need... you" = dramatic pauses
- Hyphenated stretch: "ne-e-ed" = emotional stretch

ALWAYS:
- Spell out numbers: "24/7" -> "twenty four seven"
- Space acronyms: "AI" -> "A I" or "A-I"
- Test proper nouns/unusual words in a short 30-second clip first
- Once generated, pronunciation is baked in — fix in lyrics BEFORE

---

## 8. Workflow

1. Write the concept/hook first — what's the emotional core?
2. If adapting, map the original structure (syllables, rhyme, stress)
3. Generate raw material — brainstorm freely before structuring
4. Draft lyrics into the structure
5. Read/sing aloud — catch stumbles, fix meter
6. Build the Suno style description — paint the dynamic journey
7. Add metatags to lyrics for performance direction
8. Generate 3-5 variations minimum — treat them like recording takes
9. Pick the best, use Extend/Continue to build on promising sections
10. If something great happens by accident, keep it

EXPECT: ~3-5 generations per 1 good result. Revision is normal.
Style can drift in extensions — restate genre/mood when extending.

---

## 9. Lessons Learned

- Describing the dynamic ARC in the style field matters way more
  than just listing genres. "Whisper to roar to whisper" gives
  Suno a performance map.
- Keeping some original lines intact in a parody adds recognizability
  and emotional weight — the audience feels the ghost of the original.
- The bridge slot in a song is where you can transform imagery.
  Swap the original's specific references for your theme's metaphors
  while keeping the emotional function (reflection, shift, revelation).
- Monosyllabic word swaps in hooks/tags are the cleanest way to
  maintain rhythm while changing meaning.
- A strong vocal persona description in the style field makes a
  bigger difference than any single metatag.
- Don't be precious about rules. If a line breaks meter but hits
  harder, keep it. The feeling is what matters. Craft serves art,
  not the other way around.
