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
    growthValue: 1280,
    vitalityTree: 36
  };

  const OPTION_SETS = {
    purchase: ["绝对不会买", "可能不会买", "不好说", "可能会购买", "绝对会购买"],
    try: ["完全没兴趣", "兴趣较低", "可以了解", "愿意试用", "非常想试"],
    useful: ["完全无用", "作用较小", "一般", "比较有用", "非常有用"]
  };

  function makeQuestion(id, text, optionSet) {
    return {
      id,
      text,
      options: OPTION_SETS[optionSet].map((label, index) => ({
        id: `${id}-opt-${index + 1}`,
        label
      }))
    };
  }

  function cardArt(accent, imageUrl) {
    return { accent, imageUrl: imageUrl || "" };
  }

  const seed = {
    user: CURRENT_USER,
    activity: {
      id: "activity-2026-concept",
      title: "开源社区概念卡调研",
      status: "online",
      startsAt: "2026-06-29",
      endsAt: "2026-07-31"
    },
    tasks: [
      {
        id: "task-ai",
        activityId: "activity-2026-concept",
        title: "碳酸饮料口味测试",
        subtitle: "",
        rewardText: "成长值即时记录，元气树进入人工审核",
        hero: "碳酸饮料口味测试",
        status: "online",
        order: 1
      },
      {
        id: "task-design",
        activityId: "activity-2026-concept",
        title: "咖啡口味测试",
        subtitle: "",
        rewardText: "完成后可进入下一张任务卡继续答题",
        hero: "咖啡口味测试",
        status: "online",
        order: 2
      }
    ],
    demos: [
      {
        id: "ai-01",
        taskId: "task-ai",
        brand: "CodeMate",
        category: "智能补全",
        title: "按仓库上下文生成改动建议",
        sellingPoint: "自动读取 issue、代码风格和测试结果，给出可执行修改建议。",
        price: "成长值 +20",
        spec: "1 次任务体验",
        answerCount: 12,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#ff8a2a"),
        question: makeQuestion("q-ai-01", "你愿意在真实开源任务中使用这个能力吗？", "try")
      },
      {
        id: "ai-02",
        taskId: "task-ai",
        brand: "PatchPilot",
        category: "自动修复",
        title: "测试失败后自动定位原因",
        sellingPoint: "聚合日志、变更文件和历史提交，快速生成修复路径。",
        price: "成长值 +25",
        spec: "Bugfix 场景",
        answerCount: 4,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#3c7df0"),
        question: makeQuestion("q-ai-02", "这个概念对你的开源协作是否有帮助？", "useful")
      },
      {
        id: "ai-03",
        taskId: "task-ai",
        brand: "ReviewFlow",
        category: "代码评审",
        title: "PR 评审意见自动归类",
        sellingPoint: "把 review comment 分成阻塞、建议和待确认，减少沟通成本。",
        price: "成长值 +15",
        spec: "PR 协作",
        answerCount: 27,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#1aa37a"),
        question: makeQuestion("q-ai-03", "如果社区上线这个功能，你会使用吗？", "try")
      },
      {
        id: "ai-04",
        taskId: "task-ai",
        brand: "IssueLens",
        category: "需求理解",
        title: "把复杂 issue 转成执行清单",
        sellingPoint: "自动抽取背景、验收标准和风险点，降低接任务门槛。",
        price: "成长值 +18",
        spec: "新手友好",
        answerCount: 42,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#8b5cf6"),
        question: makeQuestion("q-ai-04", "这个概念是否会提升你参与任务的意愿？", "try")
      },
      {
        id: "ai-05",
        taskId: "task-ai",
        brand: "TestBuddy",
        category: "测试生成",
        title: "根据改动生成最小测试集",
        sellingPoint: "优先补齐关键路径测试，让贡献者更快通过 CI。",
        price: "成长值 +22",
        spec: "单元测试",
        answerCount: 4,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#e84f7a"),
        question: makeQuestion("q-ai-05", "你认为这个功能是否值得优先建设？", "useful")
      },
      {
        id: "ai-06",
        taskId: "task-ai",
        brand: "DocSpark",
        category: "文档助手",
        title: "自动补齐 PR 文档说明",
        sellingPoint: "从代码改动中生成用户可读说明和迁移提示。",
        price: "成长值 +12",
        spec: "文档场景",
        answerCount: 63,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#f7b731"),
        question: makeQuestion("q-ai-06", "你会购买或兑换这个能力吗？", "purchase")
      },
      {
        id: "ai-07",
        taskId: "task-ai",
        brand: "MentorAI",
        category: "学习指导",
        title: "给新贡献者生成学习路径",
        sellingPoint: "结合项目技术栈和个人能力，推荐可完成的小任务。",
        price: "成长值 +30",
        spec: "7 日路径",
        answerCount: 74,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#00a6a6"),
        question: makeQuestion("q-ai-07", "这个概念是否适合开源社区新手？", "useful")
      },
      {
        id: "ai-08",
        taskId: "task-ai",
        brand: "ReleaseNote",
        category: "发布说明",
        title: "从 merged PR 自动生成发布摘要",
        sellingPoint: "按用户影响、风险和贡献者维度整理版本变化。",
        price: "成长值 +16",
        spec: "版本发布",
        answerCount: 88,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#64748b"),
        question: makeQuestion("q-ai-08", "你觉得这个概念对维护者是否有帮助？", "useful")
      },
      {
        id: "ai-09",
        taskId: "task-ai",
        brand: "DraftOnly",
        category: "草稿概念",
        title: "未上线概念卡",
        sellingPoint: "这张卡应被状态过滤，不展示给用户。",
        price: "-",
        spec: "草稿",
        answerCount: 1,
        targetAnswers: TARGET_ANSWERS,
        status: "draft",
        art: cardArt("#999999"),
        question: makeQuestion("q-ai-09", "这张题不应出现", "try")
      },
      {
        id: "ai-10",
        taskId: "task-ai",
        brand: "FullCard",
        category: "已收满",
        title: "已经收满 100 份答案",
        sellingPoint: "这张卡应被收满规则过滤。",
        price: "-",
        spec: "已收满",
        answerCount: 100,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt("#aaaaaa"),
        question: makeQuestion("q-ai-10", "这张题不应出现", "try")
      },
      ...["新手任务地图", "一键环境检查", "贡献者徽章", "任务难度评分", "导师匹配卡", "社区成长周报"].map((title, index) => ({
        id: `design-0${index + 1}`,
        taskId: "task-design",
        brand: "OpenSource Lab",
        category: "新手成长",
        title,
        sellingPoint: "把参与路径拆成更小、更明确、反馈更快的社区任务。",
        price: `成长值 +${10 + index * 2}`,
        spec: "新手任务",
        answerCount: index < 4 ? 8 : 35 + index,
        targetAnswers: TARGET_ANSWERS,
        status: "online",
        art: cardArt(["#ff8a2a", "#3c7df0", "#1aa37a", "#e84f7a", "#f7b731", "#8b5cf6"][index]),
        question: makeQuestion(`q-design-0${index + 1}`, "你希望社区优先上线这个任务形式吗？", index % 2 ? "try" : "useful")
      }))
    ],
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

  function hasAnswered(state, userId, demoId, questionId) {
    return state.answers.some((answer) => answer.userId === userId && answer.demoId === demoId && answer.questionId === questionId);
  }

  function effectiveAnswerCount(state, demo) {
    const submitted = state.answers.filter((answer) => answer.demoId === demo.id && answer.questionId === demo.question.id).length;
    return demo.answerCount + submitted;
  }

  function isDemoAvailable(state, userId, taskId, demo) {
    if (!demo || demo.taskId !== taskId || demo.status !== "online") return false;
    if (!getTask(state, taskId)) return false;
    if (effectiveAnswerCount(state, demo) >= (demo.targetAnswers || TARGET_ANSWERS)) return false;
    return !hasAnswered(state, userId, demo.id, demo.question.id);
  }

  function getAvailableDemos(state, userId, taskId, rng) {
    const random = rng || Math.random;
    return state.demos
      .filter((demo) => isDemoAvailable(state, userId, taskId, demo))
      .map((demo) => ({ ...clone(demo), currentAnswers: effectiveAnswerCount(state, demo), randomKey: random() }))
      .sort((a, b) => (a.currentAnswers - b.currentAnswers) || (a.randomKey - b.randomKey))
      .map(({ randomKey, ...demo }) => demo);
  }

  function getNextDemo(state, userId, taskId, rng) {
    return getAvailableDemos(state, userId, taskId, rng)[0] || null;
  }

  function getTaskProgress(state, userId, taskId) {
    const taskDemos = state.demos.filter((demo) => demo.taskId === taskId && demo.status === "online");
    const answered = taskDemos.filter((demo) => hasAnswered(state, userId, demo.id, demo.question.id)).length;
    const available = getAvailableDemos(state, userId, taskId).length;
    return {
      total: taskDemos.length,
      answered,
      available,
      complete: available === 0
    };
  }

  function submitAnswer(state, payload, rng) {
    const demo = state.demos.find((item) => item.id === payload.demoId && item.taskId === payload.taskId);
    if (!demo || demo.status !== "online") return { status: "unavailable", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };
    if (demo.question.id !== payload.questionId) return { status: "invalid-question", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };
    if (!demo.question.options.some((option) => option.id === payload.optionId)) return { status: "invalid-option", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };
    if (effectiveAnswerCount(state, demo) >= (demo.targetAnswers || TARGET_ANSWERS)) return { status: "full", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };
    if (hasAnswered(state, payload.userId, payload.demoId, payload.questionId)) return { status: "duplicate", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };

    state.answers.push({
      userId: payload.userId,
      taskId: payload.taskId,
      demoId: payload.demoId,
      questionId: payload.questionId,
      optionId: payload.optionId,
      submittedAt: new Date().toISOString()
    });

    ensureRewardRecord(state, payload.userId, payload.taskId);
    return { status: "accepted", nextDemo: getNextDemo(state, payload.userId, payload.taskId, rng) };
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
          available: progress.available,
          growthStatus: reward?.growthStatus || "未完成",
          vitalityStatus: reward?.vitalityStatus || "未完成"
        };
      });
  }

  return {
    TARGET_ANSWERS,
    createSurveyState,
    getAvailableDemos,
    getNextDemo,
    getTaskProgress,
    submitAnswer,
    getHistory
  };
});
