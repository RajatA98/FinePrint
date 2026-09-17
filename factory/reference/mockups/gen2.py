# -*- coding: utf-8 -*-
import pathlib
ROOT = pathlib.Path("/private/tmp/claude-501/-Users-rajatarora-Projects-FinePrint/11f4bf2d-d31f-4ee5-a6ca-b90e50be057b/scratchpad/fp/project")
W,H = 1440,900

DARK="#120C07"; WOOD="#3A2416"; WOOD2="#4A2F1C"; WOODLT="#5C3D25"
BRASS="#C9A227"; GILT="#E0C478"; GLOW="#F5CF86"
PAPER="#EDE1C4"; PAPER2="#E2D3AE"; INKC="#2A2017"; INKSOFT="#6B5A44"
OXBLOOD="#6E2433"; GREEN="#25392C"; NAVY="#22304A"

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
 '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
 '<link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500;6..96,600;6..96,700&family=EB+Garamond:wght@400;500;600&family=IM+Fell+English+SC&display=swap" rel="stylesheet">')

GRAIN = ("background-image: repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0) 2px, rgba(0,0,0,0.04) 4px), "
         "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0px, rgba(0,0,0,0.03) 3px);")

def page(body, extra=""):
    return f'''<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  {FONTS}
  <style>
    body {{ margin: 0; background: {DARK}; -webkit-font-smoothing: antialiased; }}
    button {{ font-family: inherit; cursor: pointer; }}
    a {{ color: {GILT}; }} a:hover {{ color: {GLOW}; }}
    {extra}
  </style>
</helmet>
{body}
</x-dc>
<script data-dc-script data-props='{{"$preview":{{"width":{W},"height":{H}}}}}'>
class Component extends DCLogic {{
  renderVals() {{ return {{}}; }}
}}
</script>
</body>
</html>
'''

# --- the silhouette cameo: a Victorian paper-cut portrait, deerstalker, no pipe ---
SIL_PATH = ("M 100 30 Q 148 30 150 78 L 158 84 Q 160 92 152 96 L 143 98 "
            "Q 147 112 146 120 Q 138 124 141 128 Q 152 134 156 140 Q 150 146 140 146 "
            "Q 147 150 142 155 Q 148 158 143 166 Q 138 176 120 182 L 116 196 "
            "Q 150 204 162 232 L 168 240 L 26 240 L 34 230 Q 46 202 80 194 L 78 176 "
            "Q 62 166 58 138 Q 56 112 57 98 L 46 96 Q 38 92 40 84 L 50 78 Q 52 30 100 30 Z")

def cameo(size=150, speaking=False, frame=True):
    ring = GILT if speaking else BRASS
    glow = f"box-shadow: 0 0 {int(size*0.3)}px rgba(245,207,134,0.28), inset 0 0 {int(size*0.2)}px rgba(0,0,0,0.5);" if speaking else "box-shadow: inset 0 0 20px rgba(0,0,0,0.55);"
    fr = f"border: {max(3,int(size*0.028))}px solid {ring}; outline: 1px solid rgba(0,0,0,0.6); outline-offset: {max(3,int(size*0.028))}px;" if frame else ""
    return f'''<div style="width: {size}px; height: {int(size*1.18)}px; border-radius: 50%; {fr} {glow} background: radial-gradient(ellipse at 50% 34%, {PAPER} 0%, {PAPER2} 52%, #C9B68C 100%); overflow: hidden; display: flex; align-items: flex-end; justify-content: center; flex-shrink: 0;">
      <svg viewBox="20 24 160 216" width="{int(size*0.82)}" height="{int(size*1.02)}" style="display: block;"><path d="{SIL_PATH}" fill="#14100B"/></svg>
    </div>'''

# --- a book spine on the shelf ---
def spine(h, w, colour, roman, tier, state="open"):
    # state: open | current | locked
    if state == "locked":
        colour = "#2C2119"; txt = "#5A4A38"; gilt_c = "#6B5838"; lift = 0
    elif state == "current":
        txt = GLOW; gilt_c = GILT; lift = 16
    else:
        txt = GILT; gilt_c = BRASS; lift = 0
    band = f'<div style="height: 3px; background: {gilt_c}; opacity: 0.8;"></div>'
    ridge = f'<div style="height: 1px; background: rgba(0,0,0,0.45);"></div>'
    return f'''<div style="width: {w}px; height: {h}px; margin-bottom: -{lift}px; box-sizing: border-box; background: linear-gradient(90deg, rgba(0,0,0,0.55) 0%, {colour} 22%, {colour} 62%, rgba(0,0,0,0.42) 100%); border-radius: 3px 3px 1px 1px; border-top: 1px solid rgba(255,255,255,0.09); box-shadow: {'0 -10px 26px rgba(245,207,134,0.3), ' if state=='current' else ''}3px 0 7px rgba(0,0,0,0.5); display: flex; flex-direction: column; padding: 10px 0 12px; align-items: center; justify-content: space-between; {GRAIN}">
      <div style="width: 100%;">{band}{ridge}</div>
      <div style="writing-mode: vertical-rl; text-orientation: mixed; font-family: 'Bodoni Moda', Didot, serif; font-size: {max(11, int(w*0.34))}px; letter-spacing: 0.14em; color: {txt}; text-shadow: 0 1px 0 rgba(0,0,0,0.6);">{roman}</div>
      <div style="writing-mode: vertical-rl; font-family: 'IM Fell English SC', serif; font-size: 10px; letter-spacing: 0.06em; color: {txt}; opacity: 0.72;">{tier}</div>
      <div style="width: 100%;">{ridge}{band}</div>
    </div>'''

def shelf_plank(width=980):
    return f'''<div style="width: {width}px; height: 15px; background: linear-gradient(180deg, {WOODLT} 0%, {WOOD2} 34%, {WOOD} 72%, #241509 100%); border-radius: 2px; box-shadow: 0 9px 20px rgba(0,0,0,0.62), inset 0 1px 0 rgba(255,255,255,0.11); {GRAIN}"></div>'''

print("gen2 helpers ready")

ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"]
COLS = [OXBLOOD, GREEN, "#3E2C52", NAVY, "#5A3418", "#6E2433", "#2F4A3A", "#4A2338", "#243A52"]

def shelf_row(tier, states, heights, cols):
    books = ""
    for i,(st,h,c) in enumerate(zip(states, heights, cols)):
        books += spine(h, 40 if i%3 else 48, c, ROMAN[i], tier, st)
    return f'''<div style="display: flex; align-items: flex-end; gap: 4px; padding-left: 26px; height: 176px;">{books}</div>{shelf_plank()}'''

