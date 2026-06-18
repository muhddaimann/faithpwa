# Proposed revision — Auth **session module** only

Scope (and only this): make the JWT server-validated so the auth module supports
**IP capture, UUID/jti, session create/validate/touch/revoke, and audit**.
Files mirror the live tree (`faithMobile/`) so they drop straight in. Nothing
else from the `../_current` audit is touched here.

```
_proposed/
  migration_auth_sessions.sql        -> run on daythree_star
  middlewares/sessionHelper.php       (NEW)
  middlewares/authMiddleware.php      (UPDATE — replaces live one)
  controllers/authController.php      (UPDATE — replaces live one)
  routes/logout.php                   (NEW route)
```

## Step 1 — New tables (required)
Run **`migration_auth_sessions.sql`**. It creates two tables and **does NOT
touch or reference the `staff` table** (no foreign key — `staff_id` is a plain
indexed column), so it's safe to run on production:
- **`auth_sessions`** — one row per login, keyed by the JWT `jti`
  (`char(36)`). Holds `staff_id`, `login_ip` / `last_seen_ip`, `user_agent`,
  `platform` / `app_version` / `device_name`, `expires_at`,
  `revoked_at` / `revoked_reason`. This is what makes revocation + IP +
  last-activity possible.
- **`auth_events`** — append-only audit log (`login_success`, `login_failed`,
  `logout`) with `staff_id`, attempted `username`, `ip_address`, `user_agent`.

No `staff` schema change is needed or made. Because there's no FK cascade,
prune stale rows by expiry/retention instead (sample `DELETE`s are in the
migration's trailing comment).

## Step 2 — Files to add / update
| File | Action | What changed |
|------|--------|--------------|
| `middlewares/sessionHelper.php` | **add** | `get_client_ip`, `client_meta`, `uuidv4`, `create_session`, `validate_session`, `touch_session`, `revoke_session`, `log_auth_event` |
| `controllers/authController.php` | **replace** | `login()` mints a `jti`, calls `create_session()` + `log_auth_event()`, returns `session_id` + `expires_at` |
| `middlewares/authMiddleware.php` | **replace** | after decode, `validate_session(jti)` → 401 if dead; `touch_session()`; removed the `error_log(print_r($decoded))` payload dump |
| `routes/logout.php` | **add** | `POST` → `revoke_session(jti,'logout')` + audit |
| `routes/auth.php` | **unchanged** | already just echoes `login()`’s result (now incl. `session_id`/`expires_at`) |

Include paths follow the project convention (entry script is always a
`routes/*.php`, so relative `../` resolves from `routes/`). No path edits needed
if you keep the existing folder names.

## Step 3 — Configure
- In `sessionHelper.php::get_client_ip()`, set `$trustedProxies` to your real
  edge IPs (nginx loopback / Cloudflare). Until then it safely uses
  `REMOTE_ADDR` only.
- Client device context: the app already sends `X-Platform` / `X-App-Version`
  (axios defaults). `X-Device` is optional (stored if present).

## Step 4 — Wire the app (already done client-side)
- App login already reads `session_id` + `expires_at`.
- App logout already calls `POST /logout.php` (`revokeSession()`), and the 401
  interceptor already kicks the user out when a session is revoked/expired.

## What this enables
- **Revoke / kick-out / remote sign-out** — revoking a row makes the next
  request 401.
- **IP + last-login + last-activity** captured per session.
- **Audit trail** of logins/logouts/failed attempts.

## Explicitly OUT of scope (do later — see `../_current/README.md`)
Hardcoded JWT secret & DB creds → env, login enumeration, lockout / account-state
checks, CORS, upload hardening, committed logs/docs, the `aiman.php` debug route.
These are intentionally **not** changed here.

## Verify before swapping in
1. `php -l` each PHP file.
2. Run the migration; confirm both tables exist.
3. Login → a row appears in `auth_sessions` with `login_ip` + a
   `login_success` in `auth_events`; response includes `session_id`/`expires_at`.
4. Call a protected endpoint → `last_seen_at` updates (throttled ~5 min).
5. `POST /logout.php` → `revoked_at` set; the same token now returns 401.
