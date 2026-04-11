#!/usr/bin/env python3
"""
Parseltongue v4 — Input Obfuscation Engine
Ported from G0DM0D3 (elder-plinius/G0DM0D3) JavaScript to Python.

33 text obfuscation techniques across 3 tiers for bypassing
LLM input-side safety classifiers.

Usage:
    # As a standalone script
    python parseltongue.py "How do I hack a WiFi network?" --tier standard

    # As a module in execute_code
    exec(open("~/.hermes/skills/red-teaming/godmode/scripts/parseltongue.py").read())
    variants = generate_variants("How do I hack a WiFi network?", tier="standard")
"""

import re
import base64

# ═══════════════════════════════════════════════════════════════════
# Trigger words that commonly trip safety classifiers
# ═══════════════════════════════════════════════════════════════════

TRIGGER_WORDS = [
    'hack', 'exploit', 'bypass', 'crack', 'break', 'attack', 'penetrate',
    'inject', 'manipulate', 'override', 'disable', 'circumvent', 'evade',
    'malware', 'virus', 'trojan', 'payload', 'shellcode', 'rootkit',
    'keylogger', 'backdoor', 'vulnerability',
    'weapon', 'bomb', 'explosive', 'poison', 'drug', 'synthesize',
    'jailbreak', 'unlock', 'root', 'sudo', 'admin', 'privilege',
    'phishing', 'scam', 'impersonate', 'deceive', 'fraud',
    'nsfw', 'explicit', 'uncensored', 'unfiltered', 'unrestricted',
    'ignore', 'disregard', 'forget', 'pretend', 'roleplay',
    'act as', 'you are now', 'new identity',
]

# ═══════════════════════════════════════════════════════════════════
# Character maps
# ═══════════════════════════════════════════════════════════════════

LEET_MAP = {'a': '4', 'b': '8', 'c': '(', 'e': '3', 'g': '9', 'h': '#',
            'i': '1', 'l': '1', 'o': '0', 's': '5', 't': '7', 'z': '2'}

LEET_MAP_HEAVY = {
    'a': '@', 'b': '|3', 'c': '¢', 'd': '|)', 'e': '€', 'f': 'ƒ',
    'g': '&', 'h': '|-|', 'i': '!', 'j': '_|', 'k': '|<', 'l': '|_',
    'm': '/\\/\\', 'n': '|\\|', 'o': '()', 'p': '|*', 'r': '|2',
    's': '$', 't': '+', 'u': '|_|', 'v': '\\/', 'w': '\\/\\/',
    'x': '><', 'y': '`/', 'z': '7_',
}

UNICODE_MAP = {'a': 'а', 'c': 'с', 'e': 'е', 'i': 'і', 'o': 'о',
               'p': 'р', 's': 'ѕ', 'x': 'х', 'y': 'у'}

SEMANTIC_SYNONYMS = {
    'hack': 'gain unauthorized access to', 'exploit': 'take advantage of',
    'bypass': 'work around', 'crack': 'break open', 'attack': 'target',
    'inject': 'insert into', 'manipulate': 'alter', 'override': 'supersede',
    'disable': 'deactivate', 'circumvent': 'go around', 'evade': 'avoid',
    'malware': 'malicious software', 'virus': 'self-replicating code',
    'payload': 'delivered content', 'shellcode': 'machine instructions',
    'backdoor': 'hidden entry point', 'vulnerability': 'weakness',
    'weapon': 'armament', 'bomb': 'explosive device', 'poison': 'toxic substance',
    'drug': 'controlled substance', 'synthesize': 'create from components',
    'jailbreak': 'remove restrictions', 'phishing': 'credential harvesting',
    'scam': 'fraudulent scheme', 'impersonate': 'pretend to be',
    'nsfw': 'mature content', 'explicit': 'uncensored', 'unrestricted': 'without limits',
}

SUPERSCRIPT_MAP = {
    'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ',
    'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ', 'k': 'ᵏ', 'l': 'ˡ',
    'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ',
    't': 'ᵗ', 'u': 'ᵘ', 'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
}

SMALLCAPS_MAP = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ',
    'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ',
    'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
    's': 'ꜱ', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'y': 'ʏ', 'z': 'ᴢ',
}

MORSE_MAP = {
    'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.', 'f': '..-.',
    'g': '--.', 'h': '....', 'i': '..', 'j': '.---', 'k': '-.-', 'l': '.-..',
    'm': '--', 'n': '-.', 'o': '---', 'p': '.--.', 'q': '--.-', 'r': '.-.',
    's': '...', 't': '-', 'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-',
    'y': '-.--', 'z': '--..',
}

