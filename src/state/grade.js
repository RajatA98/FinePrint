// Grading is pure: a lesson, an item, the choices made. It never touches state.

export const FINALE_RECONSTRUCT = "finale-reconstruct";
export const FINALE_STATEMENT = "finale-statement";

/**
 * grade(lesson, challengeId, choiceIds) -> {correct, evidenceLine}
 *
 * A normal challenge is correct when the set of choiceIds equals the set of
 * `answer`. The two finale items take an object instead of an id list:
 *   finale-reconstruct: {people, clues, culprit}
 *   finale-statement:   {slots}
 * Both also report `solved` (the contract's finale.solved rule) so the reducer
 * does not have to re-derive it.
 */
export function grade(lesson, challengeId, choiceIds) {
  if (challengeId === FINALE_RECONSTRUCT) {
    return gradeReconstruct(lesson, choiceIds);
  }
  if (challengeId === FINALE_STATEMENT) {
    return gradeStatement(lesson, choiceIds);
  }
  const challenge = lesson?.challenges?.[challengeId];
  if (!challenge) {
    throw new Error(`unknown challenge: ${challengeId}`);
  }
  return {
    correct: sameSet(choiceIds, challenge.answer),
    evidenceLine: challenge.evidence ?? null
  };
}

function gradeReconstruct(lesson, submission) {
  const { people = {}, clues = [], culprit = null } = submission ?? {};
  const reconstruct = lesson.finale.reconstruct;
  const chosen = new Set(clues);

  const peopleCorrect = reconstruct.people.every(
    (prompt) => people[prompt.cameo] === prompt.answer
  );
  const allProvingChosen = reconstruct.clues
    .filter((clue) => clue.proving)
    .every((clue) => chosen.has(clue.id));
  const noDecoyChosen = !reconstruct.clues
    .filter((clue) => !clue.proving)
    .some((clue) => chosen.has(clue.id));
  const culpritCorrect = culprit === reconstruct.culprit.answer;

  // The contract fixes finale.solved as culprit plus every proving clue and no
  // decoy. The scored item also asks the portraits to be right.
  const solved = culpritCorrect && allProvingChosen && noDecoyChosen;
  return {
    correct: solved && peopleCorrect,
    evidenceLine: null,
    solved,
    culpritCorrect,
    peopleCorrect
  };
}

function gradeStatement(lesson, submission) {
  const { slots = {} } = submission ?? {};
  const correct = lesson.finale.statement.slots.every((slot) => {
    const trueOption = slot.options.find((option) => option.true === true);
    return Boolean(trueOption) && slots[slot.id] === trueOption.vocabulary;
  });
  return { correct, evidenceLine: null };
}

function sameSet(chosen, answer) {
  const a = new Set(chosen ?? []);
  const b = new Set(answer ?? []);
  if (a.size !== b.size) {
    return false;
  }
  for (const id of b) {
    if (!a.has(id)) {
      return false;
    }
  }
  return true;
}