# ============ 1. THE STUDY ============
study = f'''<div style="width: {W}px; height: {H}px; box-sizing: border-box; position: relative; overflow: hidden; background: radial-gradient(1100px 700px at 16% 24%, #3A2415 0%, #21150C 42%, #120C07 78%);">
  <div style="position: absolute; inset: 0; background: radial-gradient(520px 420px at 13% 20%, rgba(245,207,134,0.24) 0%, rgba(245,207,134,0.06) 42%, rgba(0,0,0,0) 70%); pointer-events: none;"></div>
  <div style="position: absolute; inset: 0; box-shadow: inset 0 0 220px rgba(0,0,0,0.85); pointer-events: none;"></div>

  <div style="position: absolute; top: 44px; left: 74px; width: 330px;">
    <div style="font-family: 'Bodoni Moda', Didot, serif; font-size: 40px; color: {GLOW}; letter-spacing: 0.01em; line-height: 1;">Fine Print</div>
    <div style="height: 1px; background: linear-gradient(90deg, {BRASS}, rgba(201,162,39,0)); margin: 14px 0 12px;"></div>
    <div style="font-family: 'IM Fell English SC', serif; font-size: 13px; letter-spacing: 0.07em; color: #A08A64;">Choose a case from the shelf</div>
  </div>

  <div style="position: absolute; left: 74px; bottom: 58px; width: 340px; display: flex; gap: 22px; align-items: flex-end;">
    {cameo(126, speaking=True)}
    <div style="padding-bottom: 8px;">
      <div style="font-family: 'IM Fell English SC', serif; font-size: 11px; letter-spacing: 0.1em; color: {BRASS}; margin-bottom: 9px;">Inspector Inkwell</div>
      <div style="font-family: 'EB Garamond', Garamond, serif; font-size: 19px; line-height: 1.5; color: {PAPER}; max-width: 30ch;">Nothing is written on the spines. You will not know what you have taken down until you begin to read it.</div>
    </div>
  </div>

  <div style="position: absolute; right: 56px; top: 50%; transform: translateY(-50%); padding: 26px 24px 22px; background: linear-gradient(180deg, #2A1A0F 0%, #1C120A 100%); border: 14px solid transparent; border-image: linear-gradient(160deg, {WOODLT}, {WOOD}, #1B1008) 1; box-shadow: 0 40px 90px rgba(0,0,0,0.7), inset 0 0 90px rgba(0,0,0,0.75); {GRAIN}">
    <div style="display: flex; flex-direction: column; gap: 26px;">
      <div>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding-left: 26px;">
          <span style="font-family: 'IM Fell English SC', serif; font-size: 12px; letter-spacing: 0.12em; color: {GILT};">First Cases</span>
          <span style="flex-grow: 1; height: 1px; background: rgba(201,162,39,0.22);"></span>
          <span style="font-family: 'EB Garamond', serif; font-size: 12px; color: #8A7554;">two solved</span>
        </div>
        {shelf_row("Novice", ["open","open","current","locked","locked","locked","locked","locked","locked"], [150,162,168,144,158,150,164,146,156], COLS)}
      </div>
      <div style="opacity: 0.42;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding-left: 26px;">
          <span style="font-family: 'IM Fell English SC', serif; font-size: 12px; letter-spacing: 0.12em; color: #9A8250;">Longer Cases</span>
          <span style="flex-grow: 1; height: 1px; background: rgba(201,162,39,0.14);"></span>
          <span style="font-family: 'EB Garamond', serif; font-size: 12px; color: #6F5C40;">locked</span>
        </div>
        {shelf_row("Adept", ["locked"]*9, [158,148,166,152,144,160,150,162,148], COLS)}
      </div>
      <div style="opacity: 0.22;">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; padding-left: 26px;">
          <span style="font-family: 'IM Fell English SC', serif; font-size: 12px; letter-spacing: 0.12em; color: #9A8250;">Difficult Cases</span>
          <span style="flex-grow: 1; height: 1px; background: rgba(201,162,39,0.1);"></span>
        </div>
        {shelf_row("Master", ["locked"]*9, [146,160,150,168,142,154,164,148,158], COLS)}
      </div>
    </div>
  </div>

  <div style="position: absolute; right: 56px; bottom: 38px; display: flex; align-items: center; gap: 18px; padding: 13px 22px; background: linear-gradient(180deg, #4A3A1C, #2E2210); border: 1px solid {BRASS}; border-radius: 2px; box-shadow: 0 10px 26px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.14);">
    <div>
      <div style="font-family: 'Bodoni Moda', serif; font-size: 17px; color: {GLOW};">Case the Third</div>
      <div style="font-family: 'EB Garamond', serif; font-size: 13px; color: #BBA47C; margin-top: 2px;">First Cases . about 1,200 words . unread</div>
    </div>
    <button type="button" style="font-family: 'IM Fell English SC', serif; font-size: 14px; letter-spacing: 0.08em; padding: 11px 20px; background: {GILT}; color: #241705; border: none; border-radius: 2px;">Take it down</button>
  </div>
</div>'''
(ROOT/"Study.dc.html").write_text(page(study), encoding="utf-8")
print("study done")


LINES = [
 "&ldquo;Do you know many of the people round here?&rdquo;",
 "asked the niece, when she judged that they had",
 "had sufficient silent communion.",
 "&ldquo;Hardly a soul,&rdquo; said Framton. &ldquo;My sister was",
 "staying here, at the rectory, you know, some four",
 "years ago, and she gave me letters of introduction",
 "to some of the people here.&rdquo;",
 "He made the last statement in a tone of distinct",
 "regret.",
 "&ldquo;Then you know practically nothing about my",
 "aunt?&rdquo; pursued the self-possessed young lady.",
 "&ldquo;Only her name and address,&rdquo; admitted the caller.",
]

def numbered(lines, mark=(), tappable=False, underline=(), fs=17.5):
    out = []
    for i, l in enumerate(lines, start=1):
        shown = str(i) if (i % 5 == 0 or i == 1) else ""
        num = ('<span style="display:inline-block;width:26px;font-family:\'EB Garamond\',serif;'
               'font-size:11.5px;color:#A3906E;text-align:right;margin-right:16px;">' + shown + '</span>')
        st = "color:" + INKC + ";"
        if i in mark:
            st += "background:rgba(201,162,39,0.28);box-shadow:0 0 0 2px rgba(201,162,39,0.28);"
        if i in underline:
            st += "border-bottom:2px solid " + OXBLOOD + ";padding-bottom:1px;"
        elif tappable:
            st += "border-bottom:1px dotted #BBA98A;"
        out.append('<div style="white-space:nowrap;">' + num +
                   '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:' + str(fs) +
                   'px;line-height:2.0;' + st + '">' + l + '</span></div>')
    return "".join(out)

def desk(inner):
    return ('<div style="width:' + str(W) + 'px;height:' + str(H) + 'px;box-sizing:border-box;position:relative;'
      'overflow:hidden;background:radial-gradient(900px 620px at 50% 24%, #4A3320 0%, #241608 46%, #100A05 82%);">'
      '<div style="position:absolute;inset:0;background:radial-gradient(620px 400px at 50% 14%, rgba(245,207,134,0.22), rgba(0,0,0,0) 68%);pointer-events:none;"></div>'
      '<div style="position:absolute;inset:0;box-shadow:inset 0 0 240px rgba(0,0,0,0.9);pointer-events:none;"></div>'
      + inner + '</div>')

