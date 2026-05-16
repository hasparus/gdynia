import { useState, type CSSProperties } from "react"

import { SHORTCUTS } from "./shortcuts"

function IndexPopup() {
  const [status, setStatus] = useState<string | null>(null)

  async function copyCurrentUrl() {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    })
    if (!tab?.url) {
      flash("No URL on this tab")
      return
    }
    try {
      await navigator.clipboard.writeText(tab.url)
      flash("Copied URL")
    } catch (err) {
      // Mirror background.ts: keep the diagnostic, show a quiet failure.
      console.warn("Gdynia: clipboard write failed", err)
      flash("Couldn't copy")
    }
  }

  function flash(message: string) {
    setStatus(message)
    setTimeout(() => setStatus(null), 1400)
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.title}>Gdynia</span>
        <span style={styles.subtitle}>Arc shortcuts for Chrome</span>
      </header>

      <div style={styles.list}>
        {SHORTCUTS.map((s) => (
          <div key={s.label} style={styles.row}>
            <span>{s.label}</span>
            <span style={styles.keys}>
              {s.keys.map((k) => (
                <kbd key={k} style={styles.kbd}>
                  {k}
                </kbd>
              ))}
            </span>
          </div>
        ))}
      </div>

      <button style={styles.primary} onClick={copyCurrentUrl}>
        {status ?? "Copy current URL"}
      </button>

      <button
        style={styles.ghost}
        onClick={() =>
          chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
        }>
        Edit shortcuts
      </button>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: {
    width: 280,
    margin: 0,
    padding: 16,
    background: "#141416",
    color: "#f4f4f5",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    display: "flex",
    flexDirection: "column",
    gap: 14
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: 2
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: -0.2
  },
  subtitle: {
    fontSize: 12,
    color: "#8e8e93"
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13
  },
  keys: {
    display: "flex",
    gap: 4
  },
  kbd: {
    minWidth: 20,
    padding: "2px 6px",
    borderRadius: 6,
    background: "#2a2a2e",
    border: "1px solid #3a3a3e",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "inherit"
  },
  primary: {
    padding: "9px 12px",
    borderRadius: 9,
    border: "none",
    background: "#f4f4f5",
    color: "#141416",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer"
  },
  ghost: {
    padding: "7px 12px",
    borderRadius: 9,
    border: "1px solid #3a3a3e",
    background: "transparent",
    color: "#c7c7cc",
    fontSize: 12,
    cursor: "pointer"
  }
}

export default IndexPopup
