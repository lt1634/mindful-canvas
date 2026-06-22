import { zh } from "./zh.js";
import { en } from "./en.js";

const LANG_KEY = "mindful-canvas-lang";
const PACKS = { zh, en };

let currentLang = "zh";
const listeners = [];

function getPack(lang = currentLang) {
  return PACKS[lang] || PACKS.zh;
}

function resolve(obj, path) {
  return path.split(".").reduce((o, k) => (o === null || o === undefined ? undefined : o[k]), obj);
}

export function getLang() {
  return currentLang;
}

export function t(key, vars = {}) {
  let val = resolve(getPack(), key);
  if (val === null || val === undefined) val = resolve(PACKS.zh, key);
  if (typeof val !== "string") return key;
  return val.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : ""));
}

export function tArray(key) {
  const val = resolve(getPack(), key) ?? resolve(PACKS.zh, key);
  return Array.isArray(val) ? val : [];
}

export function tObject(key) {
  const val = resolve(getPack(), key) ?? resolve(PACKS.zh, key);
  return val && typeof val === "object" ? val : {};
}

export function onLangChange(fn) {
  listeners.push(fn);
}

export function setLang(lang) {
  if (!PACKS[lang] || lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* private mode */
  }
  document.documentElement.lang = lang === "en" ? "en" : "zh-Hant";
  document.title = t("meta.title");
  applyI18n();
  listeners.forEach((fn) => fn(lang));
}

export function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const attr = el.getAttribute("data-i18n-attr");
    const text = t(key);
    if (attr) el.setAttribute(attr, text);
    else el.textContent = text;
  });

  const toggle = document.getElementById("langToggle");
  if (toggle) {
    toggle.querySelector('[data-lang="zh"]')?.classList.toggle("active", currentLang === "zh");
    toggle.querySelector('[data-lang="en"]')?.classList.toggle("active", currentLang === "en");
    toggle.setAttribute("aria-label", t("lang.toggleLabel"));
  }

  renderTermsBody();
}

export function initI18n() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && PACKS[saved]) currentLang = saved;
  } catch {
    /* private mode */
  }
  document.documentElement.lang = currentLang === "en" ? "en" : "zh-Hant";
  document.title = t("meta.title");
  applyI18n();
}

export function getSafetyResponse() {
  return { ...getPack().content.safety, isSafe: false };
}

export function getGalleryModeLabel(mode) {
  return t(`gallery.modes.${mode}`) || mode;
}

export function getSumiColorName(index) {
  return t(`sumi.colors.${index}`) || "";
}

export function getZenName(id) {
  return t(`zen.templates.${id}.name`) || id;
}

export function getZenPickerDesc(id) {
  return t(`zen.picker.${id}`) || "";
}

export function getZenMeta(id, field) {
  return t(`zen.meta.${id}.${field}`) || "";
}

export function getAffirmations(scene) {
  const pool = getPack().content.affirmations[scene] || getPack().content.affirmations.free;
  return pool;
}

export function getSceneGuidance(scene) {
  return getPack().content.sceneGuidance[scene] || getPack().content.sceneGuidance.free;
}

export function getColorDescription(hex) {
  return getPack().content.colorDescriptions[hex] || { name: "", meaning: "" };
}

export function getSceneEnding(scene) {
  return getPack().content.sceneEndings[scene] || getPack().content.sceneEndings.free;
}

export function buildReflectionParts({
  scene,
  strokeCount,
  totalSilence,
  dominantColor,
  currentColorHex,
  zenTouchCount = 0,
}) {
  const c = getPack().content;
  const colorInfo = c.colorDescriptions[dominantColor] ||
    c.colorDescriptions[currentColorHex] || { meaning: "" };

  let strokePart = "";
  if (scene === "zen") {
    strokePart =
      zenTouchCount > 0
        ? t("reflection.zenStrokes", { count: zenTouchCount })
        : t("reflection.zenQuiet");
  } else if (scene === "sumi") {
    strokePart =
      strokeCount > 0
        ? t("reflection.sumiInteract", { count: strokeCount })
        : t("reflection.sumiWatch");
  } else if (strokeCount < 5) {
    strokePart = t("reflection.strokesFew", { count: strokeCount });
  } else if (strokeCount < 30) {
    strokePart = t("reflection.strokesMid", { count: strokeCount });
  } else if (strokeCount < 100) {
    strokePart = t("reflection.strokesMany", { count: strokeCount });
  } else {
    strokePart = t("reflection.strokesRelease", { count: strokeCount });
  }

  let silencePart = "";
  if (scene === "zen") {
    silencePart = t("reflection.zenRhythm");
  } else if (scene === "sumi") {
    silencePart = t("reflection.sumiRhythm");
  } else if (totalSilence > 60) {
    silencePart = t("reflection.silenceDeep");
  } else if (totalSilence > 30) {
    silencePart = t("reflection.silenceMid", { sec: Math.round(totalSilence) });
  } else if (totalSilence > 5) {
    silencePart = t("reflection.silenceShort", { sec: Math.round(totalSilence) });
  } else {
    silencePart = t("reflection.silenceFlow");
  }

  const endingPart = getSceneEnding(scene);
  const colorPart = colorInfo.meaning || "";
  const parts = [strokePart, silencePart, colorPart, endingPart].filter(Boolean);
  const sep = currentLang === "en" ? ", " : "，";
  return parts.slice(0, 3).join(sep) + (currentLang === "en" ? "." : "。");
}

export function renderTermsBody() {
  const el = document.getElementById("termsBody");
  if (!el) return;
  const terms = getPack().terms;
  const blocks = ["s1", "s2", "s3", "s4", "s5", "s6"]
    .map(
      (k) =>
        `<p style="margin-bottom: 12px"><strong style="color: var(--text)">${terms[k].title}</strong><br />${terms[k].body.replace(/\n/g, "<br />")}</p>`
    )
    .join("");
  el.innerHTML = `<p style="margin-bottom: 12px"><strong style="color: var(--text)">© 2026 ZenArt Lab</strong><br />All rights reserved.</p>${blocks}<p style="margin-top: 24px; font-size: 11px; color: #555">${terms.footer}</p>`;
}

export function initLangToggle(onSelect) {
  const toggle = document.getElementById("langToggle");
  if (!toggle) return;
  toggle.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang) onSelect(lang);
    });
  });
}
