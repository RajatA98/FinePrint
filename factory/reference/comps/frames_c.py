# Frames 10 and 12: the closing statement set from collected words, and the re-read.
from world import *
from world import _svg
import source as SRC


# --------------------------------------------------- 10. the closing statement
def slug(word, used=False, case="I", w=None):
    """A piece of foundry type. The vocabulary comes back as metal you set in a line."""
    width = w or max(96, int(len(word) * 10.4) + 34)
    face_bg = (f'linear-gradient(172deg,#D8CBAC,#C3B392)' if used
               else f'linear-gradient(172deg,#F4EAD2,{PAPER_W} 70%,{PAPER_D})')
    col = "#4A3F2C" if used else INK
    tickmark = (f'<span style="position:absolute;right:5px;top:4px;">{tick(13, OX)}</span>'
                if used else "")
    return (
        f'<button type="button" style="all:unset;cursor:pointer;position:relative;'
        f'display:inline-block;width:{width}px;padding:9px 0 13px;text-align:center;'
        f'border-radius:2px;background:linear-gradient(176deg,#4C3220,{MAH} 46%,#1C1108);'
        f'box-shadow:0 5px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(224,196,120,0.3);">'
        f'<span style="display:block;margin:0 5px;padding:6px 4px;border-radius:1px;'
        f'background:{face_bg};font-family:{READ};font-size:16px;color:{col};'
        f'box-shadow:inset 0 1px 3px rgba(42,32,23,0.3);">{word}</span>'
        f'<span style="display:block;margin:6px auto 0;font-family:{LABEL};font-size:11px;'
        f'letter-spacing:0.1em;color:{GILT};opacity:0.72;">EXCERPT {case}</span>'
        f'{tickmark}</button>'
    )


def set_slot(word=None, width=210):
    """A word seated in the line, or the recess waiting for one."""
    if word:
        return (f'<span style="display:inline-block;padding:2px 14px 4px;margin:0 3px;'
                f'font-family:{READ};font-size:25px;color:{INK};'
                f'background:linear-gradient(176deg,rgba(201,162,39,0.20),'
                f'rgba(201,162,39,0.07));'
                f'border-bottom:2px solid {OX};'
                f'box-shadow:inset 0 1px 4px rgba(42,32,23,0.22);">{word}</span>')
    return (f'<span style="display:inline-block;width:{width}px;height:34px;margin:0 3px;'
            f'position:relative;top:6px;border-bottom:2px solid {OX};'
            f'background:linear-gradient(180deg,rgba(42,32,23,0.14),rgba(42,32,23,0.04));'
            f'box-shadow:inset 0 2px 6px rgba(42,32,23,0.3);border-radius:1px;"></span>')


# every word the reader collected, with the excerpt each came out of, looked up
# in the source rather than typed here
WORD_PHRASES = [
    ("self-possessed", "self-possessed young lady of fifteen", True),
    ("delusion",       "widespread delusion",                  False),
    ("treacherous",    "treacherous piece of bog",             False),
    ("engulfed",       "three engulfed in a treacherous",      False),
    ("recovered",      "Their bodies were never recovered",    False),
    ("endeavoured",    "endeavoured",                          False),
    ("imminent",       "imminent collision",                   False),
    ("infirmities",    "infirmities",                          False),
    ("discounting",    "discounting",                          False),
    ("chanted",        "chanted out of the dusk",              False),
]
WORDS = [(w, used, SRC.roman_of_phrase(ph)) for w, ph, used in WORD_PHRASES]


