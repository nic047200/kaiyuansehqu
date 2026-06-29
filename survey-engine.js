(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SurveyEngine = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const TARGET_ANSWERS = 100;
  const CURRENT_USER = {
    id: "community-user-1024",
    name: "开源社区用户",
    level: "元气玩家",
    avatar: "开",
    growthValue: 1000,
    growthTarget: 2000,
    vitalityTree: 0
  };

  const PURCHASE_OPTIONS = ["绝对不会买", "可能不会买", "不好说", "可能会买", "会买", "一定会买"];

  function makeQuestions(id) {
    return [
      {
        id: `${id}-q1`,
        type: "choice",
        text: "这款产品你买吗？",
        options: PURCHASE_OPTIONS.map((label, index) => ({ id: `${id}-q1-opt-${index + 1}`, label }))
      },
      {
        id: `${id}-q2`,
        type: "text",
        text: "你觉得这张海报或产品有什么可以改进的点？",
        placeholder: "请写下具体建议，至少5个字",
        minLength: 5
      }
    ];
  }

  function cardArt(accent, tone) {
    return { accent, tone };
  }

  function demo(id, taskId, title, brand, category, sellingPoint, price, spec, answerCount, status, accent, tone) {
    return {
      id,
      taskId,
      title,
      brand,
      category,
      sellingPoint,
      price,
      spec,
      answerCount,
      targetAnswers: TARGET_ANSWERS,
      participants: 126 + answerCount,
      status,
      art: cardArt(accent, tone),
      questions: makeQuestions(id)
    };
  }

  const seed = {
    user: CURRENT_USER,
    activity: {
      id: "activity-2026-flavor",
      title: "口味测试",
      status: "online",
      startsAt: "2026-06-29",
      endsAt: "2026-07-31"
    },
    tasks: [
      {
        id: "task-soda",
        activityId: "activity-2026-flavor",
        title: "碳酸饮料",
        rewardText: "完成答题后可获得成长值，元气树奖励进入人工审核",
        hero: "淘宝推荐了饮料给你",
        status: "online",
        order: 1
      },
      {
        id: "task-coffee",
        activityId: "activity-2026-flavor",
        title: "咖啡",
        rewardText: "完成答题后可获得成长值，元气树奖励进入人工审核",
        hero: "淘宝推荐了咖啡给你",
        status: "online",
        order: 2
      }
    ],
    demos: [
      demo("soda-01", "task-soda", "野果生榨野气十足", "野石榴", "山野碳酸果汁", "爆裂石榴真快气泡，清爽不甜腻。", "¥6元", "400mL", 12, "online", "#d9432f", "berry"),
      demo("soda-02", "task-soda", "青柠气泡清爽一夏", "青柠汽水", "柠檬味气泡水", "0 糖清爽，适合运动后饮用。", "¥5元", "500mL", 4, "online", "#7ccf55", "lime"),
      demo("soda-03", "task-soda", "白桃乌龙轻气泡", "桃桃乌龙", "茶味气泡饮", "茶香和果香融合，低甜更轻盈。", "¥7元", "450mL", 27, "online", "#f4a7b9", "peach"),
      demo("soda-04", "task-soda", "冰镇可乐强爽口感", "黑冰可乐", "经典碳酸饮料", "强气泡、冰爽感和经典焦糖香。", "¥4元", "500mL", 42, "online", "#1f2937", "cola"),
      demo("soda-05", "task-soda", "葡萄爆珠气泡饮", "紫葡萄", "葡萄味气泡饮", "入口有爆珠层次，果味明显。", "¥8元", "420mL", 4, "online", "#8b5cf6", "grape"),
      demo("soda-06", "task-soda", "橙意满满维 C 泡泡", "橙橙气泡", "橙味气泡水", "维 C 卖点突出，酸甜平衡。", "¥6元", "480mL", 63, "online", "#f97316", "orange"),
      demo("soda-07", "task-soda", "荔枝玫瑰轻气泡", "荔枝玫瑰", "花果味气泡饮", "花香柔和，适合女性用户场景。", "¥9元", "380mL", 74, "online", "#ec4899", "lychee"),
      demo("soda-08", "task-soda", "西柚盐汽水", "西柚盐汽", "电解质气泡水", "运动场景补充盐分，口感清冽。", "¥6元", "500mL", 88, "online", "#fb7185", "grapefruit"),
      demo("soda-09", "task-soda", "未上线碳酸卡", "草稿", "草稿", "不应展示。", "-", "-", 1, "draft", "#999999", "draft"),
      demo("soda-10", "task-soda", "已收满碳酸卡", "收满", "收满", "不应展示。", "-", "-", 100, "online", "#aaaaaa", "full"),
      demo("coffee-01", "task-coffee", "小黄油拿铁", "JUST LATTE", "黄油拿铁", "冷萃拿铁 100% 深烘豆，奶香顺滑。", "¥5元", "400mL", 8, "online", "#f5b84b", "butter"),
      demo("coffee-02", "task-coffee", "一只小羊冷萃拿铁", "LAMBY CAFF", "冷萃拿铁", "经典冷萃，灵感咖啡。", "¥5元", "250mL", 8, "online", "#c8a27a", "latte"),
      demo("coffee-03", "task-coffee", "厚乳冰拿铁", "厚乳研究所", "厚乳咖啡", "奶感更强，入口顺滑不苦。", "¥8元", "300mL", 18, "online", "#b08968", "milk"),
      demo("coffee-04", "task-coffee", "黑咖啡醒神瓶", "醒醒咖啡", "无糖黑咖", "0 糖 0 脂，早八通勤刚需。", "¥6元", "330mL", 22, "online", "#3f2f2a", "black"),
      demo("coffee-05", "task-coffee", "椰椰生咖拿铁", "椰咖", "椰乳拿铁", "椰香和咖啡香融合，清爽轻负担。", "¥9元", "350mL", 36, "online", "#10b981", "coconut"),
      demo("coffee-06", "task-coffee", "焦糖海盐拿铁", "海盐焦糖", "风味拿铁", "甜咸平衡，适合下午茶场景。", "¥9元", "300mL", 41, "online", "#d97706", "caramel")
    ],
    sessions: [],
    answers: [],
    rewards: []
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createSurveyState(overrides) {
    return Object.assign(clone(seed), overrides || {});
  }

  function getTask(state, taskId) {
    return state.tasks.find((task) => task.id === taskId && task.status === "online");
  }

  function questionIds(demo) {
    return demo.questions.map((question) => question.id);
  }

  function hasAnsweredQuestion(state, userId, demoId, questionId) {
    return state.answers.some((answer) => answer.userId === userId && answer.demoId === demoId && answer.questionId === questionId);
  }

  function isDemoCompletedByUser(state, userId, demo) {
    return questionIds(demo).every((questionId) => hasAnsweredQuestion(state, userId, demo.id, questionId));
  }

  function completedSubmittedCount(state, demo) {
    const users = new Set();
    state.answers.filter((answer) => answer.demoId === demo.id).forEach((answer) => users.add(answer.userId));
    return [...users].filter((userId) => isDemoCompletedByUser(state, userId, demo)).length;
  }

  function effectiveAnswerCount(state, demo) {
    return demo.answerCount + completedSubmittedCount(state, demo);
  }

  function isDemoAvailable(state, userId, taskId, demo) {
    if (!demo || demo.taskId !== taskId || demo.status !== "online") return false;
    if (!getTask(state, taskId)) return false;
    if (effectiveAnswerCount(state, demo) >= (demo.targetAnswers || TARGET_ANSWERS)) return false;
    return !demo.questions.some((question) => hasAnsweredQuestion(state, userId, demo.id, question.id));
  }

  function getAvailableDemos(state, userId, taskId, rng) {
    const random = rng || Math.random;
    return state.demos
      .filter((demo) => isDemoAvailable(state, userId, taskId, demo))
      .map((demo) => ({ ...clone(demo), currentAnswers: effectiveAnswerCount(state, demo), randomKey: random() }))
      .sort((a, b) => (a.currentAnswers - b.currentAnswers) || (a.randomKey - b.randomKey))
      .map(({ randomKey, ...demo }) => demo);
  }

  function getActiveSession(state, userId, taskId) {
    return state.sessions.find((session) => session.userId === userId && session.taskId === taskId && !session.completed);
  }

  function startTaskSession(state, userId, taskId, rng) {
    const existing = getActiveSession(state, userId, taskId);
    if (existing) return existing;
    const random = rng || Math.random;
    const maxCount = Math.min(10, state.demos.filter((demo) => isDemoAvailable(state, userId, taskId, demo)).length);
    const count = maxCount ? Math.max(1, Math.ceil(random() * maxCount)) : 0;
    const available = getAvailableDemos(state, userId, taskId, random);
    const session = {
      id: `${taskId}-${userId}-${Date.now()}-${state.sessions.length + 1}`,
      userId,
      taskId,
      demoIds: available.slice(0, count).map((demo) => demo.id),
      currentIndex: 0,
      completed: count === 0,
      createdAt: new Date().toISOString()
    };
    state.sessions.push(session);
    return session;
  }

  function getSession(state, userId, sessionId) {
    return state.sessions.find((session) => session.id === sessionId && session.userId === userId);
  }

  function getSessionDemos(state, session) {
    return session.demoIds.map((id) => state.demos.find((demo) => demo.id === id)).filter(Boolean).map(clone);
  }

  function getCurrentStep(state, userId, sessionId) {
    const session = getSession(state, userId, sessionId);
    if (!session || session.completed) return null;
    while (session.currentIndex < session.demoIds.length) {
      const demo = state.demos.find((item) => item.id === session.demoIds[session.currentIndex]);
      const question = demo.questions.find((item) => !hasAnsweredQuestion(state, userId, demo.id, item.id));
      if (question) {
        return {
          sessionId: session.id,
          taskId: session.taskId,
          cardIndex: session.currentIndex,
          cardTotal: session.demoIds.length,
          answeredCards: session.currentIndex,
          participantCount: demo.participants + effectiveAnswerCount(state, demo),
          demo: clone(demo),
          question: clone(question)
        };
      }
      session.currentIndex += 1;
    }
    session.completed = true;
    ensureRewardRecord(state, userId, session.taskId);
    return null;
  }

  function getTaskProgress(state, userId, taskId) {
    const session = getActiveSession(state, userId, taskId) || [...state.sessions].reverse().find((item) => item.userId === userId && item.taskId === taskId);
    if (session) {
      const demos = session.demoIds.map((id) => state.demos.find((demo) => demo.id === id)).filter(Boolean);
      const answered = demos.filter((demo) => isDemoCompletedByUser(state, userId, demo)).length;
      return {
        total: demos.length,
        answered,
        unanswered: Math.max(0, demos.length - answered),
        available: Math.max(0, demos.length - answered),
        complete: demos.length > 0 && answered === demos.length
      };
    }
    const available = getAvailableDemos(state, userId, taskId).length;
    return { total: available, answered: 0, unanswered: available, available, complete: available === 0 };
  }

  function validateAnswer(question, value) {
    if (question.type === "choice") {
      return question.options.some((option) => option.id === value) ? "accepted" : "invalid-option";
    }
    if (question.type === "text") {
      return typeof value === "string" && value.trim().length >= question.minLength ? "accepted" : "invalid-text";
    }
    return "invalid-question";
  }

  function submitAnswer(state, payload) {
    const session = getSession(state, payload.userId, payload.sessionId);
    if (!session || session.completed) return { status: "unavailable", nextStep: null };
    const demo = state.demos.find((item) => item.id === payload.demoId && item.taskId === session.taskId);
    if (!demo || demo.status !== "online" || !session.demoIds.includes(demo.id)) return { status: "unavailable", nextStep: getCurrentStep(state, payload.userId, session.id) };
    const question = demo.questions.find((item) => item.id === payload.questionId);
    if (!question) return { status: "invalid-question", nextStep: getCurrentStep(state, payload.userId, session.id) };
    if (hasAnsweredQuestion(state, payload.userId, demo.id, question.id)) return { status: "duplicate", nextStep: getCurrentStep(state, payload.userId, session.id) };
    const status = validateAnswer(question, payload.value);
    if (status !== "accepted") return { status, nextStep: getCurrentStep(state, payload.userId, session.id) };

    state.answers.push({
      userId: payload.userId,
      taskId: session.taskId,
      sessionId: session.id,
      demoId: demo.id,
      questionId: question.id,
      value: payload.value,
      submittedAt: new Date().toISOString()
    });

    if (isDemoCompletedByUser(state, payload.userId, demo)) {
      session.currentIndex += 1;
    }

    const nextStep = getCurrentStep(state, payload.userId, session.id);
    return { status: "accepted", nextStep };
  }

  function ensureRewardRecord(state, userId, taskId) {
    const progress = getTaskProgress(state, userId, taskId);
    if (!progress.complete) return;
    const exists = state.rewards.some((reward) => reward.userId === userId && reward.taskId === taskId);
    if (exists) return;
    state.rewards.push({
      userId,
      taskId,
      growthStatus: "待发放",
      vitalityStatus: "待审核",
      syncStatus: "未同步",
      createdAt: new Date().toISOString()
    });
  }

  function getHistory(state, userId) {
    return state.tasks
      .filter((task) => task.status === "online")
      .map((task) => {
        const progress = getTaskProgress(state, userId, task.id);
        const reward = state.rewards.find((item) => item.userId === userId && item.taskId === task.id);
        return {
          taskId: task.id,
          title: task.title,
          answered: progress.answered,
          total: progress.total,
          unanswered: progress.unanswered,
          growthStatus: reward?.growthStatus || "未完成",
          vitalityStatus: reward?.vitalityStatus || "未完成"
        };
      });
  }

  return {
    TARGET_ANSWERS,
    createSurveyState,
    getAvailableDemos,
    startTaskSession,
    getSessionDemos,
    getCurrentStep,
    getTaskProgress,
    submitAnswer,
    getHistory
  };
});
