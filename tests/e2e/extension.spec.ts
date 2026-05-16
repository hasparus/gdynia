import { copyTextWithToast } from "../../src/toast"

import { test, expect } from "./fixtures"

test("popup renders shortcuts and actions", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  await expect(page.getByText("Gdynia")).toBeVisible()
  await expect(page.getByText("Arc shortcuts for Chrome")).toBeVisible()
  await expect(page.getByText("Copy page URL")).toBeVisible()
  await expect(page.getByText("Duplicate tab")).toBeVisible()
  await expect(page.getByRole("button", { name: "Copy current URL" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Edit shortcuts" })).toBeVisible()
})

test("welcome page renders onboarding flow", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/tabs/welcome.html`)

  await expect(page.getByRole("img", { name: "Gdynia" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Gdynia" })).toBeVisible()
  await expect(page.getByText("One-time setup")).toBeVisible()
  await expect(page.getByRole("button", { name: "Open chrome://extensions/shortcuts" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Done" })).toBeVisible()
})

test("popup copy button flashes a status and resets", async ({
  page,
  extensionId
}) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  // The primary "Copy current URL" button is the first button in the popup.
  const copyButton = page.locator("button").first()
  await expect(copyButton).toHaveText("Copy current URL")

  await copyButton.click()
  // Opened as a standalone page the popup has no activeTab host access, so the
  // click deterministically exercises copyCurrentUrl()'s failure-flash branch.
  await expect(copyButton).toHaveText("No URL on this tab")

  // flash() clears the status after ~1.4s, restoring the idle label.
  await expect(copyButton).toHaveText("Copy current URL")
})

test("copyTextWithToast injects a toast and cleans it up", async ({ page }) => {
  // background.ts injects this exact function into the active page on copy-url.
  await page.goto("about:blank")
  await page.evaluate(copyTextWithToast, "https://example.com/page")

  const toast = page.locator("[data-gdynia-toast]")
  await expect(toast).toBeVisible()
  await expect(toast).toHaveText(/Copied URL|Couldn't copy/)

  // The toast removes itself once the exit animation finishes.
  await expect(toast).toHaveCount(0, { timeout: 3000 })
})

test("manifest exposes expected commands", async ({ page, extensionId }) => {
  await page.goto(`chrome-extension://${extensionId}/popup.html`)

  const commands = await page.evaluate(() => chrome.runtime.getManifest().commands)

  expect(commands).toMatchObject({
    "copy-url": {
      description: "Copy active page URL",
      suggested_key: {
        default: "Ctrl+Shift+C",
        mac: "Command+Shift+C"
      }
    },
    "duplicate-tab": {
      description: "Duplicate active tab",
      suggested_key: {
        default: "Ctrl+Shift+D",
        mac: "Command+Shift+D"
      }
    }
  })
})
