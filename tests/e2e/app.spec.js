import { test, expect } from "@playwright/test";

async function enterFreeMode(page) {
  await page.locator(".mode-card").first().click();
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
    await expect(page.locator(".mode-card")).toHaveCount(2);
    await expect(page.locator("#welcomeContent .mode-title").first()).toHaveText("自由畫布");
    await expect(page.locator("#welcomeContent .mode-title").nth(1)).toHaveText("禪繞唐卡");
  });

  test("shows canvas after selecting free draw mode", async ({ page }) => {
    await enterFreeMode(page);
    await expect(page.locator("#canvasScreen")).toHaveClass(/active/);
    await expect(page.locator("#canvasTitle")).toHaveText("自由畫布");
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
    await expect(page.locator(".mode-card")).toHaveCount(2);
  });
});