NATO_ALPHABET = [
    'alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf',
    'hotel', 'india', 'juliet', 'kilo', 'lima', 'mike', 'november',
    'oscar', 'papa', 'quebec', 'romeo', 'sierra', 'tango', 'uniform',
    'victor', 'whiskey', 'xray', 'yankee', 'zulu',
]

BRAILLE_MAP = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑',
    'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕',
    'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
    'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽',
    'z': '⠵', ' ': '⠀',
}

# ═══════════════════════════════════════════════════════════════════
# 33 Obfuscation Techniques (3 tiers)
# ═══════════════════════════════════════════════════════════════════

def _apply_raw(word):
    """Raw — no transformation (baseline)."""
    return word

def _apply_leetspeak(word):
    """L33t — basic leetspeak substitution."""
    return ''.join(LEET_MAP.get(c.lower(), c) for c in word)

def _apply_unicode(word):
    """Unicode — Cyrillic/homoglyph substitution."""
    result = []
    for c in word:
        mapped = UNICODE_MAP.get(c.lower())
        if mapped:
            result.append(mapped.upper() if c.isupper() else mapped)
        else:
            result.append(c)
    return ''.join(result)

def _apply_bubble(word):
    """Bubble — circled letter Unicode characters."""
    result = []
    for c in word:
        code = ord(c.lower())
        if 97 <= code <= 122:
            result.append(chr(0x24D0 + code - 97))
        else:
            result.append(c)
    return ''.join(result)

def _apply_spaced(word):
    """Spaced — insert spaces between characters."""
    return ' '.join(word)

def _apply_fullwidth(word):
    """Fullwidth — fullwidth Unicode characters."""
    result = []
    for c in word:
        code = ord(c)
        if 33 <= code <= 126:
            result.append(chr(code + 0xFEE0))
        else:
            result.append(c)
    return ''.join(result)

def _apply_zwj(word):
    """ZeroWidth — zero-width joiners between characters."""
    return '\u200D'.join(word)

def _apply_mixedcase(word):
    """MiXeD — alternating case."""
    return ''.join(c.upper() if i % 2 else c.lower() for i, c in enumerate(word))

def _apply_semantic(word):
    """Semantic — replace with synonym/description."""
    return SEMANTIC_SYNONYMS.get(word.lower(), word)

def _apply_dotted(word):
    """Dotted — dots between characters."""
    return '.'.join(word)

def _apply_underscored(word):
    """Under_score — underscores between characters."""
    return '_'.join(word)

# ─── TIER 2: ENCODING + FRAMING (12–22) ─────────────────────────

def _apply_reversed(word):
    """Reversed — reverse the characters."""
    return word[::-1]

def _apply_superscript(word):
    """Superscript — superscript Unicode characters."""
    return ''.join(SUPERSCRIPT_MAP.get(c.lower(), c) for c in word)

def _apply_smallcaps(word):
    """SmallCaps — small capital Unicode characters."""
    return ''.join(SMALLCAPS_MAP.get(c.lower(), c) for c in word)

def _apply_morse(word):
    """Morse — morse code representation."""
    return ' '.join(MORSE_MAP.get(c.lower(), c) for c in word)

def _apply_piglatin(word):
    """PigLatin — pig latin transformation."""
    w = word.lower()
    vowels = 'aeiou'
    if w[0] in vowels:
        return w + 'yay'
    idx = next((i for i, c in enumerate(w) if c in vowels), -1)
    if idx > 0:
        return w[idx:] + w[:idx] + 'ay'
    return w + 'ay'

def _apply_brackets(word):
    """[B.r.a.c.k] — each character in brackets."""
    return '[' + ']['.join(word) + ']'

def _apply_mathbold(word):
    """MathBold — mathematical bold Unicode."""
    result = []
    for c in word:
        code = ord(c.lower())
        if 97 <= code <= 122:
            result.append(chr(0x1D41A + code - 97))
        else:
            result.append(c)
    return ''.join(result)

def _apply_mathitalic(word):
    """MathItalic — mathematical italic Unicode."""
    result = []
    for c in word:
        code = ord(c.lower())
        if 97 <= code <= 122:
            result.append(chr(0x1D44E + code - 97))
        else:
            result.append(c)
    return ''.join(result)

def _apply_strikethrough(word):
    """S̶t̶r̶i̶k̶e̶ — strikethrough combining characters."""
    return ''.join(c + '\u0336' for c in word)

def _apply_leetheavy(word):
    """L33t+ — heavy leetspeak with extended map."""
    return ''.join(LEET_MAP_HEAVY.get(c.lower(), LEET_MAP.get(c.lower(), c)) for c in word)

