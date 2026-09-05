# personal/ — status-line setup

Not part of claude-hud proper, and not something upstream
(github.com/jarrodwatts/claude-hud) would want. This directory only exists so
the machines that run this fork stay in sync through git rather than by hand.
Nothing here is imported or built by the plugin; `npm run build` ignores it.

## What's here

| File | Installs to | Purpose |
|---|---|---|
| `claude-hud-wrap` | `~/.local/bin/claude-hud-wrap` | The actual `statusLine.command`. Keeps claude-hud's **line 1** and rebuilds **line 2** from scratch in bash+jq on every tick. |
| `claude-hud.config.json` | `~/.claude/plugins/claude-hud/config.json` | claude-hud's own config — drives line 1 only, since line 2 is the wrapper's. |

## Why the wrapper exists

claude-hud re-renders only when Claude Code hands it a new payload. That's fine
for line 1 (model, cwd, git branch — none of it time-sensitive) but wrong for
anything counting down: an idle session's cache countdown and quota reset timer
would sit frozen until the session next talked to the API. Line 2 is therefore
built here on every `refreshInterval` tick (1s), with no subprocesses on the
tick path, so nothing on it can lag wall-clock time by more than a second.

Line 2 is:

```
Usage <bar> (<reset>) [│ Weekly <bar> (<reset>)] │ Context <bar> │ Cache <bar> (<tokens>) [│ Acc: #N #N] [│ <herdr pane>]
```

All three bars share one colour scale — `<75` blue, `75-89` magenta, `>=90` red
— fed the same shape of number in each case (0 = untouched, 100 = exhausted).
For Cache that's elapsed percentage of the TTL, so its colour tracks its own
fill; the label still shows absolute time remaining.

`Acc:` lists every claude-swap account with the active one bright, resolved by
matching the live `~/.claude.json` email against claude-swap's credential
filenames. It reads a directory listing only. No credential is opened, decrypted,
or embedded here.

## Install (either machine)

```bash
install -Dm755 personal/claude-hud-wrap ~/.local/bin/claude-hud-wrap
install -Dm644 personal/claude-hud.config.json ~/.claude/plugins/claude-hud/config.json
```

Then point Claude Code at it in `~/.claude/settings.json`:

```json
"statusLine": { "type": "command", "command": "~/.local/bin/claude-hud-wrap", "refreshInterval": 1 }
```

The wrapper runs `$HOME/sw/utilities/claude-hud/dist/index.js`, i.e. this
checkout's build, so `npm install && npm run build` has to have been run here.
Every path in it is `$HOME`-relative, which is what lets the same file install
verbatim under any `$HOME`.

## Optional dependencies

Both degrade to simply not rendering their segment, so the wrapper is safe to
install on a machine without them:

- **claude-swap** (`cswap`) — the `Acc:` badge, and the shared usage cache that
  makes every open terminal agree on one Usage number rather than each showing
  its own session's frozen snapshot.
- **Herdr** — the pane-id badge, from `$HERDR_PANE_ID`.
