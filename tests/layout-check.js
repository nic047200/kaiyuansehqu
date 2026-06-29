const path = require("path");
const Module = require("module");
const bundledNodeModules = "C:/Users/YQSL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules";
const bundledPnpmModules = "C:/Users/YQSL/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/node_modules";
process.env.NODE_PATH = [process.env.NODE_PATH, bundledNodeModules, bundledPnpmModules].filter(Boolean).join(path.delimiter);
Module._initPaths();
const { chromium } = require("playwright");
const { pathToFileURL } = require("url");

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" });
  const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.resolve("h5-concept-card-demo.html")).href);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector(".task-card");
  const homeMetrics = await page.evaluate(() => {
    const title = document.querySelector(".hero h1").getBoundingClientRect();
    const style = getComputedStyle(document.querySelector(".hero h1"));
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      titleHeight: title.height,
      titleLineHeight: Number.parseFloat(style.lineHeight),
      titleText: document.querySelector(".hero h1").textContent.trim(),
      cards: [...document.querySelectorAll(".task-card")].map((el) => el.getBoundingClientRect().width)
    };
  });
  if (homeMetrics.titleText !== "概念卡任务调研") throw new Error(`expected single-line title text ${JSON.stringify(homeMetrics)}`);
  if (homeMetrics.titleHeight > homeMetrics.titleLineHeight * 1.35) throw new Error(`hero title should render as one line ${JSON.stringify(homeMetrics)}`);
  if (homeMetrics.scrollWidth > homeMetrics.clientWidth) throw new Error(`home horizontal overflow ${JSON.stringify(homeMetrics)}`);
  await page.locator('[data-task="task-ai"]').click();
  await page.waitForSelector(".concept-shell");
  const surveyMetrics = await page.evaluate(() => {
    const concept = document.querySelector(".concept-shell").getBoundingClientRect();
    const options = [...document.querySelectorAll(".option")].map((el) => el.getBoundingClientRect());
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      conceptTop: concept.top,
      conceptWidth: concept.width,
      optionWidths: options.map((box) => box.width),
      visibleOptions: options.filter((box) => box.width > 0 && box.height > 0).length
    };
  });
  if (surveyMetrics.scrollWidth > surveyMetrics.clientWidth) throw new Error(`survey horizontal overflow ${JSON.stringify(surveyMetrics)}`);
  if (surveyMetrics.visibleOptions !== 5) throw new Error(`expected 5 visible options ${JSON.stringify(surveyMetrics)}`);
  if (surveyMetrics.conceptWidth < 350) throw new Error(`concept card too narrow ${JSON.stringify(surveyMetrics)}`);
  await browser.close();
  console.log("PASS layout checks");
})().catch((error) => { console.error(error); process.exit(1); });


