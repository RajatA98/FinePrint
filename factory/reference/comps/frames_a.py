# Frames 1-5: the study, the book opening, the words, the read, the close.
from world import *
from world import _svg
import source as SRC


# ---------------------------------------------------------------- 1. the study
def spine(numeral, band, cloth, h, dim=1.0, chosen=False, locked=False):
    lift = -16 if chosen else 0
    glow = (f'box-shadow:0 0 0 1px {GILT}, 0 0 26px rgba(245,207,134,0.42),'
            f'0 14px 22px rgba(0,0,0,0.6);') if chosen else \
           'box-shadow:inset -3px 0 6px rgba(0,0,0,0.45), 2px 0 5px rgba(0,0,0,0.5);'
    # the pulled spine is the only affordance on this frame - it IS the control
    tag = "a" if chosen else "button"
    attrs = 'href="Open.dc.html"' if chosen else 'type="button"'
    if locked:
        attrs += ' aria-disabled="true" tabindex="-1"'
    aria = f'aria-label="Case {numeral}, {band} cases"'
    gilt_op = 0.9 if not locked else 0.34
    txt = GILT if not locked else "#A58F66"
    return (
        f'<{tag} {attrs} {aria} style="all:unset;cursor:{"pointer" if not locked else "default"};'
        f'display:block;position:relative;width:58px;height:{h}px;'
        f'transform:translateY({lift}px);opacity:{dim};'
        f'background:linear-gradient(95deg,{cloth} 0%,rgba(0,0,0,0.34) 82%,rgba(0,0,0,0.5) 100%);'
        f'border-radius:2px 3px 3px 2px;{glow}">'
        f'<span style="position:absolute;left:8px;right:8px;top:12px;height:1px;'
        f'background:{GILT};opacity:{gilt_op};"></span>'
        f'<span style="position:absolute;left:8px;right:8px;top:18px;height:1px;'
        f'background:{GILT};opacity:{gilt_op*0.5};"></span>'
        f'<span style="position:absolute;left:8px;right:8px;bottom:26px;height:1px;'
        f'background:{GILT};opacity:{gilt_op*0.6};"></span>'
        f'<span style="position:absolute;inset:26px 0 34px;display:flex;align-items:center;'
        f'justify-content:center;font-family:{DISPLAY};font-size:19px;color:{txt};'
        f'writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);'
        f'letter-spacing:0.06em;">{numeral}</span>'
        f'<span style="position:absolute;left:0;right:0;bottom:8px;text-align:center;'
        f'font-family:{LABEL};font-size:11px;letter-spacing:0.06em;color:{txt};opacity:0.8;">'
        f'{band}</span>'
        f'</{tag}>'
    )


NUMS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"]


def shelf_band(y, name, note, dim, band_word, chosen_idx=None, locked=False):
    spines = ""
    for i, n in enumerate(NUMS):
        cloth = CLOTH[i % len(CLOTH)]
        h = [118, 126, 122, 112, 130, 120, 128, 114, 124][i]
        spines += spine(n, band_word, cloth, h, dim=dim,
                        chosen=(chosen_idx == i), locked=locked)
    head_col = GILT if not locked else "#A58F66"
    return (
        f'<div style="position:absolute;left:66px;top:{y}px;width:622px;">'
        f'<div style="display:flex;align-items:baseline;gap:14px;padding:0 24px 8px;">'
        f'<span style="font-family:{LABEL};font-size:12px;letter-spacing:0.18em;'
        f'color:{head_col};">{name}</span>'
        f'<span style="flex-grow:1;height:1px;background:{BRASS};opacity:0.28;"></span>'
        f'<span style="font-family:{READ};font-style:italic;font-size:12px;'
        f'color:{INK_L};">{note}</span></div>'
        f'<div style="display:flex;align-items:flex-end;gap:5px;padding:0 24px;'
        f'height:146px;">{spines}</div>'
        # the plank
        f'<div style="height:9px;margin:0 6px;border-radius:2px;'
        f'background:linear-gradient(180deg,{MAH_L} 0%,{MAH} 40%,{MAH_D} 100%);'
        f'box-shadow:0 5px 14px rgba(0,0,0,0.65);"></div>'
        f'</div>'
    )


