# Fine Print: Build Spec

> Working title: **Fine Print** ("Read like a detective"). Detective avatar working name: **Inspector Inkwell**. Both names still need a trademark / app store check.

Nerdy AI Hackathon, English Reading Game prompt. **Deadline: Friday Sep 18, 2026, 11:59 PM CDT.** Submission = project link + 2 to 3 minute demo video. Target: submit Friday afternoon.

---

## 1. Product in one paragraph

A reading comprehension game for grades 6 to 12. Any public domain short story is ingested and turned into a **case**. The story is sliced into SAT-length excerpts (about 80 to 150 words). For each excerpt the reader previews a vocab word, reads silently while timed, then plays a 3-question mini-game (Decode, Deduce, Pin the Evidence). After the last excerpt the reader plays **Reconstruct the Case**, a full-story comprehension finale. A 3D Victorian detective avatar guides the whole lesson. Results show effective reading rate and skill-level accuracy.

**Pitch line:** "Any book in, a verified reading case out. You read like a detective, then prove you solved the case."

### Scope boundaries
- Silent reading only. We measure **silent reading efficiency**, not oral fluency (accuracy/prosody need read-aloud; out of scope).
- No image generation.
- No open-ended chat with the avatar. All avatar lines are pre-generated and validated.
- Demo story: **"The Open Window" by Saki** (Gutenberg #269, public domain, 1,208 words).

---

## 2. Lesson loop

```
Case Briefing (detective)
  for each excerpt (about 10 for The Open Window):
    1. Vocab preview        (0 or 1 Tier 2 word; skip if none worth teaching)
    2. Detective setup line (1 sentence, no spoilers)
    3. Timed silent read    (sentence reveal)
    4. Mini-game
         a. DECODE   word in context or key detail
         b. DEDUCE   inference / central idea / author's purpose
         c. PIN      tap the sentence that proves the DEDUCE answer -> pinned to case board
    5. Feedback (detective), rewind on wrong answers
Reconstruct the Case
    Stage 1  Rebuild the timeline      (order pinned clues)
    Stage 2  Question the witnesses    (character switching; vocab inside choices; apply-then-define)
    Stage 3  Catch the lie             (point to the pinned clue that contradicts a statement)
    Stage 4  Name the answer           (pick explanation + build 2-3 clue evidence chain)
Case Report (detective)
```

### Interaction rules (non-negotiable)
- **Detective never speaks during reading.** Avatar is minimized/hidden on the reading screen.
- **No timer on questions.** Speed is measured only during reading.
- **Rereading allowed.** Previously revealed sentences stay visible.
- **Wrong answer = rewind.** Highlight the evidence region, let the reader retry.
- **Only first attempts are scored.** Retries exist so everyone finishes.
- **Apply before define.** In vocab moments, ask the action question first, then the definition, and score them separately.
- **Tell the reader how many items to find** when a task has multiple targets.
- Case language is "what really happened," not "who's the criminal." Not every story is a crime.

---

## 3. Design decisions (keep this list updated; it is interview prep)

| Decision | Why |
|---|---|
| Silent timed reading, not read-aloud | Target is grades 6+ silent reading; read-aloud tools (Readability, Amira) own that space |
| Effective reading rate = WPM x comprehension | Speed without comprehension is skimming (Rayner et al., 2016) |
| No speed-reading tricks (RSVP, no-regression) | Most regressions repair comprehension failures (Rayner et al., 2016) |
| Inconsistency detection ("Catch the lie") | Established comprehension-monitoring paradigm; training transfers to general comprehension (Wassenburg et al., 2015) |
| Tier 2 vocab preview | Beck, McKeown & Kucan framework |
| Vocab review spaced across excerpts/lessons | Spaced > massed for retention |
| Evidence pinning linked to DEDUCE | Exposes lucky guesses; mirrors SAT command-of-evidence |
| Real public domain text, AI writes only questions/scripts | Avoids hallucinated passage content |
| Fact sheet before question generation | Every item traces to sentence IDs; reduces drift |
| Sentence IDs, not quoted strings | Robust references for evidence and validation |
| No images | Image models can't guarantee details; an unplanned detail would mark correct readers wrong |
| Pre-generated avatar lines + cached TTS | No latency, per-book cost (not per-student), nothing unreviewed said to kids |
| Quota on game generations + word cap | Cost scales with words processed, not storage |
| Shared library for public domain; private uploads stay private | Generate once, reuse for everyone; don't redistribute content derived from user-uploaded copyrighted books |
| Collections: pick a story, one story = one game | Whole collections exceed tier caps; stories are natural lesson units |
| No real learning-gain claims | Two days can't show gains; show real baseline + adaptation, label any simulated charts |

---

## 4. Architecture

```
frontend/   Next.js (App Router) + TypeScript + Tailwind
  - Library, Upload, Lesson player, Reconstruct, Case Report
  - Detective component (TalkingHead 3D, 2D fallback)
backend/    FastAPI (Python)
  - REST API
  - Ingestion pipeline (background jobs)
  - SQLite via SQLModel (swap to Postgres later)
  - Static audio cache (local disk or bucket)
pipeline/   Python modules, one per stage, each idempotent + cached
evals/      scripts + results JSON/markdown
content/    generated lessons (JSON) + audio
```

- LLM and TTS providers behind small interfaces (`llm.complete_json(schema, prompt)`, `tts.synthesize(text) -> (audio_path, word_timings)`). Model names in config, not code.
- All LLM calls use structured JSON output validated with Pydantic.
- Log per call: stage, tokens in/out, cost estimate, latency. Aggregate per lesson.

### API (minimum)
```
POST /api/uploads                 (epub or txt) -> {upload_id, stories:[{story_id,title,words}]}
POST /api/lessons                 {story_id} -> {job_id}   (quota check here)
GET  /api/jobs/{job_id}           -> {status, stage, progress, stats}
GET  /api/library                 -> shared + user lessons
GET  /api/lessons/{lesson_id}     -> lesson JSON
POST /api/sessions                {lesson_id} -> {session_id}
POST /api/sessions/{id}/events    batched reading + answer events
GET  /api/sessions/{id}/report    -> case report
GET  /api/me                      -> {plan, games_used, games_limit, word_cap}
```

---

## 5. Data model

### Lesson JSON (content, generated once per story)
```json
{
  "lesson_id": "saki-the-open-window",
  "source": {"title": "The Open Window", "author": "Saki", "gutenberg_id": 269, "license": "public_domain_us"},
  "content_hash": "sha256:...",
  "words": 1208,
  "reading_level": {"flesch_kincaid_grade": 0.0},
  "visibility": "shared",
  "status": "verified",
  "characters": [{"id": "vera", "name": "Vera", "role": "the niece"}],
  "fact_sheet": {
    "events": [
      {"id": "ev1", "who": "vera", "what": "...", "why": "...", "feeling": "...", "evidence": ["x2_s3"]}
    ]
  },
  "excerpts": [ { "...": "see Excerpt" } ],
  "reconstruct": { "...": "see Reconstruct" },
  "detective": { "...": "see Detective script" },
  "validation": {"items_total": 0, "items_verified": 0, "items_dropped": 0, "drop_reasons": {}},
  "generation_stats": {"tokens_in": 0, "tokens_out": 0, "cost_usd": 0.0, "seconds": 0.0}
}
```

### Excerpt
```json
{
  "excerpt": 4,
  "words": 118,
  "sentences": [{"id": "x4_s1", "text": "..."}],
  "vocab_preview": {"word": "...", "definition": "...", "example": "..."},
  "minigame": [
    {
      "slot": "decode",
      "type": "word_in_context",
      "prompt": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 1,
      "distractor_types": ["opposite", null, "same_category", "same_category"],
      "evidence": ["x4_s2"]
    },
    {
      "slot": "deduce",
      "type": "inference",
      "prompt": "...",
      "options": ["...", "...", "...", "..."],
      "answer": 2,
      "distractor_types": ["true_not_stated", "too_broad", null, "distorted"],
      "evidence": ["x4_s3"]
    },
    {
      "slot": "pin",
      "type": "evidence_tap",
      "linked_to": "deduce",
      "prompt": "Pin the sentence that proves it.",
      "answer_sentences": ["x4_s3"],
      "clue_label": "Vera knows the aunt's routine"
    }
  ],
  "verified": true
}
```

Allowed `decode` types: `word_in_context`, `key_detail`.
Allowed `deduce` types: `inference`, `central_idea`, `author_purpose`, `character_motive`.
Allowed distractor types: `opposite`, `same_category`, `true_not_stated`, `too_broad`, `too_narrow`, `distorted`.

### Reconstruct
```json
{
  "timeline": {"clue_ids": ["c1", "c4", "c2", "c7"], "correct_order": ["c1", "c2", "c4", "c7"]},
  "witnesses": [
    {
      "character": "framton",
      "prompt": "You're Framton. ... What do you do?",
      "skill": "action",
      "options": ["..."],
      "answer": 0,
      "evidence": ["x9_s1"],
      "vocab_check": {
        "word": "...",
        "prompt": "What does ... mean?",
        "options": ["...", "...", "...", "..."],
        "answer": 1,
        "distractor_types": ["opposite", null, "same_category", "same_category"]
      }
    }
  ],
  "lie": {
    "speaker": "vera",
    "statement": "...",
    "contradicted_by_clue": "c7",
    "evidence": ["x9_s2"]
  },
  "solve": {
    "prompt": "What really happened, and why?",
    "options": ["..."],
    "answer": 1,
    "required_clues": ["c2", "c5", "c7"],
    "min_clues": 2
  }
}
```

Skill order in witnesses: who -> what -> why -> feeling -> climax.

### Detective script
```json
{
  "lines": [
    {"id": "brief", "trigger": "case_start", "text": "...", "audio": "audio/lesson/brief.mp3", "timings": [], "mood": "neutral", "gesture": null},
    {"id": "x4_setup", "trigger": "excerpt_start:4", "text": "..."},
    {"id": "fb_pin_wrong", "trigger": "pin_wrong", "template": "That evidence doesn't hold up. Look closer at {region}."}
  ]
}
```
- Template lines use a small fixed set of pre-recorded variants plus captions; the slot value appears in captions only.
- Spoiler rule: a line for excerpt N may only reference events with evidence in excerpts 1..N.

### Session / events (per reader)
```
User(id, plan, games_used)
Session(id, user_id, lesson_id, started_at, finished_at)
ReadingEvent(session_id, excerpt, sentence_id, revealed_at_ms, visible, idle)
AnswerEvent(session_id, item_id, slot, choice, correct, attempt_no, at_ms)
VocabState(user_id, word, seen_count, last_seen, correct_streak, due_after_lesson)
```

---

## 6. Ingestion pipeline

Each stage: input hash -> cached output on disk/DB. Failures resume from the last good stage. Chapters/stories process concurrently behind a semaphore.

### Stage 1: Ingest
- Accept `.epub` and `.txt`.
- EPUB -> markdown via pandoc. Strip Gutenberg header/footer (markers may be escaped as `\*\*\*`).
- Split by story headings. Skip front matter, license, and bodies under 200 words.
- Return story list with word counts (this is the collection picker).
- **Starting point:** `split_collection.py` (already works on Gutenberg #269: 36 stories, 1,022 to 2,246 words each).

### Stage 2: Quota check
- Word count known before any LLM call.
- Reject if over the plan's word cap or out of generations. Show "This will use 1 game generation" confirm.
- If `content_hash` already exists in shared library: return it, charge 0.

### Stage 3: Slice
- Split into paragraphs, group consecutive paragraphs up to 150 words.
- **Fallback:** a paragraph over 150 words is split at sentence boundaries (The Open Window excerpt 4 is a 215-word paragraph).
- Merge a trailing excerpt under 60 words into the previous one if the result stays at or under 170.
- Sentence-split each excerpt; assign IDs `x{n}_s{m}`.
- Test on The Open Window: expect about 10 excerpts, all 60 to 170 words.

### Stage 4: Fact sheet (LLM)
- Whole story in, JSON out: characters, events (who/what/why/feeling), each with evidence sentence IDs.
- Validate: every evidence ID exists.

### Stage 5: Vocab candidates (code) + selection (LLM)
- Candidates: words in a frequency band approximating Tier 2 (use `wordfreq`; tune band), exclude proper nouns and archaic spellings that aren't useful.
- LLM picks at most 1 per excerpt, writes a kid-friendly definition, a non-spoiler example sentence not from the story, and distractors (1 opposite, 2 same-category).
- Validate: word appears in that excerpt.

### Stage 6: Mini-games (LLM, per excerpt)
- Input: excerpt sentences + fact sheet events for excerpts 1..N (no future events).
- Output: decode, deduce, pin as in schema.

### Stage 7: Reconstruct (LLM)
- Clues = pin items from Stage 6 (id, label, sentence).
- Generate timeline, 4 to 6 witness items with character switching, 1 lie, 1 solve.

### Stage 8: Detective script (LLM) + audio (TTS)
- Lines: briefing, per-excerpt setup, feedback variants, reconstruct stage intros, case report templates.
- TTS each line once; store audio + word timings (from TTS, or align with Whisper if the provider has none).

### Stage 9: Validate (gates)
Code checks:
- all evidence/answer sentence IDs exist
- vocab word appears in its excerpt
- pin sentence(s) belong to the same excerpt
- answer index in range, 4 options, no duplicate options
- distractor types present (word items must include an `opposite`)
- no spoilers: detective line for excerpt N references only events with evidence in 1..N

LLM judge checks (judge sees only the cited evidence sentences):
- Is the question answerable from the evidence?
- Which option does the judge pick? Must equal `answer`.
- Is any distractor also defensible from the text? Must be no.
- For `pin`: does the sentence support the linked deduce answer?
- For `lie`: does the cited sentence contradict the statement?

Policy: failed item regenerates up to 2 times, then is dropped with a reason. Excerpts need decode + deduce + pin all verified; otherwise the excerpt is read-only (no mini-game) and logged.

### Stage 10: Save
- Write lesson JSON, set `status`, update library, increment `games_used` only on success.

### Job progress
`queued -> ingest -> slice -> fact_sheet -> vocab -> minigames -> reconstruct -> detective -> validate -> done` with per-stage counts shown in the UI.

---

## 7. Frontend

### Screens
1. **Library**: shared lessons (instant, 0 quota) + my lessons. Quota badge: "Games: 1 of 2 created".
2. **Upload**: file drop -> story picker with word counts -> confirm -> job progress view with stage stats.
3. **Lesson player**: detective briefing -> excerpt loop -> reconstruct -> report. Case board sidebar.
4. **Case report**.

### Reading screen
- Sentences reveal one at a time on Space / tap / "Next". Revealed sentences stay visible.
- Record `performance.now()` per reveal.
- Pause timing when `document.visibilityState !== "visible"` or idle over 30 s.
- A sentence read faster than 700 WPM is flagged `skim` and excluded from WPM.
- Detective avatar minimized, silent.

### Mini-game components
- `ChoiceCard` (decode, deduce, witnesses, solve)
- `SentenceTap` (pin, lie): passage with tappable sentences; correct pin animates onto the case board
- `CaseBoard`: pinned clues; missed clues shown as blank cards linking back to their excerpt
- `TimelineOrder`: drag to order (fallback: "which came first?" pairwise picks)
- `EvidenceChain`: select 2 to 3 clues from the board

### Case report
- Effective reading rate (and WPM)
- First-try accuracy: Decode, Deduce, Pin, Timeline, Witnesses, Lie, Solve, Vocab (apply vs define)
- "Right answer, wrong evidence" count
- Most common distractor type missed, with a one-line coaching tip
- Words queued for review
- Detective closing line (template filled with weakest skill)

---

## 8. Scoring

```
WPM          = words_read_non_skim / minutes_reading_non_skim
comprehension= first_try_correct / first_try_total      (all scored items in the lesson)
ERR          = WPM * comprehension                      (effective reading rate)
evidence_gap = count(deduce correct AND pin wrong)
solve_score  = 1.0 if answer correct and >= min_clues from required_clues
               0.5 if answer correct with weaker chain
               0.0 otherwise
```

Adaptation (between lessons):
- comprehension >= 0.80 for the lesson: raise the suggested pace target 5 to 10%
- comprehension < 0.70: lower pace target, recommend same reading level
- Weakest skill drives which deduce types appear more often next lesson (when the pipeline has alternatives) and the detective's coaching line.

Vocab review: words missed on define or apply get `due_after_lesson = next`; they reappear as a decode item or witness vocab check in the next lesson when present in that text, otherwise as a 1-question warmup.

---

## 9. Detective avatar

### Character
- Original character, **Inspector Inkwell** (working name). Victorian detective look: deerstalker, Inverness cape, magnifying glass. **No pipe. Do not call the character Sherlock Holmes.**
- Stylized and friendly, not realistic. Sharp, warm, a little funny, never mocking.

### Implementation
- Library: **TalkingHead** (met4citizen, Three.js). Use prerecorded audio + word timings (`speakAudio`; confirm exact signature in the repo README).
- Avatar model: GLB with the facial blend shapes TalkingHead expects (Ready Player Me compatible). **Verify availability first.**
- Props (hat, magnifying glass): separate GLBs attached to head/hand bones. Only CC0 or CC-BY assets; record attribution in `ASSETS.md`.
- Camera: head-and-shoulders view. Test performance on the recording machine.
- Moods/gestures: neutral (briefing), thinking (wrong answer), happy (correct), celebrate (case closed).
- Captions always on. Mute and skip buttons.

### Interface (so 2D fallback is a drop-in swap)
```ts
interface Detective {
  speak(line: { text: string; audioUrl: string; timings?: WordTiming[] }): Promise<void>;
  setMood(mood: "neutral" | "thinking" | "happy" | "celebrate"): void;
  minimize(hidden: boolean): void;
}
```
- `Detective3D` (TalkingHead) and `Detective2D` (sprite with idle/talk/think/celebrate states, mouth driven by audio amplitude).
- **Kill rule:** if 3D is not solid by Thursday evening, ship `Detective2D`. Script + audio pipeline is identical.

---

## 10. Plans and quota

| Plan | Game generations | Max words per game | Notes |
|---|---|---|---|
| Free | 2 total | 10,000 | Demo tier |
| Pro | N per month | 100,000 | Most novels |
| Unlimited | No monthly cap | Higher | Fair-use rate limit |

- Shared library lessons cost 0 generations.
- Failed generations are not charged.
- Over-limit behavior (demo): block with an upgrade message. Next step (doc only): partial game up to the cap.
- No payments. `plan` field + counter only.

---

## 11. Evals (deliverable: `evals/RESULTS.md`)

1. **Pipeline quality on The Open Window:** pass rate per gate, drop reasons, and a **hand review** of every item (record agree/disagree per item).
2. **FairytaleQA comparison** (github.com/uci-soe/FairytaleQAData; confirm license before use): run the pipeline on 10 to 20 stories.
   - Skill-type distribution vs expert questions
   - LLM judge accuracy on expert Q/A pairs (does the judge get expert answers right?)
   - Answerability rate of generated items
3. **Vocab items:** share with an `opposite` distractor, word-in-excerpt rate.
4. **Spoiler check:** detective lines flagged vs total.
5. **Cost and scale:** tokens, cost, and seconds per 1,000 words; parallel vs sequential time; cache hit cost on re-upload (~$0); projection for a 100-book library; per-student cost after generation (~$0).
6. **Self-test (honest):** Rajat's own first playthrough of The Open Window: WPM, ERR, skill accuracy. No fabricated progress charts.

---

## 12. Build order

### Wednesday night
- [ ] Repo scaffold (Next.js + FastAPI), config for LLM/TTS keys
- [ ] Stage 1 (reuse `split_collection.py`) + Stage 3 slicer with sentence fallback + tests
- [ ] Stage 4 fact sheet on The Open Window
- [ ] Confirm avatar model availability; load TalkingHead demo with one test line (1 hour max)
- [ ] Read "The Open Window" once

### Thursday
- [ ] Stages 5 to 7, Stage 9 validation
- [ ] Lesson JSON for The Open Window; start hand review
- [ ] Reading screen + timing, mini-game components, case board
- [ ] Reconstruct stages (timeline fallback allowed)
- [ ] Case report
- [ ] Stage 8 script + TTS; Detective3D (3 to 4 hours max, then 2D fallback)
- [ ] Deploy (frontend + backend)

### Friday morning
- [ ] Upload flow + job progress UI + quota badge/block
- [ ] Pre-generate 2 to 3 more Saki stories for the shared library
- [ ] Evals + `RESULTS.md`
- [ ] README, `DECISIONS.md` (from section 3), `ASSETS.md`
- [ ] Own playthrough (self-test numbers)

### Friday afternoon
- [ ] Record demo (with a backup recording of live generation)
- [ ] Submit

### Cut list (cut in this order if behind)
1. Pro/Unlimited UI (keep free tier only)
2. Drag timeline (use pairwise fallback)
3. 3D avatar (use 2D)
4. Voice (captions-only detective)
5. Live upload in video (show recorded run)

**Never cut:** reading timer, mini-game, Reconstruct solve stage, validation gates, eval results.

---

## 13. Demo script (3:00)

| Time | Beat |
|---|---|
| 0:00 to 0:15 | Hook: "I was a slow reader with weak comprehension. So I built the game I needed." |
| 0:15 to 0:45 | Library on free tier. Upload Saki collection, pick a story, "uses 1 of 2", pipeline stages + validation stats |
| 0:45 to 1:20 | Open "The Open Window". Detective briefing, vocab preview, timed read (sped up), Decode / Deduce / Pin with one wrong answer + rewind |
| 1:20 to 2:05 | Reconstruct the Case: timeline, a witness with character switch + vocab, catch Vera's lie, solve with evidence chain, "Case Closed" |
| 2:05 to 2:25 | Case report: ERR, skill accuracy, evidence gap, words for review |
| 2:25 to 2:50 | Rigor + scale slide: research basis, eval numbers vs FairytaleQA, cost per game, generate once reuse for every student, shared library instant load |
| 2:50 to 3:00 | Close: "Any book in, a verified reading case out." |

---

## 14. Acceptance criteria

- [ ] Uploading Gutenberg #269 lists 36 stories with word counts
- [ ] Generating "The Open Window" completes with a stage-by-stage progress view and validation stats
- [ ] Every scored item has evidence IDs that exist; pin sentences are in the right excerpt
- [ ] Reading WPM excludes hidden-tab, idle, and skim time
- [ ] Only first attempts affect scores; retries always possible
- [ ] Detective never speaks on the reading screen; captions always shown
- [ ] Free tier blocks a third generation and books over 10,000 words; shared lessons open without using quota
- [ ] Case report shows ERR, per-skill accuracy, evidence gap, review words
- [ ] `evals/RESULTS.md`, `DECISIONS.md`, `ASSETS.md`, README exist
- [ ] Deployed link works in a clean browser

---

## 15. Open items to verify

- [ ] FairytaleQA data license
- [ ] Avatar GLB source and license; prop licenses
- [ ] TTS provider returns word timings (else Whisper alignment)
- [ ] TalkingHead `speakAudio` input format
- [ ] Product and detective name availability
- [ ] Gutenberg license terms for redistributing derived lesson content
- [ ] "The Open Window" content check (read fully before demo)
