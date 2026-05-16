// Gdynia — Arc-style keyboard shortcuts for Chrome.
// Service worker: routes registered keyboard commands to tab actions.

import { type Command, isCommand } from "./shortcuts"
import { copyTextWithToast } from "./toast"

chrome.commands.onCommand.addListener((command, tab) => {
  if (!isCommand(command)) {
    console.warn("Gdynia: ignoring unknown command", command)
    return
  }
  void handleCommand(command, tab)
})

// Open the onboarding tab once, on first install — it walks the user through
// assigning the keyboard shortcuts (Chrome won't bind the defaults itself).
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    void chrome.tabs.create({ url: chrome.runtime.getURL("tabs/welcome.html") })
  }
})

async function handleCommand(command: Command, tab?: chrome.tabs.Tab) {
  const active = tab?.id ? tab : await getActiveTab()
  if (!active?.id) return

  switch (command) {
    case "copy-url":
      await copyUrl(active)
      break
    case "duplicate-tab":
      await chrome.tabs.duplicate(active.id)
      break
    default:
      // Exhaustiveness guard: a new Command must be routed here.
      command satisfies never
  }
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  return tab
}

async function copyUrl(tab: chrome.tabs.Tab) {
  if (!tab.id || !tab.url) return
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: copyTextWithToast,
      args: [tab.url]
    })
  } catch (err) {
    // Restricted pages (chrome://, the Web Store, the New Tab page) can't be
    // scripted. Nothing to copy into there anyway — fail quietly.
    console.warn("Gdynia: can't copy from this page", err)
  }
}
