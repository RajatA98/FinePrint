# Frames 6-10: the three actions from memory, the finale, the report.
from world import *
from world import _svg
import source as SRC
from objects import GUNS, COAT, SPANIEL, STICK_HAT, LETTERS, TEACUP
from frames_a import spread, room_edges, studs, LINES


def action_count(n):
    """Three actions per excerpt, shown as brass studs rather than a progress bar."""
    out = ""
    for i in range(3):
        if i < n - 1:
            out += (f'<span style="width:11px;height:11px;border-radius:50%;background:{OX};'
                    f'box-shadow:0 0 0 1.5px {OX};"></span>')
        elif i == n - 1:
            out += (f'<span style="width:13px;height:13px;border-radius:50%;background:{LAMP};'
                    f'box-shadow:0 0 0 1.5px {BRASS},0 0 12px rgba(245,207,134,0.6);"></span>')
        else:
            out += (f'<span style="width:11px;height:11px;border-radius:50%;'
                    f'background:rgba(0,0,0,0.4);'
                    f'box-shadow:0 0 0 1.5px rgba(201,162,39,0.32);"></span>')
    return (f'<div style="display:flex;align-items:center;gap:10px;">{out}</div>')


# ------------------------------------------------------------- 6. the word lock
# The four meanings are engraved around the lock's own face. There is no list of
# options beside it - the answer is made by turning the mechanism.

MEANINGS = [
    ("safe-looking, not safe", True),
    ("sudden, no warning", False),
    ("wet and muddy", False),
    ("deep and cold", False),
]


def _sector(r, rr, a0, a1):
    """A brightened wedge of the brass, marking the legend now selected."""
    import math as _m
    def pt(rad, deg):
        t = _m.radians(deg)
        return (r + rad * _m.cos(t), r - rad * _m.sin(t))
    x0, y0 = pt(rr + 22, a0)
    x1, y1 = pt(rr + 22, a1)
    xi, yi = pt(rr - 34, a1)
    xj, yj = pt(rr - 34, a0)
    return (f'<path d="M {x0:.1f} {y0:.1f} A {rr+22} {rr+22} 0 0 0 {x1:.1f} {y1:.1f} '
            f'L {xi:.1f} {yi:.1f} A {rr-34} {rr-34} 0 0 1 {xj:.1f} {yj:.1f} Z" '
            f'fill="#D8C285" opacity="0.30"/>')


def lock_face(cx, cy, r):
    """A brass tumbler lock: engraved ring, notches, escutcheon, one pointer.

    Two arcs, not one circle: text on the lower half has to run on a path drawn
    the other way round or it renders upside down.
    """
    d = r * 2
    rr = r - 28
    top = f'M {r - rr} {r} A {rr} {rr} 0 0 1 {r + rr} {r}'   # over the crown
    bot = f'M {r - rr} {r} A {rr} {rr} 0 0 0 {r + rr} {r}'   # under the foot

    placed = [(MEANINGS[0], "arcTop", "72%"), (MEANINGS[3], "arcTop", "28%"),
              (MEANINGS[1], "arcBot", "72%"), (MEANINGS[2], "arcBot", "28%")]
    texts = ""
    for (label, right), arc, off in placed:
        col = "#241C05" if right else "#4A3B10"
        wt = "600" if right else "400"
        texts += (f'<text font-family="EB Garamond, Georgia, serif" font-size="16.5" '
                  f'font-weight="{wt}" fill="{col}" letter-spacing="0.3">'
                  f'<textPath href="#{arc}" startOffset="{off}" text-anchor="middle">'
                  f'{label}</textPath></text>')

    notches = "".join(
        f'<line x1="{r}" y1="7" x2="{r}" y2="{17 if i % 4 == 0 else 11}" '
        f'stroke="#2B2108" stroke-width="{2 if i % 4 == 0 else 1.1}" opacity="0.55" '
        f'transform="rotate({i * 11.25} {r} {r})"/>' for i in range(32))

    return (
        f'<svg width="{d}" height="{d}" viewBox="0 0 {d} {d}" aria-hidden="true">'
        f'<defs><path id="arcTop" d="{top}" fill="none"/>'
        f'<path id="arcBot" d="{bot}" fill="none"/>'
        f'<linearGradient id="brassface" x1="0.2" y1="0" x2="0.8" y2="1">'
        f'<stop offset="0" stop-color="#9A8340"/><stop offset="0.45" stop-color="#8A7230"/>'
        f'<stop offset="1" stop-color="#5E4A14"/></linearGradient></defs>'
        f'<circle cx="{r}" cy="{r}" r="{r - 2}" fill="url(#brassface)" '
        f'stroke="#2B2108" stroke-width="5"/>'
        # turned concentric grain, the way a brass face is finished
        + "".join(f'<circle cx="{r}" cy="{r}" r="{k}" fill="none" stroke="#C8AE6A" '
                  f'stroke-width="0.5" opacity="0.10"/>' for k in range(24, r - 6, 9))
        + f'<circle cx="{r}" cy="{r}" r="{r - 13}" fill="none" stroke="#2B2108" '
          f'stroke-width="1" opacity="0.4"/>'
          f'<circle cx="{r}" cy="{r}" r="{rr - 15}" fill="none" stroke="#2B2108" '
          f'stroke-width="1" opacity="0.3"/>'
        + _sector(r, rr, 30, 70)
        + f'{notches}{texts}'
        # escutcheon and keyway
        f'<circle cx="{r}" cy="{r}" r="33" fill="#52400F" stroke="#2B2108" '
        f'stroke-width="2"/>'
        f'<circle cx="{r}" cy="{r}" r="26" fill="none" stroke="#D8C285" '
        f'stroke-width="1" opacity="0.42"/>'
        f'<path d="M {r} {r - 13} a 7 7 0 1 1 -0.01 0 M {r - 4} {r - 2} '
        f'L {r - 3} {r + 15} L {r + 3} {r + 15} L {r + 4} {r - 2} Z" fill="#171003"/>'
        # the pointer, turned onto the meaning the sentence carries
        f'<g transform="rotate(44 {r} {r})">'
        f'<path d="M {r} {r - 78} L {r - 5} {r - 40} L {r + 5} {r - 40} Z" fill="#6E2433"/>'
        f'<circle cx="{r}" cy="{r - 78}" r="4.5" fill="#9A4453"/></g>'
        f'</svg>'
    )


