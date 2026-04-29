# Secrets, API Keys, and `.env` Files (Read this before you ship anything)

## Purpose
If you leak an API key (OpenAI, Google, AWS, Firebase admin key, etc.), someone can:
- run up charges,
- delete data,
- spam APIs,
- get your project banned.

This class runs on **evidence**, but **secrets are the one thing you never “prove” by pasting into GitHub**.

---

## The rule (non‑negotiable)
**Never put secrets in GitHub.**
That includes:
- code files
- commits
- Issues / PR comments
- screenshots
- README / docs
- pasted terminal output

If it’s in GitHub, assume it’s public forever (even in “private” repos, mistakes happen).

---

## What counts as a secret?
Treat these as secrets:
- API keys / tokens (anything that looks like a long random string)
- passwords
- database connection strings
- private keys (`-----BEGIN PRIVATE KEY-----`)
- service account JSON
- JWT signing secrets

### Not all “keys” are secrets
Some services have **public client keys** (used in the browser). Those are okay *only if the service explicitly calls them public*.

**Rule of thumb:**
- If it can write data, delete data, bill money, or access admin privileges → **secret**.
- If it’s used only to identify your app in a browser and can’t grant privileged access → maybe public.

---

## Why `.env` files exist
A `.env` file is a local “settings + secrets” file.
- It lives on **your computer**, not in the repo.
- Your app reads it at runtime.
- Git ignores it.

You will usually have:
- `.env` or `.env.local` (real secrets, never committed)
- `.env.example` (safe template, committed)

---

## Local setup: the correct way (do this)
### 1) Create a local env file (NOT committed)
Create one of these (depends on your stack):
- `.env`
- `.env.local`

Put real values inside:
- `OPENAI_API_KEY=...`
- `DATABASE_URL=...`

### 2) Add it to `.gitignore`
Make sure your repo ignores env files. Add these lines to `.gitignore` (if you don’t already have them):
- `.env`
- `.env.*`
- `!.env.example` (this keeps the example file tracked)

### 3) Commit a safe template: `.env.example`
Create `.env.example` with **variable names only**, no real values:
- `OPENAI_API_KEY=`
- `DATABASE_URL=`
- `APP_ENV=development`

This is how you help teammates set up without leaking secrets.

### 4) Tell teammates how to use it
In `docs/PROJECT.md`, add a short setup note:
1) copy `.env.example` → `.env` (or `.env.local`)
2) fill in values
3) run the project

---

## Frontend warning (seriously)
If you build a web app:
- Anything bundled into frontend JavaScript is visible to users.
- “Frontend env variables” are often **public** by design.

Examples (stack-specific):
- Next.js: variables starting with `NEXT_PUBLIC_` are exposed.
- Vite: variables like `VITE_...` are exposed.

**Never put a secret in frontend env variables.**
If you need a secret, it belongs on the **server** (backend) or inside a secure API.

---

## Putting secrets on GitHub the right way
### Use GitHub **Actions Secrets**
If your project uses GitHub Actions (CI, deploy, etc.), store secrets in GitHub:
- Repo → **Settings** → **Secrets and variables** → **Actions**
- Add a **Repository secret** (example name: `OPENAI_API_KEY`)

Then your workflow can read it as an environment variable.

### Prefer least privilege
When generating keys/tokens:
- choose read-only if possible
- restrict scopes/permissions
- restrict by domain/IP if the service supports it

### Rotate keys
If a key has been shared in chat, screenshots, or committed:
- assume it’s compromised
- rotate it immediately

---

## Best practices checklist
Use this as your default standard:

### ✅ Do
- Use `.env` / `.env.local` locally
- Commit `.env.example` (names only)
- Add `.env*` to `.gitignore`
- Use GitHub Actions secrets for CI/deploy
- Use different keys for dev vs production (if possible)
- Limit token permissions and rotate periodically

### ❌ Don’t
- Commit `.env`
- Paste keys into Issues/PRs
- Put secrets in frontend code
- Save secrets in screenshots or demo videos
- Share one key across the entire team forever

---

## If you accidentally leaked a key (incident response)
Don’t panic. Do these steps **immediately**:

1) **Revoke/rotate the key** in the service dashboard (this is the real fix)
2) Remove the secret from the repo:
   - delete the leaked text
   - make a PR that removes it
3) Assume Git history still contains it:
   - tell your instructor
   - your team may need to rewrite history (advanced) and rotate again
4) Add a note in the Sprint Packet under “Broke / Risks”:
   - what happened
   - what you did to fix it
   - link to PR showing the cleanup

**Important:** deleting a file is not enough—Git keeps history.

---

## What your repo should include (recommended files)
Add these to your project:
- `.env.example` (tracked)
- `.gitignore` (must ignore `.env`)
- Setup instructions in `docs/PROJECT.md`

Optional but helpful:
- `docs/SECURITY_NOTES.md` (short list of what is a secret and where it lives)

---

## “What good looks like” examples
### Good
- `.env.example` exists (empty values)
- `.env` is ignored
- Sprint Packet has a deploy/demo link but no secrets
- CI workflow uses GitHub secrets

### Bad
- API key is in a screenshot in an Issue
- `.env` is committed “just for testing”
- secret key is stored in frontend code

---

## Quick assignment (10 minutes, do it now)
1) Create `.env.example`
2) Update `.gitignore` to ignore `.env*`
3) Add one line to `docs/PROJECT.md` explaining how teammates create `.env`
4) If you use Actions: add the key in GitHub → Secrets and variables

That’s it. Boring and safe is the goal.