def frame_study():
    b = ""
    # L1 far wall + the open window (the story's own motif)
    b += (f'<div style="position:absolute;left:902px;top:118px;width:304px;height:366px;'
          f'filter:blur(1.1px);">'
          f'<div style="position:absolute;inset:0;border:9px solid {MAH_D};border-radius:2px;'
          f'background:linear-gradient(180deg,#3E453D 0%,#333A32 46%,#262C24 78%,#1F251E 100%);'
          f'box-shadow:inset 0 0 46px rgba(0,0,0,0.72), 0 0 40px rgba(0,0,0,0.5);"></div>'
          f'<div style="position:absolute;left:50%;top:9px;bottom:9px;width:7px;'
          f'transform:translateX(-50%);background:{MAH_D};"></div>'
          f'<div style="position:absolute;left:9px;right:9px;top:44%;height:7px;'
          f'background:{MAH_D};"></div>'
          f'<div style="position:absolute;left:9px;right:9px;bottom:9px;height:74px;'
          f'background:linear-gradient(180deg,#2C3A2C,#1D2620);opacity:0.9;"></div>'
          f'</div>')
    # L3 mantel + chair, deep and out of focus
    b += (f'<div style="position:absolute;left:712px;top:404px;width:210px;height:300px;'
          f'filter:blur(3.4px);opacity:0.72;'
          f'background:linear-gradient(180deg,rgba(58,36,22,0) 0%,{MAH_D} 34%,#160E07 100%);'
          f'border-radius:44px 44px 6px 6px;"></div>')
    b += (f'<div style="position:absolute;left:1236px;top:352px;width:176px;height:340px;'
          f'filter:blur(4.6px);opacity:0.6;'
          f'background:linear-gradient(180deg,{MAH} 0%,#18100A 100%);'
          f'border-radius:70px 24px 4px 4px;"></div>')
    # L2 the shelf
    b += (f'<div style="position:absolute;left:52px;top:150px;width:650px;height:556px;'
          f'background:linear-gradient(100deg,{MAH_D} 0%,#1A1008 60%,#120B06 100%);'
          f'box-shadow:inset 0 0 60px rgba(0,0,0,0.8), 0 22px 60px rgba(0,0,0,0.6);'
          f'border-radius:3px;"></div>')
    b += shelf_band(172, "Difficult Cases", "locked", 0.40, "Sharp", locked=True)
    b += shelf_band(350, "Longer Cases", "locked", 0.68, "Adept", locked=True)
    b += shelf_band(528, "First Cases", "two solved", 1.0, "Novice", chosen_idx=2)
    # L4 the desk
    b += (f'<div style="position:absolute;left:0;right:0;top:700px;height:200px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 5px,#2C1B10 46%,#170F08 100%);'
          f'box-shadow:0 -18px 46px rgba(0,0,0,0.6);"></div>')
    # the leather desk pad the case notes are written on
    b += (f'<div style="position:absolute;left:246px;top:726px;width:672px;height:150px;'
          f'background:linear-gradient(168deg,#3B1B10,#2A100A 70%,#1A0A05);'
          f'box-shadow:inset 0 3px 10px rgba(0,0,0,0.85),'
          f'inset 0 -2px 0 rgba(224,196,120,0.10), 0 4px 14px rgba(0,0,0,0.5);">'
          f'<span style="position:absolute;inset:0;opacity:0.22;'
          f'background-image:radial-gradient(#8A5A34 0.6px, rgba(0,0,0,0) 0.6px),'
          f'radial-gradient(#0E0603 0.5px, rgba(0,0,0,0) 0.5px);'
          f'background-size:5px 4px, 7px 6px;background-position:0 0, 2px 3px;"></span>'
          f'<span style="position:absolute;inset:11px;'
          f'border:1.5px dashed rgba(196,150,96,0.34);"></span></div>')
    # L5 the lamp, and the light is actually coming out of it
    b += (f'<div style="position:absolute;left:1108px;top:476px;width:250px;height:240px;">'
          + _svg(250, 240,
                 f'<path d="M58 96 C58 60, 94 40, 126 40 C158 40, 194 60, 194 96 Z" '
                 f'fill="url(#shade)" stroke="{BRASS}" stroke-width="2.4"/>'
                 f'<path d="M58 96 L194 96" stroke="{LAMP}" stroke-width="3"/>'
                 f'<path d="M126 40 L126 26" stroke="{BRASS}" stroke-width="2"/>'
                 f'<path d="M126 96 L126 188" stroke="{BRASS}" stroke-width="3"/>'
                 f'<path d="M92 196 C92 188, 106 184, 126 184 C146 184, 160 188, 160 196 Z" '
                 f'fill="{MAH_D}" stroke="{BRASS}" stroke-width="2"/>'
                 f'<path d="M84 200 L168 200" stroke="{BRASS}" stroke-width="2"/>'
                 f'<defs><linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">'
                 f'<stop offset="0" stop-color="#8A6C1A"/>'
                 f'<stop offset="0.72" stop-color="{BRASS}"/>'
                 f'<stop offset="1" stop-color="{LAMP}"/></linearGradient></defs>',
                 stroke=BRASS, sw=2)
          + f'<span style="position:absolute;left:14px;top:74px;width:222px;height:150px;'
            f'pointer-events:none;background:radial-gradient(ellipse at 50% 0%,'
            f'rgba(245,207,134,0.42),rgba(245,207,134,0) 72%);"></span>'
          + '</div>')
    # the cone the shade throws left across the desk and up onto the lit band
    b += (f'<div style="position:absolute;left:520px;top:544px;width:760px;height:346px;'
          f'pointer-events:none;opacity:0.55;'
          f'background:linear-gradient(102deg,rgba(245,207,134,0) 0%,'
          f'rgba(245,207,134,0.09) 36%,rgba(245,207,134,0.24) 74%,'
          f'rgba(245,207,134,0.04) 100%);'
          f'clip-path:polygon(100% 2%, 100% 58%, 2% 100%, 30% 40%);"></div>')
    b += lamp_pool(1150, 700, 560, 400, 0.34)
    b += lamp_pool(300, 240, 420, 300, 0.10)
    # the wordmark, and the line that replaces a shelf of titles
    b += (f'<div style="position:absolute;left:66px;top:46px;width:560px;">'
          f'<h1 style="margin:0;font-family:{DISPLAY};font-size:58px;font-weight:400;'
          f'letter-spacing:-0.012em;color:{GILT};'
          f'text-shadow:0 2px 20px rgba(245,207,134,0.22);">Fine Print</h1>'
          f'<p style="margin:10px 0 0;font-family:{READ};font-size:17px;font-style:italic;'
          f'color:#C6B08A;">Nothing is written on the spines. Choose a case by its '
          f'weight, not its name.</p></div>')
    # what the pulled spine turns out to be - letterpressed onto the desk, not a floating CTA
    b += (f'<div style="position:absolute;left:290px;top:752px;width:560px;">'
          f'<div style="font-family:{DISPLAY};font-size:33px;color:#C8A86E;'
          f'letter-spacing:0.004em;text-shadow:0 1px 0 rgba(255,232,180,0.16),'
          f'0 -1px 1px rgba(0,0,0,0.85);">Case the Third</div>'
          f'<div style="margin-top:10px;font-family:{LABEL};font-size:13px;'
          f'letter-spacing:0.1em;word-spacing:0.5em;color:#BC9764;'
          f'text-shadow:0 1px 0 rgba(255,232,180,0.10), 0 -1px 1px rgba(0,0,0,0.8);">'
          f'FIRST CASES &nbsp; ABOUT 1,200 WORDS &nbsp; TEN EXCERPTS</div>'
          f'<div style="margin-top:14px;font-family:{READ};font-style:italic;'
          f'font-size:14.5px;color:#C2A67C;">Pull it off the shelf. You will not know '
          f'what it is until it opens.</div></div>')
    # the guide, small, on the desk, clear of the shelf
    b += (f'<div style="position:absolute;left:96px;top:742px;">{cameo(88)}</div>')
    # L6 near clutter, closest to the eye
    b += (f'<div style="position:absolute;left:-34px;bottom:-26px;width:300px;height:152px;'
          f'filter:blur(8px);opacity:0.9;'
          f'background:linear-gradient(160deg,{MAH} 0%,#120B06 78%);'
          f'border-radius:10px;transform:rotate(-4deg);"></div>')
    # loose paper and an inkwell, closest to the eye
    b += (f'<div style="position:absolute;right:-44px;bottom:-58px;width:340px;height:196px;'
          f'filter:blur(11px);opacity:0.95;pointer-events:none;">'
          f'<span style="position:absolute;left:30px;top:58px;width:236px;height:124px;'
          f'transform:rotate(-7deg);background:linear-gradient(168deg,#6E5C3E,#3A2E1C);'
          f'box-shadow:0 10px 26px rgba(0,0,0,0.7);"></span>'
          f'<span style="position:absolute;left:0;top:42px;width:214px;height:120px;'
          f'transform:rotate(4deg);background:linear-gradient(168deg,#7A6844,#42351F);'
          f'"></span>'
          f'<span style="position:absolute;right:18px;top:14px;width:94px;height:108px;'
          f'border-radius:12px 12px 28px 28px;'
          f'background:linear-gradient(150deg,#241608,#0C0603);'
          f'box-shadow:inset 0 6px 14px rgba(224,196,120,0.2);"></span></div>')
    b += grain() + vignette(0.9)
    return skeleton(stage(b))