def frame_statement():
    b = (f'<div style="position:absolute;inset:0;'
         f'background:radial-gradient(1180px 840px at 38% 28%,#36271A 0%,#1C1309 48%,'
         f'#0C0805 86%);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:0;height:900px;'
          f'background:linear-gradient(180deg,rgba(76,50,32,0) 0%,rgba(58,36,22,0.5) 62%,'
          f'#170F08 100%);"></div>')
    b += (f'<div style="position:absolute;left:0;right:0;top:764px;height:136px;'
          f'background:linear-gradient(180deg,{MAH_L} 0px,{MAH} 6px,#271810 46%,'
          f'#110A05 100%);box-shadow:0 -18px 44px rgba(0,0,0,0.6);"></div>')
    b += (f'<div style="position:absolute;left:-40px;bottom:-30px;width:280px;height:150px;'
          f'filter:blur(8px);opacity:0.8;border-radius:10px;transform:rotate(-4deg);'
          f'background:linear-gradient(160deg,{MAH} 0%,#120B06 78%);"></div>')
    b += shallow_room('right', desk=False, lamp=(None, None))
    b += lamp_pool(430, 210, 700, 520, 0.22)

    # the report itself, on the desk under the lamp
    statement = (
        f'<p style="margin:0;font-family:{READ};font-size:25px;line-height:1.95;'
        f'color:{INK};">The niece was {set_slot("self-possessed")} from the very first '
        f'line. The tragedy was her own invention, and Mr. Nuttel left this house under '
        f'a {set_slot(None, 176)} of his own making.</p>'
    )
    b += (f'<div style="position:absolute;left:74px;top:112px;width:760px;height:642px;'
          f'box-sizing:border-box;padding:46px 52px;border-radius:3px;'
          f'background:linear-gradient(172deg,#F4EAD2 0%,{PAPER} 42%,{PAPER_W} 100%);'
          f'box-shadow:0 30px 66px rgba(0,0,0,0.72);">'
          f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
          f'padding-bottom:14px;border-bottom:1px solid rgba(78,63,45,0.34);">'
          f'<span style="font-family:{LABEL};font-size:12px;letter-spacing:0.16em;'
          f'color:{INK_M};">THE CASE OF THE OPEN WINDOW &middot; CONCLUSION</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
          f'color:{INK_L};">in the hand of Inspector Inkwell</span></div>'
          f'<div style="margin-top:34px;">{statement}</div>'
          f'<div style="margin-top:36px;padding-top:22px;'
          f'border-top:1px solid rgba(78,63,45,0.28);">'
          f'<p style="margin:0;font-family:{READ};font-size:16.5px;line-height:1.66;'
          f'color:{INK_M};max-width:52ch;">The wrong word does not merely read badly here '
          f'&mdash; it makes the sentence untrue. Set the one that holds.</p></div>'
          f'<div style="position:absolute;left:52px;right:52px;bottom:40px;display:flex;'
          f'align-items:flex-end;justify-content:space-between;">'
          f'<div style="display:flex;align-items:center;gap:14px;">{cameo(56)}'
          f'<span style="font-family:{READ};font-style:italic;font-size:15px;'
          f'color:{INK_M};max-width:26ch;">One word left, and the case is written.</span>'
          f'</div>'
          f'<a href="Report.dc.html" style="font-family:{LABEL};font-size:14px;'
          f'letter-spacing:0.12em;color:{OX};text-decoration:none;'
          f'border-bottom:1.5px solid {OX};padding-bottom:3px;">SIGN THE REPORT</a>'
          f'</div></div>')

    # the type case: every word the reader collected across ten excerpts
    slugs = "".join(slug(w, used=u, case=c) for w, u, c in WORDS)
    b += (f'<div style="position:absolute;left:880px;top:112px;width:486px;height:642px;'
          f'box-sizing:border-box;padding:26px 24px;border-radius:4px;'
          f'background:linear-gradient(160deg,#4A2F1D 0%,{MAH} 38%,#20140B 100%);'
          f'box-shadow:0 26px 58px rgba(0,0,0,0.7), inset 0 0 40px rgba(0,0,0,0.5);">'
          f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
          f'padding-bottom:12px;border-bottom:1px solid rgba(201,162,39,0.26);">'
          f'<span style="font-family:{LABEL};font-size:12px;letter-spacing:0.16em;'
          f'color:{GILT};">YOUR WORDS, ALL TEN EXCERPTS</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
          f'color:#B09A72;">one set, one to go</span></div>'
          f'<div style="margin-top:20px;display:flex;flex-wrap:wrap;gap:11px;">'
          f'{slugs}</div>'
          f'<div style="position:absolute;left:24px;right:24px;bottom:24px;'
          f'padding-top:16px;border-top:1px solid rgba(201,162,39,0.2);">'
          f'<p style="margin:0;font-family:{READ};font-size:15.5px;line-height:1.6;'
          f'color:#CDB68C;">Every one of these came out of Saki&rsquo;s own sentences. '
          f'Eight of them are true words that will not make this line true.</p></div>'
          f'</div>')
    b += (f'<div style="position:absolute;left:74px;top:52px;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:44px;font-weight:400;'
          f'letter-spacing:-0.018em;color:{PAPER};">Set the words into the line.</h2></div>')
    b += grain() + vignette(0.84)
    return skeleton(stage(b))


# ------------------------------------------------------------ 12. the re-read
FIRST = SRC.span(SRC.TELL_A, SRC.TELL_B)
TELLS = {SRC.find("when she judged"),
         SRC.find("Then you know practically nothing about my aunt"),
         SRC.find("the self-possessed young lady")}