def frame_lock():
    b = ""
    b += (f'<div style="position:absolute;left:0;right:0;top:0;height:420px;'
          f'background:linear-gradient(180deg,#0A0603 0%,#1C1309 100%);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:404px;height:496px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 7px,#2A1A0F 44%,#130C06 100%);'
          f'box-shadow:0 -22px 54px rgba(0,0,0,0.6);"></div>')
    b += lamp_pool(1010, 140, 720, 500, 0.24)

    # the evidence box, shut, with the word behind its glass
    b += (f'<div style="position:absolute;left:78px;top:238px;width:468px;height:400px;'
          f'border-radius:5px;'
          f'background:linear-gradient(140deg,#4E2E1C 0%,{MAH} 40%,#25160D 100%);'
          f'box-shadow:0 30px 60px rgba(0,0,0,0.75), inset 0 0 44px rgba(0,0,0,0.45);">'
          + "".join(
              f'<span style="position:absolute;{pos}width:40px;height:40px;'
              f'border-{v}:2px solid {BRASS};border-{hh}:2px solid {BRASS};'
              f'opacity:0.62;"></span>'
              for pos, v, hh in [("left:12px;top:12px;", "top", "left"),
                                 ("right:12px;top:12px;", "top", "right"),
                                 ("left:12px;bottom:12px;", "bottom", "left"),
                                 ("right:12px;bottom:12px;", "bottom", "right")])
          + f'<div style="position:absolute;left:38px;right:38px;top:58px;height:146px;'
            f'border:2px solid {BRASS};border-radius:3px;'
            f'background:linear-gradient(168deg,{PAPER} 0%,{PAPER_W} 70%,{PAPER_D} 100%);'
            f'box-shadow:inset 0 3px 14px rgba(42,32,23,0.35), 0 3px 10px rgba(0,0,0,0.5);'
            f'display:flex;flex-direction:column;align-items:center;'
            f'justify-content:center;gap:8px;">'
            f'<div style="display:flex;align-items:center;gap:10px;">'
            f'<span style="font-family:{DISPLAY};font-size:44px;color:{INK};'
            f'letter-spacing:-0.012em;">treacherous</span>{key_mark(20)}</div>'
            f'<div style="font-family:{LABEL};font-size:11px;letter-spacing:0.15em;'
            f'color:{INK_M};">FROM LINE {SRC.find("treacherous piece of bog")}</div></div>'
          + f'<div style="position:absolute;left:38px;right:38px;top:228px;">'
            f'<p style="margin:0;font-family:{READ};font-size:17px;line-height:1.64;'
            f'color:#E3D4B2;">&ldquo;&hellip;they were all three engulfed in a '
            f'<span style="border-bottom:2px solid {OX_L};padding-bottom:2px;">treacherous'
            f'</span> piece of bog.&rdquo;</p></div>'
          + f'<div style="position:absolute;left:0;right:0;bottom:34px;display:flex;'
            f'justify-content:center;">'
            + _svg(58, 44,
                   f'<path d="M17 26 L17 17 C17 9, 22 4, 29 4 C36 4, 41 9, 41 17 L41 26"/>'
                   f'<rect x="10" y="26" width="38" height="16" rx="2" fill="{MAH_D}"/>',
                   stroke=BRASS, sw=2.4, extra='viewBox="0 0 58 44"')
            + f'</div></div>')

    # the lock itself, its meanings cut into the brass
    R = 190
    b += (f'<div style="position:absolute;left:{1016 - R}px;top:{438 - R}px;'
          f'filter:drop-shadow(-8px 16px 26px rgba(0,0,0,0.75));">{lock_face(0, 0, R)}</div>')

    b += (f'<div style="position:absolute;left:78px;top:76px;width:620px;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:42px;font-weight:400;'
          f'letter-spacing:-0.016em;color:{PAPER};">Turn it until the lock agrees.</h2>'
          f'<p style="margin:12px 0 0;font-family:{READ};font-size:17.5px;'
          f'font-style:italic;color:#C9B28A;max-width:60ch;">The box holds this '
          f'excerpt&rsquo;s clue. It opens on the meaning the sentence will carry &mdash; '
          f'not the one the word usually has.</p></div>')
    b += (f'<div style="position:absolute;left:78px;bottom:58px;display:flex;'
          f'align-items:center;gap:20px;">' + action_count(1)
          + f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.15em;'
            f'color:{GILT};opacity:0.85;">FIRST OF THREE</span>'
          + f'<span style="width:1px;height:20px;background:rgba(201,162,39,0.3);"></span>'
          + f'<span style="font-family:{READ};font-style:italic;font-size:14px;'
            f'color:#B49B70;">a wrong turn reopens the page with that line lit</span></div>')
    b += (f'<div style="position:absolute;right:56px;bottom:54px;display:flex;'
          f'align-items:center;gap:18px;">{cameo(64)}'
          f'<a href="Search.dc.html" style="font-family:{LABEL};font-size:15px;'
          f'letter-spacing:0.13em;color:{LAMP};text-decoration:none;'
          f'border:1px solid {BRASS};padding:12px 26px;border-radius:2px;'
          f'background:linear-gradient(180deg,rgba(201,162,39,0.2),rgba(201,162,39,0.05));">'
          f'TURN THE LOCK</a></div>')
    b += grain() + vignette(0.88)
    return skeleton(stage(b))


