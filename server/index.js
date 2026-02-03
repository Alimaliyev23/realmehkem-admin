// server/index.js
import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = jsonServer.create();
const middlewares = jsonServer.defaults();

// __dirname ekvivalenti (ESM üçün)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed data: repo-dakı server/db.json-dan yalnız startda oxuyuruq
const seedPath = path.resolve(__dirname, "db.json");

let seed = {};
try {
  const raw = fs.readFileSync(seedPath, "utf-8");
  seed = JSON.parse(raw);
} catch (e) {
  console.warn(
    "[WARN] server/db.json oxunmadı. Boş data ilə başlayıram.",
    e?.message,
  );
  seed = {};
}
function validateDb(db) {
  const problems = [];

  for (const [key, value] of Object.entries(db)) {
    if (!Array.isArray(value)) continue;

    value.forEach((item, idx) => {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        problems.push(`${key}[${idx}] -> NOT an object`);
        return;
      }
      if (item.id == null) {
        problems.push(`${key}[${idx}] -> id is null/missing`);
      }
    });
  }

  if (problems.length) {
    console.warn("❌ DB validation problems:");
    problems.forEach((p) => console.warn("  -", p));
  } else {
    console.log("✅ DB validation OK");
  }
}

// In-memory DB (FAYLA YAZMIR!)
const router = jsonServer.router(seed);

// Render üçün port
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(middlewares);
app.use(jsonServer.bodyParser);

// (istəyə görə) sadə healthcheck
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    mode: "in-memory",
    note: "Restart olanda data sifirlanir",
  });
});

// Router
app.use(router);

// Start
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ In-memory json-server running on port ${PORT}`);
});
