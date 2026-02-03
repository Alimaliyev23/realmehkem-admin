// server/index.js
import jsonServer from "json-server";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = jsonServer.create();
const middlewares = jsonServer.defaults();

// __dirname (ESM üçün)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seed data (yalnız startda oxunur)
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

/* =========================
   🔎 DB VALIDATION
   ========================= */
function validateDb(db) {
  const problems = [];

  for (const [key, value] of Object.entries(db)) {
    if (!Array.isArray(value)) continue;

    value.forEach((item, idx) => {
      // element mütləq obyekt olmalıdır (array/null olmamalıdır)
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        problems.push(`${key}[${idx}] -> NOT an object`);
        return;
      }
      // hər obyektin id-si olmalıdır
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

validateDb(seed);

/* =========================
   🧼 SANITIZE SEED
   - array/null/obyekt olmayan elementləri atır
   - id null olanları atır
   ========================= */
function sanitizeDb(db) {
  for (const [key, value] of Object.entries(db)) {
    if (!Array.isArray(value)) continue;

    db[key] = value.filter((item) => {
      if (item == null || typeof item !== "object" || Array.isArray(item)) {
        console.warn(`[SANITIZE] Removed non-object item from ${key}`);
        return false;
      }
      if (item.id == null) {
        console.warn(`[SANITIZE] Removed item with null id from ${key}`);
        return false;
      }
      return true;
    });
  }
}

/* =========================
   🧹 REMOVE null FOREIGN KEYS
   - json-server delete zamanı relation check edərkən
     getById(null) çağırıb 500 verə bilir.
   - Ona görə seed-dəki "*Id: null" sahələrini silirik.
   ========================= */
function stripNullForeignKeys(db) {
  for (const [key, value] of Object.entries(db)) {
    if (!Array.isArray(value)) continue;

    value.forEach((doc) => {
      if (!doc || typeof doc !== "object" || Array.isArray(doc)) return;

      for (const [k, v] of Object.entries(doc)) {
        if (k.endsWith("Id") && v === null) {
          delete doc[k];
        }
      }
    });
  }
}

sanitizeDb(seed);
stripNullForeignKeys(seed);

/* =========================
   🚧 JSON-SERVER ROUTER
   ========================= */
const router = jsonServer.router(seed);

// Port
const PORT = process.env.PORT || 3001;

// Default middlewares
app.use(middlewares);
app.use(jsonServer.bodyParser);

/* =========================
   🛡️ ID + FK PROTECTION
   - POST/PUT/PATCH zamanı id:null gəlirsə silir
   - foreign key-lərdə (*Id) null gəlirsə silir (DB-yə yazdırmır)
   - PUT /resource/:id zamanı body.id-ni URL-dən məcburi götürür
   ========================= */
app.use((req, _res, next) => {
  const method = req.method.toUpperCase();

  if (
    (method === "POST" || method === "PUT" || method === "PATCH") &&
    req.body &&
    typeof req.body === "object"
  ) {
    // id null/undefined isə sil
    if (req.body.id == null) {
      delete req.body.id;
    }

    // ✅ foreign key null-ları sil (storeId, managerId, departmentId və s.)
    for (const [k, v] of Object.entries(req.body)) {
      if (k.endsWith("Id") && v == null) {
        delete req.body[k];
      }
    }

    // PUT /resource/:id üçün id-ni URL-dən götür
    const match = req.path.match(/^\/([^/]+)\/([^/]+)$/);
    if (method === "PUT" && match) {
      req.body.id = String(match[2]);
    }
  }

  next();
});

/* =========================
   ❤️ HEALTHCHECK
   ========================= */
app.get("/", (_req, res) => {
  res.json({
    ok: true,
    mode: "in-memory",
    note: "Restart olanda data sıfırlanır",
  });
});

/* =========================
   🚀 ROUTER
   ========================= */
app.use(router);

/* =========================
   ▶️ START
   ========================= */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ In-memory json-server running on port ${PORT}`);
});
