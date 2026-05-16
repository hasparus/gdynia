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
