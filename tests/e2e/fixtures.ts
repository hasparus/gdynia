import { test as base, chromium, expect, type BrowserContext } from "@playwright/test"
import path from "node:path"

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  context: async ({}, use, testInfo) => {
    const extensionPath = path.join(process.cwd(), "build/chrome-mv3-prod")
    const userDataDir = testInfo.outputPath("user-data-dir")

    const context = await chromium.launchPersistentContext(userDataDir, {
      channel: "chromium",
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`
      ]
    })

    await use(context)
    await context.close()
  },
  extensionId: async ({ context }, use) => {
    let [serviceWorker] = context.serviceWorkers()
    serviceWorker ??= await context.waitForEvent("serviceworker")

    await use(serviceWorker.url().split("/")[2])
  }
})

export { expect }