def book(left_html, right_html, w=1120, h=648):
    pw = (w - 30) // 2
    return ('<div style="width:' + str(w) + 'px;height:' + str(h) + 'px;display:flex;'
      'filter:drop-shadow(0 46px 70px rgba(0,0,0,0.75));">'
      '<div style="width:' + str(pw) + 'px;box-sizing:border-box;padding:44px 42px 36px 50px;overflow:hidden;'
      'background:linear-gradient(255deg,#D9C9A2 0%,' + PAPER + ' 15%,' + PAPER + ' 86%,#C8B999 100%);'
      'border-radius:5px 0 0 5px;">' + left_html + '</div>'
      '<div style="width:30px;background:linear-gradient(90deg,rgba(0,0,0,0.03),rgba(74,50,26,0.45) 42%,rgba(74,50,26,0.45) 58%,rgba(0,0,0,0.03));"></div>'
      '<div style="width:' + str(pw) + 'px;box-sizing:border-box;padding:44px 50px 36px 42px;overflow:hidden;'
      'background:linear-gradient(105deg,#D9C9A2 0%,' + PAPER + ' 15%,' + PAPER + ' 86%,#C8B999 100%);'
      'border-radius:0 5px 5px 0;">' + right_html + '</div></div>')

def rhead(text, right=""):
    return ('<div style="display:flex;justify-content:space-between;align-items:baseline;padding-bottom:13px;'
      'margin-bottom:20px;border-bottom:1px solid rgba(42,32,23,0.2);">'
      '<span style="font-family:\'IM Fell English SC\',serif;font-size:11.5px;letter-spacing:0.14em;color:#7A6647;">' + text + '</span>'
      '<span style="font-family:\'EB Garamond\',serif;font-size:11.5px;color:#9B8663;">' + right + '</span></div>')

def gildbtn(label):
    return ('<button type="button" style="font-family:\'IM Fell English SC\',serif;font-size:14px;letter-spacing:0.08em;'
      'padding:12px 26px;background:' + GILT + ';color:#241705;border:none;border-radius:2px;'
      'box-shadow:0 8px 22px rgba(0,0,0,0.5);">' + label + '</button>')

def quietbtn(label):
    return ('<button type="button" style="font-family:\'IM Fell English SC\',serif;font-size:13px;letter-spacing:0.07em;'
      'padding:11px 22px;background:transparent;color:#C3AE84;border:1px solid rgba(201,162,39,0.45);border-radius:2px;">' + label + '</button>')

print("part2 helpers ok")

# ============ 2. THE BOOK, OPEN (reading) ============
left2 = (rhead("Case the Third") +
  '<div style="font-family:\'Bodoni Moda\',Didot,serif;font-size:29px;color:' + INKC + ';line-height:1.22;margin-bottom:10px;">The title of this<br>case is withheld.</div>' +
  '<div style="font-family:\'EB Garamond\',serif;font-size:15px;line-height:1.66;color:' + INKSOFT + ';max-width:34ch;margin-bottom:26px;">You are told what you have read once you have finished reading it. Work from the page in front of you, and nothing else.</div>' +
  '<div style="height:1px;background:rgba(42,32,23,0.18);margin-bottom:20px;"></div>' +
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:11px;letter-spacing:0.12em;color:#7A6647;margin-bottom:12px;">Case notes</div>' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);height:32px;"></div>' * 4)

right2 = (rhead("Passage", "Excerpt 3 of 10") +
  '<div style="position:relative;">' + numbered(LINES[:9]) +
  '<div style="position:absolute;left:-28px;right:-28px;bottom:-36px;height:176px;'
  'background:linear-gradient(180deg,rgba(237,225,196,0) 0%,rgba(152,130,92,0.5) 44%,rgba(52,40,24,0.94) 100%);pointer-events:none;"></div></div>')

open_inner = ('<div style="position:absolute;left:50%;top:40px;transform:translateX(-50%);">' + book(left2, right2) + '</div>'
  '<div style="position:absolute;left:50%;bottom:44px;transform:translateX(-50%);display:flex;align-items:center;gap:30px;">'
  '<div style="display:flex;align-items:center;gap:13px;opacity:0.5;">' + cameo(46, False) +
  '<span style="font-family:\'EB Garamond\',serif;font-size:14px;color:#A08A64;font-style:italic;">Inkwell says nothing while you are reading.</span></div>'
  + gildbtn("Bring the lamp down") + '</div>')
(ROOT/"Open.dc.html").write_text(page(desk(open_inner)), encoding="utf-8")

# ============ 3. SAT-STYLE QUESTION ============
def satopt(letter, text, state="idle"):
    box_bd, box_bg, box_col, txt_col = "rgba(42,32,23,0.42)", "transparent", INKC, INKC
    if state == "chosen":
        box_bd, box_bg, box_col = INKC, INKC, PAPER
    if state == "wrong":
        box_bd, box_bg, box_col, txt_col = OXBLOOD, "transparent", OXBLOOD, "#7A6647"
    return ('<div style="display:flex;align-items:flex-start;gap:13px;margin-bottom:15px;">'
      '<span style="width:23px;height:23px;flex-shrink:0;border-radius:50%;border:1.5px solid ' + box_bd + ';background:' + box_bg + ';'
      'display:flex;align-items:center;justify-content:center;font-family:\'EB Garamond\',serif;font-size:13px;color:' + box_col + ';">' + letter + '</span>'
      '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:16.5px;line-height:1.5;color:' + txt_col + ';">' + text + '</span></div>')

left3 = (rhead("Passage", "Lines 1 to 12") +
  '<div style="opacity:0.96;">' + numbered(LINES, mark=()) + '</div>')

right3 = (rhead("The question", "1 of 3") +
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:11px;letter-spacing:0.12em;color:#7A6647;margin-bottom:14px;">Deduce</div>' +
  '<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:19px;line-height:1.5;color:' + INKC + ';margin-bottom:26px;">The niece keeps asking how much Framton knows about her aunt. She does this chiefly in order to</div>' +
  satopt("A", "make polite conversation with a stranger.") +
  satopt("B", "find out whether anyone can contradict her.", "chosen") +
  satopt("C", "persuade him to leave the house at once.") +
  satopt("D", "discover whether he is a friend of the family.") +
  '<div style="height:10px;"></div>' +
  '<div style="border-top:1px solid rgba(42,32,23,0.18);padding-top:16px;font-family:\'EB Garamond\',serif;font-size:14px;color:' + INKSOFT + ';line-height:1.6;">There is no clock on this. Read the lines again as often as you like.</div>')

q_inner = ('<div style="position:absolute;left:50%;top:40px;transform:translateX(-50%);">' + book(left3, right3) + '</div>'
  '<div style="position:absolute;left:50%;bottom:44px;transform:translateX(-50%);display:flex;align-items:center;gap:20px;">'
  + quietbtn("Read it again") + gildbtn("Give that answer") + '</div>')
(ROOT/"Question.dc.html").write_text(page(desk(q_inner)), encoding="utf-8")
print("open + question done")

# ============ 4. EVIDENCE: cite the line ============
left4 = (rhead("Passage", "Tap the line that proves it") +
  numbered(LINES, tappable=True, underline=(10, 11)))

right4 = (rhead("Case notes", "Clue 4 of 10") +
  '<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:16.5px;line-height:1.55;color:' + INKC + ';margin-bottom:22px;">You said the niece is finding out whether anyone can contradict her.</div>' +
  '<div style="padding:18px 20px;background:rgba(110,36,51,0.06);border-left:2px solid ' + OXBLOOD + ';margin-bottom:24px;">' +
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:10.5px;letter-spacing:0.1em;color:' + OXBLOOD + ';margin-bottom:8px;">Entered in evidence, lines 10 to 11</div>' +
  '<div style="font-family:\'EB Garamond\',serif;font-style:italic;font-size:16px;line-height:1.6;color:' + INKC + ';">&ldquo;Then you know practically nothing about my aunt?&rdquo;</div></div>' +
  '<div style="font-family:\'EB Garamond\',serif;font-size:15px;line-height:1.9;color:#8A7554;">' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);padding-bottom:4px;margin-bottom:10px;"><span style="color:' + INKC + ';">1. Framton has never met the aunt</span></div>' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);padding-bottom:4px;margin-bottom:10px;"><span style="color:' + INKC + ';">2. The window is kept open every evening</span></div>' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);padding-bottom:4px;margin-bottom:10px;"><span style="color:' + INKC + ';">3. Three men left through that window</span></div>' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);padding-bottom:4px;margin-bottom:10px;"><span style="color:' + OXBLOOD + ';">4. She checks what he knows</span></div>' +
  '<div style="border-bottom:1px solid rgba(42,32,23,0.13);height:30px;"></div></div>')