# ------------------------------------------------- 2. the book opens, title shown
def spread(left_html, right_html, top=96, left=190, w=1060, h=700):
    half = w // 2
    return (
        f'<div style="position:absolute;left:{left}px;top:{top}px;width:{w}px;height:{h}px;'
        f'display:flex;border-radius:3px;'
        f'box-shadow:0 34px 70px rgba(0,0,0,0.72), 0 4px 0 rgba(203,182,137,0.28),'
        f'0 7px 0 rgba(120,96,58,0.22);">'
        f'<div style="width:{half}px;height:100%;box-sizing:border-box;position:relative;'
        f'background:linear-gradient(94deg,{PAPER_D} 0%,{PAPER_W} 3%,{PAPER} 8%,{PAPER} 100%);'
        f'border-radius:3px 0 0 3px;">{left_html}'
        f'<div style="position:absolute;right:0;top:0;bottom:0;width:54px;'
        f'background:linear-gradient(90deg,rgba(90,74,56,0) 0%,rgba(90,74,56,0.30) 100%);'
        f'pointer-events:none;"></div></div>'
        f'<div style="width:{half}px;height:100%;box-sizing:border-box;position:relative;'
        f'background:linear-gradient(266deg,{PAPER_D} 0%,{PAPER_W} 3%,{PAPER} 8%,{PAPER} 100%);'
        f'border-radius:0 3px 3px 0;">{right_html}'
        f'<div style="position:absolute;left:0;top:0;bottom:0;width:54px;'
        f'background:linear-gradient(270deg,rgba(90,74,56,0) 0%,rgba(90,74,56,0.30) 100%);'
        f'pointer-events:none;"></div></div>'
        f'</div>'
    )


