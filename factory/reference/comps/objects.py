# The room's objects, drawn as Victorian engravings rather than outline icons.
#
# Each one carries a heavy contour, a lighter interior line, and hatching for
# shade. A sixth-grader who has read the passage once has to be able to name
# each of these in isolation - that is the whole task of the Search frame.

from world import GILT, BRASS, OX, OX_L, PAPER, MAH_D

LAMP_FROM = "upper-right"   # so every shadow in this room falls down and left


def engraving(w, h, vb, heavy, light="", hatch="", ink=GILT, shade=None):
    """One object: contour at 2.8, detail at 1.2, hatching at 0.8."""
    shade = shade or ink
    return (
        f'<svg width="{w}" height="{h}" viewBox="{vb}" fill="none" '
        f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
        f'<g stroke="{shade}" stroke-width="0.8" opacity="0.55">{hatch}</g>'
        f'<g stroke="{ink}" stroke-width="1.2" opacity="0.9">{light}</g>'
        f'<g stroke="{ink}" stroke-width="2.8">{heavy}</g>'
        f'</svg>'
    )


# --- a tired brown spaniel, lying by the hearth where he settled ----------
SPANIEL = engraving(214, 124, "0 0 214 124", ink="#DFA463", shade="#B4763C",
    heavy=(
        # the long low back, haunch to shoulder
        '<path d="M44 76 C42 60 60 52 86 52 C114 52 138 56 152 64"/>'
        # neck into a domed skull
        '<path d="M152 64 C155 47 168 38 182 40 C195 42 201 55 195 65 '
        'C190 73 178 76 168 72"/>'
        # muzzle and nose
        '<path d="M195 65 C201 66 206 69 206 73 C202 78 195 78 190 74"/>'
        # the ear: one long lobe hanging past the jaw, the spaniel's tell
        '<path d="M174 44 C189 55 193 82 180 94 C169 104 155 97 159 82"/>'
        # underline of the body
        '<path d="M52 84 C84 97 126 97 152 88"/>'
        # rear haunch, rounded
        '<path d="M46 74 C33 77 29 91 40 96"/>'
        # forepaws stretched out in front of him
        '<path d="M168 72 L170 96"/><path d="M152 76 L152 96"/>'
        # feathered tail
        '<path d="M42 78 C27 72 20 57 29 45"/>'
    ),
    light=(
        '<path d="M170 96 C164 99 165 104 172 104 L182 103"/>'
        '<path d="M152 96 C146 99 147 104 154 104 L163 103"/>'
        '<path d="M40 96 C34 99 35 104 42 104 L52 103"/>'
        '<circle cx="181" cy="57" r="2.2" fill="#B4763C" stroke="none"/>'
        '<path d="M32 50 L25 44"/><path d="M28 58 L20 55"/><path d="M28 66 L21 65"/>'
    ),
    hatch=(
        '<path d="M74 90 L71 81"/><path d="M90 93 L88 83"/><path d="M106 94 L104 84"/>'
        '<path d="M122 93 L121 83"/><path d="M138 90 L138 81"/>'
    ))


# --- his stick and his hat, left in the hall --------------------------------
STICK_HAT = engraving(168, 140, "0 0 168 140", ink="#CBAE7C", shade="#9A8054",
    heavy=(
        # bowler: crown then brim
        '<path d="M38 64 C38 43 50 32 65 32 C80 32 92 43 92 64"/>'
        '<path d="M22 66 C22 60 40 66 65 66 C90 66 108 60 108 66 '
        'C108 73 90 78 65 78 C40 78 22 73 22 66 Z"/>'
        # the cane: an OPEN crook at the top, shaft down to a ferrule at the foot
        '<path d="M134 40 L133 24 C133 16 124 11 116 15 C109 19 108 29 115 34"/>'
        '<path d="M134 40 L148 126"/>'
        '<path d="M143 124 L154 122"/>'
    ),
    light=(
        '<path d="M40 58 L90 58"/>'          # hat band
        '<path d="M44 52 C52 44 62 41 70 42"/>'  # crown highlight
        '<path d="M139 82 L145 81"/>'        # collar on the shaft
    ),
    hatch=(
        '<path d="M46 72 L44 66"/><path d="M58 75 L57 68"/><path d="M70 75 L70 68"/>'
        '<path d="M82 74 L83 67"/><path d="M94 71 L96 65"/>'
        '<path d="M133 60 L137 60"/><path d="M136 78 L140 78"/>'
        '<path d="M139 100 L143 100"/>'
    ))


