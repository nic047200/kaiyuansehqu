const http = require("http");
const { execFile } = require("child_process");

const PORT = Number(process.env.PORT || 4317);
const LARK_CLI = process.env.LARK_CLI || "C:\\Users\\YQSL\\.codex\\skills\\lark-shared\\lark-cli.exe";
const BASE_TOKEN = process.env.BASE_TOKEN || "FoCkbw9Q0a3z5EsUutwcjoqSnwf";
const CARD_TABLE_ID = process.env.CARD_TABLE_ID || "tbl1s8wVI1Rf5Mu4";
const DETAIL_TABLE_ID = process.env.DETAIL_TABLE_ID || "tbl4oHC38PsYlkp4";

function send(res, status, data) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store"
  });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error("request-too-large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("invalid-json"));
      }
    });
    req.on("error", reject);
  });
}

function runLark(args) {
  return new Promise((resolve, reject) => {
    execFile(LARK_CLI, args, { windowsHide: true, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        error.stdout = stdout;
        error.stderr = stderr;
        reject(error);
        return;
      }
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ ok: true, raw: stdout });
      }
    });
  });
}

function firstOption(value) {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

function attachmentName(value) {
  return Array.isArray(value) && value[0] && value[0].name ? String(value[0].name) : "";
}

function numberValue(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

async function listConceptCards() {
  const result = await runLark([
    "base",
    "+record-list",
    "--as",
    "user",
    "--base-token",
    BASE_TOKEN,
    "--table-id",
    CARD_TABLE_ID,
    "--limit",
    "200",
    "--format",
    "json"
  ]);
  if (!result.ok) return result;

  const fieldNames = result.data.fields || [];
  const records = result.data.data || [];
  const rows = records.map((record) => {
    const item = {};
    fieldNames.forEach((field, index) => {
      item[field] = record[index];
    });
    return {
      id: String(item["概念卡ID"] || ""),
      trackId: String(item["赛道ID"] || ""),
      track: String(item["赛道"] || ""),
      category: String(item["品类"] || ""),
      price: String(item["价格"] || ""),
      spec: String(item["规格"] || ""),
      answerCount: numberValue(item["已答题用户数"], 0),
      targetAnswers: numberValue(item["目标答题用户"], 100),
      status: firstOption(item["问卷状态"]),
      startsAt: String(item["开始时间设置"] || ""),
      endsAt: String(item["结束时间设置"] || ""),
      posterName: attachmentName(item["海报图"])
    };
  });

  return { ok: true, rows, total: rows.length, fetchedAt: new Date().toISOString() };
}

function validatePayload(payload) {
  const required = ["conceptCardId", "communityUserId", "purchaseIntent", "feedback", "submittedAt"];
  const missing = required.filter((key) => !payload[key]);
  if (missing.length) {
    return `missing: ${missing.join(", ")}`;
  }
  if (String(payload.feedback).trim().length < 5) return "feedback-too-short";
  return "";
}

function createRecord(payload) {
  const request = {
    fields: [
      "概念卡ID",
      "社区用户ID",
      "奖励元气树数量",
      "元气树发放状态",
      "元气树审核状态",
      "你觉得这张海报或产品有什么可以改进的点？",
      "提交时间",
      "购买意愿"
    ],
    rows: [[
      payload.conceptCardId,
      payload.communityUserId,
      0,
      "未发放",
      "审核中",
      String(payload.feedback).trim(),
      payload.submittedAt,
      payload.purchaseIntent
    ]]
  };

  return runLark([
    "base",
    "+record-batch-create",
    "--as",
    "user",
    "--base-token",
    BASE_TOKEN,
    "--table-id",
    DETAIL_TABLE_ID,
    "--json",
    JSON.stringify(request),
    "--format",
    "json"
  ]);
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || "127.0.0.1"}`).pathname;
  if (req.method === "OPTIONS") {
    send(res, 204, {});
    return;
  }

  try {
    if (req.method === "GET" && pathname === "/survey-data") {
      const result = await listConceptCards();
      send(res, result.ok ? 200 : 500, result);
      return;
    }

    if (req.method === "POST" && pathname === "/submit-answer") {
      const payload = await readJson(req);
      const invalid = validatePayload(payload);
      if (invalid) {
        send(res, 400, { ok: false, error: invalid });
        return;
      }
      const result = await createRecord(payload);
      send(res, 200, { ok: true, result });
      return;
    }

    send(res, 404, { ok: false, error: "not-found" });
  } catch (error) {
    send(res, 500, {
      ok: false,
      error: error.message,
      stderr: error.stderr,
      stdout: error.stdout
    });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Lark bridge listening on http://127.0.0.1:${PORT}`);
});

