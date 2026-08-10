/**
 * Mindful Canvas — Feedback Storage Module
 * IndexedDB-based feedback collection for user experience surveys
 * @module feedback
 */

const DB_NAME = "mindful_canvas_feedback";
const DB_VERSION = 1;
const STORE = "feedback";

/**
 * Open the feedback IndexedDB database
 * @returns {Promise<IDBDatabase>}
 */
function openFeedbackDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("createdAt", "createdAt", { unique: false });
        store.createIndex("mode", "mode", { unique: false });
      }
    };
  });
}

/**
 * Validate a feedback entry
 * @param {Object} entry
 * @returns {boolean}
 */
export function isValidFeedbackEntry(entry) {
  return Boolean(
    entry && typeof entry.mode === "string" && ["free", "zen", "sumi"].includes(entry.mode)
  );
}

/**
 * Add a feedback entry to IndexedDB
 * @param {Object} feedback
 * @param {string} feedback.mode - Drawing mode (free|zen|sumi)
 * @param {string|null} feedback.templateId - Zen template ID
 * @param {number|null} feedback.rating - Emoji rating 1-5
 * @param {string} feedback.comment - Optional text comment
 * @param {number} feedback.duration - Session duration in seconds
 * @param {string} feedback.language - User language (zh|en)
 * @returns {Promise<number>} Entry ID
 */
export async function addFeedbackEntry(feedback) {
  const entry = {
    createdAt: new Date().toISOString(),
    mode: feedback.mode || "free",
    templateId: feedback.templateId || null,
    rating: feedback.rating || null,
    comment: String(feedback.comment || "").slice(0, 200),
    duration: Math.max(0, Math.round(feedback.duration || 0)),
    language: feedback.language || "zh",
  };

  if (!isValidFeedbackEntry(entry)) {
    throw new Error("invalid feedback entry");
  }

  const db = await openFeedbackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).add(entry);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * List all feedback entries (for teacher export)
 * @returns {Promise<Array>}
 */
export async function listFeedbackEntries() {
  const db = await openFeedbackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get the total number of feedback entries
 * @returns {Promise<number>}
 */
export async function getFeedbackCount() {
  const db = await openFeedbackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result || 0);
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Delete a feedback entry by ID
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteFeedbackEntry(id) {
  const db = await openFeedbackDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const req = tx.objectStore(STORE).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Export all feedback entries as JSON for download
 * @returns {Promise<void>}
 */
export async function exportFeedbackJSON() {
  const entries = await listFeedbackEntries();
  const data = JSON.stringify(entries, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.download = "mindful-canvas-feedback.json";
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
}
