import { type CSSProperties } from "react"

import crestUrl from "url:~assets/icon.png"

const shortcuts = [
  {
    keys: ["⌘", "⇧", "C"],
    label: "Copy page URL",
    desc: "Copies the active tab's URL, with a toast on the page"
  },
  {
    keys: ["⌘", "⇧", "D"],
    label: "Duplicate tab",
    desc: "Opens a copy of the active tab"
  }
]

const steps = [
  "Open Chrome's shortcuts page with the button below.",
  'Scroll to "Gdynia" in the list.',
  "Click each shortcut field and press the keys you want."
]

function Welcome() {
  function openShortcuts() {
    chrome.tabs.create({ url: "chrome://extensions/shortcuts" })
  }

  function done() {
    chrome.tabs.getCurrent((tab) => {
      if (tab?.id) chrome.tabs.remove(tab.id)
    })
  }

  return (
    <div style={styles.root}>
      <main style={styles.card}>
        <img src={crestUrl} alt="Gdynia" style={styles.crest} />
        <h1 style={styles.title}>Gdynia</h1>
        <p style={styles.subtitle}>Arc keyboard shortcuts for Chrome</p>

        <section style={styles.shortcuts}>
          {shortcuts.map((s) => (
            <div key={s.label} style={styles.shortcutRow}>
              <div>
                <div style={styles.shortcutLabel}>{s.label}</div>
                <div style={styles.shortcutDesc}>{s.desc}</div>
              </div>
              <div style={styles.keys}>
                {s.keys.map((k) => (
                  <kbd key={k} style={styles.kbd}>
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </section>

        <div style={styles.callout}>
          <strong style={styles.calloutTitle}>One-time setup</strong>
          Chrome reserves ⌘⇧C and ⌘⇧D for its own actions, so it won't bind
          them automatically — you assign them once yourself. Doing so
          overrides Chrome's "Inspect Element" and "Bookmark all tabs" on those
          keys, which is intended.
        </div>

        <ol style={styles.steps}>
          {steps.map((text, i) => (
            <li key={i} style={styles.step}>
              <span style={styles.stepNum}>{i + 1}</span>
              <span>{text}</span>
            </li>
          ))}
        </ol>

        <div style={styles.actions}>
          <button style={styles.primary} onClick={openShortcuts}>
            Open chrome://extensions/shortcuts
          </button>
          <button style={styles.ghost} onClick={done}>
            Done
          </button>
        </div>

        <p style={styles.footnote}>
          No setup needed for the popup — click the toolbar icon anytime to
          copy the current URL.
        </p>
      </main>
      <footer style={styles.footer}>Arka Gdynia ⚽</footer>
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  root: {
    minHeight: "100vh",
    margin: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: "48px 20px",
    boxSizing: "border-box",
    background: "radial-gradient(ellipse at top, #1a2240 0%, #0e0e10 60%)",
    color: "#f4f4f5",
    fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"
  },
  card: {
    width: "100%",
    maxWidth: 520,
    boxSizing: "border-box",
    padding: 32,
    borderRadius: 18,
    background: "#161618",
    border: "1px solid #2a2a2e",
    boxShadow: "0 24px 60px rgba(0,0,0,.45)"
  },
  crest: {
    width: 64,
    height: 64,
    objectFit: "contain",
    display: "block"
  },
  title: {
    margin: "16px 0 2px",
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: -0.4
  },
  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#8e8e93"
  },
  shortcuts: {
    marginTop: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8
  },
  shortcutRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 14px",
    borderRadius: 12,
    background: "#1f1f22",
    border: "1px solid #2a2a2e"
  },
  shortcutLabel: {
    fontSize: 14,
    fontWeight: 600
  },
  shortcutDesc: {
    fontSize: 12,
    color: "#8e8e93",
    marginTop: 2
  },
  keys: {
    display: "flex",
    gap: 4,
    flexShrink: 0
  },
  kbd: {
    minWidth: 24,
    padding: "4px 7px",
    borderRadius: 7,
    background: "#2a2a2e",
    border: "1px solid #3a3a3e",
    fontSize: 13,
    textAlign: "center",
    fontFamily: "inherit"
  },
  callout: {
    marginTop: 20,
    padding: "12px 14px",
    borderRadius: 12,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#e7d6a8",
    background: "rgba(247,198,0,.08)",
    border: "1px solid rgba(247,198,0,.28)"
  },
  calloutTitle: {
    display: "block",
    marginBottom: 4,
    color: "#f7c600"
  },
  steps: {
    listStyle: "none",
    margin: "20px 0 0",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: 10
  },
  step: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    fontSize: 13.5,
    lineHeight: 1.5
  },
  stepNum: {
    flexShrink: 0,
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "#f7c600",
    color: "#1a1a1a",
    fontSize: 12,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  actions: {
    marginTop: 24,
    display: "flex",
    gap: 10,
    flexWrap: "wrap"
  },
  primary: {
    flex: 1,
    minWidth: 220,
    padding: "11px 16px",
    borderRadius: 10,
    border: "none",
    background: "#f7c600",
    color: "#1a1a1a",
    fontSize: 13.5,
    fontWeight: 600,
    cursor: "pointer"
  },
  ghost: {
    padding: "11px 20px",
    borderRadius: 10,
    border: "1px solid #3a3a3e",
    background: "transparent",
    color: "#c7c7cc",
    fontSize: 13.5,
    cursor: "pointer"
  },
  footnote: {
    margin: "18px 0 0",
    fontSize: 12,
    color: "#6e6e73",
    lineHeight: 1.5
  },
  footer: {
    fontSize: 12,
    color: "#3a3a3e"
  }
}

export default Welcome
