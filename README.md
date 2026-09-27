# SMD-MINI (deobfuscated fork)

Educational reconstruction of [iTx-Sarkar/SMD-MINI](https://github.com/iTx-Sarkar/SMD-MINI).

## What upstream actually does

Upstream `index.js` **does not ship the bot**. It downloads obfuscated code from:

`https://bandaheali-cdn.koyeb.app/bandaheali/smd-mini.js`

That script then downloads a ZIP runtime, extracts it into a hidden path under `node_modules/yt-search/...`, and runs `node index.js` there.

See [docs/CDN_LOADER.md](docs/CDN_LOADER.md).

## What this fork contains

The **captured, readable runtime** after extraction:

| Path | Role |
|------|------|
| `index.js` | Express pair server entry |
| `command.js` | `cmd()` registry |
| `config.js` | Env-based settings |
| `plugins/` | All command plugins (readable) |
| `plugins/{main,group,download,tools,fun,ai,media,search,settings,islamic,anime,system}/` | Categorized copies |
| `lib/` | Helpers, DB, stickers, events |
| `docs/PLUGIN_INDEX.md` | Command list extracted from sources |

## Run (local)

```bash
npm install
# set OWNER_NUMBER, DATABASE_URL / MONGODB_URI, PREFIX in .env
npm start
```

## Disclaimer

For **education / security research** only. You are responsible for compliance with WhatsApp ToS and local law. Upstream branding and assets belong to their authors.
