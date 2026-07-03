const http = require("http");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { execFile } = require("child_process");

const PORT = Number(process.env.PORT || 4317);
const LARK_CLI = process.env.LARK_CLI || "C:\\Users\\YQSL\\.codex\\skills\\lark-shared\\lark-cli.exe";
const BASE_TOKEN = process.env.BASE_TOKEN || "FoCkbw9Q0a3z5EsUutwcjoqSnwf";
const CARD_TABLE_ID = process.env.CARD_TABLE_ID || "tbl1s8wVI1Rf5Mu4";
const DETAIL_TABLE_ID = process.env.DETAIL_TABLE_ID || "tbl4oHC38PsYlkp4";
const PREVIEW_HTML_PATH = process.env.PREVIEW_HTML_PATH || path.join(__dirname, "h5-concept-card-final.html");
const PREVIEW_BASE_URL = process.env.PREVIEW_BASE_URL || `http://127.0.0.1:${PORT}/preview`;

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

function sendFile(res, contentType, content) {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  res.end(content);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml"
  }[ext] || "application/octet-stream";
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

function attachmentValue(value) {
  return Array.isArray(value) ? value.filter((item) => item && item.file_token) : [];
}

function numberValue(value, fallback) {
  if (value === null || value === undefined || value === "") return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function previewLinkFor(cardId) {
  const url = new URL(PREVIEW_BASE_URL);
  url.searchParams.set("preview", String(cardId));
  return url.href;
}

function isPreviewReady(row) {
  return Boolean(row.id && row.track && row.category && row.posterName && row.price && row.spec);
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
  const recordIds = result.data.record_id_list || [];
  const rows = records.map((record, recordIndex) => {
    const item = {};
    fieldNames.forEach((field, index) => {
      item[field] = record[index];
    });
    return {
      recordId: String(recordIds[recordIndex] || ""),
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
      posterName: attachmentName(item["海报图"]),
      posterAttachment: attachmentValue(item["海报图"]),
      previewLink: String(item["预览链接"] || "")
    };
  });

  return { ok: true, rows, total: rows.length, fetchedAt: new Date().toISOString() };
}

async function updatePreviewLinks() {
  const list = await listConceptCards();
  if (!list.ok) return list;
  const readyRows = list.rows.filter((row) => row.recordId && isPreviewReady(row));
  const updates = [];
  for (const row of readyRows) {
    const previewLink = previewLinkFor(row.id);
    if (row.previewLink && row.previewLink.includes(previewLink)) {
      updates.push({ conceptCardId: row.id, recordId: row.recordId, skipped: true, previewLink });
      continue;
    }
    const result = await runLark([
      "base",
      "+record-batch-update",
      "--as",
      "user",
      "--base-token",
      BASE_TOKEN,
      "--table-id",
      CARD_TABLE_ID,
      "--json",
      JSON.stringify({ record_id_list: [row.recordId], patch: { "预览链接": previewLink } }),
      "--format",
      "json"
    ]);
    updates.push({ conceptCardId: row.id, recordId: row.recordId, skipped: false, previewLink, result });
  }
  return { ok: true, updated: updates.filter((item) => !item.skipped).length, skipped: updates.filter((item) => item.skipped).length, totalReady: readyRows.length, updates };
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

async function createRecord(payload) {
  const list = await listConceptCards();
  const conceptCard = list.ok ? list.rows.find((row) => row.id === String(payload.conceptCardId)) : null;
  const posterAttachment = conceptCard?.posterAttachment || [];
  const fields = [
    "概念卡ID",
    "社区用户ID",
    "奖励元气树数量",
    "元气树发放状态",
    "元气树审核状态",
    "你觉得这张海报或产品有什么可以改进的点？",
    "提交时间",
    "购买意愿"
  ];
  const row = [
    payload.conceptCardId,
    payload.communityUserId,
    0,
    "未发放",
    "审核中",
    String(payload.feedback).trim(),
    payload.submittedAt,
    payload.purchaseIntent
  ];
  if (posterAttachment.length) {
    fields.push("海报");
    row.push(posterAttachment);
  }
  const request = { fields, rows: [row] };

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
    if (req.method === "GET" && pathname === "/preview") {
      sendFile(res, "text/html; charset=utf-8", fs.readFileSync(PREVIEW_HTML_PATH));
      return;
    }

    if (req.method === "GET" && pathname.startsWith("/assets/")) {
      const assetsRoot = path.resolve(__dirname, "assets");
      const filePath = path.resolve(__dirname, decodeURIComponent(pathname.slice(1)));
      if (!filePath.startsWith(assetsRoot + path.sep)) {
        send(res, 403, { ok: false, error: "forbidden" });
        return;
      }
      sendFile(res, contentTypeFor(filePath), fs.readFileSync(filePath));
      return;
    }

    if (req.method === "GET" && pathname === "/survey-data") {
      const result = await listConceptCards();
      send(res, result.ok ? 200 : 500, result);
      return;
    }

    if (req.method === "POST" && pathname === "/preview-links") {
      const result = await updatePreviewLinks();
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




