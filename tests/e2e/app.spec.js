import { test, expect } from "@playwright/test";

async function enterFreeMode(page) {
  await page.locator(".mode-card.free-secondary").click();
  await expect(page.locator("#drawCanvas")).toBeVisible({ timeout: 5000 });
}

test.describe("Mindful Canvas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads the app", async ({ page }) => {
    await expect(page).toHaveTitle(/Mindful Canvas/);
  });

  test("shows welcome screen with mode cards", async ({ page }) => {
    await expect(page.locator("#welcome")).toBeVisible();
    await expect(page.getByRole("heading", { name: "覺知畫布" })).toBeVisible();
    await expect(page.locator(".mode-card")).toHaveCount(3);
    await expect(page.locator("#welcomeContent .mode-title").first()).toHaveText("禪繞唐卡");
    await expect(page.locator("#welcomeContent .mode-title").nth(1)).toHaveText("墨流畫布");
    await expect(page.locator("#welcomeContent .mode-title").nth(2)).toHaveText("自由畫布");
  });

  test("shows canvas after selecting free draw mode", async ({ page }) => {
    await enterFreeMode(page);
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#canvasTitle")).toHaveText("自由畫布");
  });

  test("opens zen template picker and starts guided zen mode", async ({ page }) => {
    await page.locator(".mode-card.zen").click();
    await expect(page.locator("#zenPickerScreen")).toHaveClass(/active/);
    await expect(page.getByRole("heading", { name: "選一個圖案跟住畫" })).toBeVisible();
    await expect(page.locator(".zen-tpl-card")).toHaveCount(7);
    await expect(page.locator(".zen-tpl-preview canvas")).toHaveCount(7);
    await page.locator(".zen-tpl-card").first().click();
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#zenOverlay")).toBeVisible();
    await expect(page.locator("#zenStepLabel")).toHaveText("步驟 1 / 4");
    await expect(page.locator("#zenNextBtn")).toHaveText("跟好了 →");
  });

  test("starts sumi marbling mode and can drop ink", async ({ page }) => {
    await page.locator(".mode-card.sumi").click();
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#canvasTitle")).toHaveText("墨流畫布");
    await expect(page.locator("#sumiUI")).toBeVisible();
    await expect(page.locator(".sumi-flow-btn")).toHaveCount(3);
    await expect(page.locator(".sumi-flow-btn").first()).toHaveClass(/active/);
    await expect(page.locator(".sumi-dot")).toHaveCount(14);
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
    await expect(page.locator(".mode-card")).toHaveCount(3);
  });
});