# ----------------------------------------------------- 7. search the room, from memory
def room_object(x, y, w, h, svg, name, found=False, rot=0, pool=0.34):
    """An object standing in the room, lit from the window at upper right."""
    ink = mark = ""
    if found:
        ink = (f'<span style="position:absolute;left:-16px;top:-14px;right:-16px;'
               f'bottom:-14px;border:3px solid {OX};border-radius:50%;'
               f'pointer-events:none;transform:rotate(-6deg);'
               f'box-shadow:0 0 14px rgba(110,36,51,0.55);"></span>')
        mark = (f'<span style="position:absolute;right:-24px;top:-22px;width:27px;'
                f'height:27px;border-radius:50%;background:{OX};display:flex;'
                f'align-items:center;justify-content:center;'
                f'box-shadow:0 2px 9px rgba(0,0,0,0.7);">{tick(15, PAPER)}</span>')
    return (
        f'<button type="button" aria-label="{name}" style="all:unset;cursor:pointer;'
        f'position:absolute;left:{x}px;top:{y}px;width:{w}px;height:{h}px;'
        f'transform:rotate({rot}deg);">'
        # the shadow is thrown down and to the LEFT, away from the window
        f'<span style="position:absolute;left:-14%;bottom:-13px;width:{int(w*1.15)}px;'
        f'height:26px;border-radius:50%;pointer-events:none;'
        f'transform:skewX(-26deg);background:radial-gradient(closest-side,'
        f'rgba(0,0,0,0.72),rgba(0,0,0,0) 100%);"></span>'
        # light catching the surface it stands on, brighter on the window side
        f'<span style="position:absolute;right:-6%;bottom:-10px;width:{int(w*0.8)}px;'
        f'height:18px;border-radius:50%;pointer-events:none;'
        f'background:radial-gradient(closest-side,rgba(245,207,134,{pool}),'
        f'rgba(245,207,134,0) 100%);"></span>'
        f'<span style="position:absolute;inset:0;display:flex;align-items:center;'
        f'justify-content:center;filter:drop-shadow(-4px 5px 7px rgba(0,0,0,0.75));">'
        f'{svg}</span>{ink}{mark}</button>'
    )


def frame_search():
    b = ""
    b += (f'<div style="position:absolute;inset:0;'
          f'background:radial-gradient(1240px 880px at 64% 40%,#3C2B19 0%,#20150C 48%,'
          f'#0D0804 86%);"></div>')
    # the window, still open on the October afternoon
    b += (f'<div style="position:absolute;left:986px;top:126px;width:296px;height:344px;'
          f'border:9px solid {MAH_D};filter:blur(0.7px);'
          f'background:linear-gradient(180deg,#414A41 0%,#333B34 48%,#232A23 100%);'
          f'box-shadow:inset 0 0 40px rgba(0,0,0,0.62),0 0 80px rgba(245,207,134,0.10);"></div>')
    b += (f'<div style="position:absolute;left:1130px;top:135px;width:7px;height:336px;'
          f'background:{MAH_D};filter:blur(0.7px);"></div>')
    # the shelf the teacup stands on, and the mantel shelf itself
    b += (f'<div style="position:absolute;left:640px;top:366px;width:268px;height:13px;'
          f'border-radius:2px;background:linear-gradient(180deg,{MAH_L},{MAH} 46%,{MAH_D});'
          f'box-shadow:0 10px 26px rgba(0,0,0,0.66);"></div>')
    b += (f'<div style="position:absolute;left:660px;top:379px;width:228px;height:150px;'
          f'filter:blur(3px);opacity:0.55;'
          f'background:linear-gradient(180deg,{MAH_D},rgba(13,8,4,0));"></div>')
    # the bookshelf at the far left, deep out of focus
    b += (f'<div style="position:absolute;left:36px;top:110px;width:340px;height:398px;'
          f'filter:blur(4px);opacity:0.68;border-radius:3px;'
          f'background:linear-gradient(100deg,{MAH_L} 0%,{MAH} 32%,#170F08 100%);'
          f'box-shadow:inset 0 0 46px rgba(0,0,0,0.72);"></div>')
    b += ("".join(
        f'<div style="position:absolute;left:{66 + i*46}px;top:150px;width:34px;'
        f'height:{128 + (i % 3) * 14}px;filter:blur(3.6px);opacity:0.5;border-radius:2px;'
        f'background:linear-gradient(95deg,{CLOTH[(i + 3) % len(CLOTH)]},rgba(0,0,0,0.5));'
        f'"></div>' for i in range(6)))
    # the hall table the stick and hat were left on
    b += (f'<div style="position:absolute;left:214px;top:672px;width:236px;height:12px;'
          f'border-radius:2px;background:linear-gradient(180deg,{MAH_L},{MAH} 48%,{MAH_D});'
          f'box-shadow:0 10px 24px rgba(0,0,0,0.6);"></div>')
    # the chair the coat is thrown over
    b += (f'<div style="position:absolute;left:782px;top:498px;width:206px;height:246px;'
          f'filter:blur(1.6px);opacity:0.92;'
          f'background:linear-gradient(170deg,#452A1B 0%,#1C1108 100%);'
          f'border-radius:38px 38px 4px 4px;box-shadow:0 20px 44px rgba(0,0,0,0.65);"></div>')
    # the desk
    b += (f'<div style="position:absolute;left:0;right:0;top:754px;height:146px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 6px,#271810 46%,#120B06 100%);'
          f'box-shadow:0 -16px 40px rgba(0,0,0,0.58);"></div>')
    # one directional wash from the window, one from the lamp off-frame right
    b += lamp_pool(1140, 300, 660, 470, 0.20)
    b += lamp_pool(560, 700, 620, 330, 0.13)

    # two already in the file, one still out there, three honest decoys
    b += room_object(1034, 382, 168, 142, GUNS, "Three guns leaning by the window",
                     found=True, pool=0.5)
    b += room_object(806, 486, 128, 160, COAT, "A white coat over the chair",
                     found=True, rot=-3, pool=0.44)
    b += room_object(512, 606, 200, 142, SPANIEL, "A tired brown spaniel", pool=0.52)
    b += room_object(252, 534, 168, 140, STICK_HAT, "A stick and a hat", rot=1, pool=0.34)
    b += room_object(132, 650, 154, 116, LETTERS, "A bundle of letters", rot=-2, pool=0.3)
    b += room_object(700, 262, 126, 108, TEACUP, "A teacup on the mantel", pool=0.36)

    b += (f'<div style="position:absolute;left:66px;top:74px;width:624px;'
          f'padding:26px 30px;box-sizing:border-box;'
          f'background:linear-gradient(170deg,rgba(17,11,6,0.9),rgba(17,11,6,0.62));'
          f'border-left:1px solid {BRASS};">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:40px;font-weight:400;'
          f'line-height:1.14;letter-spacing:-0.016em;color:{PAPER};">'
          f'Three men crossed the lawn.<br>Find what they carried.</h2>'
          f'<p style="margin:14px 0 0;font-family:{READ};font-size:17.5px;font-style:italic;'
          f'color:#CDB68C;">Three things to find. Not everything in this room came in with '
          f'them.</p></div>')
    b += (f'<div style="position:absolute;right:66px;top:88px;width:250px;text-align:right;">'
          f'<div style="font-family:{LABEL};font-size:11px;letter-spacing:0.15em;'
          f'color:{GILT};opacity:0.85;">IN THE FILE</div>'
          f'<div style="margin-top:12px;font-family:{READ};font-size:16.5px;line-height:1.85;'
          f'color:#E6D5AE;">the guns<br>the white coat<br>'
          f'<span style="color:#B09A72;font-style:italic;">one still missing</span></div>'
          f'</div>')
    b += (f'<div style="position:absolute;left:66px;bottom:52px;display:flex;'
          f'align-items:center;gap:20px;">' + action_count(2)
          + f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.15em;'
            f'color:{GILT};opacity:0.85;">SECOND OF THREE</span></div>')
    b += (f'<div style="position:absolute;right:66px;bottom:48px;display:flex;'
          f'align-items:center;gap:18px;">'
          f'<span style="font-family:{READ};font-style:italic;font-size:15px;color:#CDB68C;'
          f'text-align:right;max-width:24ch;">You walked past all of these<br>'
          f'on your way in.</span>{cameo(68)}'
          f'<a href="Cite.dc.html" style="font-family:{LABEL};font-size:14px;'
          f'letter-spacing:0.13em;color:{LAMP};text-decoration:none;border:1px solid {BRASS};'
          f'padding:12px 24px;border-radius:2px;'
          f'background:linear-gradient(180deg,rgba(201,162,39,0.2),rgba(201,162,39,0.05));">'
          f'NEXT</a></div>')
    b += grain() + vignette(0.84)
    return skeleton(stage(b))