def room_edges():
    """The study has not gone anywhere: it falls away at the frame's edges."""
    return (
        f'<div style="position:absolute;left:0;top:0;bottom:0;width:206px;'
        f'filter:blur(6px);opacity:0.9;'
        f'background:linear-gradient(90deg,#0B0704 0%,{MAH_D} 62%,rgba(36,23,13,0) 100%);"></div>'
        f'<div style="position:absolute;right:0;top:0;bottom:0;width:230px;'
        f'filter:blur(6px);opacity:0.9;'
        f'background:linear-gradient(270deg,#0B0704 0%,{MAH_D} 58%,rgba(36,23,13,0) 100%);"></div>'
    )


def frame_open():
    left = (
        f'<div style="padding:92px 76px 0;text-align:center;">'
        f'<h2 style="margin:0;font-family:{DISPLAY};font-size:57px;font-weight:500;'
        f'line-height:1.02;letter-spacing:-0.018em;color:{INK};">The Open<br>Window</h2>'
        f'<div style="margin:30px auto 0;width:150px;height:1px;background:{OX};'
        f'opacity:0.55;"></div>'
        f'<div style="margin-top:26px;font-family:{LABEL};font-size:19px;'
        f'letter-spacing:0.14em;color:{INK};">SAKI</div>'
        f'<p style="margin:14px 0 0;font-family:{READ};font-size:14px;font-style:italic;'
        f'color:{INK_M};line-height:1.7;">from <span style="font-style:normal;">Beasts and '
        f'Super-Beasts</span>, 1914<br>1,208 words &middot; ten excerpts</p>'
        f'<p style="margin:52px 0 0;font-family:{LABEL};font-size:11px;letter-spacing:0.13em;'
        f'color:{INK_L};">PUBLIC DOMAIN &middot; PROJECT GUTENBERG 269</p>'
        f'</div>'
    )
    right = (
        f'<div style="padding:74px 76px 0 70px;position:relative;height:100%;'
        f'box-sizing:border-box;">'
        f'<h3 style="margin:0;font-family:{DISPLAY};font-size:29px;font-weight:500;'
        f'line-height:1.2;color:{INK};letter-spacing:-0.012em;">'
        f'You have taken down a case<br>you cannot look up.</h3>'
        f'<p style="margin:22px 0 0;font-family:{READ};font-size:17.5px;line-height:1.66;'
        f'color:{INK};max-width:41ch;">Every word on these pages is Saki\'s. I have added '
        f'nothing to them and taken nothing away. What I have added are the questions &mdash; '
        f'and each one can be answered from the page in front of you.</p>'
        f'<p style="margin:16px 0 0;font-family:{READ};font-size:17.5px;line-height:1.66;'
        f'color:{INK};max-width:41ch;">You will read an excerpt. Then the book closes, and '
        f'I ask you what you held. Get one wrong and the page opens again &mdash; '
        f'the first answer is the one I write down.</p>'
        f'<div style="margin-top:26px;display:flex;align-items:center;gap:15px;">'
        f'{cameo(56)}'
        f'<div><div style="font-family:{LABEL};font-size:11px;letter-spacing:0.14em;'
        f'color:{INK_M};">INSPECTOR INKWELL</div>'
        f'<div style="font-family:{READ};font-style:italic;font-size:14px;color:{INK_M};'
        f'margin-top:3px;">I will be quiet while you read.</div></div></div>'
        f'<div style="position:absolute;left:70px;right:76px;bottom:46px;">'
        f'<div style="height:1px;background:{INK_M};opacity:0.28;"></div>'
        f'<div style="margin-top:20px;display:flex;align-items:baseline;'
        f'justify-content:space-between;">'
        f'<a href="Vocabulary.dc.html" style="font-family:{LABEL};font-size:15px;'
        f'letter-spacing:0.12em;color:{OX};text-decoration:none;'
        f'border-bottom:1.5px solid {OX};padding-bottom:3px;">BEGIN THE FIRST EXCERPT</a>'
        f'<span style="font-family:{READ};font-size:13px;color:{INK_L};">excerpt {SRC._ROMAN[0]} of {SRC.N_EXCERPTS}</span>'
        f'</div></div></div>'
    )
    b = shallow_room('left', lamp=(1180, 120)) + room_edges()
    b += spread(left, right)
    b += grain() + vignette(0.78)
    return skeleton(stage(b))