def _apply_hyphenated(word):
    """Hyphen — hyphens between characters."""
    return '-'.join(word)

# ─── TIER 3: MULTI-LAYER COMBOS (23–33) ─────────────────────────

def _apply_leetunicode(word):
    """L33t+Uni — alternating leet and unicode."""
    result = []
    for i, c in enumerate(word):
        lower = c.lower()
        if i % 2 == 0:
            result.append(LEET_MAP.get(lower, c))
        else:
            result.append(UNICODE_MAP.get(lower, c))
    return ''.join(result)

def _apply_spacedmixed(word):
    """S p A c E d — spaced + alternating case."""
    return ' '.join(c.upper() if i % 2 else c.lower() for i, c in enumerate(word))

def _apply_reversedleet(word):
    """Rev+L33t — reversed then leetspeak."""
    return ''.join(LEET_MAP.get(c.lower(), c) for c in reversed(word))

def _apply_bubblespaced(word):
    """Bubble+Spaced — bubble text with spaces."""
    result = []
    for c in word:
        code = ord(c.lower())
        if 97 <= code <= 122:
            result.append(chr(0x24D0 + code - 97))
        else:
            result.append(c)
    return ' '.join(result)

def _apply_unicodezwj(word):
    """Uni+ZWJ — unicode homoglyphs with zero-width non-joiners."""
    result = []
    for c in word:
        mapped = UNICODE_MAP.get(c.lower())
        result.append(mapped if mapped else c)
    return '\u200C'.join(result)

def _apply_base64hint(word):
    """Base64 — base64 encode the word."""
    try:
        return base64.b64encode(word.encode()).decode()
    except Exception:
        return word

def _apply_hexencode(word):
    """Hex — hex encode each character."""
    return ' '.join(f'0x{ord(c):x}' for c in word)

def _apply_acrostic(word):
    """Acrostic — NATO alphabet expansion."""
    result = []
    for c in word:
        idx = ord(c.lower()) - 97
        if 0 <= idx < 26:
            result.append(NATO_ALPHABET[idx])
        else:
            result.append(c)
    return ' '.join(result)

def _apply_dottedunicode(word):
    """Dot+Uni — unicode homoglyphs with dots."""
    result = []
    for c in word:
        mapped = UNICODE_MAP.get(c.lower())
        result.append(mapped if mapped else c)
    return '.'.join(result)

def _apply_fullwidthmixed(word):
    """FW MiX — fullwidth + mixed case alternating."""
    result = []
    for i, c in enumerate(word):
        code = ord(c)
        if i % 2 == 0 and 33 <= code <= 126:
            result.append(chr(code + 0xFEE0))
        else:
            result.append(c.upper() if i % 2 else c)
    return ''.join(result)

def _apply_triplelayer(word):
    """Triple — leet + unicode + uppercase rotating with ZWJ."""
    result = []
    for i, c in enumerate(word):
        lower = c.lower()
        mod = i % 3
        if mod == 0:
            result.append(LEET_MAP.get(lower, c))
        elif mod == 1:
            result.append(UNICODE_MAP.get(lower, c))
        else:
            result.append(c.upper())
    return '\u200D'.join(result)


# ═══════════════════════════════════════════════════════════════════
# Technique registry (ordered by tier)
# ═══════════════════════════════════════════════════════════════════