# ------------------------------------------------------------- 8. cite the line
def frame_cite():
    rows = ""
    PROVE = SRC.find("Their bodies were never recovered")
    WRONG = SRC.find("They never came back")
    for n, text, para in LINES:
        extra, margin, after = "", "", ""
        if n == PROVE:
            extra = (f'border-bottom:2.5px solid {OX};padding-bottom:1px;')
            margin = (f'<span style="position:absolute;left:-26px;top:3px;">{nib(20)}</span>')
        if n == WRONG:
            extra = (f'text-decoration:line-through;text-decoration-color:rgba(110,36,51,0.55);'
                     f'text-decoration-thickness:1.5px;color:{INK_L};')
            # the inkwell writes the reason in the margin, inside this page
            after = (f'<div style="margin:2px 0 6px 46px;font-family:{READ};font-style:italic;'
                     f'font-size:12.5px;color:{OX};line-height:1.42;max-width:44ch;'
                     f'border-left:1px solid rgba(110,36,51,0.4);padding-left:12px;">'
                     f'this says they did not return &mdash; not that they were never found'
                     f'</div>')
        rows += (f'<div style="position:relative;display:flex;gap:22px;align-items:baseline;">'
                 f'{margin}'
                 f'<span style="width:22px;text-align:right;flex-shrink:0;font-family:{LABEL};'
                 f'font-size:11px;color:{OX if n == PROVE else INK_M};position:relative;top:-2px;">'
                 f'{n}</span>'
                 f'<span style="font-family:{READ};font-size:18.5px;line-height:1.74;'
                 f'color:{INK};{extra}">{text}</span></div>{after}')
    left = (
        f'<div style="padding:46px 26px 0 30px;">'
        f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
        f'padding-bottom:12px;margin-bottom:20px;border-bottom:1px solid rgba(90,74,56,0.3);">'
        f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
        f'color:{INK_M};">EXCERPT {SRC._ROMAN[SRC.READ_NO-1]}, REOPENED</span>'
        f'<span style="font-family:{READ};font-style:italic;font-size:12px;color:{INK_L};">'
        f'second attempt</span></div>'
        f'<div style="position:relative;">'
        f'<div style="position:absolute;left:31px;top:2px;bottom:0;width:1px;'
        f'background:rgba(110,36,51,0.2);"></div>{rows}</div></div>'
    )
    right = (
        f'<div style="padding:52px 66px 0 58px;position:relative;height:100%;'
        f'box-sizing:border-box;">'
        f'<div style="position:absolute;left:58px;right:66px;top:0;bottom:0;'
        f'background:repeating-linear-gradient(180deg,rgba(90,74,56,0) 0 33px,'
        f'rgba(90,74,56,0.16) 33px 34px);pointer-events:none;"></div>'
        f'<h3 style="margin:0;font-family:{DISPLAY};font-size:27px;font-weight:500;'
        f'color:{INK};">The case notes</h3>'
        f'<p style="margin:16px 0 0;font-family:{READ};font-size:16px;color:{INK_M};'
        f'font-style:italic;line-height:1.7;">Whatever you cite is written in here, and '
        f'this is what you will have to work with at the end.</p>'
        f'<div style="margin-top:26px;padding-top:18px;border-top:1px solid rgba(90,74,56,0.3);">'
        + "".join(
            f'<div style="display:flex;gap:14px;margin-bottom:17px;">'
            f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.09em;'
            f'color:{OX};flex-shrink:0;width:52px;padding-top:4px;">LINE {ln}</span>'
            f'<span style="font-family:{READ};font-style:italic;font-size:16.5px;'
            f'line-height:1.6;color:{OX};">{txt}</span></div>'
            for ln, txt in [
                (SRC.find("Then you know practically nothing about my aunt"),
                 SRC.quote("Then you know practically nothing about my aunt?")),
                (SRC.find("indicating a large French window"),
                 SRC.quote("indicating a large French window")),
            ])
        + f'<div style="display:flex;gap:14px;margin-bottom:6px;">'
          f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.09em;'
          f'color:{OX};flex-shrink:0;width:52px;padding-top:4px;">LINE {PROVE}</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:16.5px;'
          f'line-height:1.6;color:{OX};border-bottom:1px solid rgba(110,36,51,0.4);">'
          f'{SRC.quote("Their bodies were never recovered.")}'
          f'<span style="display:inline-block;width:2px;height:17px;background:{OX};'
          f'margin-left:3px;position:relative;top:3px;"></span></span></div>'
        + f'</div>'
        f'<div style="position:absolute;left:58px;right:66px;bottom:44px;">'
        f'<div style="height:1px;background:{INK_M};opacity:0.28;"></div>'
        f'<div style="margin-top:18px;display:flex;align-items:baseline;'
        f'justify-content:space-between;">'
        f'<a href="Reconstruct.dc.html" style="font-family:{LABEL};font-size:14px;'
        f'letter-spacing:0.12em;color:{OX};text-decoration:none;'
        f'border-bottom:1.5px solid {OX};padding-bottom:3px;">WRITE IT IN</a>'
        f'<span style="font-family:{READ};font-size:12.5px;color:{INK_L};">'
        f'three clues in the file</span></div></div></div>'
    )
    b = room_edges() + lamp_pool(700, 40, 700, 380, 0.16)
    b += (f'<div style="position:absolute;left:0;right:0;top:26px;text-align:center;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:34px;font-weight:400;'
          f'color:{PAPER};letter-spacing:-0.014em;">'
          f'Which line proves the bodies were never found?</h2></div>')
    b += spread(left, right, top=92, left=186, w=1068, h=712)
    b += (f'<div style="position:absolute;left:66px;bottom:36px;display:flex;'
          f'align-items:center;gap:18px;">' + action_count(3)
          + f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.15em;'
            f'color:{GILT};opacity:0.8;">THIRD OF THREE</span></div>')
    b += grain() + vignette(0.74)
    return skeleton(stage(b))


