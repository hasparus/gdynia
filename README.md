# Gdynia

Arc-style keyboard shortcuts for Chrome. Built with [Plasmo](https://docs.plasmo.com) + TypeScript.

<img src="art/arka.png" width="96" alt="Arka">

## Shortcuts (v1)

| Action         | macOS     | Windows/Linux |
| -------------- | --------- | ------------- |
| Copy page URL  | ⌘⇧C       | Ctrl+Shift+C  |
| Duplicate tab  | ⌘⇧D       | Ctrl+Shift+D  |

> ⌘⇧C collides with Chrome's DevTools "Inspect Element". If it doesn't fire,
> rebind it at `chrome://extensions/shortcuts` (or use the popup's
> "Edit shortcuts" button).

## Develop

```bash
bun install
bun dev          # watch build → build/chrome-mv3-dev
```

Load the unpacked extension: `chrome://extensions` → enable Developer mode →
**Load unpacked** → select `build/chrome-mv3-dev`.

## Build

```bash
bun run build    # → build/chrome-mv3-prod
bun run package  # → zipped artifact for the Web Store
bun run test:e2e # build + Playwright extension tests
```

## Notes

- On first install, an onboarding tab opens and walks you
  through assigning the shortcuts at `chrome://extensions/shortcuts`. Chrome
  reserves ⌘⇧C and ⌘⇧D, so it won't bind the manifest defaults automatically.
- Copy URL injects into the active tab, so it works on normal pages but not on
  restricted pages (`chrome://`, the New Tab page, the Web Store). The popup's
  "Copy current URL" button works regardless.
- Chrome grants `activeTab` on each keyboard-command invocation, so Gdynia
  needs no broad host permissions.