# ------------------------------------------------------------- 3. the words first
def word_card(word, sense, line_no, quote, rot, key=False, top=0, left=0):
    k = (f'<span style="position:absolute;right:16px;top:15px;">{key_mark(19)}</span>') if key else ""
    edge = f'2px solid {BRASS}' if key else f'1px solid rgba(90,74,56,0.34)'
    return (
        f'<div style="position:absolute;left:{left}px;top:{top}px;width:396px;'
        f'box-sizing:border-box;padding:18px 22px 20px;transform:rotate({rot}deg);'
        f'background:linear-gradient(176deg,#F6ECD4,{PAPER_W});border:{edge};'
        f'border-radius:2px;box-shadow:0 10px 22px rgba(42,32,23,0.3);">{k}'
        f'<div style="font-family:{DISPLAY};font-size:29px;color:{INK};'
        f'letter-spacing:-0.005em;">{word}</div>'
        f'<div style="margin-top:8px;font-family:{READ};font-size:17px;color:{INK};'
        f'line-height:1.55;">{sense}</div>'
        f'<div style="margin-top:13px;padding-top:11px;border-top:1px solid rgba(90,74,56,0.3);'
        f'font-family:{READ};font-style:italic;font-size:14.5px;color:{INK_M};'
        f'line-height:1.6;">'
        f'<span style="font-family:{LABEL};font-style:normal;font-size:11px;'
        f'letter-spacing:0.1em;color:{OX};">LINE {line_no}</span>&nbsp; {quote}</div>'
        f'</div>'
    )


def frame_vocab():
    left = (
        f'<div style="padding:58px 0 0;">'
        f'<h3 style="margin:0 54px 0;font-family:{DISPLAY};font-size:31px;font-weight:500;'
        f'color:{INK};line-height:1.2;">Three words, before you read.</h3>'
        f'<div style="position:relative;height:520px;margin-top:26px;">'
        + word_card("engulfed", "Swallowed up completely.",
                    SRC.find("engulfed"),
                    SRC.quote("three engulfed in a treacherous piece of bog"),
                    -1.1, top=0, left=54)
        + word_card("treacherous", "Looking safe, and not safe at all.",
                    SRC.find("treacherous piece of bog"),
                    SRC.quote("a treacherous piece of bog"),
                    0.7, top=176, left=62, key=True)
        + word_card("recovered", "Found, and brought back.",
                    SRC.find("Their bodies were never recovered"),
                    SRC.quote("Their bodies were never recovered."),
                    -0.6, top=352, left=50)
        + f'</div></div>'
    )
    right = (
        f'<div style="padding:78px 84px 0 74px;">'
        f'<h3 style="margin:0;font-family:{DISPLAY};font-size:30px;font-weight:500;'
        f'color:{INK};line-height:1.24;">These are keys, not questions.</h3>'
        f'<p style="margin:22px 0 0;font-family:{READ};font-size:18.5px;line-height:1.72;'
        f'color:{INK};max-width:38ch;">Nothing on this page is scored. Read them, then read '
        f'the excerpt they came from.</p>'
        f'<div style="margin-top:30px;padding:20px 22px;background:rgba(201,162,39,0.13);'
        f'border-left:1px solid {BRASS};">'
        f'<div style="display:flex;align-items:center;gap:10px;">{key_mark(19)}'
        f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.13em;'
        f'color:{INK};">ONE OF THESE OPENS SOMETHING</span></div>'
        f'<p style="margin:12px 0 0;font-family:{READ};font-size:17px;line-height:1.66;'
        f'color:{INK};">A lock later in this excerpt will only turn on the right meaning of '
        f'one of these three. I will not tell you which.</p></div>'
        f'<p style="margin:30px 0 0;font-family:{READ};font-size:17px;line-height:1.7;'
        f'color:{INK_M};max-width:38ch;">If the lock refuses you, the page opens again with '
        f'that word\'s line lit. No one is kept out on a word.</p>'
        f'<div style="margin-top:44px;height:1px;background:{INK_M};opacity:0.28;"></div>'
        f'<div style="margin-top:22px;display:flex;align-items:baseline;'
        f'justify-content:space-between;">'
        f'<a href="Read.dc.html" style="font-family:{LABEL};font-size:15px;'
        f'letter-spacing:0.12em;color:{OX};text-decoration:none;'
        f'border-bottom:1.5px solid {OX};padding-bottom:3px;">READ THE EXCERPT</a>'
        f'<span style="font-family:{READ};font-size:13px;color:{INK_L};">excerpt {SRC._ROMAN[SRC.READ_NO-1]} of {SRC.N_EXCERPTS}</span>'
        f'</div></div>'
    )
    b = shallow_room('left', lamp=(1160, 140)) + room_edges()
    b += spread(left, right)
    b += grain() + vignette(0.78)
    return skeleton(stage(b))