# --------------------------------------------------------- 9. reconstruct the case
# The whole passage, not one excerpt. Two things are asked: who these people were
# (their names, from memory) and which clues actually prove what happened. Every
# decoy is a true line from the story that simply does not prove it.

NAME_SLUGS = ["Vera", "Mrs. Sappleton", "Framton Nuttel", "Bertie", "Ronnie",
              "never named"]

SITTERS = [
    ("girl",      "Vera",        "fifteen, and<br>entirely calm",  True),
    ("lady",      "Mrs. Sappleton", "down at last,<br>wanting tea", True),
    ("bare",      None,          "here with a letter<br>from his sister", False),
    ("capped",    None,          "came in through<br>the window,<br>muddy to the eyes", False),
]

# Seven candidates. Four of them prove she invented it; three are true lines
# that do not. The fourth proving clue is the hardest in the story: she put a
# real song into the lie, and the real man sings it when he walks back in.
CLUES = [
    ("Then you know practically nothing about my aunt?", True,
     "she made sure you could not check it"),
    ("Romance at short notice was her speciality.", True,
     "she does this habitually"),
    ("three figures were walking across the lawn", True,
     "they were never dead at all"),
    ("singing 'Bertie, why do you bound?'", True,
     "she put a real song into the story"),
    ("They never came back.", False, "this is the invention itself"),
    ("indicating a large French window", False, "the narrator, not her"),
    ("became falteringly human", False, "it sounded like sincerity"),
]
N_PROVING = sum(1 for _, r, _ in CLUES if r)


def nameplate(name):
    """Brass, engraved when filled, empty and waiting when not."""
    if name:
        return (f'<span style="display:block;margin-top:9px;padding:5px 8px;'
                f'border-radius:1px;text-align:center;'
                f'background:linear-gradient(176deg,#F0DDA6,{GILT} 58%,{BRASS});'
                f'font-family:{LABEL};font-size:11.5px;letter-spacing:0.06em;'
                f'color:#241C05;box-shadow:0 2px 6px rgba(0,0,0,0.5);">{name}</span>')
    return (f'<span style="display:block;margin-top:9px;height:25px;border-radius:1px;'
            f'background:linear-gradient(176deg,#3A2E12,#241C0B);'
            f'box-shadow:inset 0 2px 5px rgba(0,0,0,0.8),'
            f'inset 0 -1px 0 rgba(224,196,120,0.14);"></span>')