e_inner = ('<div style="position:absolute;left:50%;top:40px;transform:translateX(-50%);">' + book(left4, right4) + '</div>'
  '<div style="position:absolute;left:50%;bottom:44px;transform:translateX(-50%);display:flex;align-items:center;gap:22px;">'
  '<span style="font-family:\'EB Garamond\',serif;font-size:14.5px;color:#A08A64;font-style:italic;">An answer without a line behind it does not count as solved.</span>'
  + gildbtn("Enter it in evidence") + '</div>')
(ROOT/"Evidence.dc.html").write_text(page(desk(e_inner)), encoding="utf-8")

# ============ 5. THE COACH, AND THE TITLE REVEALED ============
cover = ('<div style="width:330px;height:452px;box-sizing:border-box;padding:40px 34px;border-radius:4px 8px 8px 4px;'
  'background:linear-gradient(118deg,#7A2A3A 0%,' + OXBLOOD + ' 34%,#4E1824 100%);'
  'box-shadow:0 40px 70px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.14);'
  'display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;' + GRAIN + '">'
  '<div style="width:100%;height:2px;background:' + BRASS + ';opacity:0.75;"></div>'
  '<div style="flex-grow:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;">'
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:11px;letter-spacing:0.16em;color:' + BRASS + ';">Case the Third</div>'
  '<div style="font-family:\'Bodoni Moda\',Didot,serif;font-size:37px;line-height:1.15;color:' + GILT + ';">The Open<br>Window</div>'
  '<div style="width:52px;height:1px;background:' + BRASS + ';opacity:0.6;"></div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:17px;color:#D8BE8E;">Saki</div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:12.5px;color:#B0906A;margin-top:6px;">1,208 words . published 1914</div></div>'
  '<div style="width:100%;height:2px;background:' + BRASS + ';opacity:0.75;"></div></div>')

verdict = ('<div style="display:flex;align-items:baseline;gap:18px;margin-bottom:8px;">'
  '<span style="font-family:\'Bodoni Moda\',Didot,serif;font-size:44px;color:' + GLOW + ';line-height:1;">Case closed</span></div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:17px;color:#BBA47C;margin-bottom:26px;">You worked out what the niece was doing, and you could point to the lines that prove it.</div>'
  '<div style="display:flex;gap:44px;padding:20px 0;border-top:1px solid rgba(201,162,39,0.25);border-bottom:1px solid rgba(201,162,39,0.25);margin-bottom:28px;">'
  '<div><div style="font-family:\'Bodoni Moda\',serif;font-size:28px;color:' + PAPER + ';">78%</div><div style="font-family:\'EB Garamond\',serif;font-size:13px;color:#9A845E;margin-top:4px;">right first time</div></div>'
  '<div><div style="font-family:\'Bodoni Moda\',serif;font-size:28px;color:' + PAPER + ';">8 of 10</div><div style="font-family:\'EB Garamond\',serif;font-size:13px;color:#9A845E;margin-top:4px;">lines cited correctly</div></div>'
  '<div><div style="font-family:\'Bodoni Moda\',serif;font-size:28px;color:#9A845E;">142</div><div style="font-family:\'EB Garamond\',serif;font-size:13px;color:#9A845E;margin-top:4px;">words a minute, not scored</div></div></div>')

coachtext = ('<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:18px;line-height:1.72;color:' + PAPER + ';max-width:56ch;">'
  '<p style="margin:0 0 14px;">Every word question, you had first time. Vocabulary is not what is holding you back.</p>'
  '<p style="margin:0 0 14px;">The four you missed were all reasoning questions, and they share a shape. In each one the proving line fell in the <span style="color:' + GLOW + ';">last three lines of the passage</span>. You are settling on a meaning before you reach the end.</p>'
  '<p style="margin:0 0 14px;">Your citing is strong. Eight times out of ten you could show me the line. That is the harder half, and you have it.</p>'
  '<p style="margin:0;color:' + GLOW + ';">One thing for the next case. Read to the last line, then answer. Nothing else.</p></div>')

c_inner = ('<div style="position:absolute;inset:0;display:flex;align-items:center;gap:70px;padding:0 84px;">'
  '<div style="flex-shrink:0;transform:rotate(-2.2deg);">' + cover + '</div>'
  '<div style="flex-grow:1;">' + verdict +
  '<div style="display:flex;gap:26px;align-items:flex-start;">' + cameo(118, True) +
  '<div style="padding-top:4px;">'
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:11px;letter-spacing:0.12em;color:' + BRASS + ';margin-bottom:12px;">Inspector Inkwell, on your reading</div>'
  + coachtext + '</div></div>'
  '<div style="display:flex;gap:16px;margin-top:32px;">' + quietbtn("Look at the two I missed") + gildbtn("Back to the shelf") + '</div>'
  '</div></div>')
(ROOT/"Coach.dc.html").write_text(page(desk(c_inner)), encoding="utf-8")
print("evidence + coach done")

