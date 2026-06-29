const path = require("path");
const Module = require("module");
const bundledNodeModules = "C:/Users/YQSL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const bundledPnpmModules = "C:/Users/YQSL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules";
process.env.NODE_PATH = [process.env.NODE_PATH, bundledNodeModules, bundledPnpmModules].filter(Boolean).join(path.delimiter);
Module._initPaths();
const { chromium } = require("playwright");
const { pathToFileURL } = require("url");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve("h5-concept-card-demo.html")).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("#taskPage.active .task-card");

  const title = await page.locator(".app-title").textContent();
  if (title.trim() !== "口味测试") throw new Error(`expected page title 口味测试, got ${title}`);
  const profileItems = await page.locator(".profile-card .profile-stat").count();
  if (profileItems !== 3) throw new Error(`expected level/growth/tree profile stats, got ${profileItems}`);
  await page.locator("#ruleEntry").click();
  await page.waitForSelector("#ruleModal.open");
  const ruleText = await page.locator("#ruleModal").textContent();
  for (const text of ["答题规则", "成长值", "元气树", "人工审核"]) {
    if (!ruleText.includes(text)) throw new Error(`rule modal missing ${text}`);
  }
  await page.locator("#closeRule").click();

  const taskTitles = await page.locator("#taskPage.active .task-card h2").allTextContents();
  if (taskTitles.join("|") !== "碳酸饮料|咖啡") throw new Error(`unexpected task titles ${taskTitles.join("|")}`);
  const systemText = await page.locator("body").textContent();
  for (const banned of ["低完成度", "分发", "随机出现", "张可答"]) {
    if (systemText.includes(banned)) throw new Error(`user-facing system rule should be hidden: ${banned}`);
  }
  const progressText = await page.locator("#taskPage .task-card").first().textContent();
  if (!/已答题\s*0\s*\/\s*未答题\s*\d+/.test(progressText)) throw new Error(`expected answered/unanswered progress, got ${progressText}`);
  if (!progressText.includes("答题")) throw new Error("task button should say 答题");

  await page.locator('#taskPage [data-task="task-soda"]').click();
  await page.waitForSelector("#surveyScreen.active .concept-shell");
  const navCount = await page.locator(".answer-thumb").count();
  if (navCount !== 10) throw new Error(`expected 10 answer cards by default, got ${navCount}`);
  const navText = await page.locator(".survey-meta").textContent();
  if (!/第\s*1\s*\/\s*\d+\s*张/.test(navText) || !navText.includes("人参与")) throw new Error(`bad survey meta ${navText}`);

  const questionTitles = await page.locator(".question-title").allTextContents();
  if (questionTitles.length !== 2) throw new Error(`expected both questions on one page, got ${questionTitles.length}`);
  if (!questionTitles[0].includes("这款产品你买吗") || !questionTitles[1].includes("可以改进的点")) throw new Error(`unexpected question titles ${questionTitles.join("|")}`);
  const options = await page.locator(".option").count();
  if (options !== 6) throw new Error(`expected 6 choice options, got ${options}`);
  const placeholder = await page.locator("textarea.feedback-input").getAttribute("placeholder");
  if (placeholder !== "请写下具体建议，至少5个字") throw new Error(`bad placeholder ${placeholder}`);
  const activeThumb = await page.locator(".answer-thumb.current").boundingBox();
  const navBox = await page.locator(".thumbs").boundingBox();
  if (!activeThumb || !navBox) throw new Error("missing active thumb metrics");
  if (activeThumb.x - navBox.x > 8) throw new Error(`thumb navigation should start left aligned ${JSON.stringify({activeThumb, navBox})}`);
  const appCenter = navBox.x + navBox.width / 2;
  for (const selector of [".survey-pill", "#surveyMeta"]) {
    const box = await page.locator(selector).boundingBox();
    if (!box) throw new Error(`missing centered element ${selector}`);
    const center = box.x + box.width / 2;
    if (Math.abs(center - appCenter) > 8) throw new Error(`${selector} should be centered ${JSON.stringify({center, appCenter, box})}`);
  }
  const feedbackTitleMetrics = await page.locator(".feedback-block .question-title").evaluate((el) => {
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return { height: box.height, lineHeight: Number.parseFloat(style.lineHeight), fontSize: Number.parseFloat(style.fontSize), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
  });
  if (feedbackTitleMetrics.height > feedbackTitleMetrics.lineHeight * 1.35 || feedbackTitleMetrics.fontSize > 14) {
    throw new Error(`feedback title should be smaller and one line ${JSON.stringify(feedbackTitleMetrics)}`);
  }
  await page.evaluate(() => showToast("测试提示"));
  await page.waitForSelector("#toast.show");
  const toastBox = await page.locator("#toast").boundingBox();
  const submitBox = await page.locator("#submitAnswer").boundingBox();
  if (!toastBox || !submitBox) throw new Error("missing toast or submit metrics");
  const overlapsSubmit = toastBox.y < submitBox.y + submitBox.height && toastBox.y + toastBox.height > submitBox.y;
  if (overlapsSubmit) throw new Error(`toast should not overlap submit button ${JSON.stringify({toastBox, submitBox})}`);
  await page.evaluate(() => document.getElementById("toast").classList.remove("show"));
  await page.locator(".option").nth(2).click();
  await page.fill("textarea.feedback-input", "包装信息可以更突出一些");
  await page.locator("#submitAnswer").dblclick();
  await page.waitForTimeout(700);
  const toastText = await page.locator("#toast.show").textContent().catch(() => "");
  if (toastText.includes("已提交") || toastText.includes("不能修改")) throw new Error(`duplicate toast should not appear after rapid submit, got ${toastText}`);
  const answered = await page.evaluate(() => JSON.parse(localStorage.getItem("concept-card-demo-state-v2")).answers.length);
  if (answered !== 2) throw new Error(`expected two persisted answers for one card, got ${answered}`);

  await page.screenshot({ path: "h5-concept-card-demo.png", fullPage: true });
  await browser.close();
  console.log("PASS browser interaction checks");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
