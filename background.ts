// Gdynia — Arc-style keyboard shortcuts for Chrome.
// Service worker: routes registered keyboard commands to tab actions.

type Command = "copy-url" | "duplicate-tab"

chrome.commands.onCommand.addListener((command, tab) => {
  void handleCommand(command as Command, tab)
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

// Injected into the page. Must be self-contained — no outer-scope references.
function copyTextWithToast(text: string) {
  const ta = document.createElement("textarea")
  ta.value = text
  ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none"
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  ta.remove()

  const toast = document.createElement("div")
  toast.textContent = ok ? "Copied URL" : "Couldn't copy"
  toast.style.cssText = [
    "position:fixed",
    "bottom:24px",
    "left:50%",
    "transform:translateX(-50%) translateY(8px)",
    "z-index:2147483647",
    "padding:8px 14px",
    "border-radius:9999px",
    "font:500 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:#fff",
    "background:" + (ok ? "#1c1c1e" : "#b3261e"),
    "box-shadow:0 6px 24px rgba(0,0,0,.28)",
    "opacity:0",
    "transition:opacity .16s ease,transform .16s ease",
    "pointer-events:none"
  ].join(";")
  document.body.appendChild(toast)

  requestAnimationFrame(() => {
    toast.style.opacity = "1"
    toast.style.transform = "translateX(-50%) translateY(0)"
  })
  setTimeout(() => {
    toast.style.opacity = "0"
    toast.style.transform = "translateX(-50%) translateY(8px)"
    setTimeout(() => toast.remove(), 200)
  }, 1400)
}