# ---------- gamified question parts ----------
def slip(letter, text, state, reason="", rot="0deg"):
    # state: live | ruled | chosen
    if state == "ruled":
        return ('<div style="position:relative;transform:rotate(' + rot + ');margin-bottom:11px;padding:13px 17px;'
          'background:linear-gradient(180deg,#E4D8B8,#DACDA8);border:1px solid rgba(42,32,23,0.16);border-radius:2px;'
          'box-shadow:0 2px 5px rgba(0,0,0,0.12);opacity:0.72;">'
          '<div style="display:flex;align-items:flex-start;gap:12px;">'
          '<span style="width:21px;height:21px;flex-shrink:0;border-radius:50%;border:1.5px solid rgba(110,36,51,0.55);'
          'display:flex;align-items:center;justify-content:center;font-family:\'EB Garamond\',serif;font-size:12px;color:' + OXBLOOD + ';">' + letter + '</span>'
          '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:16px;line-height:1.45;color:#8A7554;'
          'text-decoration:line-through;text-decoration-color:' + OXBLOOD + ';text-decoration-thickness:1.5px;">' + text + '</span></div>'
          '<div style="margin-top:7px;margin-left:33px;font-family:\'EB Garamond\',serif;font-style:italic;font-size:13px;color:' + OXBLOOD + ';">' + reason + '</div>'
          '</div>')
    bd = GILT if state == "chosen" else "rgba(42,32,23,0.3)"
    sh = "0 6px 16px rgba(201,162,39,0.35),0 2px 5px rgba(0,0,0,0.2)" if state == "chosen" else "0 3px 8px rgba(0,0,0,0.16)"
    bgc = "linear-gradient(180deg,#F5EBD2,#EADFC0)" if state == "chosen" else "linear-gradient(180deg,#F2E8CE,#E7DBBA)"
    return ('<div style="position:relative;transform:rotate(' + rot + ');margin-bottom:11px;padding:15px 17px;'
      'background:' + bgc + ';border:1.5px solid ' + bd + ';border-radius:2px;box-shadow:' + sh + ';">'
      '<div style="display:flex;align-items:flex-start;gap:12px;">'
      '<span style="width:21px;height:21px;flex-shrink:0;border-radius:50%;border:1.5px solid ' + INKC + ';'
      'display:flex;align-items:center;justify-content:center;font-family:\'EB Garamond\',serif;font-size:12px;color:' + INKC + ';">' + letter + '</span>'
      '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:16.5px;line-height:1.48;color:' + INKC + ';flex-grow:1;">' + text + '</span>'
      '<button type="button" aria-label="Rule this out" style="flex-shrink:0;width:24px;height:24px;padding:0;background:transparent;'
      'border:1px dashed rgba(110,36,51,0.4);border-radius:2px;display:flex;align-items:center;justify-content:center;">'
      '<svg width="11" height="11" viewBox="0 0 24 24" stroke="' + OXBLOOD + '" stroke-width="2.6" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>'
      '</button></div></div>')

def pip(state):
    if state == "hit":
        return '<span style="width:9px;height:9px;border-radius:50%;background:' + GILT + ';box-shadow:0 0 7px rgba(224,196,120,0.8);"></span>'
    if state == "miss":
        return '<span style="width:9px;height:9px;border-radius:50%;background:transparent;border:1px solid ' + OXBLOOD + ';"></span>'
    return '<span style="width:9px;height:9px;border-radius:50%;background:rgba(42,32,23,0.18);"></span>'

def magnifier(spent=False):
    c = "rgba(42,32,23,0.2)" if spent else BRASS
    return ('<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round">'
      '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg>')

def waxseal(text, sub):
    return ('<div style="width:86px;height:86px;border-radius:50%;flex-shrink:0;'
      'background:radial-gradient(circle at 36% 30%,#9E3244 0%,' + OXBLOOD + ' 46%,#4A1622 100%);'
      'box-shadow:0 6px 16px rgba(0,0,0,0.45),inset 0 2px 4px rgba(255,255,255,0.22),inset 0 -3px 8px rgba(0,0,0,0.45);'
      'display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-6deg);">'
      '<div style="font-family:\'Bodoni Moda\',serif;font-size:27px;color:#F0C9A8;line-height:1;">' + text + '</div>'
      '<div style="font-family:\'IM Fell English SC\',serif;font-size:8.5px;letter-spacing:0.1em;color:#E0A88E;margin-top:3px;">' + sub + '</div></div>')
print("game parts ok")

# ============ 3b. GAMIFIED SAT QUESTION ============
gl = (rhead("Passage", "Lines 1 to 12") + numbered(LINES))

streak = ('<div style="display:flex;align-items:center;gap:7px;">' + pip("hit") + pip("hit") + pip("hit") + pip("miss") + pip("hit") + pip("open") + pip("open") + '</div>')

hints = ('<div style="display:flex;align-items:center;gap:10px;">'
  '<span style="font-family:\'EB Garamond\',serif;font-size:13.5px;color:' + INKSOFT + ';">Nudges left</span>'
  '<span style="display:flex;gap:5px;">' + magnifier(False) + magnifier(False) + magnifier(True) + '</span></div>')

gr = (rhead("The deduction", "Two still standing") +
  '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">'
  '<span style="font-family:\'IM Fell English SC\',serif;font-size:11px;letter-spacing:0.12em;color:#7A6647;">Rule out what the page cannot support</span>'
  + streak + '</div>' +
  '<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:19.5px;line-height:1.48;color:' + INKC + ';margin-bottom:20px;">The niece keeps asking how much Framton knows about her aunt. She does this chiefly in order to</div>' +
  slip("A", "make polite conversation with a stranger.", "ruled", "Nothing on the page says she is being polite.", "-0.5deg") +
  slip("B", "find out whether anyone can contradict her.", "live", "", "0.4deg") +
  slip("C", "persuade him to leave the house at once.", "ruled", "She is keeping him there, not sending him off.", "0.6deg") +
  slip("D", "discover whether he is a friend of the family.", "live", "", "-0.3deg") +
  '<div style="height:12px;"></div>' +
  '<div style="display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid rgba(201,162,39,0.4);">'
  + hints +
  '<button type="button" style="font-family:\'IM Fell English SC\',serif;font-size:13.5px;letter-spacing:0.08em;'
  'padding:11px 22px;background:' + INKC + ';color:' + PAPER + ';border:none;border-radius:2px;">Name it</button></div>')

rankstrip = ('<div style="display:flex;align-items:center;gap:30px;padding:16px 26px;'
  'background:linear-gradient(180deg,#4A3A1C,#2B2010);border:1px solid rgba(201,162,39,0.55);border-radius:3px;'
  'box-shadow:0 14px 34px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.13);">'
  + waxseal("3", "IN A ROW") +
  '<div style="width:430px;">'
  '<div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:9px;">'
  '<span style="font-family:\'Bodoni Moda\',serif;font-size:19px;color:' + GLOW + ';">Constable</span>'
  '<span style="font-family:\'EB Garamond\',serif;font-size:13px;color:#A78F65;">41 marks to Sergeant</span></div>'
  '<div style="height:7px;background:rgba(0,0,0,0.5);border-radius:4px;overflow:hidden;box-shadow:inset 0 1px 3px rgba(0,0,0,0.7);">'
  '<div style="width:62%;height:7px;background:linear-gradient(90deg,' + BRASS + ',' + GLOW + ');box-shadow:0 0 12px rgba(245,207,134,0.65);"></div></div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:13px;color:#A78F65;margin-top:9px;">Rule out a wrong answer and keep the mark. Guess and you lose it.</div>'
  '</div>'
  '<div style="width:1px;height:62px;background:rgba(201,162,39,0.3);"></div>'
  '<div style="text-align:center;">'
  '<div style="font-family:\'Bodoni Moda\',serif;font-size:26px;color:' + PAPER + ';line-height:1;">+2</div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:12.5px;color:#A78F65;margin-top:5px;">marks for a clean<br>deduction</div></div></div>')

