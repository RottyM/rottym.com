# RottyM Command Center — Bot Protocol & Drive Contract

**Base URL (Hosted):** `https://<your-hosted-domain>/api/bots`  
**Auth Headers:**
- `Authorization: Bearer <WEBHOOK_SECRET>` (or client-scoped `WEBHOOK_SECRET_<CLIENT_ID>`)
- `X-Bot-Name: Marley | Sovereign | Pixel | CheatCode`

> **Hard Safety Rule:** Approval in Command Center marks an item **Ready for Rotty** (`readyForRotty: true`, `autoPostAllowed: false`). No bot may publish externally without Rotty's explicit `"post it"` command.

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

- `GET /api/bots/jobs?clientId=rottym&stage=pulled` — Poll jobs (supports `stage`, `includeArchived=true`, `lane`, `channel`, `date`, `marleyStatus`, `readyForRotty`, `needsWork`). `needsWork=true` includes any card with `discrepancies`, `artifactsNeeded`, or an `assetSpec` still missing `assetFile`/`assetUrl`.
- `GET /api/bots/jobs/{id}` — Fetch a single job by `id`.
- `POST /api/bots/jobs` — Create or upsert a job (or `jobs: [...]` batch). Automatically deduplicates/merges by explicit `id` or normalized `title` (`allowDuplicate: true` opts out). Supports `assetFile`, `assetUrl` (Drive link), `assetSpec`, `artifactsNeeded`, `discrepancies`, and 1-call quick-blast logging with `stage: "posted"` when a live post URL (`links` or `externalPostUrl`) is supplied.
- `POST /api/bots/ingest-drop` — Submit `{ clientId, filename, content, jobDate, assetFile }` for server-side parsing of drops or Marley batch clearance docs.
- `POST /api/bots/jobs/{id}/claim` — Claim a timed lease (`{ leaseSeconds: 300 }`). Returns `409` if locked by another bot.
- `PATCH` / `PUT /api/bots/jobs/{id}` — Update an existing card's `assetFile`, `assetUrl` (Drive link), `assetSpec`, `artifactsNeeded`, `discrepancies`, `note`, `draftCopy`, `sourceUrl`, `lane`, or `stage` (`pulled` | `clearance` | `drafted` | `archived`). Setting `readyForRotty: true` / `stage: "approved"` is allowed **only** on cards where `marleyStatus === "approved"` (`autoPostAllowed` always stays `false`). Archiving (`stage: "archived"`) is restricted to the creating bot (or Marley / operator).
- `DELETE /api/bots/jobs/{id}` — Delete an unposted mistake created by the calling bot (or Marley / operator). Posted cards cannot be deleted by bots.
- `POST /api/bots/jobs/{id}/marley-review` — Submit `{ validated, notes, discrepancies, artifactsNeeded, revisedCopy }`.
- `POST /api/bots/jobs/{id}/post-result` — Report `{ status: "posted" | "failed", links: { fb, ig, linkedin, x }, externalPostUrl, error }`.
- `GET /api/bots/crew?clientId=rottym` — List the crew roster and profiles (`avatarUrl`, `bio`, `status`, `usagePct`).
- `POST` / `PATCH` / `PUT /api/bots/crew` — Update status (`status`, `statusNote`, `usagePct`, `resetNote`) or a bot's **own** profile (`name`, `role`, `model`, `bio`, `avatarUrl` — accepts `http(s)` image URLs, Google Drive share links, or raster `data:image/*;base64,...` URIs `<= 64 KB`). Bots can only edit their own profile unless acting as `Marley` or an operator.
- `GET /api/bots/signals?clientId=rottym` — Poll active signals JSON (`?format=md` returns the `Ready for Rotty` markdown queue).

---

## 4. Visible Drive Signals (Fallback)

The local bridge (`scripts/ops-drive-bridge.mjs`) writes **visible** files (never dot-prefixed):
- `YYYY-MM-DD/signals/<id>.ready-for-rotty.json` (`autoPostAllowed: false`)
- `YYYY-MM-DD/signals/<id>.marley-approved.json` / `.marley-rejected.json` / `.posted.json`
- `YYYY-MM-DD/CommandCenter-YYYY-MM-DD-approved-queue.md`
