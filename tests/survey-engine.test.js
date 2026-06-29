const assert = require("assert");
const {
  createSurveyState,
  getAvailableDemos,
  getNextDemo,
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

test("prioritizes demos with fewer valid answers and filters unavailable demos", () => {
  const state = createSurveyState();
  const demos = getAvailableDemos(state, "user-demo", "task-ai", () => 0.5);
  const ids = demos.map((demo) => demo.id);

  assert.deepStrictEqual(ids.slice(0, 3), ["ai-02", "ai-05", "ai-01"]);
  assert(!ids.includes("ai-09"));
  assert(!ids.includes("ai-10"));
});

test("randomizes demos with the same completion count", () => {
  const stateA = createSurveyState();
  const stateB = createSurveyState();
  const lowSequence = [0.1, 0.2, 0.3, 0.4];
  const highSequence = [0.9, 0.8, 0.7, 0.6];

  const lowRandom = getAvailableDemos(stateA, "user-demo", "task-design", () => lowSequence.shift() ?? 0.5).map((demo) => demo.id);
  const highRandom = getAvailableDemos(stateB, "user-demo", "task-design", () => highSequence.shift() ?? 0.5).map((demo) => demo.id);

  assert.notDeepStrictEqual(lowRandom.slice(0, 3), highRandom.slice(0, 3));
});

test("submits one answer and returns the next available demo", () => {
  const state = createSurveyState();
  const first = getNextDemo(state, "user-demo", "task-ai", () => 0.5);
  const result = submitAnswer(state, {
    userId: "user-demo",
    taskId: "task-ai",
    demoId: first.id,
    questionId: first.question.id,
    optionId: first.question.options[0].id
  }, () => 0.5);

  assert.strictEqual(result.status, "accepted");
  assert(result.nextDemo);
  assert.notStrictEqual(result.nextDemo.id, first.id);
  assert.strictEqual(state.answers.length, 1);
});

test("rejects duplicate answers for the same demo question", () => {
  const state = createSurveyState();
  const first = getNextDemo(state, "user-demo", "task-ai", () => 0.5);
  const payload = {
    userId: "user-demo",
    taskId: "task-ai",
    demoId: first.id,
    questionId: first.question.id,
    optionId: first.question.options[0].id
  };

  assert.strictEqual(submitAnswer(state, payload, () => 0.5).status, "accepted");
  assert.strictEqual(submitAnswer(state, payload, () => 0.5).status, "duplicate");
  assert.strictEqual(state.answers.length, 1);
});

test("rejects submissions when a demo has already reached one hundred answers", () => {
  const state = createSurveyState();
  const fullDemo = state.demos.find((demo) => demo.id === "ai-10");

  const result = submitAnswer(state, {
    userId: "new-user",
    taskId: fullDemo.taskId,
    demoId: fullDemo.id,
    questionId: fullDemo.question.id,
    optionId: fullDemo.question.options[0].id
  }, () => 0.5);

  assert.strictEqual(result.status, "full");
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