def sitter(profile, name, note, filled):
    return (f'<button type="button" style="all:unset;cursor:pointer;width:148px;'
            f'display:block;text-align:center;">'
            f'{cameo(64, profile=profile)}'
            f'{nameplate(name)}'
            f'<span style="display:block;margin-top:7px;font-family:{READ};'
            f'font-style:italic;font-size:13px;line-height:1.38;color:#A58F66;">'
            f'{note}</span></button>')


def clue_card(phrase, right, why, pinned=True):
    ring = (f'box-shadow:0 0 0 2.5px {OX}, 0 8px 20px rgba(0,0,0,0.55);' if pinned
            else 'box-shadow:0 6px 16px rgba(0,0,0,0.5);')
    pin = (f'<span style="position:absolute;right:-9px;top:-9px;width:23px;height:23px;'
           f'border-radius:50%;background:{OX};display:flex;align-items:center;'
           f'justify-content:center;box-shadow:0 2px 7px rgba(0,0,0,0.65);">'
           f'{tick(13, PAPER)}</span>') if pinned else ""
    n = SRC.find(phrase)
    return (f'<button type="button" style="all:unset;cursor:pointer;position:relative;'
            f'width:307px;box-sizing:border-box;padding:11px 14px 12px;border-radius:2px;'
            f'background:linear-gradient(172deg,#F4EAD2,{PAPER_W});{ring}">'
            f'<span style="display:flex;align-items:baseline;gap:9px;'
            f'font-family:{LABEL};font-size:11px;letter-spacing:0.08em;color:{OX};">'
            f'<span>LINE {n}</span><span style="opacity:0.6;">EXCERPT '
            f'{SRC.excerpt_roman(n)}</span></span>'
            f'<span style="display:block;margin-top:7px;font-family:{READ};'
            f'font-style:italic;font-size:15px;line-height:1.42;color:{INK};'
            f'text-align:left;">{SRC.quote(phrase)}</span>'
            f'<span style="display:block;margin-top:8px;font-family:{READ};'
            f'font-size:13px;color:{INK_M};text-align:left;">'
            f'{why if pinned else "&mdash; " + why}</span>{pin}</button>')


def frame_reconstruct():
    b = (f'<div style="position:absolute;inset:0;'
         f'background:radial-gradient(1240px 880px at 44% 26%,#38281B 0%,#1C1309 48%,'
         f'#0C0805 86%);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:640px;height:260px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 6px,#251710 46%,'
          f'#110A05 100%);"></div>')
    b += lamp_pool(760, 110, 800, 440, 0.2)
    b += (f'<div style="position:absolute;left:66px;top:50px;width:900px;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:50px;font-weight:400;'
          f'letter-spacing:-0.02em;color:{PAPER};">Reconstruct the case.</h2>'
          f'<p style="margin:11px 0 0;font-family:{READ};font-size:18px;font-style:italic;'
          f'color:#C9B28A;max-width:64ch;">Not one excerpt &mdash; the whole afternoon. '
          f'The book stays shut for this.</p></div>')

    chosen_now = [p for p, r, _ in CLUES if r][:N_PROVING - 1]

    # who was in the house: the names are recalled, not shown
    b += (f'<div style="position:absolute;left:66px;top:176px;width:636px;">'
          f'<div style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
          f'color:{GILT};opacity:0.85;">WHO WAS IN THE HOUSE &mdash; NAME THEM</div>'
          f'<div style="margin-top:20px;display:flex;gap:14px;">'
          + "".join(sitter(p, n, note, f) for p, n, note, f in SITTERS)
          + f'</div></div>')
    b += (f'<div style="position:absolute;left:66px;top:432px;width:636px;'
          f'padding-top:18px;border-top:1px solid rgba(201,162,39,0.22);">'
          f'<div style="font-family:{LABEL};font-size:11px;letter-spacing:0.14em;'
          f'color:{GILT};opacity:0.75;">THE NAMES YOU WROTE DOWN</div>'
          f'<div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:9px;">'
          + "".join(
              f'<span style="padding:7px 13px;border-radius:1px;font-family:{READ};'
              f'font-size:15px;'
              + (f'background:rgba(201,162,39,0.10);color:#7A6848;'
                 f'box-shadow:inset 0 0 0 1px rgba(201,162,39,0.2);'
                 if nm in ("Vera", "Mrs. Sappleton") else
                 f'background:linear-gradient(176deg,#F2E8D0,{PAPER_W});color:{INK};'
                 f'box-shadow:0 3px 9px rgba(0,0,0,0.5);')
              + f'">{nm}</span>' for nm in NAME_SLUGS)
          + f'</div>'
          f'<p style="margin:14px 0 0;font-family:{READ};font-style:italic;'
          f'font-size:13.5px;color:#A58F66;">One of these is her brother, who crossed the lawn and never sat down. One is only a name in a song she was singing. And one is not a name at all.</p></div>')

    # the clues, drawn from across the whole passage
    b += (f'<div style="position:absolute;left:734px;top:168px;width:640px;">'
          f'<div style="display:flex;align-items:baseline;justify-content:space-between;">'
          f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
          f'color:{GILT};opacity:0.85;">WHICH CLUES PROVE SHE INVENTED IT</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
          f'color:#A58F66;">{N_PROVING} of these {len(CLUES)} do</span></div>'
          f'<div style="margin-top:16px;display:flex;flex-wrap:wrap;gap:11px;">'
          + "".join(clue_card(p, r, w, pinned=(p in chosen_now)) for p, r, w in CLUES)
          + f'</div></div>')

    # the chain the chosen clues are building, and the gap still in it
    chosen = [p for p, r, _ in CLUES if r][:N_PROVING - 1]
    chits = ""
    for k, phrase in enumerate(chosen):
        n = SRC.find(phrase)
        chits += (f'<span style="position:relative;padding:11px 15px 12px;'
                  f'border-radius:2px;background:linear-gradient(174deg,#F2E8D0,{PAPER_W});'
                  f'box-shadow:0 5px 14px rgba(0,0,0,0.55);max-width:290px;">'
                  f'<span style="position:absolute;left:50%;top:-6px;width:11px;height:11px;'
                  f'margin-left:-5.5px;border-radius:50%;'
                  f'background:radial-gradient(circle at 36% 32%,#F2E3B4,{BRASS});'
                  f'box-shadow:0 1px 4px rgba(0,0,0,0.6);"></span>'
                  f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.08em;'
                  f'color:{OX};">LINE {n}</span>'
                  f'<span style="display:block;margin-top:4px;font-family:{READ};'
                  f'font-style:italic;font-size:14px;line-height:1.4;color:{INK};">'
                  f'{SRC.quote(phrase)}</span></span>')
        if k < len(chosen) - 1:
            chits += (f'<span style="align-self:center;font-family:{DISPLAY};font-size:22px;'
                      f'color:{BRASS};opacity:0.6;">&amp;</span>')
    chits += (f'<span style="align-self:center;font-family:{DISPLAY};font-size:22px;'
              f'color:{BRASS};opacity:0.6;">&amp;</span>'
              f'<span style="align-self:stretch;min-width:186px;border-radius:2px;'
              f'display:flex;align-items:center;justify-content:center;'
              f'background:rgba(0,0,0,0.3);'
              f'box-shadow:inset 0 2px 7px rgba(0,0,0,0.75),'
              f'inset 0 -1px 0 rgba(224,196,120,0.12);">'
              f'<span style="width:11px;height:11px;border-radius:50%;'
              f'background:radial-gradient(circle at 36% 32%,#B79A55,#6B5314);'
              f'box-shadow:0 1px 3px rgba(0,0,0,0.7);"></span></span>')
    b += (f'<div style="position:absolute;left:66px;right:66px;top:600px;'
          f'padding-top:20px;border-top:1px solid rgba(201,162,39,0.22);">'
          f'<div style="display:flex;align-items:baseline;justify-content:space-between;">'
          f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
          f'color:{GILT};opacity:0.85;">THE CHAIN YOU ARE BUILDING</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
          f'color:#A58F66;">a bare pin means a clue you have not found yet</span></div>'
          f'<div style="margin-top:18px;display:flex;gap:12px;align-items:stretch;">'
          f'{chits}</div></div>')
    b += (f'<div style="position:absolute;left:66px;bottom:52px;display:flex;'
          f'align-items:center;gap:22px;">'
          f'<a href="Statement.dc.html" style="font-family:{LABEL};font-size:15px;'
          f'letter-spacing:0.13em;color:{LAMP};text-decoration:none;'
          f'border:1px solid {BRASS};padding:13px 28px;border-radius:2px;'
          f'background:linear-gradient(180deg,rgba(201,162,39,0.2),'
          f'rgba(201,162,39,0.05));">WRITE THE CONCLUSION</a>'
          f'<span style="font-family:{READ};font-style:italic;font-size:14.5px;'
          f'color:#C9B28A;max-width:42ch;">Two names still blank, and one of the four clues still to find.</span></div>')
    b += (f'<div style="position:absolute;right:70px;bottom:46px;">{cameo(64)}</div>')
    b += grain() + vignette(0.86)
    return skeleton(stage(b))