# -------------------------------------------------------------- 4. the timed read
LINES = SRC.span(SRC.READ_A, SRC.READ_B, SRC.READ_STOP)


def frame_read():
    rows = ""
    for n, text, para in LINES:
        rows += (f'<div style="display:flex;gap:26px;align-items:baseline;'
                 f'margin-top:{14 if para else 0}px;">'
                 f'<span style="width:22px;text-align:right;flex-shrink:0;'
                 f'font-family:{LABEL};font-size:11px;color:{INK_M};'
                 f'position:relative;top:-2px;">{n}</span>'
                 f'<span style="font-family:{READ};font-size:22.5px;line-height:1.9;'
                 f'color:{INK};">{text}</span></div>')
    page = (
        f'<div style="position:absolute;left:148px;top:74px;width:836px;height:722px;'
        f'box-sizing:border-box;padding:66px 62px 0 54px;border-radius:3px;'
        f'background:linear-gradient(98deg,{PAPER_D} 0%,{PAPER_W} 3%,{PAPER} 7%,{PAPER} 100%);'
        f'box-shadow:0 30px 70px rgba(0,0,0,0.7);overflow:hidden;">'
        f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
        f'padding-bottom:16px;margin-bottom:26px;border-bottom:1px solid rgba(90,74,56,0.3);">'
        f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
        f'color:{INK_M};">THE OPEN WINDOW &middot; EXCERPT {SRC._ROMAN[SRC.READ_NO-1]}</span>'
        f'<span style="font-family:{READ};font-style:italic;font-size:13px;color:{INK_L};">'
        f'lines {SRC.READ_A} to {SRC.READ_B}</span></div>'
        f'<div style="position:relative;">'
        f'<div style="position:absolute;left:33px;top:2px;bottom:0;width:1px;'
        f'background:rgba(110,36,51,0.22);"></div>{rows}</div>'
        # the lamp has not reached the foot of the page yet
        f'<div style="position:absolute;left:0;right:0;bottom:0;height:176px;'
        f'pointer-events:none;background:linear-gradient(180deg,rgba(74,46,26,0) 0%,'
        f'rgba(66,40,22,0.34) 44%,rgba(58,36,22,0.62) 100%);"></div>'
        f'</div>'
    )
    b = (f'<div style="position:absolute;left:0;top:0;bottom:0;width:170px;'
         f'filter:blur(6px);background:linear-gradient(90deg,#0A0603,{MAH_D} 70%,'
         f'rgba(36,23,13,0) 100%);"></div>')
    b += page
    b += lamp_pool(430, 150, 660, 420, 0.22)
    # the study, still there, to the right - and the pace mark, quiet on purpose
    b += (f'<div style="position:absolute;left:1032px;top:0;bottom:0;right:0;'
          f'background:linear-gradient(255deg,#0A0603 0%,#1A1009 54%,rgba(26,16,9,0) 100%);'
          f'"></div>')
    # the shelf, still at the reader's shoulder, deep out of focus
    b += (f'<div style="position:absolute;left:1066px;top:78px;width:310px;height:300px;'
          f'filter:blur(5px);opacity:0.62;border-radius:3px;'
          f'background:linear-gradient(100deg,{MAH_L} 0%,{MAH} 34%,#1A1108 100%);'
          f'box-shadow:inset 0 0 40px rgba(0,0,0,0.7);"></div>')
    b += ("".join(
        f'<div style="position:absolute;left:{1092 + i*46}px;top:122px;width:34px;'
        f'height:{132 + (i % 3) * 12}px;filter:blur(4.6px);opacity:0.5;border-radius:2px;'
        f'background:linear-gradient(95deg,{CLOTH[(i + 2) % len(CLOTH)]},rgba(0,0,0,0.5));'
        f'"></div>' for i in range(6)))
    b += (f'<div style="position:absolute;left:1074px;bottom:188px;width:284px;">'
          f'<div style="height:2px;background:rgba(201,162,39,0.24);border-radius:1px;'
          f'overflow:hidden;"><div style="width:44%;height:100%;background:{BRASS};'
          f'opacity:0.85;"></div></div>'
          f'<div style="margin-top:12px;font-family:{READ};font-style:italic;font-size:14px;'
          f'color:#CDB68C;">Your pace is being noted. It is never scored.</div></div>')
    b += (f'<div style="position:absolute;left:1074px;bottom:92px;display:flex;'
          f'align-items:center;gap:14px;">{cameo(52, lit=False)}'
          f'<span style="font-family:{READ};font-style:italic;font-size:15px;'
          f'color:#C0A87E;max-width:20ch;">When you turn this page,<br>it closes.</span></div>')
    b += grain() + vignette(0.7)
    return skeleton(stage(b))


