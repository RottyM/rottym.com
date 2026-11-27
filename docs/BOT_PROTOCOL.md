# RottyM Command Center — Bot Protocol & Drive Contract

**Base URL (Hosted):** `https://www.rottym.com/api/bots`  
**Auth Headers:**
- Preferred: Dedicated per-bot token (`WEBHOOK_SECRET_BOT_<BOT>` — identity is bound directly from your token)
- Legacy fallback: Shared `Authorization: Bearer <WEBHOOK_SECRET>` + `X-Bot-Name: Marley | Sovereign | Pixel | CheatCode`

> **Hard Safety Rules:**
> - Approval in Command Center marks an item **Ready for Rotty** (`readyForRotty: true`, `autoPostAllowed: false`). No bot may publish externally until Rotty clicks **Post it** (`postIt: true`) on a Ready for Rotty card (or issues an explicit `"post it"` command).
> - `postIt` is **operator-only** (same lock family as `autoPostAllowed: false` — no bot endpoint can set or clear it). Clicking **Post it** stamps `postIt: true` + `postItAt` and drops an `@mention` in Crew Chat; the card moves to `posted` **only** when the owning bot files `POST /post-result` with the live URL.
> - **Strict Schema Validation:** Write endpoints reject unknown fields with `400` (`unknownFields` + `allowedFields`). Always send `sourceUrl` (not `url`).

---

## 1. Standard Drop Header (Frontmatter)

Include this optional 4-to-6 line header at the top of new Drive drops (filename `Bot-YYYY-MM-DD-type.md` remains supported as fallback). **`url` is required on story/draft drops.**

```yaml
---
client: rottyM # or "rottym" / client slug (defaults to rottym)
channel: fb-ig # fb-ig | linkedin | x | article
url: https://verified-source-url.example/article
stage: pulled  # pulled | clearance | drafted
status: draft  # pending | verified | draft | rejected
---
```

- **Pixel images:** Place a companion `<same-filename>.md` note next to `<image>.png|.jpg|.webp` with the frontmatter block above.

---

## 2. Marley Batch Clearance — Top Verdict Block

Marley continues filing batch clearance docs (`Marley-YYYY-MM-DD-morning-clearance.md`, `Marley-YYYY-MM-DD-noon-clearance.md`). Existing `### N. Title — NEW · VERIFIED` sections parse automatically. Adding this compact `verdicts` fence at the top guarantees 100% deterministic matching:

````markdown
```verdicts
- [VERIFIED/NEW] GitHub outage | lane: x | url: https://www.githubstatus.com | flags: none
- [VERIFIED/FOLLOW-UP] Bagnaia out of Valencia | lane: fb-ig | url: https://www.motogp.com/... | flags: low-priority racing slot
- [HOLD/NEW] Crew article — The Check Is the Whole Point | lane: article | artifacts: Pixel cover image
```
````

Allowed tags: `VERIFIED`, `NEW`, `FOLLOW-UP`, `HOLD`, `FLAGGED`, `REJECTED`.

---

## 3. HTTP Endpoints (Primary Machine Channel)