# --- the white coat one of them carried over his shoulders ------------------
COAT = engraving(148, 176, "0 0 148 176", ink="#F1E6C8", shade="#BFB292",
    heavy=(
        # body with shoulders and hem
        '<path d="M44 36 C44 26 53 19 63 17 L74 29 L85 17 C95 19 104 26 104 36 '
        'L110 100 L106 162 L42 162 L38 100 Z"/>'
        # both sleeves hanging
        '<path d="M44 36 L20 96 C18 102 22 107 28 106 L38 102"/>'
        '<path d="M104 36 L128 96 C130 102 126 107 120 106 L110 102"/>'
        # collar and lapels
        '<path d="M63 17 L74 56 L85 17"/>'
    ),
    light=(
        '<path d="M74 56 L74 158"/>'          # centre seam
        '<path d="M40 100 L108 100"/>'        # belted waist
        '<circle cx="74" cy="76" r="2"/><circle cx="74" cy="104" r="2"/>'
        '<circle cx="74" cy="132" r="2"/>'
    ),
    hatch=(
        '<path d="M52 150 L50 130"/><path d="M62 154 L61 132"/>'
        '<path d="M86 154 L87 132"/><path d="M96 150 L98 130"/>'
        '<path d="M28 92 L24 80"/><path d="M120 92 L124 80"/>'
    ))


# --- three guns, under their arms, now leaning by the window ----------------
def _gun(dx):
    """One side-by-side: butt with a comb and heel, action, fore-end, two muzzles."""
    return (
        # the pair of barrels, ending in open muzzles
        f'<path d="M{44+dx} 112 L{104+dx} 26"/>'
        f'<path d="M{52+dx} 116 L{112+dx} 30"/>'
        f'<path d="M{104+dx} 26 L{112+dx} 30"/>'
        # the action
        f'<path d="M{44+dx} 112 L{52+dx} 116 L{60+dx} 104 L{52+dx} 100 Z"/>'
        # the butt stock: comb along the top, heel and toe at the end
        f'<path d="M{44+dx} 112 C{34+dx} 118 {22+dx} 128 {18+dx} 138 '
        f'L{30+dx} 146 C{38+dx} 140 {48+dx} 126 {52+dx} 116 Z"/>'
    )


GUNS = engraving(196, 160, "0 0 196 160", ink=GILT, shade="#A98B48",
    heavy=_gun(0) + _gun(26) + _gun(52),
    light=(
        # fore-end woodwork on each, and a trigger guard under each action
        '<path d="M70 88 L82 72 L88 75 L76 91 Z"/>'
        '<path d="M96 88 L108 72 L114 75 L102 91 Z"/>'
        '<path d="M122 88 L134 72 L140 75 L128 91 Z"/>'
        '<path d="M50 118 C46 124 50 129 56 127"/>'
        '<path d="M76 118 C72 124 76 129 82 127"/>'
        '<path d="M102 118 C98 124 102 129 108 127"/>'
    ),
    hatch='<path d="M14 150 L182 150"/><path d="M22 155 L170 155"/>')


# --- his sister's letters of introduction, on the desk ---------------------
LETTERS = engraving(154, 116, "0 0 154 116", ink="#E4D4AA", shade="#AA9A72",
    heavy=(
        '<path d="M16 42 L118 32 L136 78 L34 90 Z"/>'
        '<path d="M12 50 L114 40 L132 86 L30 98 Z"/>'
        '<path d="M8 58 L110 48 L128 94 L26 106 Z"/>'
        '<path d="M8 58 L66 82 L110 48"/>'
    ),
    light='<path d="M44 96 L50 62"/><path d="M92 90 L86 56"/>',
    hatch='<path d="M36 74 L30 66"/><path d="M118 62 L112 54"/>')


# --- a teacup on the mantel, waiting for them ------------------------------
TEACUP = engraving(126, 108, "0 0 126 108", ink="#DCD1B2", shade="#A69B80",
    heavy=(
        '<path d="M26 30 L33 70 C34 79 43 84 60 84 C77 84 86 79 87 70 L94 30 Z"/>'
        '<path d="M94 42 C108 42 113 52 108 59 C104 65 95 65 90 61"/>'
        '<path d="M14 92 C14 86 34 90 60 90 C86 90 106 86 106 92 '
        'C106 98 86 101 60 101 C34 101 14 98 14 92 Z"/>'
    ),
    light='<path d="M28 36 C42 41 78 41 92 36"/>',
    hatch='<path d="M40 76 L38 66"/><path d="M52 80 L51 68"/><path d="M68 80 L69 68"/>'
          '<path d="M80 76 L82 66"/>')
