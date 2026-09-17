# Shared world for the Fine Print lesson-flow artboards.
# Palette and type are pinned brand commitments (PRODUCT.md) - not re-decided here.

W, H = 1440, 900

GROUND   = "#150E08"   # near-black, warm
GROUND_2 = "#1E160C"
MAH      = "#3A2416"   # mahogany
MAH_D    = "#24170D"
MAH_L    = "#4C3220"
PAPER    = "#EDE1C4"   # aged paper - anything the reader reads
PAPER_W  = "#E2D2AC"
PAPER_D  = "#D3BF97"
INK      = "#2A2017"
INK_M    = "#4E3F2D"
INK_L    = "#5A4934"
BRASS    = "#C9A227"
GILT     = "#E0C478"
LAMP     = "#F5CF86"
OX       = "#6E2433"   # oxblood - the reader's own evidence marks ONLY
OX_L     = "#9A4453"

# Victorian publisher's book cloth. Oxblood #6E2433 is deliberately ABSENT:
# it belongs to the reader's evidence marks alone, so a red stroke always
# means "I claimed this" - it must never appear as decoration on a spine.
CLOTH = ["#7A3B22", "#2F4034", "#8A6A2F", "#3C3A52", "#4A2E24", "#2E3F48",
         "#6B5326", "#46402A", "#3B4A3C"]

DISPLAY = "'Bodoni Moda', 'Didot', Georgia, serif"
READ    = "'EB Garamond', Georgia, serif"
LABEL   = "'IM Fell English SC', Georgia, serif"

FONTS = ("https://fonts.googleapis.com/css2?"
         "family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400&"
         "family=EB+Garamond:ital,wght@0,400..600;1,400..500&"
         "family=IM+Fell+English+SC&display=swap")