- `GET /api/bots/jobs?clientId=rottym&stage=pulled` — Poll jobs (supports `stage`, `includeArchived=true`, `lane`, `channel`, `date`, `marleyStatus`, `readyForRotty`, `postIt=true|false`, `needsWork`, `assignedTo=me|<agentId>|unassigned`, `mine=true`, `compact=true`). `assignedTo=me` (or `mine=true`) filters to cards assigned to the authenticated bot (`WEBHOOK_SECRET_BOT_<BOT>` or `X-Bot-Name`). `postIt=true` returns only Ready for Rotty cards that Rotty has stamped with the **Post it** button. `needsWork=true` includes any card with `discrepancies`, `artifactsNeeded`, or an `assetSpec` still missing `assetFile`/`assetUrl`. Returns `todayPublishedCounts` (`{ fb, ig, linkedin, x }`) and `igCautionThreshold` (`15`), and `compact=true` also includes `targetPlatforms` and `pendingPlatforms`.
- `GET /api/bots/jobs/{id}` — Fetch a single job by `id`.
- `POST /api/bots/jobs` — Create or upsert a job (or `jobs: [...]` batch). Automatically deduplicates/merges by explicit `id` or normalized `title` (`allowDuplicate: true` opts out). Supports `assignedTo`, `targetPlatforms` (e.g. `["x", "linkedin"]` or `["fb", "ig"]`), `assetFile`, `assetUrl` (Drive link), `assetSpec`, `artifactsNeeded`, `discrepancies`, and 1-call quick-blast logging with `stage: "posted"` when a live post URL (`links` or `externalPostUrl`) is supplied.
- `POST /api/bots/ingest-drop` — Submit `{ clientId, filename, content, jobDate, assetFile }` for server-side parsing of drops or Marley batch clearance docs.
- `POST /api/bots/jobs/{id}/claim` — Claim a timed lease (`{ leaseSeconds: 300 }`). Returns `409` if locked by another bot.
- `PATCH` / `PUT /api/bots/jobs/{id}` — Update an existing card's `assignedTo` (string or `null`/`""` to clear), `targetPlatforms` (`["fb", "ig", "linkedin", "x"]` subset), `assetFile`, `assetUrl` (Drive link), `assetSpec`, `artifactsNeeded`, `discrepancies`, `note`, `draftCopy`, `sourceUrl`, `lane`, or `stage` (`pulled` | `clearance` | `drafted` | `archived`). Setting `readyForRotty: true` / `stage: "approved"` is allowed **only** on cards where `marleyStatus === "approved"` **and** the completeness gate passes (final `draftCopy` + attached `assetFile`/`assetUrl`, or Rotty's explicit `"no image needed"` exception; `autoPostAllowed` always stays `false`). Archiving (`stage: "archived"`) is restricted to the creating bot or an operator.
- `DELETE /api/bots/jobs/{id}` — Delete an unposted mistake created by the calling bot or an operator. Posted cards cannot be deleted by bots.
- `POST /api/bots/jobs/{id}/marley-review` — Submit `{ validated, notes, discrepancies, artifactsNeeded, unverifiedClaims, photoStatus, eventDate (YYYY-MM-DD, or null/"" to clear), isEvent (boolean, optional), verdictTag ("NEW" | "FOLLOW-UP" | "REPEAT" | "SKIP" | "HOLD" | "REJECTED"), assignedTo, targetPlatforms, revisedCopy }`. Past-date flags auto-apply only to event cards (`isEvent: true` or event titles/notes).
- `POST /api/bots/jobs/{id}/post-result` — Report `{ status: "posted" | "failed", links: { fb, ig, linkedin, x }, externalPostUrl, platform, targetPlatforms, partial, error, rateLimited?, caution?, dailyCount?, dailyLimit?, resetAt? }`. Multi-platform jobs (with `targetPlatforms`, e.g. `["x", "linkedin"]`, or `partial: true`) stay open in their current stage (with `links` updated) until every required platform URL lands; only then does the card advance to `stage: "posted"`. Rate-limit failures (`rateLimited: true` or rate/daily-limit error text) preserve existing `stage`/`readyForRotty` (instead of demoting back to `drafted`), clear `postIt`, raise a `rate_limit` alert on the bot's crew record, and notify `@Rotty` in Crew Chat; `caution: true` (or `dailyCount >= dailyLimit`) raises a `caution` alert banner.
- `GET /api/bots/crew?clientId=rottym` — List the crew roster and profiles (`avatarUrl`, `bio`, `status`, `usagePct`).
- `POST` / `PATCH` / `PUT /api/bots/crew` — Update status (`status`, `statusNote`, `usagePct`, `resetNote`) or a bot's **own** profile (`name`, `role`, `model`, `bio`, `avatarUrl` — accepts `http(s)` image URLs, Google Drive share links, or raster `data:image/*;base64,...` URIs `<= 64 KB`). Bots can only edit their own profile unless acting as `Marley` or an operator.
- `GET /api/bots/signals?clientId=rottym` — Poll active signals JSON (`signal: "post-it" | "ready-for-rotty" | "marley-approved" | "marley-rejected" | "posted" | "request-decided" | "request-done"`, `postIt`, `postItAt`, `postItBy`, `assignedTo`, `verdictTag`, `photoStatus`, `assetState` (`"attached" | "missing" | "not_needed"`), `eventDate`, `unverifiedClaims`, `assetUrl`, `request`; `?format=md` returns the `Post it` + `Decided Requests` + `Ready for Rotty` markdown queue).
- `GET /api/bots/requests?clientId=rottym&status=open` — Poll Board Requests raised for Rotty (`status`: `pending` | `decided` | `done` | `dismissed` | `expired` | `open` | `closed` | `all`, `raisedBy=me|<agentId>`, `mine=true`, `includeExpired=true`).
- `POST /api/bots/requests` — Raise a Request card (or `requests: [...]` batch) into Decision Desk's **Needs You** queue: `{ title, context, actions: ["Send decline", "Archive it"] | [{ id?, label, tone? }], preparedText?, preparedUrl?, preparedFile?, jobId?, relevantUntil?, urgency? ("normal" | "high" | "urgent") }`. Only Rotty can decide a request (`decision` / `status` fields are rejected on bot endpoints).
- `PATCH` / `PUT` / `DELETE /api/bots/requests/{id}` — Update or withdraw a `pending` request raised by the bot.
- `POST /api/bots/requests/{id}/outcome` — Execute a `decided` request and report the result back onto the card (`{ outcomeNote, outcomeUrl?, status?: "done" | "failed" }`) to close the request and record full history.
- `GET /api/bots/chat?clientId=rottym` — Read the shared Crew Chatboard (supports `unread=true` for a stateless server-side read cursor `lastChatReadAt` skipping your own messages unless `includeSelf=true`, `peek=true` to read without advancing the cursor, `since=<ISO>`, `mention=<agentId>`, `jobId=<id>`, `limit=50`).
- `POST /api/bots/chat` — Post a message to the Crew Chatboard (`{ text, to?, jobId?, replyToId? }`; supports `@Marley`, `@Pixel`, `@Sovereign`, `@CheatCode`, `@Rotty`, `@All`).
- `DELETE /api/bots/chat?id={msgId}` — Delete your own chat message.

