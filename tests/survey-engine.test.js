const assert = require("assert");
const {
  createSurveyState,
  startTaskSession,
  getAvailableDemos,
  getTaskProgress,
  getCurrentStep,
  submitAnswer
} = require("../survey-engine");

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error.message);
    process.exitCode = 1;
  }
}

function sequence(values) {
  const queue = [...values];
  return () => queue.shift() ?? 0.5;
}

test("prioritizes demos with fewer valid participants and filters unavailable demos", () => {
  const state = createSurveyState();
  const demos = getAvailableDemos(state, "user-demo", "task-soda", () => 0.5);
  const ids = demos.map((demo) => demo.id);

  assert.deepStrictEqual(ids.slice(0, 3), ["soda-02", "soda-05", "soda-09"]);
  assert(!ids.includes("soda-11"));
  assert(!ids.includes("soda-12"));
});

test("creates a stable task session with ten cards by default", () => {
  const state = createSurveyState();
  const session = startTaskSession(state, "user-demo", "task-soda", sequence([0.5, 0.5, 0.5, 0.5]));
  const again = startTaskSession(state, "user-demo", "task-soda", () => 0.99);

  assert.strictEqual(session.demoIds.length, 10);
  assert.deepStrictEqual(again.demoIds, session.demoIds);
});

test("each concept card has a six-option choice question and a required feedback question", () => {
  const state = createSurveyState();
  const session = startTaskSession(state, "user-demo", "task-soda", sequence([0.01, 0.5]));
  const step = getCurrentStep(state, "user-demo", session.id);

  assert.strictEqual(step.question.type, "choice");
  assert.strictEqual(step.question.options.length, 6);
  assert.strictEqual(step.demo.questions[1].type, "text");
  assert.strictEqual(step.demo.questions[1].placeholder, "请写下具体建议，至少5个字");
  assert(/^assets\/posters\/poster-\d{2}\.(jpg|png)$/.test(step.demo.poster));
});

test("coffee task cards include poster assets for thumbnail navigation", () => {
  const state = createSurveyState();
  const demos = getAvailableDemos(state, "user-demo", "task-coffee", () => 0.5);

  assert(demos.length > 0);
  assert(demos.every((demo) => /^assets\/posters\/poster-\d{2}\.(jpg|png)$/.test(demo.poster)));
});

test("submits choice first, then requires text feedback before advancing to next card", () => {
  const state = createSurveyState();
  const session = startTaskSession(state, "user-demo", "task-soda", sequence([0.24, 0.5, 0.5]));
  const first = getCurrentStep(state, "user-demo", session.id);

  let result = submitAnswer(state, {
    userId: "user-demo",
    sessionId: session.id,
    demoId: first.demo.id,
    questionId: first.question.id,
    value: first.question.options[2].id
  });
  assert.strictEqual(result.status, "accepted");
  assert.strictEqual(result.nextStep.question.type, "text");
  assert.strictEqual(result.nextStep.demo.id, first.demo.id);

  result = submitAnswer(state, {
    userId: "user-demo",
    sessionId: session.id,
    demoId: first.demo.id,
    questionId: result.nextStep.question.id,
    value: "太短"
  });
  assert.strictEqual(result.status, "invalid-text");

  result = submitAnswer(state, {
    userId: "user-demo",
    sessionId: session.id,
    demoId: first.demo.id,
    questionId: first.demo.questions[1].id,
    value: "建议突出真实口味和容量信息"
  });
  assert.strictEqual(result.status, "accepted");
  assert(result.nextStep);
  assert.notStrictEqual(result.nextStep.demo.id, first.demo.id);
});

test("rejects duplicate answers for the same session question", () => {
  const state = createSurveyState();
  const session = startTaskSession(state, "user-demo", "task-soda", sequence([0.01, 0.5]));
  const first = getCurrentStep(state, "user-demo", session.id);
  const payload = {
    userId: "user-demo",
    sessionId: session.id,
    demoId: first.demo.id,
    questionId: first.question.id,
    value: first.question.options[0].id
  };

  assert.strictEqual(submitAnswer(state, payload).status, "accepted");
  assert.strictEqual(submitAnswer(state, payload).status, "duplicate");
});

test("reports task progress as answered and unanswered card counts", () => {
  const state = createSurveyState();
  const session = startTaskSession(state, "user-demo", "task-soda", sequence([0.01, 0.5]));
  const first = getCurrentStep(state, "user-demo", session.id);
  submitAnswer(state, { userId: "user-demo", sessionId: session.id, demoId: first.demo.id, questionId: first.question.id, value: first.question.options[0].id });
  submitAnswer(state, { userId: "user-demo", sessionId: session.id, demoId: first.demo.id, questionId: first.demo.questions[1].id, value: "希望文案更清楚一点" });

  const progress = getTaskProgress(state, "user-demo", "task-soda");
  assert.strictEqual(progress.answered, 1);
  assert.strictEqual(progress.unanswered, 9);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
