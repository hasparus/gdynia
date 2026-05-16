// Gdynia — Arc-style keyboard shortcuts for Chrome.
// Service worker: routes registered keyboard commands to tab actions.

type Command = "copy-url" | "duplicate-tab"

chrome.commands.onCommand.addListener((command, tab) => {
  void handleCommand(command as Command, tab)
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

  // --- toast: springs down from the top edge, eases back out ---
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches

  // Damped-spring easing (~12% overshoot) sampled from spring physics —
  // the CSS linear() spring technique. See scripts/spring-easing.mjs.
  const spring =
    "linear(0,0.0409,0.1445,0.2851,0.4412,0.5964,0.7388,0.8611,0.9595," +
    "1.0332,1.0834,1.1129,1.1253,1.1245,1.1142,1.098,1.0788,1.059,1.0402," +
    "1.0236,1.0099,0.9993,0.9917,0.987,1)"

  const base = "translateX(-50%)"
  const hidden = reduce ? base : base + " translateY(-20px) scale(0.7)"
  const shown = reduce ? base : base + " translateY(0) scale(1)"

  const toast = document.createElement("div")
  toast.textContent = ok ? "Copied URL" : "Couldn't copy"
  toast.style.cssText = [
    "position:fixed",
    "top:24px",
    "left:50%",
    "z-index:2147483647",
    "padding:8px 14px",
    "border-radius:9999px",
    "corner-shape:squircle",
    "font:500 13px/1.2 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
    "color:#fff",
    "background:" + (ok ? "#1c1c1e" : "#b3261e"),
    "box-shadow:0 8px 28px rgba(0,0,0,.32)",
    "pointer-events:none",
    "opacity:0",
    "filter:blur(0)",
    "transform:" + hidden,
    reduce
      ? "transition:opacity 160ms ease-out"
      : "transition:transform 365ms " + spring + ",opacity 150ms ease-out"
  ].join(";")
  toast.setAttribute("data-gdynia-toast", "")
  document.body.appendChild(toast)

  // Cap concurrent toasts at 3 — drop the oldest if a burst stacks up.
  const live = document.querySelectorAll("[data-gdynia-toast]")
  for (let i = 0; i < live.length - 3; i++) live[i].remove()

  // Enter — double rAF so the hidden state paints before the transition.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      toast.style.opacity = "1"
      toast.style.transform = shown
    })
  )

  // Exit — fast fade; scales down and blurs in place, no upward shift.
  setTimeout(() => {
    toast.style.transition =
      "transform 100ms cubic-bezier(0.23,1,0.32,1)," +
      "opacity 100ms ease-out,filter 100ms ease-out"
    toast.style.opacity = "0"
    toast.style.filter = "blur(1px)"
    if (!reduce) toast.style.transform = base + " translateY(0) scale(0.98)"
    setTimeout(() => toast.remove(), 120)
  }, 1500)
}
