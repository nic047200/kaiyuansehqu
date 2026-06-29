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

  const taskCount = await page.locator("#taskPage.active .task-card").count();
  if (taskCount !== 2) throw new Error(`expected 2 task cards, got ${taskCount}`);
  const loginStatus = await page.locator(".login-status").textContent();
  if (!loginStatus.includes("已登录") || !loginStatus.includes("开源社区用户")) throw new Error(`expected login status in hero, got ${loginStatus}`);
  const heroMetricCount = await page.locator(".hero .metric").count();
  if (heroMetricCount !== 2) throw new Error(`expected two metric cards inside hero, got ${heroMetricCount}`);
  const taskTitles = await page.locator("#taskPage.active .task-card h2").allTextContents();
  if (taskTitles.join("|") !== "碳酸饮料口味测试|咖啡口味测试") throw new Error(`unexpected task titles ${taskTitles.join("|")}`);
  const taskDescriptions = await page.locator("#taskPage.active .task-card p").count();
  if (taskDescriptions !== 0) throw new Error("task descriptions should be removed");
  const historyVisibleOnTaskPage = await page.locator("#taskPage.active .history-item").count();
  if (historyVisibleOnTaskPage !== 0) throw new Error("history should not be rendered on task page");
  if (await page.locator("#minePage").isVisible()) throw new Error("mine page should be hidden while task page is active");

  await page.locator('[data-tab="mine"]').click();
  await page.waitForSelector("#minePage.active .history-item");
  const taskVisibleOnMinePage = await page.locator("#minePage.active .task-card").count();
  if (taskVisibleOnMinePage !== 0) throw new Error("task cards should not be rendered on mine page");
  if (await page.locator("#taskPage").isVisible()) throw new Error("task page should be hidden while mine page is active");

  await page.locator('[data-tab="tasks"]').click();
  await page.waitForSelector("#taskPage.active .task-card");
  await page.locator('#taskPage [data-task="task-ai"]').click();
  await page.waitForSelector(".concept-shell");
  const title = await page.locator(".poster-art h2").textContent();
  const firstIsLowCompletion = title.includes("测试失败后自动定位原因") || title.includes("根据改动生成最小测试集");
  if (!firstIsLowCompletion) {
    throw new Error(`expected one of the lowest completion demos first, got ${title}`);
  }

  await page.locator(".option").nth(2).click();
  await page.waitForTimeout(700);
  const nextTitle = await page.locator(".poster-art h2").textContent();
  if (nextTitle === title) throw new Error("did not advance after answer");

  const answered = await page.evaluate(() => JSON.parse(localStorage.getItem("concept-card-demo-state-v1")).answers.length);
  if (answered !== 1) throw new Error(`expected one persisted answer, got ${answered}`);

  await page.screenshot({ path: "h5-concept-card-demo.png", fullPage: true });
  await browser.close();
  console.log("PASS browser interaction checks");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