g_inner = ('<div style="position:absolute;left:50%;top:26px;transform:translateX(-50%);">' + book(gl, gr, 1120, 620) + '</div>'
  '<div style="position:absolute;left:50%;bottom:34px;transform:translateX(-50%);">' + rankstrip + '</div>')
(ROOT/"Question.dc.html").write_text(page(desk(g_inner)), encoding="utf-8")
print("gamified question done")

# ---------- character busts: one base profile, swappable headwear ----------
BUST = ("M 100 52 Q 140 52 142 96 Q 146 106 145 116 Q 138 120 141 124 Q 151 130 155 136 "
        "Q 149 142 139 142 Q 146 146 141 151 Q 147 154 142 162 Q 137 172 118 178 L 114 192 "
        "Q 150 200 164 236 L 170 240 L 24 240 L 32 228 Q 46 198 82 190 L 80 174 "
        "Q 62 164 58 134 Q 56 96 60 88 Q 64 52 100 52 Z")
TOPPERS = {
 "deerstalker": '<path d="M 100 26 Q 146 26 148 72 L 158 78 Q 161 88 150 90 L 46 90 Q 36 88 40 78 L 50 72 Q 52 26 100 26 Z" fill="#14100B"/>',
 "tophat":      '<path d="M 64 12 L 138 12 L 140 62 L 62 62 Z" fill="#14100B"/><path d="M 44 62 L 158 62 L 158 70 L 44 70 Z" fill="#14100B"/>',
 "bun":         '<path d="M 100 44 Q 144 44 146 96 L 56 96 Q 54 44 100 44 Z" fill="#14100B"/><circle cx="52" cy="82" r="19" fill="#14100B"/>',
 "updo":        '<path d="M 100 38 Q 146 38 147 98 L 55 98 Q 52 38 100 38 Z" fill="#14100B"/><path d="M 68 44 Q 100 4 132 44 Q 100 26 68 44 Z" fill="#14100B"/><circle cx="60" cy="56" r="14" fill="#14100B"/>',
 "bare":        '',
}
def bust(kind, size=104, lit=False, tone=None):
    ring = GILT if lit else BRASS
    glow = "box-shadow: 0 0 26px rgba(245,207,134,0.35), inset 0 0 18px rgba(0,0,0,0.5);" if lit else "box-shadow: inset 0 0 18px rgba(0,0,0,0.5);"
    bg = tone or PAPER
    return ('<div style="width:' + str(size) + 'px;height:' + str(int(size*1.18)) + 'px;border-radius:50%;flex-shrink:0;'
      'border:' + str(max(2,int(size*0.03))) + 'px solid ' + ring + ';' + glow +
      'background:radial-gradient(ellipse at 50% 34%,' + bg + ' 0%,#DCCEA8 54%,#C3AF85 100%);overflow:hidden;'
      'display:flex;align-items:flex-end;justify-content:center;">'
      '<svg viewBox="20 6 160 234" width="' + str(int(size*0.84)) + '" height="' + str(int(size*1.04)) + '" style="display:block;">'
      + TOPPERS[kind] + '<path d="' + BUST + '" fill="#14100B"/></svg></div>')

# ---------- ink line-art objects ----------
def obj_svg(kind, c):
    s = 'fill="none" stroke="' + c + '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
    P = {
     "coat":  '<path d="M20 8l-8 5-6 22 7 3 2-13v37h26V25l2 13 7-3-6-22-8-5z" ' + s + '/><path d="M20 8l6 9 6-9" ' + s + '/>',
     "gun":   '<path d="M4 44l30-30" ' + s + '/><path d="M34 14l10-10 6 6-10 10z" ' + s + '/><path d="M12 36l8 8" ' + s + '/><path d="M4 44l-2 6 6-2" ' + s + '/>',
     "dog":   '<path d="M8 40V26c0-6 5-10 11-10h14l6-6 4 4-2 6c4 2 6 6 6 10v10" ' + s + '/><path d="M8 40v6M20 40v6M34 40v6M44 40v6" ' + s + '/><path d="M33 16c-4 2-6 7-5 12" ' + s + '/>',
     "cup":   '<path d="M10 20h26v14a10 10 0 01-10 10h-6a10 10 0 01-10-10z" ' + s + '/><path d="M36 24h5a5 5 0 010 10h-5" ' + s + '/><path d="M8 48h32" ' + s + '/>',
     "letter":'<path d="M6 14h38v26H6z" ' + s + '/><path d="M6 14l19 14 19-14" ' + s + '/>',
     "stick": '<path d="M16 46L34 10" ' + s + '/><path d="M34 10c0-5 8-6 8-1s-7 4-7 9" ' + s + '/>',
     "hat":   '<path d="M14 14h22v22H14z" ' + s + '/><path d="M6 36h38v5H6z" ' + s + '/>',
    }
    return '<svg viewBox="0 0 50 52" width="46" height="48">' + P[kind] + '</svg>'

def hotspot(kind, label, state, left, top):
    # state: found | wrong | idle
    if state == "found":
        c, bd, bg = GLOW, GILT, "rgba(245,207,134,0.13)"
        badge = ('<span style="position:absolute;top:-9px;right:-9px;width:21px;height:21px;border-radius:50%;'
          'background:' + OXBLOOD + ';border:1px solid #C07A86;display:flex;align-items:center;justify-content:center;">'
          '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#F3D9C8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg></span>')
        ring = "box-shadow:0 0 28px rgba(245,207,134,0.5);"
    elif state == "wrong":
        c, bd, bg, badge, ring = "#7A6647", "rgba(110,36,51,0.5)", "transparent", "", "opacity:0.45;"
    else:
        c, bd, bg, badge, ring = "#C3A87A", "rgba(201,162,39,0.32)", "rgba(0,0,0,0.22)", "", ""
    return ('<button type="button" style="position:absolute;left:' + str(left) + 'px;top:' + str(top) + 'px;padding:11px;'
      'background:' + bg + ';border:1px dashed ' + bd + ';border-radius:4px;' + ring + '">'
      + obj_svg(kind, c) + badge +
      '<div style="font-family:\'EB Garamond\',serif;font-size:12px;color:' + c + ';margin-top:5px;white-space:nowrap;">' + label + '</div></button>')
print("scene parts ok")

def task_banner(kind, text, count):
    return ('<div style="display:flex;align-items:center;gap:18px;padding:15px 22px;'
      'background:linear-gradient(180deg,rgba(58,44,22,0.92),rgba(30,22,11,0.92));border:1px solid rgba(201,162,39,0.5);'
      'border-radius:3px;box-shadow:0 12px 30px rgba(0,0,0,0.6);backdrop-filter:blur(2px);">'
      '<div style="width:34px;height:34px;flex-shrink:0;border-radius:50%;border:1px solid ' + BRASS + ';display:flex;align-items:center;justify-content:center;">'
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="' + GILT + '" stroke-width="1.9" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5L21 21"/></svg></div>'
      '<div><div style="font-family:\'IM Fell English SC\',serif;font-size:10.5px;letter-spacing:0.13em;color:' + BRASS + ';margin-bottom:5px;">' + kind + '</div>'
      '<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:18.5px;line-height:1.4;color:' + PAPER + ';max-width:46ch;">' + text + '</div></div>'
      '<div style="width:1px;height:42px;background:rgba(201,162,39,0.3);"></div>'
      '<div style="text-align:center;flex-shrink:0;"><div style="font-family:\'Bodoni Moda\',serif;font-size:23px;color:' + GLOW + ';line-height:1;">' + count + '</div>'
      '<div style="font-family:\'EB Garamond\',serif;font-size:12px;color:#A78F65;margin-top:4px;">found</div></div></div>')

