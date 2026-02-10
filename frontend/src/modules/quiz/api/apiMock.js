import sections from "../fixtures/sections.json";
import unitsArticles from "../fixtures/units_by_section_sec_articles.json";
import unitsNouns from "../fixtures/units_by_section_sec_nouns.json";

import quizAAn from "../fixtures/quiz_unit_articles_a_an.json";
import quizMixed from "../fixtures/quiz_unit_articles_mixed.json";
import quizThe from "../fixtures/quiz_unit_articles_the.json";
import quizCountable from "../fixtures/quiz_unit_nouns_countable.json";
import quizProper from "../fixtures/quiz_unit_nouns_proper.json";

const unitsBySection = {
  sec_articles: unitsArticles,
  sec_nouns: unitsNouns,
};

const quizByUnit = {
  unit_articles_a_an: quizAAn,
  unit_articles_mixed: quizMixed,
  unit_articles_the: quizThe,
  unit_nouns_countable: quizCountable,
  unit_nouns_proper: quizProper,
};

// fake DB for attempt answers
const attempts = {};

export async function getSections() {
  return new Promise((r) => setTimeout(() => r(sections), 150));
}

export async function getUnits(sectionId) {
  return new Promise((r, rej) => {
    const data = unitsBySection[sectionId];
    data ? setTimeout(() => r(data), 150) : rej("Section not found");
  });
}

export async function getQuiz(unitId) {
  const quiz = quizByUnit[unitId];
  if (!quiz) throw new Error("Quiz not found");
  return quiz;
}

export async function createAttempt(unitId) {
  const attemptId = "att_mock_" + Math.random().toString(36).slice(2, 8);
  attempts[attemptId] = { unitId, selections: {} };
  return { attemptId };
}

export async function saveAnswer(attemptId, { questionId, choiceId }) {
  if (!attempts[attemptId]) throw new Error("Attempt not found");
  attempts[attemptId].selections[questionId] = choiceId;
  return { ok: true };
}

export async function submitAttempt(attemptId) {
  const attempt = attempts[attemptId];
  if (!attempt) throw new Error("Attempt not found");
  const quiz = await getQuiz(attempt.unitId);
  const selections = attempt.selections;

  const answerKey = {
    // a/an
    q_art_a_an_01: "c_art_a_an_01_b",
    q_art_a_an_02: "c_art_a_an_02_a",
    q_art_a_an_03: "c_art_a_an_03_b",
    q_art_a_an_04: "c_art_a_an_04_a",
    q_art_a_an_05: "c_art_a_an_05_b",
    q_art_a_an_06: "c_art_a_an_06_a",
    // mixed
    q_art_mix_01: "c_art_mix_01_b",
    q_art_mix_02: "c_art_mix_02_b",
    q_art_mix_03: "c_art_mix_03_c",
    q_art_mix_04: "c_art_mix_04_b",
    q_art_mix_05: "c_art_mix_05_c",
    q_art_mix_06: "c_art_mix_06_b",
    q_art_mix_07: "c_art_mix_07_a",
    q_art_mix_08: "c_art_mix_08_c",
    q_art_mix_09: "c_art_mix_09_c",
    q_art_mix_10: "c_art_mix_10_c",
    // the
    q_art_the_01: "c_art_the_01_c",
    q_art_the_02: "c_art_the_02_c",
    q_art_the_03: "c_art_the_03_c",
    q_art_the_04: "c_art_the_04_c",
    q_art_the_05: "c_art_the_05_c",
    q_art_the_06: "c_art_the_06_c",
    // countable
    q_n_count_01: "c_n_count_01_b",
    q_n_count_02: "c_n_count_02_b",
    q_n_count_03: "c_n_count_03_c",
    q_n_count_04: "c_n_count_04_b",
    q_n_count_05: "c_n_count_05_c",
    q_n_count_06: "c_n_count_06_a",
    // proper
    q_n_prop_01: "c_n_prop_01_c",
    q_n_prop_02: "c_n_prop_02_b",
    q_n_prop_03: "c_n_prop_03_b",
    q_n_prop_04: "c_n_prop_04_b",
    q_n_prop_05: "c_n_prop_05_b",
  };

  let numCorrect = 0;
  const items = quiz.questions.map((q) => {
    const your = selections[q.id] || null;
    const correct = answerKey[q.id];
    const isCorrect = your === correct;

    const byId = Object.fromEntries(q.choices.map((ch) => [ch.id, ch.text]));
    const yourText = your ? byId[your] : "—";
    const correctText = byId[correct];

    if (isCorrect) numCorrect++;
    return {
      questionId: q.id,
      stem: q.stem,
      yourChoiceId: your,
      yourChoiceText: yourText,
      correctChoiceId: correct,
      correctChoiceText: correctText,
      isCorrect,
      explanation: q.explanation,
    };
  });

  const numTotal = quiz.questions.length;
  const scorePercent = Math.round((numCorrect / numTotal) * 100);
  const result = { attemptId, unitId: attempt.unitId, numCorrect, numTotal, scorePercent, items };
  attempts[attemptId].result = result;
  return result;
}

export async function getAttempt(attemptId) {
  const att = attempts[attemptId];
  if (!att || !att.result) throw new Error("Not submitted");
  return att.result;
}
