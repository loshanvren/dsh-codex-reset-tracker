English | [简体中文](README.zh-CN.md)

# dsh-codex-reset-tracker

DeepSeek Harness plugin for Codex reset status. It adds a composer entry with a compact status popover and registers the read-only `codex_reset` agent tool.

## Acknowledgements

Reset signals and available translations are provided by [Did Codex Reset](https://didcodexreset.com/zh/). Thank you to its maintainers for collecting and organizing these public reset signals and providing the [read-only API](https://didcodexreset.com/zh/api.html) and [OpenAPI specification](https://didcodexreset.com/openapi/v1/openapi.json). This repository is a DSH integration of that upstream work; the API does not include account-specific quota information.

Original reset announcements are from [Tibo Sottiaux (@thsottiaux)](https://x.com/thsottiaux).

## Screenshots

These screenshots predate v0.5.1 and show the earlier entry placement, label and probability colours. See the behaviour described below for the current interface.

| Light theme | Dark theme |
|---|---|
| <a href="assets/screenshot-light.jpg"><img src="assets/screenshot-light.jpg" alt="Light theme" width="380"></a> | <a href="assets/screenshot-dark.jpg"><img src="assets/screenshot-dark.jpg" alt="Dark theme" width="380"></a> |

## What it shows

- The composer entry reports the source site's live schedule probability (for example, **≥86% Yes**), alongside the latest completed reset and next expected time. The heading switches to an upcoming-reset question when a live schedule is available.
- Schedule confidence comes directly from the public API and is rounded to a percent as on the source page. In the popover, a live schedule displays probability + Yes even below 80% or when its local date is tomorrow. A completion reported today takes priority. Scheduled events remain schedule records and do not replace the latest completed reset. The day check uses the browser's local calendar day; completion times prefer `completedAt`, then `effectiveAt`, then `announcedAt`.
- The popover includes the Tibo Sottiaux source post. It shows the Simplified Chinese translation and the English source when both differ.
- The entry sits in the right group of the status strip below the input, immediately to the left of the auto-compact ring when that plugin is installed. It follows the popover's schedule rules. Without a reportable forecast it shows only the glyph, no text. When no completion has been reported today and a live pending schedule has a rounded probability of at least 80%, the glyph is followed by a single space and `≥86%` (the label is ` ≥86%`, or ` 100%` at 100%). With only the glyph visible, the button has 6px side padding and a 28px box, matching the auto-compact ring on standard pointers. The percentage stays violet on hover and when expanded, and the popover's probability answer uses the same colour. The entry reserves no extra width, so it narrows and widens slightly as the forecast appears or clears. Normal refreshes keep the last successful, still-valid forecast visible. A failed request returns to the glyph-only state until a later successful response confirms a valid forecast. The accessible name and tooltip stay `Codex reset status`. Unread markers and unread storage are removed.
- While the voice-input extension is active (recording, transcribing or retrying), the host temporarily hides the right-hand status group, including this entry and the auto-compact ring.
- The client requests `/status` on mount and refreshes every 10 minutes. Opening the popover, returning to the foreground, or reconnecting checks for updates when the snapshot is at least 60 seconds old. Requests time out after 20 seconds and respect rate-limit cooldowns. The popover displays the local time zone and fetch time; fetch time is not the upstream monitor time. The agent tool can query status or paginated records.
- When today's reset answer turns from no to yes, the client raises one system notification saying `Codex has reset` (`Codex 已经重置` in Chinese). Notifications need browser permission: the popover footer offers Enable notifications, and only that click asks for it; a denial or an unsupported browser simply sends nothing. Recent completion IDs are deduplicated across status slots and kept in local storage so a reload stays quiet; browsers supporting Web Locks also coordinate concurrent pages. Without that coordination, cross-page deduplication is best effort. A blocked storage API deduplicates only within the current page, and the first load only records a baseline instead of replaying history. Detection rides the polling above, so it can lag by up to one refresh interval.

## Install from source

Clone the repository, then add it to a DSH profile:

```sh
git clone https://github.com/loshanvren/dsh-codex-reset-tracker.git
cd dsh-codex-reset-tracker
dsh plugin --profile <profile> add .
```

The package and client loader are named `dsh-codex-reset-tracker` as of v0.4.0.

### Upgrade from v0.3.x

The old package was named `dsh-codex-reset`. Remove that package from the same DSH profile before installing the new package, so the old tool and composer entry do not remain enabled alongside the new ones:

```sh
dsh plugin --profile <profile> remove dsh-codex-reset
dsh plugin --profile <profile> add https://github.com/loshanvren/dsh-codex-reset-tracker/releases/latest/download/dsh-codex-reset-tracker.tgz
```

Restart DSH after replacing the package. If you applied the patch manually, change its package `name` to `dsh-codex-reset-tracker`, preserve the `codex-reset` row ID and your `config`, and do not keep a second old row.

### Prebuilt install

```sh
dsh plugin --profile <profile> add https://github.com/loshanvren/dsh-codex-reset-tracker/releases/latest/download/dsh-codex-reset-tracker.tgz
```

The release tarball contains the same JavaScript, manifest, patch and locale files as a source install; there is no install-time build script.

## Agent tool

`codex_reset` supports:

- `action: "status"` — the latest global and Banked reset signals and the next scheduled reset.
- `action: "records"` — one page of records, filtered by `kind`, `page`, and `pageSize`.

The tool accepts an optional `lang` for record translations. Successful responses are cached for 60 seconds by default.

| Config | Default | Purpose |
|---|---:|---|
| `apiBaseUrl` | `https://didcodexreset.com/openapi/v1` | Public API base URL used by the agent tool |
| `cacheTtlSeconds` | `60` | Tool response cache, from 5 to 3600 seconds |
| `timeoutMs` | `20000` | Tool call timeout, from 1000 to 120000 milliseconds |

Override these values under the plugin row's `config` in `cordis.patch.yml`. The public API documents a shared limit of 60 requests per hour per IP.

## License

The MIT License applies to this repository's code only. It does not relicense Did Codex Reset's data or translations, or Tibo Sottiaux's post and profile image.
