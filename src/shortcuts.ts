// Single source of truth for the keyboard shortcuts Gdynia provides.
// background.ts routes the commands; popup.tsx and tabs/welcome.tsx display them.
// The command ids here must stay in sync with the `commands` block in package.json.

export type Command = "copy-url" | "duplicate-tab"

export type Shortcut = {
  command: Command
  keys: string[]
  label: string
  desc: string
}

export const SHORTCUTS: Shortcut[] = [
  {
    command: "copy-url",
    keys: ["⌘", "⇧", "C"],
    label: "Copy page URL",
    desc: "Copies the active tab's URL, with a toast on the page"
  },
  {
    command: "duplicate-tab",
    keys: ["⌘", "⇧", "D"],
    label: "Duplicate tab",
    desc: "Opens a copy of the active tab"
  }
]

// Narrows the raw string Chrome hands us to a known Command.
export function isCommand(value: string): value is Command {
  return SHORTCUTS.some((s) => s.command === value)
}