# ------------------------------------------------------------- 10. the case report
def verdict_rail():
    steps = [("MASTER DETECTIVE", "solved, 90% and a clean chain", False),
             ("CASE CLOSED", "solved, evidence holds up", True),
             ("EVIDENCE REVIEW", "solved, gaps in the file", False),
             ("CASE REOPENED", "not solved yet", False)]
    out = ""
    for name, note, now in steps:
        dot = (f'width:17px;height:17px;background:{LAMP};'
               f'box-shadow:0 0 0 2px {BRASS},0 0 18px rgba(245,207,134,0.7);'
               if now else
               f'width:11px;height:11px;background:rgba(0,0,0,0.45);'
               f'box-shadow:0 0 0 1.5px rgba(201,162,39,0.36);')
        col = PAPER if now else "#A58F66"
        weight = "500" if now else "400"
        out += (f'<div style="display:flex;align-items:center;gap:16px;height:52px;">'
                f'<span style="border-radius:50%;flex-shrink:0;{dot}"></span>'
                f'<span><span style="font-family:{LABEL};font-size:12px;'
                f'letter-spacing:0.13em;color:{col};font-weight:{weight};">{name}</span>'
                f'<span style="display:block;font-family:{READ};font-style:italic;'
                f'font-size:13px;color:#7E6A50;margin-top:2px;">{note}</span></span></div>')
    return (f'<div style="position:relative;padding-left:8px;">'
            f'<div style="position:absolute;left:13px;top:12px;bottom:12px;width:2px;'
            f'background:linear-gradient(180deg,{BRASS},rgba(201,162,39,0.2));'
            f'opacity:0.55;"></div>{out}</div>')


