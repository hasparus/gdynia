# Gdynia

Arc-style keyboard shortcuts for Chrome. Built with [Plasmo](https://docs.plasmo.com) + TypeScript.

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
```

## Notes

- Copy URL injects into the active tab, so it works on normal pages but not on
  restricted pages (`chrome://`, the New Tab page, the Web Store). The popup's
  "Copy current URL" button works regardless.
- `activeTab` permission is granted per keyboard-command invocation — no broad
  host permissions required.
