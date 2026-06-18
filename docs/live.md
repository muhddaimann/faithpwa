# FAITH Mobile — Current Backend (as-is audit)

Snapshot of the **live** PHP API under `faithMobile/`. This documents what it
actually does today and where the holes are, **before** any changes. Companion:
the proposed fixes live in `../_proposed/`.

## Stack & layout

- **PHP + mysqli** (raw, no framework). MySQL `daythree_star` (5.7).
- **Composer deps** (`composer.json`): `firebase/php-jwt ^5`, `vlucas/phpdotenv ^3`,
  `ramsey/uuid ^3`, `phpmailer ^6`.
- Structure: `routes/*.php` (entry per resource) → `middlewares/` (auth, cors,
  upload, email) → `controllers/*.php` (logic + SQL). `dbConn.php` exposes a
  global `$conn`. `index.php` is a banner.
- **Auth:** stateless **JWT HS256**, 7-day `exp`, sent as `Bearer`. Password
  hashing is **bcrypt** (`password_verify`).

## Request flow (login)

`POST routes/auth.php` → `controllers/authController.php::login()` → look up
`staff` by `Username` (prepared) → `password_verify` → `JWT::encode(...)`.
Protected endpoints call `authenticate()` (from `middlewares/authMiddleware.php`)
which decodes the JWT or `exit`s `401`.

## Auth coverage (who checks the token)

`authenticate()` is called **inside the controllers**, not the routes, so route
files alone are misleading. Effective state:

- **Protected:** staff, leave, claim, overtime, roomBooking, attendance,
  balance, broadcast, auxLive, aiman.
- **🔓 Unauthenticated:** `attStatus`, `clinic`, `pHoliday`, `roomAvailability`,
  `weather`. `roomAvailability` is the sensitive one — it can expose booking
  PIC/event data to anyone.

---

## 🔴 Critical loopholes

1. **Hardcoded production DB credentials, committed** — `dbConn.php` contains
   `10.50.50.50` / `daythree_root` / a plaintext password. Anyone with repo
   access has full DB access. `phpdotenv` is installed but **there is no `.env`**
   and it's unused — creds and secrets are all in code.
2. **Hardcoded JWT secret `"your_secret_key"`** — in *both* `authController.php`
   and `authMiddleware.php`. It's weak and public → **anyone can forge a token
   for any `staff_id`** and call every protected endpoint.

## 🟠 High

3. **Stateless JWT, no session store** — there is no `auth_sessions` table, no
   `jti`, no revocation. A token is valid until its 7-day `exp` no matter what;
   **logout/kick-out/"sign out other devices" are impossible server-side**, and
   there is no last-login / IP / activity capture.
4. **CORS is broken & inconsistent** — `middlewares/cors.php` sends
   `Access-Control-Allow-Origin: *` **with** `Allow-Credentials: true` (an
   invalid combo browsers reject), and it's only included by `broadcast.php` and
   `balance.php`. Every other route emits no CORS headers (works today only
   because the app calls a same-origin `/api` proxy; a cross-origin PWA breaks).
5. **Insecure file uploads** (`middlewares/uploadMiddleware.php`) —
   validates by **file extension only** (no MIME/content check), `mkdir(..., 0777)`,
   and stores files **inside `DOCUMENT_ROOT`** (`leaveDocument/`, `claimDocument/`)
   so they're **publicly web-served**. Medical certs (PII) end up directly
   downloadable by anyone who has/guesses the URL.
6. **Sensitive artifacts committed in the web tree** — `controllers/leave_error.log`,
   `controllers/leave_debug.log`, `routes/error_log.txt`, and actual uploaded
   documents under `uploads/leaveDocument/` & `leaveDocument/`. Logs + user MC
   images should never be in the repo or web-accessible.

## 🟡 Medium

7. **Username enumeration** — `login()` returns distinct `user_not_found` vs
   `invalid_password`, revealing which usernames exist.
8. **No lockout / rate limiting** — the `staff.LockCount` / `LockDateTime`
   columns exist but `login()` ignores them; brute force is unthrottled.
9. **No account-state check** — `login()` ignores `Status` (`Active`) and
   `LoginStatus`, so terminated/disabled staff can still authenticate.
10. **Information disclosure** — `authMiddleware` does
    `error_log(print_r($decoded, true))` (token payload to logs every request);
    five controllers (`leave`, `claim`, `aux`, `staff`, `overtime`) return raw
    `$conn->error` strings to the client; `routes/aiman.php` turns on
    `display_errors` + `error_reporting(E_ALL)` (a debug route that shouldn't
    ship); `index.php` lists routes.

## 🟢 Low / cleanup

11. Login failures return **HTTP 200** (should be a 4xx).
12. `firebase/php-jwt ^5` is outdated (current is `^6`).
13. Upload cap is **2 MB** here vs the client's 1 MB (mismatch).
14. `staff` table charset is `latin1` while connections use utf8mb4.
15. No `UNIQUE(staff.Username)` → login does an unindexed scan and silently
    takes the first match on duplicates.

---

## What's already solid (don't regress)

- **Prepared statements** throughout the SQL seen (no string-interpolated
  queries found) — good injection posture.
- **bcrypt** password hashing; token carried in the `Authorization` header
  (not a cookie), so the CORS-credentials issue is lower-impact in practice.
- **`staffController::getStaff()` projects only needed columns** — it does *not*
  leak salary/bank/EPF; returns name/email/designation/contact/address/NRIC.
- The middleware **does** return `401` on a bad/expired token → the app's
  client-side kick-out works for protected endpoints.
- `ramsey/uuid` and `phpdotenv` are **already installed** — everything needed
  for the session module (jti + env secrets) is present; it just isn't wired.

---

## Next (see `../_proposed/`)
Priority order: (1) creds/secret → env; (2) `auth_sessions`+`auth_events` with
`jti` validation for revocation/IP/last-login; (3) lockout + account-state +
generic login error; (4) CORS pinned + applied everywhere; (5) upload hardening
(MIME/content check, store outside web root); (6) purge committed logs/docs and
the `aiman.php` debug route; (7) stop returning raw `$conn->error`.