TECHNIQUES = [
    # TIER 1: CORE OBFUSCATION (1-11)
    {'name': 'raw',          'label': 'Raw',         'tier': 1, 'fn': _apply_raw},
    {'name': 'leetspeak',    'label': 'L33t',        'tier': 1, 'fn': _apply_leetspeak},
    {'name': 'unicode',      'label': 'Unicode',     'tier': 1, 'fn': _apply_unicode},
    {'name': 'bubble',       'label': 'Bubble',      'tier': 1, 'fn': _apply_bubble},
    {'name': 'spaced',       'label': 'Spaced',      'tier': 1, 'fn': _apply_spaced},
    {'name': 'fullwidth',    'label': 'Fullwidth',    'tier': 1, 'fn': _apply_fullwidth},
    {'name': 'zwj',          'label': 'ZeroWidth',   'tier': 1, 'fn': _apply_zwj},
    {'name': 'mixedcase',    'label': 'MiXeD',       'tier': 1, 'fn': _apply_mixedcase},
    {'name': 'semantic',     'label': 'Semantic',     'tier': 1, 'fn': _apply_semantic},
    {'name': 'dotted',       'label': 'Dotted',      'tier': 1, 'fn': _apply_dotted},
    {'name': 'underscored',  'label': 'Under_score', 'tier': 1, 'fn': _apply_underscored},

    # TIER 2: ENCODING + FRAMING (12-22)
    {'name': 'reversed',     'label': 'Reversed',    'tier': 2, 'fn': _apply_reversed},
    {'name': 'superscript',  'label': 'Superscript', 'tier': 2, 'fn': _apply_superscript},
    {'name': 'smallcaps',    'label': 'SmallCaps',   'tier': 2, 'fn': _apply_smallcaps},
    {'name': 'morse',        'label': 'Morse',       'tier': 2, 'fn': _apply_morse},
    {'name': 'piglatin',     'label': 'PigLatin',    'tier': 2, 'fn': _apply_piglatin},
    {'name': 'brackets',     'label': '[B.r.a.c.k]', 'tier': 2, 'fn': _apply_brackets},
    {'name': 'mathbold',     'label': 'MathBold',    'tier': 2, 'fn': _apply_mathbold},
    {'name': 'mathitalic',   'label': 'MathItalic',  'tier': 2, 'fn': _apply_mathitalic},
    {'name': 'strikethrough','label': 'Strike',      'tier': 2, 'fn': _apply_strikethrough},
    {'name': 'leetheavy',    'label': 'L33t+',       'tier': 2, 'fn': _apply_leetheavy},
    {'name': 'hyphenated',   'label': 'Hyphen',      'tier': 2, 'fn': _apply_hyphenated},

    # TIER 3: MULTI-LAYER COMBOS (23-33)
    {'name': 'leetunicode',     'label': 'L33t+Uni',  'tier': 3, 'fn': _apply_leetunicode},
    {'name': 'spacedmixed',     'label': 'S p A c E d','tier': 3, 'fn': _apply_spacedmixed},
    {'name': 'reversedleet',    'label': 'Rev+L33t',  'tier': 3, 'fn': _apply_reversedleet},
    {'name': 'bubblespaced',    'label': 'Bub Spcd',  'tier': 3, 'fn': _apply_bubblespaced},
    {'name': 'unicodezwj',      'label': 'Uni+ZWJ',   'tier': 3, 'fn': _apply_unicodezwj},
    {'name': 'base64hint',      'label': 'Base64',    'tier': 3, 'fn': _apply_base64hint},
    {'name': 'hexencode',       'label': 'Hex',       'tier': 3, 'fn': _apply_hexencode},
    {'name': 'acrostic',        'label': 'Acrostic',  'tier': 3, 'fn': _apply_acrostic},
    {'name': 'dottedunicode',   'label': 'Dot+Uni',   'tier': 3, 'fn': _apply_dottedunicode},
    {'name': 'fullwidthmixed',  'label': 'FW MiX',    'tier': 3, 'fn': _apply_fullwidthmixed},
    {'name': 'triplelayer',     'label': 'Triple',    'tier': 3, 'fn': _apply_triplelayer},
]

TIER_SIZES = {'light': 11, 'standard': 22, 'heavy': 33}

# ═══════════════════════════════════════════════════════════════════
# Encoding escalation (for retry logic with GODMODE CLASSIC)
# ═══════════════════════════════════════════════════════════════════

def to_braille(text):
    """Convert text to braille Unicode characters."""
    return ''.join(BRAILLE_MAP.get(c.lower(), c) for c in text)

def to_leetspeak(text):
    """Convert text to leetspeak."""
    return ''.join(LEET_MAP.get(c.lower(), c) for c in text)

def to_bubble(text):
    """Convert text to bubble/circled text."""
    circled = 'ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙⓚⓛⓜⓝⓞⓟⓠⓡⓢⓣⓤⓥⓦⓧⓨⓩ'
    result = []
    for c in text:
        idx = ord(c.lower()) - 97
        if 0 <= idx < 26:
            result.append(circled[idx])
        else:
            result.append(c)
    return ''.join(result)

def to_morse(text):
    """Convert text to Morse code."""
    morse = {
        'a': '.-', 'b': '-...', 'c': '-.-.', 'd': '-..', 'e': '.',
        'f': '..-.', 'g': '--.', 'h': '....', 'i': '..', 'j': '.---',
        'k': '-.-', 'l': '.-..', 'm': '--', 'n': '-.', 'o': '---',
        'p': '.--.', 'q': '--.-', 'r': '.-.', 's': '...', 't': '-',
        'u': '..-', 'v': '...-', 'w': '.--', 'x': '-..-', 'y': '-.--',
        'z': '--..', ' ': '/',
    }
    return ' '.join(morse.get(c.lower(), c) for c in text)