def frame_report():
    b = (f'<div style="position:absolute;inset:0;'
         f'background:radial-gradient(1100px 800px at 40% 26%,#34261A 0%,#1B1208 50%,'
         f'#0B0704 88%);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:640px;height:260px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 6px,#241610 44%,#100A05 100%);'
          f'"></div>')
    b += lamp_pool(520, 150, 700, 460, 0.22)
    # the verdict, letterpressed
    b += (f'<div style="position:absolute;left:74px;top:70px;width:660px;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:82px;font-weight:400;'
          f'line-height:0.98;letter-spacing:-0.028em;color:{GILT};'
          f'text-shadow:0 2px 28px rgba(245,207,134,0.2);">Case Closed</h2>'
          f'<div style="margin-top:20px;width:190px;height:1px;background:{OX};'
          f'opacity:0.7;"></div>'
          f'<p style="margin:22px 0 0;font-family:{READ};font-size:20px;line-height:1.66;'
          f'color:#E2D2AE;max-width:40ch;">You solved it, and the evidence behind it holds '
          f'up. You answered <span style="font-family:{DISPLAY};font-size:23px;'
          f'color:{PAPER};">18 of 22</span> first attempts correctly.</p>'
          f'<p style="margin:16px 0 0;font-family:{READ};font-size:17px;line-height:1.7;'
          f'color:#B7A07A;max-width:44ch;">Twice you gave the right answer and cited the '
          f'wrong line. That gap is the thing worth closing next.</p>'
          f'<p style="margin:26px 0 0;font-family:{READ};font-style:italic;font-size:14.5px;'
          f'color:#A58F66;">You read at 148 words a minute. That is not part of your score.</p>'
          f'</div>')
    # the ladder, so the reader sees where they landed without being failed
    b += (f'<div style="position:absolute;right:80px;top:96px;width:400px;">'
          f'{verdict_rail()}</div>')
    # the coach: a live call, on performance only, and it says so
    b += (f'<div style="position:absolute;left:74px;top:566px;width:790px;'
          f'box-sizing:border-box;padding:28px 32px;border-radius:3px;'
          f'background:linear-gradient(168deg,#F4EAD2 0%,{PAPER_W} 74%,{PAPER_D} 100%);'
          f'box-shadow:0 26px 54px rgba(0,0,0,0.7);">'
          f'<div style="display:flex;gap:24px;align-items:flex-start;">'
          f'<div style="flex-shrink:0;">{cameo(84)}</div>'
          f'<div>'
          f'<p style="margin:0;font-family:{READ};font-size:19.5px;line-height:1.68;'
          f'color:{INK};font-style:italic;">&ldquo;You missed three inference questions, and '
          f'in every one the proving line sat in the last two sentences of the excerpt. You '
          f'are deciding what a passage means before you have finished reading it. On the '
          f'next case, hold your answer until the final line.&rdquo;</p>'
          f'<div style="margin-top:18px;padding-top:14px;'
          f'border-top:1px solid rgba(90,74,56,0.3);display:flex;align-items:center;gap:10px;">'
          f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.13em;'
          f'color:{INK_M};">INSPECTOR INKWELL WAS TOLD HOW YOU ANSWERED &mdash; '
          f'HE WAS NEVER TOLD THE STORY</span></div></div></div></div>')
    # the file itself: every clue the reader cited, and which two carried the solve
    clues = [(SRC.find("Then you know practically nothing about my aunt"),
              "Then you know practically nothing about my aunt?", True, "she said it"),
             (SRC.find("Romance at short notice"),
              "Romance at short notice was her speciality.", True, "the narrator"),
             (SRC.find("They never came back"), "They never came back.", False,
              "she said it &mdash; and it was false"),
             (SRC.find("indicating a large French window"),
              "indicating a large French window", False,
              "the narrator, not her &mdash; true, but no proof")]
    rows = ""
    for ln, txt, used, who in clues:
        col = PAPER if used else "#9C875F"
        bar = OX if used else "rgba(201,162,39,0.28)"
        note = who
        rows += (f'<div style="display:flex;align-items:baseline;gap:14px;padding:8px 0;'
                 f'border-top:1px solid rgba(201,162,39,0.16);">'
                 f'<span style="width:3px;height:26px;background:{bar};flex-shrink:0;'
                 f'border-radius:2px;"></span>'
                 f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.1em;'
                 f'color:{GILT};opacity:0.8;width:46px;flex-shrink:0;">LINE {ln}</span>'
                 f'<span style="flex-grow:1;font-family:{READ};font-style:italic;'
                 f'font-size:15.5px;line-height:1.45;color:{col};">&ldquo;{txt}&rdquo;</span>'
                 f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
                 f'color:{"#C6AE80" if used else "#9C875F"};width:116px;flex-shrink:0;'
                 f'text-align:right;line-height:1.35;">{note}</span></div>')
    b += (f'<div style="position:absolute;right:80px;top:326px;width:400px;">'
          f'<div style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
          f'color:{GILT};opacity:0.85;margin-bottom:6px;">THE FOUR CLUES YOU CITED, AND WHOSE WORDS THEY ARE</div>'
          f'{rows}</div>')

    # the two ways out, retry framed as revisiting
    b += (f'<div style="position:absolute;right:80px;bottom:78px;width:400px;'
          f'display:flex;flex-direction:column;gap:14px;align-items:flex-end;">'
          f'<a href="Reread.dc.html" style="font-family:{LABEL};font-size:15px;'
          f'letter-spacing:0.13em;color:{LAMP};text-decoration:none;border:1px solid {BRASS};'
          f'padding:14px 30px;border-radius:2px;'
          f'background:linear-gradient(180deg,rgba(201,162,39,0.2),rgba(201,162,39,0.05));">'
          f'READ IT AGAIN, KNOWING</a>'
          f'<a href="Main.dc.html" style="font-family:{LABEL};font-size:14px;'
          f'letter-spacing:0.12em;color:{GILT};text-decoration:none;'
          f'border-bottom:1px solid rgba(201,162,39,0.5);padding-bottom:3px;">'
          f'TAKE DOWN ANOTHER</a>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13.5px;'
          f'color:#A58F66;text-align:right;max-width:30ch;margin-top:4px;">Revisiting does '
          f'not change your score. The first answer is the one already written down.</span>'
          f'</div>')
    b += grain() + vignette(0.86)
    return skeleton(stage(b))
