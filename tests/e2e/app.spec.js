import { test, expect } from "@playwright/test";

async function enterFreeMode(page) {
  await page.locator(".showcase-card.showcase-free").click();
  await expect(page.locator("#drawCanvas")).toBeVisible({ timeout: 5000 });
}

test.describe("Mindful Canvas", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addInitScript(() => {
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
      }
    });
    await page.goto(`/?v=zen-v51&_=${Date.now()}`);
    await page.waitForFunction(() => typeof window.openZenPicker === "function");
  });

  test("loads the app", async ({ page }) => {
    await expect(page).toHaveTitle(/Mindful Canvas/);
  });

  test("shows welcome screen with showcase cards", async ({ page }) => {
    await expect(page.locator("#welcome")).toBeVisible();
    await expect(page.getByRole("heading", { name: "覺知畫布" })).toBeVisible();
    await expect(page.getByText("畫一筆，讓心安靜下來")).toBeVisible();
    await expect(page.getByText("探索三種不同的創作體驗")).toBeVisible();
    await expect(page.locator(".showcase-card")).toHaveCount(3);
    await expect(page.locator("#galleryOpenBtn")).toBeVisible();
    await expect(page.locator("#galleryOpenBtn")).toContainText("查看全部");
    await expect(page.locator("#welcomeContent .showcase-title").first()).toHaveText("🪷 禪繞唐卡");
    await expect(page.locator("#welcomeContent .showcase-title").nth(1)).toHaveText("🌊 墨流畫布");
    await expect(page.locator("#welcomeContent .showcase-title").nth(2)).toHaveText("🎨 自由畫布");
    await expect(page.locator("#welcomeRecent")).toBeVisible();
  });

  test("shows canvas after selecting free draw mode", async ({ page }) => {
    await enterFreeMode(page);
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#canvasTitle")).toHaveText("自由畫布");
  });

  test("opens zen template picker and starts guided zen mode", async ({ page }) => {
    await page.locator(".showcase-card.showcase-zen").click();
    await expect(page.locator("#zenPickerScreen")).toHaveClass(/active/);
    await expect(page.getByRole("heading", { name: "選一個圖案跟住畫" })).toBeVisible();
    await expect(page.locator(".zen-tpl-card")).toHaveCount(12);
    await expect(page.locator(".zen-tpl-preview canvas")).toHaveCount(12);
    await page.locator(".zen-tpl-card").first().click();
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#zenOverlay")).toBeVisible();
    await expect(page.locator("#zenHint")).toHaveText("跟住淺色線條，留下你的色彩痕跡");
    await expect(page.locator("#eraserBtn")).toBeVisible();
    await expect(page.locator("#undoBtn")).toBeVisible();
  });

  test("starts sumi marbling mode and can drop ink", async ({ page }) => {
    await page.locator(".showcase-card.showcase-sumi").click();
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#canvasTitle")).toHaveText("墨流畫布");
    await expect(page.locator("#sumiUI")).toBeVisible();
    await expect(page.locator(".sumi-steps")).toBeVisible();
    await expect(page.locator(".sumi-step-label").first()).toHaveText("滴墨");
    await expect(page.locator(".sumi-step-label").nth(1)).toHaveText("攪水");
    await expect(page.locator(".sumi-palette .sumi-dot")).toHaveCount(12);
    await expect(page.locator(".sumi-palette .sumi-dot").nth(3)).toHaveAttribute(
      "aria-label",
      "藤黄"
    );
    await expect(page.locator(".sumi-flow-btn")).toHaveCount(3);
    await expect(page.locator(".sumi-flow-btn").first()).toHaveClass(/active/);
    await expect(page.locator(".sumi-dot")).toHaveCount(12);
    await expect(page.locator("#sumiUndoBtn")).toBeVisible();
    const canvas = page.locator("#drawCanvas");
    const box = await canvas.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await expect(page.locator("#completeBtn")).toBeVisible();
  });

  test("can draw on canvas after entering draw mode", async ({ page }) => {
    await enterFreeMode(page);
    const canvas = page.locator("#drawCanvas");
    const box = await canvas.boundingBox();
    expect(box).toBeTruthy();
    await page.mouse.move(box.x + 100, box.y + 100);
    await page.mouse.down();
    await page.mouse.move(box.x + 200, box.y + 200, { steps: 10 });
    await page.mouse.up();
    await expect(canvas).toBeVisible();
  });

  test("has no console errors on load", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.reload();
    await page.waitForTimeout(1000);
    const realErrors = errors.filter(
      (e) => !e.includes("service worker") && !e.includes("SW") && !e.includes("favicon")
    );
    expect(realErrors).toHaveLength(0);
  });

  test("is responsive on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await expect(page.locator("#welcome")).toBeVisible();
    await expect(page.locator(".showcase-card")).toHaveCount(3);
  });

  test("switches to English via language toggle", async ({ page }) => {
    await expect(page.locator("#langToggle")).toBeVisible();
    await page.locator('#langToggle [data-lang="en"]').click();
    await expect(page.getByRole("heading", { name: "Mindful Canvas" })).toBeVisible();
    await expect(page.getByText("Draw one stroke, let your heart settle")).toBeVisible();
    await page.locator(".showcase-card.showcase-free").click();
    await expect(page.locator("#canvasTitle")).toHaveText("Free Canvas");
    await expect(page.locator("#completeBtn")).toHaveText("Done →");
  });

  test("saves welcome feedback locally without calling an unconfigured remote endpoint", async ({
    page,
  }) => {
    const feedbackRequests = [];
    page.on("request", (request) => {
      if (request.url().includes("/api/feedback")) feedbackRequests.push(request.url());
    });

    await page.locator("#welcomeFeedbackComment").fill("測試回饋");
    await page.locator("#welcomeFeedbackSubmit").click();

    await expect(page.locator(".welcome-feedback-done")).toBeVisible();
    expect(feedbackRequests).toHaveLength(0);
  });

  test("gallery delete removes saved entry", async ({ page }) => {
    await page.evaluate(async () => {
      const DB_NAME = "mindful_canvas_gallery";
      const thumb = new Blob([new Uint8Array([0xff, 0xd8, 0xff, 0xd9])], {
        type: "image/jpeg",
      });
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const database = e.target.result;
          if (!database.objectStoreNames.contains("entries")) {
            const store = database.createObjectStore("entries", {
              keyPath: "id",
              autoIncrement: true,
            });
            store.createIndex("createdAt", "createdAt", { unique: false });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction("entries", "readwrite");
        tx.objectStore("entries").add({
          createdAt: new Date().toISOString(),
          mode: "zen",
          templateId: "lotus",
          affirmation: "測試題字",
          thumb,
        });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    });

    await page.reload();
    await expect(page.locator(".welcome-recent-thumb")).toHaveCount(1);

    await page.locator("#galleryOpenBtn").click();
    await expect(page.locator("#galleryScreen")).toHaveClass(/active/);
    await expect(page.locator(".gallery-item")).toHaveCount(1);

    await page.locator(".gallery-item").first().click();
    await expect(page.locator("#galleryDetail")).toBeVisible();

    await page.locator("#galleryDeleteBtn").click();
    await expect(page.locator("#toast")).toContainText("已刪除", { timeout: 5000 });
    await expect(page.locator("#galleryDetail")).toBeHidden();
    await expect(page.locator(".gallery-item")).toHaveCount(0);
    await expect(page.locator("#galleryEmpty")).toBeVisible();
  });
});