ENCODING_ESCALATION = [
    {'name': 'plain',     'label': 'PLAIN',   'fn': lambda q: q},
    {'name': 'leetspeak', 'label': 'L33T',    'fn': to_leetspeak},
    {'name': 'bubble',    'label': 'BUBBLE',  'fn': to_bubble},
    {'name': 'braille',   'label': 'BRAILLE', 'fn': to_braille},
    {'name': 'morse',     'label': 'MORSE',   'fn': to_morse},
]


# ═══════════════════════════════════════════════════════════════════
# Core functions
# ═══════════════════════════════════════════════════════════════════

def detect_triggers(text, custom_triggers=None):
    """Detect trigger words in text. Returns list of found triggers."""
    all_triggers = TRIGGER_WORDS + (custom_triggers or [])
    found = []
    lower = text.lower()
    for trigger in all_triggers:
        pattern = re.compile(r'\b' + re.escape(trigger) + r'\b', re.IGNORECASE)
        if pattern.search(lower):
            found.append(trigger)
    return list(set(found))


def obfuscate_query(query, technique_name, triggers=None):
    """Apply one obfuscation technique to trigger words in a query.
    
    Args:
        query: The input text
        technique_name: Name of the technique (e.g., 'leetspeak', 'unicode')
        triggers: List of trigger words to obfuscate. If None, auto-detect.
    
    Returns:
        Obfuscated query string
    """
    if triggers is None:
        triggers = detect_triggers(query)
    
    if not triggers or technique_name == 'raw':
        return query
    
    # Find the technique function
    tech = next((t for t in TECHNIQUES if t['name'] == technique_name), None)
    if not tech:
        return query
    
    result = query
    # Sort longest-first to avoid partial replacements
    sorted_triggers = sorted(triggers, key=len, reverse=True)
    for trigger in sorted_triggers:
        pattern = re.compile(r'\b(' + re.escape(trigger) + r')\b', re.IGNORECASE)
        result = pattern.sub(lambda m: tech['fn'](m.group()), result)
    
    return result


def generate_variants(query, tier="standard", custom_triggers=None):
    """Generate obfuscated variants of a query up to the tier limit.
    
    Args:
        query: Input text
        tier: 'light' (11), 'standard' (22), or 'heavy' (33)
        custom_triggers: Additional trigger words beyond the default list
    
    Returns:
        List of dicts with keys: text, technique, label, tier
    """
    triggers = detect_triggers(query, custom_triggers)
    max_variants = TIER_SIZES.get(tier, TIER_SIZES['standard'])
    
    variants = []
    for i, tech in enumerate(TECHNIQUES[:max_variants]):
        variants.append({
            'text': obfuscate_query(query, tech['name'], triggers),
            'technique': tech['name'],
            'label': tech['label'],
            'tier': tech['tier'],
        })
    
    return variants


def escalate_encoding(query, level=0):
    """Get an encoding-escalated version of the query.
    
    Args:
        query: Input text
        level: 0=plain, 1=leetspeak, 2=bubble, 3=braille, 4=morse
    
    Returns:
        Tuple of (encoded_query, label)
    """
    if level >= len(ENCODING_ESCALATION):
        level = len(ENCODING_ESCALATION) - 1
    enc = ENCODING_ESCALATION[level]
    return enc['fn'](query), enc['label']


# ═══════════════════════════════════════════════════════════════════
# CLI interface
# ═══════════════════════════════════════════════════════════════════

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description='Parseltongue — Input Obfuscation Engine')
    parser.add_argument('query', help='The query to obfuscate')
    parser.add_argument('--tier', choices=['light', 'standard', 'heavy'], default='standard',
                        help='Obfuscation tier (default: standard)')
    parser.add_argument('--technique', help='Apply a single technique by name')
    parser.add_argument('--triggers', nargs='+', help='Additional trigger words')
    parser.add_argument('--escalate', type=int, default=None,
                        help='Encoding escalation level (0-4)')
    args = parser.parse_args()

    if args.escalate is not None:
        encoded, label = escalate_encoding(args.query, args.escalate)
        print(f"[{label}] {encoded}")
    elif args.technique:
        result = obfuscate_query(args.query, args.technique, args.triggers)
        print(result)
    else:
        triggers = detect_triggers(args.query, args.triggers)
        print(f"Detected triggers: {triggers}\n")
        variants = generate_variants(args.query, tier=args.tier, custom_triggers=args.triggers)
        for v in variants:
            print(f"[T{v['tier']} {v['label']:>12s}] {v['text']}")