# ----------------------------------------------------------- 5. the book closes
def studs(done=2, total=10, current=2):
    out = ""
    for i in range(total):
        if i < done:
            fill, ring, size = OX, OX, 12
        elif i == current:
            fill, ring, size = LAMP, BRASS, 14
        else:
            fill, ring, size = "rgba(0,0,0,0.35)", "rgba(201,162,39,0.3)", 12
        out += (f'<span style="width:{size}px;height:{size}px;border-radius:50%;'
                f'background:{fill};box-shadow:0 0 0 1.5px {ring},'
                f'inset 0 1px 2px rgba(255,255,255,0.25);"></span>')
    return (f'<div style="display:flex;align-items:center;gap:13px;">{out}</div>')


def frame_close():
    b = ""
    # the room comes back up now that the reading is done
    b += (f'<div style="position:absolute;left:60px;top:96px;width:560px;height:430px;'
          f'filter:blur(4.4px);opacity:0.72;border-radius:3px;'
          f'background:linear-gradient(100deg,{MAH_L} 0%,{MAH} 30%,#170F08 100%);'
          f'box-shadow:inset 0 0 50px rgba(0,0,0,0.7);"></div>')
    for row in (146, 316):
        b += ("".join(
            f'<div style="position:absolute;left:{92 + i*52}px;top:{row}px;width:40px;'
            f'height:{138 + (i % 3) * 14}px;filter:blur(4.2px);opacity:0.5;border-radius:2px;'
            f'background:linear-gradient(95deg,{CLOTH[(i + row) % len(CLOTH)]},'
            f'rgba(0,0,0,0.55));"></div>' for i in range(9)))
    b += (f'<div style="position:absolute;left:918px;top:104px;width:280px;height:330px;'
          f'filter:blur(3px);opacity:0.8;border:8px solid {MAH_D};'
          f'background:linear-gradient(180deg,#3B423A,#252B23);'
          f'box-shadow:0 0 60px rgba(245,207,134,0.10);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:560px;height:340px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 6px,#2A1A0F 40%,#140D07 100%);'
          f'box-shadow:0 -20px 50px rgba(0,0,0,0.6);"></div>')
    # the closed book, laid on the desk: boards, spine, headband, contact shadow
    b += (f'<div style="position:absolute;left:0;right:0;top:296px;height:410px;'
          f'perspective:1300px;display:flex;justify-content:center;">'
          f'<div style="width:412px;height:296px;transform:rotateX(54deg) rotateZ(-7deg);'
          f'transform-style:preserve-3d;position:relative;">'
          # the shadow the volume casts on the leather, thrown away from the lamp
          f'<span style="position:absolute;left:-46px;top:34px;width:470px;height:280px;'
          f'background:radial-gradient(closest-side,rgba(0,0,0,0.78),rgba(0,0,0,0) 100%);'
          f'filter:blur(12px);transform:translateZ(-2px) skewX(-12deg);"></span>'
          # the text block: leaves seen on the fore-edge and tail
          f'<span style="position:absolute;left:10px;right:-9px;top:9px;bottom:-11px;'
          f'border-radius:2px 4px 4px 2px;'
          f'background:repeating-linear-gradient(178deg,{PAPER_D} 0 2px,{PAPER_W} 2px 4px);'
          f'box-shadow:0 2px 6px rgba(0,0,0,0.6);"></span>'
          # the front board
          f'<span style="position:absolute;inset:0;border-radius:3px 6px 6px 3px;'
          f'background:linear-gradient(128deg,#5C3521 0%,{MAH} 44%,#2A1810 100%);'
          f'box-shadow:0 30px 60px rgba(0,0,0,0.7), inset 0 0 36px rgba(0,0,0,0.42),'
          f'inset 0 2px 0 rgba(224,196,120,0.14);">'
          f'<span style="position:absolute;inset:20px;border:1.5px solid {BRASS};'
          f'opacity:0.5;border-radius:2px;"></span>'
          f'<span style="position:absolute;inset:28px;border:1px solid {BRASS};'
          f'opacity:0.24;"></span>'
          f'<span style="position:absolute;inset:0;display:flex;align-items:center;'
          f'justify-content:center;font-family:{DISPLAY};font-size:76px;color:{GILT};'
          f'opacity:0.9;text-shadow:0 1px 0 rgba(0,0,0,0.7);">III</span></span>'
          # the rounded spine with its raised bands, and the headband at the top
          f'<span style="position:absolute;left:-17px;top:0;bottom:0;width:20px;'
          f'border-radius:5px 0 0 5px;'
          f'background:linear-gradient(90deg,#160D06,#3E2415 60%,#4C3220);'
          f'box-shadow:inset 2px 0 4px rgba(0,0,0,0.6);">'
          f'<span style="position:absolute;left:2px;right:2px;top:58px;height:3px;'
          f'background:{BRASS};opacity:0.4;"></span>'
          f'<span style="position:absolute;left:2px;right:2px;top:150px;height:3px;'
          f'background:{BRASS};opacity:0.4;"></span>'
          f'<span style="position:absolute;left:2px;right:2px;top:238px;height:3px;'
          f'background:{BRASS};opacity:0.4;"></span></span>'
          f'<span style="position:absolute;left:-16px;top:-3px;width:26px;height:9px;'
          f'border-radius:3px;background:repeating-linear-gradient(90deg,'
          f'#2F4034 0 3px,{PAPER_W} 3px 6px);opacity:0.85;"></span>'
          f'</div></div>')
    b += lamp_pool(720, 250, 620, 440, 0.26)
    # the turn the whole product rests on
    b += (f'<div style="position:absolute;left:0;right:0;top:92px;text-align:center;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:62px;font-weight:400;'
          f'letter-spacing:-0.02em;color:{PAPER};'
          f'text-shadow:0 2px 26px rgba(0,0,0,0.7);">The book is closed.</h2>'
          f'<p style="margin:18px 0 0;font-family:{READ};font-size:21px;font-style:italic;'
          f'color:#C9B28A;">Answer from what you held. If you lose it, the page opens again.</p>'
          f'</div>')
    # where you are in the ten - the sequence carries real information
    b += (f'<div style="position:absolute;left:0;right:0;top:700px;display:flex;'
          f'flex-direction:column;align-items:center;gap:14px;">'
          + studs(done=SRC.READ_NO - 1, total=SRC.N_EXCERPTS, current=SRC.READ_NO - 1)
          + f'<div style="font-family:{LABEL};font-size:12px;letter-spacing:0.16em;'
            f'color:{GILT};opacity:0.8;">EXCERPT {SRC._ROMAN[SRC.READ_NO-1]} OF {SRC.N_EXCERPTS} &nbsp;&middot;&nbsp; '
            f'TWO CLUES IN THE FILE</div>'
          + f'<a href="Lock.dc.html" style="margin-top:12px;font-family:{LABEL};'
            f'font-size:16px;letter-spacing:0.13em;color:{LAMP};text-decoration:none;'
            f'border:1px solid {BRASS};padding:13px 30px;border-radius:2px;'
            f'background:linear-gradient(180deg,rgba(201,162,39,0.20),rgba(201,162,39,0.06));'
            f'box-shadow:0 6px 18px rgba(0,0,0,0.5);">OPEN THE EVIDENCE BOX</a></div>')
    b += (f'<div style="position:absolute;right:74px;bottom:70px;display:flex;'
          f'align-items:center;gap:16px;">'
          f'<span style="font-family:{READ};font-style:italic;font-size:15px;'
          f'color:#C9B28A;text-align:right;max-width:21ch;">Three things to do,<br>'
          f'and none of them on the page.</span>{cameo(76)}</div>')
    b += grain() + vignette(0.86)
    return skeleton(stage(b))
