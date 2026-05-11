import initSqlJs from 'sql.js'
import { join, dirname } from 'path'
import { createRequire } from 'module'
import { app } from 'electron'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs'

const _require = createRequire(import.meta.url)

let instance = null   // KitsuneDB wrapper
let rawDb    = null   // sql.js Database
let filePath = null
let dirty    = false

// Flush dirty DB to disk every 3 seconds
setInterval(() => _flush(), 3_000)

function _flush() {
  if (dirty && rawDb && filePath) {
    writeFileSync(filePath, Buffer.from(rawDb.export()))
    dirty = false
  }
}

function markDirty() {
  dirty = true
}

// ─── sql.js wrapper that mirrors better-sqlite3's sync API ────────────────────
//
//   db.exec(sql)
//   db.pragma(str)
//   db.prepare(sql).get(...params)   → first row or undefined
//   db.prepare(sql).all(...params)   → array of rows
//   db.prepare(sql).run(...params)   → { lastInsertRowid }
//   db.transaction(fn)()             → wrapped in BEGIN/COMMIT/ROLLBACK
//
function makeDB(sqlJs) {
  const api = {
    exec(sql) {
      sqlJs.run(sql)
      markDirty()
    },

    pragma(str) {
      try { sqlJs.run(`PRAGMA ${str}`) } catch { /* ignore unsupported pragmas in WASM */ }
    },

    prepare(sql) {
      return {
        get(...args) {
          const params = normalise(args)
          const stmt = sqlJs.prepare(sql)
          try {
            stmt.bind(params)
            return stmt.step() ? stmt.getAsObject() : undefined
          } finally {
            stmt.free()
          }
        },

        all(...args) {
          const params = normalise(args)
          const stmt = sqlJs.prepare(sql)
          const rows = []
          try {
            stmt.bind(params)
            while (stmt.step()) rows.push(stmt.getAsObject())
          } finally {
            stmt.free()
          }
          return rows
        },

        run(...args) {
          const params = normalise(args)
          sqlJs.run(sql, params)
          markDirty()
          const id = sqlJs.exec('SELECT last_insert_rowid() as id')[0]?.values[0][0] ?? null
          return { lastInsertRowid: id, changes: sqlJs.getRowsModified() }
        }
      }
    },

    transaction(fn) {
      return (...args) => {
        sqlJs.run('BEGIN')
        try {
          fn(...args)
          sqlJs.run('COMMIT')
          markDirty()
        } catch (e) {
          sqlJs.run('ROLLBACK')
          throw e
        }
      }
    }
  }
  return api
}

// Accepts (val), (val1, val2, ...) or ([val1, val2])
function normalise(args) {
  if (args.length === 0) return []
  if (args.length === 1 && Array.isArray(args[0])) return args[0]
  return args
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function initDatabase() {
  if (instance) return instance

  // require.resolve('sql.js') → .../node_modules/sql.js/dist/sql-wasm.js
  // so dirname gives us the dist/ folder where the WASM lives alongside
  const sqlJsDist = dirname(_require.resolve('sql.js'))
  const SQL = await initSqlJs({
    locateFile: file => join(sqlJsDist, file)
  })

  const dataDir = join(app.getPath('userData'), 'kitsune')
  mkdirSync(dataDir, { recursive: true })
  filePath = join(dataDir, 'kitsune.db')

  rawDb = existsSync(filePath)
    ? new SQL.Database(readFileSync(filePath))
    : new SQL.Database()

  instance = makeDB(rawDb)
  runMigrations(instance)
  _flush()   // save initial schema

  console.log(`[DB] Initialized at: ${filePath}`)
  return instance
}

export function getDatabase() {
  return instance
}

// ─── Schema ───────────────────────────────────────────────────────────────────

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id         INTEGER PRIMARY KEY,
      name       TEXT NOT NULL DEFAULT 'Tilki',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      settings   TEXT DEFAULT '{}'
    );

    CREATE TABLE IF NOT EXISTS languages (
      id          INTEGER PRIMARY KEY,
      code        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      native_name TEXT NOT NULL,
      flag        TEXT NOT NULL,
      tail_color  TEXT NOT NULL,
      tail_index  INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_languages (
      id             INTEGER PRIMARY KEY,
      user_id        INTEGER NOT NULL REFERENCES users(id),
      language_code  TEXT NOT NULL REFERENCES languages(code),
      cefr_level     TEXT DEFAULT 'A1',
      xp             INTEGER DEFAULT 0,
      streak         INTEGER DEFAULT 0,
      last_practice  DATETIME,
      tail_unlocked  INTEGER DEFAULT 1,
      tail_glow      INTEGER DEFAULT 0,
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, language_code)
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id            INTEGER PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      language_code TEXT NOT NULL,
      scenario      TEXT DEFAULT 'free',
      started_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at      DATETIME
    );

    CREATE TABLE IF NOT EXISTS messages (
      id          INTEGER PRIMARY KEY,
      session_id  INTEGER NOT NULL REFERENCES chat_sessions(id),
      role        TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
      content     TEXT NOT NULL,
      corrections TEXT,
      audio_path  TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS vocabulary (
      id            INTEGER PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      language_code TEXT NOT NULL,
      word          TEXT NOT NULL,
      translation   TEXT,
      context       TEXT,
      next_review   DATETIME DEFAULT CURRENT_TIMESTAMP,
      interval_days INTEGER DEFAULT 1,
      ease_factor   REAL DEFAULT 2.5,
      review_count  INTEGER DEFAULT 0,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, language_code, word)
    );

    CREATE TABLE IF NOT EXISTS level_assessments (
      id            INTEGER PRIMARY KEY,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      language_code TEXT NOT NULL,
      cefr_result   TEXT NOT NULL,
      score         INTEGER NOT NULL,
      completed_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  seedLanguages(db)
  seedDefaultUser(db)
}

function seedLanguages(db) {
  const row = db.prepare('SELECT COUNT(*) as c FROM languages').get()
  if (row?.c > 0) return

  const ins = db.prepare(
    'INSERT INTO languages (code, name, native_name, flag, tail_color, tail_index) VALUES (?, ?, ?, ?, ?, ?)'
  )
  db.transaction(() => {
    ins.run('en', 'İngilizce',  'English',  '🇬🇧', '#4ade80', 1)
    ins.run('de', 'Almanca',    'Deutsch',  '🇩🇪', '#facc15', 2)
    ins.run('zh', 'Çince',      '中文',      '🇨🇳', '#60a5fa', 3)
    ins.run('ja', 'Japonca',    '日本語',    '🇯🇵', '#f87171', 4)
    ins.run('fr', 'Fransızca',  'Français', '🇫🇷', '#fb923c', 5)
    ins.run('es', 'İspanyolca', 'Español',  '🇪🇸', '#c084fc', 6)
    ins.run('it', 'İtalyanca',  'Italiano', '🇮🇹', '#fde68a', 7)
    ins.run('ko', 'Korece',     '한국어',    '🇰🇷', '#f9a8d4', 8)
    ins.run('sv', 'İsveççe',    'Svenska',  '🇸🇪', '#67e8f9', 9)
  })()
}

function seedDefaultUser(db) {
  const user = db.prepare('SELECT id FROM users LIMIT 1').get()
  if (!user) db.prepare('INSERT INTO users (name) VALUES (?)').run('Tilki')
}
