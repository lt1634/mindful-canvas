import {
  GALLERY_DB_NAME,
  GALLERY_MAX_ENTRIES,
  isValidGalleryEntry,
} from "../src/logic.js?v=zen-v49";

export {
  GALLERY_MAX_ENTRIES,
  GALLERY_MODE_LABELS,
  formatGalleryDate,
  isValidGalleryEntry,
} from "../src/logic.js?v=zen-v49";

const DB_NAME = GALLERY_DB_NAME;
const DB_VERSION = 1;
const STORE = "entries";

function openDB() {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) {
      reject(new Error("indexedDB unavailable"));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function getAllFromDB(db) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function pruneOldEntries(db) {
  const all = await getAllFromDB(db);
  if (all.length <= GALLERY_MAX_ENTRIES) return;
  const sorted = [...all].sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
  const excess = sorted.length - GALLERY_MAX_ENTRIES;
  const toDelete = sorted.slice(0, excess);
  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    toDelete.forEach((entry) => store.delete(entry.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function dataUrlToThumbnailBlob(dataUrl, maxWidth = 320, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("thumbnail encode failed"))),
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => reject(new Error("thumbnail load failed"));
    img.src = dataUrl;
  });
}

export async function addGalleryEntry(entry) {
  if (!isValidGalleryEntry(entry)) {
    throw new Error("invalid gallery entry");
  }
  const db = await openDB();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const req = tx.objectStore(STORE).add(entry);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    await pruneOldEntries(db);
  } finally {
    db.close();
  }
}

export async function listGalleryEntries() {
  const db = await openDB();
  try {
    const all = await getAllFromDB(db);
    return all.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  } finally {
    db.close();
  }
}

export async function deleteGalleryEntry(id) {
  const key = typeof id === "string" ? Number(id) : id;
  if (!Number.isFinite(key)) {
    throw new Error("invalid gallery entry id");
  }
  const db = await openDB();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const req = tx.objectStore(STORE).delete(key);
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function getGalleryCount() {
  const entries = await listGalleryEntries();
  return entries.length;
}