def frame_reread():
    rows = ""
    for n, text, para in FIRST:
        kind = "tell" if n in TELLS else None
        style = f'font-family:{READ};font-size:20px;line-height:1.86;color:{INK};'
        note = ""
        if kind == "tell":
            style += f'border-bottom:2px solid {OX};padding-bottom:1px;'
            note = (f'<span style="position:absolute;left:-28px;top:6px;width:9px;'
                    f'height:9px;border-radius:50%;background:{OX};"></span>')
        rows += (f'<div style="position:relative;display:flex;gap:22px;align-items:baseline;'
                 f'margin-top:{12 if para else 0}px;">'
                 f'{note}'
                 f'<span style="width:20px;text-align:right;flex-shrink:0;'
                 f'font-family:{LABEL};font-size:11px;color:{OX if kind else INK_M};'
                 f'position:relative;top:-2px;">{n}</span>'
                 f'<span style="{style}">{text}</span></div>')

    b = shallow_room('left', lamp=(None, None))
    b += (f'<div style="position:absolute;left:104px;top:64px;width:790px;height:790px;'
          f'box-sizing:border-box;padding:48px 52px 0 46px;border-radius:3px;'
          f'background:linear-gradient(98deg,{PAPER_D} 0%,{PAPER_W} 3%,{PAPER} 7%,'
          f'{PAPER} 100%);box-shadow:0 30px 70px rgba(0,0,0,0.7);overflow:hidden;">'
          f'<div style="display:flex;align-items:baseline;justify-content:space-between;'
          f'padding-bottom:14px;margin-bottom:22px;'
          f'border-bottom:1px solid rgba(78,63,45,0.32);">'
          f'<span style="font-family:{LABEL};font-size:11px;letter-spacing:0.16em;'
          f'color:{INK_M};">THE OPEN WINDOW &middot; EXCERPT {SRC._ROMAN[SRC.TELL_NO-1]}, AGAIN</span>'
          f'<span style="font-family:{READ};font-style:italic;font-size:13px;'
          f'color:{INK_L};">the same words as before</span></div>'
          f'<div style="position:relative;">'
          f'<div style="position:absolute;left:30px;top:2px;bottom:0;width:1px;'
          f'background:rgba(110,36,51,0.2);"></div>{rows}</div>'
          f'<div style="margin-top:26px;padding-top:18px;'
          f'border-top:1px solid rgba(78,63,45,0.26);display:flex;gap:12px;'
          f'align-items:flex-start;">'
          f'<span style="width:9px;height:9px;border-radius:50%;background:{OX};'
          f'flex-shrink:0;margin-top:7px;"></span>'
          f'<p style="margin:0;font-family:{READ};font-size:16.5px;line-height:1.62;'
          f'color:{INK_M};max-width:56ch;">Three marks, and two of them are not hers. Twice the narrator tells you what she is &mdash; self-possessed, and waiting for her moment. Once, in her own words, she makes certain you cannot check her story. All of it before the tragedy is ever mentioned.</p></div>'
          f'</div>')
    # the lamp has travelled to the foot of the page by now
    b += lamp_pool(500, 780, 660, 400, 0.2)

    # the two rates, set as a line in the file rather than a dashboard
    b += (f'<div style="position:absolute;right:62px;top:96px;width:414px;">'
          f'<h2 style="margin:0;font-family:{DISPLAY};font-size:35px;font-weight:400;'
          f'line-height:1.16;letter-spacing:-0.016em;color:{PAPER};">'
          f'Read it again, now that you know.</h2>'
          f'<p style="margin:18px 0 0;font-family:{READ};font-size:17.5px;'
          f'font-style:italic;color:#CDB68C;">The words have not changed. You have.</p>'
          f'<div style="margin-top:32px;padding-top:22px;'
          f'border-top:1px solid rgba(201,162,39,0.28);">'
          f'<p style="margin:0;font-family:{READ};font-size:19px;line-height:1.75;'
          f'color:#E0CFA8;">The first time through you read it at '
          f'<span style="color:#C0A87E;">148</span> words a minute. This time, '
          f'<span style="color:{LAMP};">176</span> &mdash; and of those, '
          f'<span style="color:{PAPER};">144</span> carried through to something '
          f'you understood.</p></div>'
          f'<p style="margin:26px 0 0;font-family:{READ};font-size:16.5px;line-height:1.68;'
          f'color:#CDB68C;">You read it faster because you understood it, not the other way '
          f'round. Neither number is your score.</p>'
          f'</div>')
    b += (f'<div style="position:absolute;right:62px;bottom:62px;display:flex;'
          f'flex-direction:column;align-items:flex-end;gap:14px;">'
          f'<a href="Main.dc.html" style="font-family:{LABEL};font-size:15px;'
          f'letter-spacing:0.13em;color:{LAMP};text-decoration:none;'
          f'border:1px solid {BRASS};padding:14px 30px;border-radius:2px;'
          f'background:linear-gradient(180deg,rgba(201,162,39,0.2),rgba(201,162,39,0.05));">'
          f'TAKE DOWN ANOTHER CASE</a>'
          f'<div style="display:flex;align-items:center;gap:14px;">'
          f'<span style="font-family:{READ};font-style:italic;font-size:14px;'
          f'color:#B09A72;text-align:right;max-width:24ch;">The shelf has eight more '
          f'you have not opened.</span>{cameo(58)}</div></div>')
    b += grain() + vignette(0.7)
    return skeleton(stage(b))