# ============ 6. THE DRAWING ROOM ============
window_pane = ('<div style="position:absolute;left:706px;top:150px;width:352px;height:452px;'
  'background:linear-gradient(180deg,#8FA6B4 0%,#B9B79A 44%,#D8C08A 74%,#9C8556 100%);'
  'box-shadow:0 0 140px 42px rgba(245,207,134,0.30),inset 0 0 60px rgba(60,48,24,0.35);border:9px solid #23170D;">'
  '<div style="position:absolute;left:50%;top:0;bottom:0;width:7px;background:#23170D;transform:translateX(-50%);"></div>'
  '<div style="position:absolute;left:0;right:0;top:34%;height:6px;background:#23170D;"></div>'
  '<div style="position:absolute;left:0;right:0;bottom:0;height:96px;background:linear-gradient(180deg,rgba(60,74,44,0.5),rgba(30,40,22,0.85));"></div>'
  '<div style="position:absolute;left:0;right:0;bottom:78px;height:2px;background:rgba(40,52,30,0.55);"></div></div>')

furniture = ('<div style="position:absolute;left:250px;top:520px;width:300px;height:15px;background:linear-gradient(180deg,#4A2F1C,#241509);border-radius:3px;box-shadow:0 16px 34px rgba(0,0,0,0.75);"></div>'
  '<div style="position:absolute;left:276px;top:535px;width:13px;height:132px;background:#2A1A0F;"></div>'
  '<div style="position:absolute;left:510px;top:535px;width:13px;height:132px;background:#2A1A0F;"></div>'
  '<div style="position:absolute;left:1120px;top:470px;width:186px;height:15px;background:linear-gradient(180deg,#4A2F1C,#241509);border-radius:3px;box-shadow:0 14px 30px rgba(0,0,0,0.7);"></div>'
  '<div style="position:absolute;left:1140px;top:485px;width:11px;height:118px;background:#2A1A0F;"></div>'
  '<div style="position:absolute;left:1278px;top:485px;width:11px;height:118px;background:#2A1A0F;"></div>'
  '<div style="position:absolute;left:0;right:0;top:640px;height:3px;background:rgba(201,162,39,0.10);"></div>')

room_inner = (window_pane + furniture +
  hotspot("coat", "white coat", "found", 330, 404) +
  hotspot("gun", "guns", "found", 452, 404) +
  hotspot("dog", "the spaniel", "idle", 1140, 352) +
  hotspot("cup", "tea things", "wrong", 1210, 620) +
  hotspot("letter", "letters of introduction", "idle", 156, 640) +
  hotspot("hat", "hat", "idle", 588, 654) +
  hotspot("stick", "walking stick", "idle", 700, 690) +
  '<div style="position:absolute;left:62px;top:52px;">' +
  task_banner("Search the room", "Three went out through that window, and the niece said what each of them had. Find all three.", "2 of 3") + '</div>' +
  '<div style="position:absolute;left:62px;bottom:46px;display:flex;align-items:center;gap:15px;opacity:0.82;">' + cameo(62, False) +
  '<div><div style="font-family:\'IM Fell English SC\',serif;font-size:10px;letter-spacing:0.1em;color:' + BRASS + ';margin-bottom:5px;">Inspector Inkwell</div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:16px;line-height:1.45;color:#D6C39A;max-width:34ch;font-style:italic;">The tea things were her aunt&rsquo;s doing, not theirs. Read that part again.</div></div></div>' +
  '<div style="position:absolute;right:62px;bottom:46px;display:flex;align-items:center;gap:16px;">'
  '<span style="font-family:\'EB Garamond\',serif;font-size:14px;color:#A78F65;">Open the book again</span>'
  + gildbtn("One still missing") + '</div>')
(ROOT/"Room.dc.html").write_text(page(desk(room_inner).replace("radial-gradient(900px 620px at 50% 24%, #4A3320 0%, #241608 46%, #100A05 82%)","radial-gradient(1000px 760px at 61% 40%, #3A3020 0%, #1E160C 48%, #0D0905 84%)")), encoding="utf-8")

# ============ 7. THE SUSPECTS ============
def suspect(kind, name, role, clues, state):
    lit = state == "picked"
    plate_bg = "linear-gradient(180deg,#5C4820,#332612)" if lit else "linear-gradient(180deg,#3A2E16,#221909)"
    bd = GILT if lit else "rgba(201,162,39,0.35)"
    return ('<div style="display:flex;flex-direction:column;align-items:center;gap:14px;padding:22px 20px 18px;'
      'border:1px solid ' + bd + ';border-radius:3px;background:' + ("rgba(245,207,134,0.07)" if lit else "rgba(0,0,0,0.25)") + ';'
      + ("box-shadow:0 0 40px rgba(245,207,134,0.22);" if lit else "") + '">'
      + bust(kind, 112, lit) +
      '<div style="padding:8px 18px;background:' + plate_bg + ';border:1px solid ' + bd + ';border-radius:2px;text-align:center;min-width:132px;">'
      '<div style="font-family:\'Bodoni Moda\',serif;font-size:17px;color:' + (GLOW if lit else "#C7AF80") + ';line-height:1.1;">' + name + '</div>'
      '<div style="font-family:\'EB Garamond\',serif;font-size:12.5px;color:#9A845E;margin-top:3px;">' + role + '</div></div>'
      '<div style="font-family:\'EB Garamond\',serif;font-size:12.5px;color:' + (GILT if lit else "#8A7554") + ';">' + clues + '</div></div>')

sus_inner = ('<div style="position:absolute;left:50%;top:56px;transform:translateX(-50%);">' +
  task_banner("Name the culprit", "One person in this house told Framton something that was not true. You have four clues that say who.", "4 clues") + '</div>' +
  '<div style="position:absolute;left:50%;top:238px;transform:translateX(-50%);display:flex;gap:26px;">'
  + suspect("bun", "Vera", "the niece, fifteen", "3 clues point here", "picked")
  + suspect("bare", "Framton", "the caller", "no clues", "idle")
  + suspect("updo", "Mrs Sappleton", "the aunt", "1 clue", "idle")
  + suspect("tophat", "Ronnie", "her youngest brother", "no clues", "idle")
  + '</div>' +
  '<div style="position:absolute;left:50%;bottom:52px;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:18px;">'
  '<div style="font-family:\'EB Garamond\',serif;font-size:16px;color:#BBA47C;font-style:italic;">Naming is not enough. You will be asked which clue proves it.</div>'
  '<div style="display:flex;gap:16px;">' + quietbtn("Look at my clues again") + gildbtn("Name Vera") + '</div></div>')