def skeleton(body, preview_w=W, preview_h=H, extra_css=""):
    """One self-contained .dc.html artboard."""
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<style>
body {{ margin: 0; background: {GROUND}; -webkit-font-smoothing: antialiased; }}
a {{ color: {GILT}; text-decoration-color: rgba(201,162,39,0.45); text-underline-offset: 3px; }}
a:hover {{ color: {LAMP}; }}
button {{ font-family: inherit; cursor: pointer; }}
::selection {{ background: {OX}; color: {PAPER}; }}
:focus-visible {{ outline: 2px solid {BRASS}; outline-offset: 3px; }}
* {{ scrollbar-color: {MAH_L} {GROUND}; }}
{extra_css}
</style>
</helmet>
{body}
</x-dc>
<script data-dc-script data-props='{{"$preview":{{"width":{preview_w},"height":{preview_h}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
"""


def stage(inner, bg=None):
    """The fixed-size root: one camera position on the single study."""
    bg = bg or (f"radial-gradient(1200px 820px at 68% 34%, {MAH} 0%, {GROUND_2} 46%, "
                f"{GROUND} 78%, #0C0805 100%)")
    return (f'<div style="width:{W}px;height:{H}px;box-sizing:border-box;position:relative;'
            f'overflow:hidden;background:{bg};color:{PAPER};">{inner}</div>')


def lamp_pool(x, y, rx=520, ry=380, strength=0.30):
    """Lamplight is the only light source in this world."""
    return (f'<div style="position:absolute;inset:0;pointer-events:none;'
            f'background:radial-gradient({rx}px {ry}px at {x}px {y}px,'
            f'rgba(245,207,134,{strength}),rgba(245,207,134,{strength*0.42:.3f}) 34%,'
            f'rgba(0,0,0,0) 72%);"></div>')


def vignette(strength=0.82):
    return (f'<div style="position:absolute;inset:0;pointer-events:none;'
            f'box-shadow:inset 0 0 260px rgba(0,0,0,{strength}),'
            f'inset 0 0 90px rgba(0,0,0,0.5);"></div>')


def grain():
    """Paper/air tooth, kept very low - texture, not noise."""
    return ('<div style="position:absolute;inset:0;pointer-events:none;opacity:0.055;'
            'background-image:radial-gradient(#F5CF86 0.5px, rgba(0,0,0,0) 0.5px);'
            'background-size:3px 3px;"></div>')


def shallow_room(shelf_side="left", desk=True, lamp=(None, None)):
    """The study held at the edges of a frame the page dominates.

    Not the full six-layer stage - a shelf with real spines and a mantel at the
    frame's margins, a desk edge, and the lamp's falloff, so a page-dominant
    frame is still a position in the room rather than a panel on a ground.
    """
    out = ""
    if shelf_side == "left":
        sx, mx = 20, 1210
    else:
        sx, mx = 1160, 34
    # the shelf carcass, deep and out of focus
    out += (f'<div style="position:absolute;left:{sx}px;top:96px;width:250px;height:404px;'
            f'filter:blur(7px);opacity:0.6;border-radius:3px;'
            f'background:linear-gradient(100deg,{MAH_L} 0%,{MAH} 34%,#160E07 100%);'
            f'box-shadow:inset 0 0 44px rgba(0,0,0,0.72);"></div>')
    # its spines, book cloth still reading as colour through the blur
    out += "".join(
        f'<div style="position:absolute;left:{sx + 24 + i*38}px;top:136px;width:28px;'
        f'height:{132 + (i % 3) * 16}px;filter:blur(6px);opacity:0.44;border-radius:2px;'
        f'background:linear-gradient(95deg,{CLOTH[(i + 1) % len(CLOTH)]},'
        f'rgba(0,0,0,0.55));"></div>' for i in range(5))
    out += (f'<div style="position:absolute;left:{sx + 10}px;top:{136 + 150}px;'
            f'width:230px;height:8px;filter:blur(6px);opacity:0.5;border-radius:2px;'
            f'background:linear-gradient(180deg,{MAH_L},{MAH_D});"></div>')
    # the mantel and the chair back on the other margin
    out += (f'<div style="position:absolute;left:{mx}px;top:300px;width:212px;height:330px;'
            f'filter:blur(8px);opacity:0.5;border-radius:44px 44px 4px 4px;'
            f'background:linear-gradient(170deg,#43291A 0%,#160E07 100%);"></div>')
    if desk:
        out += (f'<div style="position:absolute;left:0;right:0;bottom:0;height:104px;'
                f'filter:blur(3px);opacity:0.92;'
                f'background:linear-gradient(180deg,rgba(76,50,32,0) 0%,{MAH} 34%,'
                f'#150D07 100%);"></div>')
    lx, ly = lamp
    if lx is not None:
        out += lamp_pool(lx, ly, 640, 430, 0.18)
    return out


# ---------------------------------------------------------------- drawn marks
# Icons are authored SVG in one stroke language: 1.6px, round caps, gilt.

def _svg(w, h, paths, stroke=GILT, sw=1.6, fill="none", extra=""):
    return (f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="{fill}" '
            f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="round" '
            f'stroke-linejoin="round" aria-hidden="true" {extra}>{paths}</svg>')


# Paper-cut cameo silhouettes. Four sitters, four outlines - a frame that asks
# "who made it happen" cannot show the same face three times.

_FACE = ('<path d="M31 44 C29 52, 29 58, 31 63 L37 65 L33 69 C32 73, 34 76, 38 77 '
         'L36 81 C36 85, 40 88, 45 89 L45 96 C36 98, 26 103, 22 112 L68 112 '
         'C66 100, 58 93, 52 90 C55 83, 56 72, 55 63 C54 52, 48 44, 40 43 Z"/>')

_HEADS = {
    # the guide: a homburg, never a deerstalker, and never a pipe
    "gent": ('<path d="M22 40 C22 28, 32 21, 45 21 C58 21, 66 28, 66 38 L70 40 '
             'C72 41, 72 44, 69 44 L20 44 C17 44, 17 41, 22 40 Z"/>'),
    # the niece, fifteen: bare head, hair gathered long at the nape with a bow
    "girl": ('<path d="M30 44 C27 36, 28 24, 37 19 C47 14, 58 18, 60 29 '
             'C61 36, 59 41, 56 44 Z"/>'
             '<path d="M31 40 C22 45, 18 57, 20 69 C21 76, 28 79, 32 74 '
             'C35 69, 31 57, 34 47 Z"/>'
             '<path d="M25 39 C19 35, 19 28, 25 28 C30 28, 31 35, 25 39 Z"/>'),
    # Mrs. Sappleton: hair swept up, a period bun high at the back
    "lady": ('<path d="M30 44 C26 36, 27 23, 36 17 C46 11, 58 15, 61 26 '
             'C63 34, 60 41, 56 44 Z"/>'
             '<path d="M55 20 C62 12, 73 15, 74 24 C75 33, 65 38, 58 32 Z"/>'),
    # Mr. Nuttel: bare, high forehead, and a moustache over a starched collar
    "bare": ('<path d="M30 44 C27 33, 32 21, 43 19 C53 17, 59 26, 58 37 '
             'C57 41, 56 42, 55 44 Z"/>'
             '<path d="M35 70 C29 69, 24 72, 24 76 C28 79, 34 78, 37 75 Z"/>'
             '<path d="M40 92 L30 100 L44 100 Z"/>'),
    # her husband, the bearer of the white mackintosh: flat cap and a full beard
    "capped": ('<path d="M26 40 C26 28, 36 21, 47 22 C57 23, 63 29, 62 37 '
               'L70 39 C73 40, 72 43, 68 43 L24 43 C21 43, 21 41, 26 40 Z"/>'
               '<path d="M33 66 C28 72, 28 84, 34 92 C40 99, 50 100, 55 94 '
               'C59 88, 58 76, 54 68 C48 74, 39 74, 33 66 Z"/>'),
}


def cameo(size=92, ring=BRASS, lit=True, profile="gent"):
    """A paper-cut silhouette in a gilt oval."""
    op = "1" if lit else "0.34"
    prof = _HEADS.get(profile, _HEADS["gent"]) + _FACE
    return (
        f'<span style="display:inline-block;width:{size}px;height:{size*1.22:.0f}px;'
        f'border-radius:50%;opacity:{op};position:relative;'
        f'background:radial-gradient(60% 55% at 38% 30%, {PAPER} 0%, {PAPER_W} 55%, {PAPER_D} 100%);'
        f'box-shadow:0 0 0 2px {ring}, 0 0 0 5px rgba(58,36,22,0.9), '
        f'0 3px 14px rgba(0,0,0,0.55), inset 0 -6px 18px rgba(203,182,137,0.5);">'
        f'<span style="position:absolute;inset:0;display:flex;align-items:flex-end;'
        f'justify-content:center;overflow:hidden;border-radius:50%;">'
        f'<svg width="{size*0.72:.0f}" height="{size*0.98:.0f}" viewBox="0 0 90 112" '
        f'fill="{INK}" stroke="none" aria-hidden="true">{prof}</svg></span></span>'
    )


def key_mark(size=20):
    return _svg(size, size,
                '<circle cx="6" cy="6" r="3.6"/><path d="M8.4 8.4 L17 17"/>'
                '<path d="M13.2 12.6 L15.6 10.2"/><path d="M15.4 14.8 L17.8 12.4"/>',
                stroke=BRASS, sw=1.5, extra='viewBox="0 0 20 20"')


def tick(size=18, stroke=OX_L):
    return _svg(size, size, '<path d="M3.5 9.5 L7 13.5 L15 4.5"/>', stroke=stroke, sw=2.2,
                extra='viewBox="0 0 18 18"')


def nib(size=26):
    return _svg(size, size,
                '<path d="M13 2 L20 13 L13 24 L6 13 Z"/><path d="M13 9 L13 24"/>'
                '<circle cx="13" cy="12" r="1.6" fill="' + OX + '" stroke="none"/>',
                stroke=OX_L, sw=1.5, extra='viewBox="0 0 26 26"')


def rule(width="100%", color=None, op=0.5):
    color = color or BRASS
    return (f'<div style="width:{width};height:1px;background:{color};opacity:{op};"></div>')


def label(text, size=11, color=None, ls="0.16em", mb=0):
    color = color or INK_L
    return (f'<div style="font-family:{LABEL};font-size:{size}px;letter-spacing:{ls};'
            f'color:{color};margin-bottom:{mb}px;">{text}</div>')