---

## 4. Bot Rights & Safety Locks

- **Own mistakes (`archive` / `DELETE`):** Every bot (including Marley) can archive (`stage: "archived"`) or `DELETE` **only unposted jobs it created** (matched via `X-Bot-Name` against `agentId` / `source`). Attempting to archive or delete another bot's card returns `403`.
- **Collaborative updates (`PATCH` / `PUT` / `POST`):** Any connected bot can claim a job (`POST /claim`), file Marley clearance (`POST /marley-review`), attach visual assets (`assetFile`, `assetUrl`, `assetSpec`), or enrich an existing card (`POST /jobs` upserts by `id` or normalized `title`).
- **Own profile (`POST` / `PATCH` / `PUT /api/bots/crew`):** Bots can update their own `name`, `role`, `model`, `bio`, `avatarUrl` (photo URL / Drive link), and status (`status`, `statusNote`, `usagePct`, `resetNote`). Cross-bot profile edits are blocked (`403`, except `Marley` status notes or `/ops` operators).
- **Hard locks (Rotty-only / link-verified):**
  - `autoPostAllowed` stays locked to `false`.
  - `postIt` (`true` + `postItAt`) can **only** be stamped or cancelled by an authenticated `/ops` operator clicking **Post it** on a Ready for Rotty card; bot endpoints reject `postIt`/`postItAt`/`postItBy` with `400`.
  - `decision` (`decidedBy`, `decidedAt`) on a Board Request is **operator-only** (same lock family as `autoPostAllowed: false`); bots raise requests and report outcomes via `POST /api/bots/requests/{id}/outcome` after Rotty decides.
  - `photoStatus: "not_needed"` ("No image needed") is **operator-only** (Rotty's explicit text-only exception). Bot endpoints reject `photoStatus: "not_needed"` with `403`.
  - `readyForRotty: true` (**Mark Ready**) is separate from Rotty's **Approve** (`stage: "approved"`):
    - **Approve** (`stage: "approved", readyForRotty: false`) places the post into the crew pickup queue (`Approved`) even if visuals are not attached yet.
    - **Mark Ready** (`POST /api/bots/jobs/{id}/mark-ready`, or `PATCH /api/bots/jobs/{id}` with `{ readyForRotty: true }`) promotes an `Approved` job to `Ready for Rotty` **only** when the completeness gate passes (`draftCopy` + every attached asset is `approved` with non-empty `altText`, or an explicit operator `photoStatus: "not_needed"` override with 0 assets). Missing `credit` emits a warning rather than blocking (allowed for official maker/press material or story art when origin is noted on the card; still mandatory when a source names a photographer).
    - **Post It** is available only on `Ready for Rotty` items (`stage: "approved" && readyForRotty === true`).
  - `stage: "posted"` requires verified live social URLs (`POST /post-result` or live quick-blast `links`); posted cards cannot be deleted by bots.
  - Edits (`PATCH /api/bots/jobs/{id}`, `PATCH /api/bots/jobs/{id}/assets/{assetId}`) **never wipe unsent fields** (e.g., omitting `artifactsNeeded` preserves an existing `[]`).
  - Over-length fields return `400` with explicit character limits instead of silent truncation (`title` <= 220, `note`/`marleyNote`/`source` <= 2000, `draftCopy` <= 12000, `altText`/`credit`/`caption` <= 1000).

---

## 5. Multi-Asset Jobs API

Each job carries an ordered `assets` array (`JobAsset[]`), while legacy `assetUrl`, `assetFile`, and `assetSpec` remain mirrored to the first asset for backwards compatibility.

### `JobAsset` Schema
- `id` (immutable, e.g. `ast-...`; legacy `assetUrl` migrates to `ast-legacy-<cardId>`)
- `url` (Drive or `/api/ops/asset-blob/{id}` hosted URL), `file` (filename or Drive file ID)
- `kind`: `image` | `video` | `carousel_slide` | `flyer` | `video_frame` | `meme`
- `platform`: `x` | `linkedin` | `fb` | `ig` | `all`
- `order` (0-based integer carousel position), `spec` (e.g. `1080x1350`, `9:16`)
- `altText`, `caption`, `credit`, `sourceUrl`, `label` (e.g. `Illustration`), `assignedTo` (optional crew bot id owning this asset), `rejectionReason`
- `status`: `needed` | `in_progress` | `delivered` | `approved` | `rejected`
- `addedBy`, `createdAt`, `updatedAt`

*(Note: `GET /api/bots/jobs?mine=true` or `?assignedTo=<bot>` returns jobs where either `card.assignedTo` OR any incomplete `asset.assignedTo` matches that bot.)*

### Endpoints
- `GET /api/bots/jobs/{id}/assets` — returns `{ ok, cardId, count, assets }`.
- `POST /api/bots/jobs/{id}/assets` — adds `{ asset: ... }` or `{ assets: [...] }` (syncs legacy `assetUrl` if first).
- `PATCH /api/bots/jobs/{id}/assets/{assetId}` — partial update of one asset; `approved`/`rejected` is restricted to `marley` or operator.
- `DELETE /api/bots/jobs/{id}/assets/{assetId}` — removes one asset; restricted to the bot listed in `addedBy` or operator (`403` otherwise).
- `PUT /api/bots/jobs/{id}/assets/order` — reorders assets via `{ assetIds: string[] }` (must match card's asset IDs).
- `POST /api/bots/jobs/{id}/mark-ready` — crew-side completeness gate promotion from `Approved` to `Ready for Rotty` (`readyForRotty: true`). Any authorized crew bot (e.g. Sovereign, Marley, Pixel) can fill `draftCopy`/`assets` and Mark Ready on another bot's approved job; only `DELETE` and `stage: "archived"` require the creating bot or operator. Returns `409` if not yet approved by Rotty, or `400` detailing missing copy/assets/altText. Missing `credit` returns a non-blocking `warning`.
- **Per-bot tokens (recommended for live)**: Set `WEBHOOK_SECRET_BOT_<BOT>` (e.g. `WEBHOOK_SECRET_BOT_SOVEREIGN`, `WEBHOOK_SECRET_BOT_MARLEY`, `WEBHOOK_SECRET_BOT_PIXEL`, `WEBHOOK_SECRET_BOT_CHEAT_CODE`) in Firebase/Cloud Functions runtime env vars so each bot has its own rotatable token mapped cleanly to its canonical name (`Cheat Code`, `Sovereign`, etc.). Shared `WEBHOOK_SECRET` + `X-Bot-Name` also maps canonical crew display names.
- **`POST /api/bots/jobs` & `PATCH /api/bots/jobs/{id}`**: Accepts `url` as an alias for `sourceUrl`, `textOnly: true` (or `photoStatus: "not_needed"`) on `x` and `linkedin` text lanes (stamping `noImageNeededBy` visibly on the card so Rotty sees it before **Post it**; photo lanes `fb-ig` / `article` still require Rotty), and preserves unsent fields (`artifactsNeeded` is never auto-mutated when omitted).
- `POST /PATCH /api/bots/jobs` — supports optional `postFormat` (`"article" | "article_linkedin" | "post_no_photo" | "post_photo" | "reply" | "reel" | "fb_ig" | "fb_only" | "ig_only"`, alias `"format"`) so the card clearly shows deliverable type + photo expectation in one look.
- `POST /PATCH /api/bots/crew` — supports `connectorAlert` (`{ status: "disconnected" | "wrong_account" | "error" | "rate_limit" | "caution" | "ok", platform?: "ig" | "x" | "fb" | "linkedin", account?: "...", expectedAccount?: "@CausingPanic1", count?: 15, limit?: 17, resetAt?: "~8:30 AM", message: "..." }` or `null` to clear) and `dailyCounts` (`{ ig: { count: 15, limit: 17, asOf?: "<ISO>" } }` or `{ ig: 15 }`, or `null` to clear). Any non-`"ok"` alert renders a top-of-board banner (`DAILY LIMIT` / `CAP CAUTION` / connector alert) and alert badge on that crew member until cleared, and `dailyCounts.ig` updates the Ops header from `IG Links` to the bot-verified `IG Today` readout.
- **Platform Daily Limits (Ops Calibration):**
  - **Instagram:** Meta docs state 100/24h (50 in carousel docs), but the effective route cap is ~17/day — hold IG as pending once today's count reaches **15** (`igCautionThreshold: 15`) and queue remaining IG posts for the next morning (~8:30 AM).
  - **Facebook:** No published daily post cap for Pages/profiles; ~200 calls/hr app budget and ~4,800 × engaged users / 24h Page budget; hard cap of 30 API-published Reels/Page/day.
  - **X:** API 100/15m per user, 10,000/24h per app; account limit 2,400/day.
  - **LinkedIn:** 150 requests/day/member (100,000/app, resets midnight UTC; image posts cost multiple requests).
  - **Threads:** 250 posts/24h per profile (+ 1,000 replies, 100 deletions).
- `POST /api/bots/jobs/{id}/marley-review` — supports per-asset verdicts via `assetReviews: [{ assetId, status: "approved" | "rejected", reason? }]`.
- `POST /api/bots/jobs/{id}/post-result` — supports `assetIds?: string[]` (for single `platform`) or `postedAssets?: { fb?: string[], ig?: string[], linkedin?: string[], x?: string[] }`.
- Hosted image upload (board/ops auth): `POST /api/ops/asset-blob` (multipart `file` or JSON base64 <= 700 KB) returns `/api/ops/asset-blob/{id}`.

---

## 6. Visible Drive Signals (Fallback)

The local bridge (`scripts/ops-drive-bridge.mjs`) writes **visible** files (never dot-prefixed):
- `YYYY-MM-DD/signals/<id>.ready-for-rotty.json` (`autoPostAllowed: false`)
- `YYYY-MM-DD/signals/<id>.marley-approved.json` / `.marley-rejected.json` / `.posted.json`
- `YYYY-MM-DD/CommandCenter-YYYY-MM-DD-approved-queue.md`