(ROOT/"Suspects.dc.html").write_text(page(desk(sus_inner)), encoding="utf-8")
print("room + suspects done")

def plaque(text, state):
    if state == "turning":
        return ('<button type="button" style="display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;text-align:left;'
          'padding:16px 19px;background:linear-gradient(180deg,#6B5526,#3E2F12);border:1px solid ' + GILT + ';border-radius:2px;'
          'box-shadow:0 0 30px rgba(245,207,134,0.3),inset 0 1px 0 rgba(255,255,255,0.22);">'
          '<span style="width:26px;height:26px;flex-shrink:0;border-radius:50%;border:2px solid ' + GLOW + ';display:flex;align-items:center;justify-content:center;">'
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="' + GLOW + '" stroke-width="2.4" stroke-linecap="round"><path d="M12 3v9"/><path d="M5.6 6.6a9 9 0 1012.8 0"/></svg></span>'
          '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:17px;line-height:1.4;color:' + PAPER + ';">' + text + '</span></button>')
    dead = state == "dead"
    return ('<button type="button" style="display:flex;align-items:center;gap:14px;width:100%;box-sizing:border-box;text-align:left;'
      'padding:16px 19px;background:linear-gradient(180deg,#3A2E16,#221909);border:1px solid rgba(201,162,39,0.3);border-radius:2px;'
      'box-shadow:inset 0 1px 0 rgba(255,255,255,0.08);' + ("opacity:0.45;" if dead else "") + '">'
      '<span style="width:26px;height:26px;flex-shrink:0;border-radius:50%;border:1.5px solid rgba(201,162,39,0.45);"></span>'
      '<span style="font-family:\'EB Garamond\',Garamond,serif;font-size:17px;line-height:1.4;color:#C2AB80;">' + text + '</span></button>')

# ============ 8. THE WORD LOCK ============
box = ('<div style="width:398px;height:296px;box-sizing:border-box;position:relative;border-radius:5px;'
  'background:linear-gradient(160deg,#5C3D25 0%,#3A2416 44%,#241509 100%);'
  'box-shadow:0 40px 70px rgba(0,0,0,0.75),inset 0 2px 0 rgba(255,255,255,0.12);' + GRAIN + '">'
  '<div style="position:absolute;left:16px;right:16px;top:16px;bottom:16px;border:1px solid rgba(201,162,39,0.35);border-radius:3px;"></div>'
  '<div style="position:absolute;left:0;right:0;top:112px;height:12px;background:linear-gradient(180deg,#1A0F07,#31200F);"></div>'
  '<div style="position:absolute;left:36px;top:34px;width:28px;height:28px;border:2px solid ' + BRASS + ';border-radius:2px;opacity:0.7;"></div>'
  '<div style="position:absolute;right:36px;top:34px;width:28px;height:28px;border:2px solid ' + BRASS + ';border-radius:2px;opacity:0.7;"></div>'
  '<div style="position:absolute;left:50%;top:150px;transform:translateX(-50%);width:246px;padding:16px 0;text-align:center;'
  'background:linear-gradient(180deg,#8A6E2E,#4E3A13);border:2px solid ' + GILT + ';border-radius:3px;'
  'box-shadow:0 0 34px rgba(245,207,134,0.35),inset 0 1px 0 rgba(255,255,255,0.3);">'
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:9.5px;letter-spacing:0.18em;color:#E8D3A0;margin-bottom:6px;">The lock reads</div>'
  '<div style="font-family:\'Bodoni Moda\',Didot,serif;font-size:31px;letter-spacing:0.04em;color:#FBEBC6;line-height:1;">falteringly</div></div>'
  '<div style="position:absolute;left:50%;bottom:26px;transform:translateX(-50%);display:flex;gap:7px;">'
  '<span style="width:36px;height:5px;background:' + GILT + ';border-radius:3px;box-shadow:0 0 8px rgba(245,207,134,0.7);"></span>'
  '<span style="width:36px;height:5px;background:rgba(201,162,39,0.25);border-radius:3px;"></span></div></div>')

applied = ('<div style="display:flex;align-items:flex-start;gap:13px;padding:15px 18px;background:rgba(245,207,134,0.07);'
  'border-left:2px solid ' + GILT + ';border-radius:2px;margin-bottom:26px;max-width:560px;">'
  '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + GILT + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="margin-top:3px;flex-shrink:0;"><path d="M20 6L9 17l-5-5"/></svg>'
  '<div><div style="font-family:\'IM Fell English SC\',serif;font-size:10px;letter-spacing:0.12em;color:' + BRASS + ';margin-bottom:6px;">You already used it</div>'
  '<div style="font-family:\'EB Garamond\',serif;font-size:16px;line-height:1.5;color:' + PAPER + ';">When her voice went <span style="font-style:italic;">falteringly</span> human, you chose to stop trusting her calm. That was the right move. Now name what the word means.</div></div></div>')

quote_card = ('<div style="max-width:560px;padding:20px 24px;background:linear-gradient(170deg,#EDE1C4,#DED0AC);border-radius:3px;'
  'box-shadow:0 18px 34px rgba(0,0,0,0.5);transform:rotate(-0.6deg);margin-bottom:28px;">'
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:10px;letter-spacing:0.12em;color:#7A6647;margin-bottom:9px;">From the passage, line 27</div>'
  '<div style="font-family:\'EB Garamond\',Garamond,serif;font-size:17.5px;line-height:1.65;color:' + INKC + ';">Here the child&rsquo;s voice lost its self-possessed note and became <span style="background:rgba(201,162,39,0.32);box-shadow:0 0 0 2px rgba(201,162,39,0.32);">falteringly</span> human.</div></div>')

word_inner = ('<div style="position:absolute;left:66px;top:50px;">' +
  task_banner("Turn the lock", "The box will not open until you say what the word means where it stands.", "3 words") + '</div>'
  '<div style="position:absolute;left:66px;top:206px;width:576px;">' + applied + quote_card +
  '<div style="display:flex;align-items:center;gap:14px;">' + cameo(56, True) +
  '<div style="font-family:\'EB Garamond\',serif;font-size:15.5px;line-height:1.5;color:#D6C39A;font-style:italic;max-width:38ch;">Three words in your notebook so far. This one is worth having.</div></div></div>'
  '<div style="position:absolute;right:76px;top:168px;display:flex;gap:44px;align-items:flex-start;">'
  '<div>' + box + '</div>'
  '<div style="width:352px;display:flex;flex-direction:column;gap:11px;padding-top:6px;">'
  '<div style="font-family:\'IM Fell English SC\',serif;font-size:10.5px;letter-spacing:0.13em;color:' + BRASS + ';margin-bottom:5px;">Turn it to the right meaning</div>'
  + plaque("breaking and unsteady", "turning")
  + plaque("suddenly loud and certain", "idle")
  + plaque("cold and unfeeling", "idle")
  + plaque("cheerful and quick", "idle")
  + '<div style="height:8px;"></div>' + gildbtn("Open the box") + '</div></div>')
(ROOT/"Word.dc.html").write_text(page(desk(word_inner)), encoding="utf-8")
print("word lock done")
