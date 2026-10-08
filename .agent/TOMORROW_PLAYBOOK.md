# TOMORROW PLAYBOOK: every step, in order (Thu 8 Oct 2026, 10:00 to 18:00)

Menu names in Antigravity, hosting sites and Devfolio change over time. Where I am not certain of an exact label I say so. Follow the intent, not the exact wording.

## 0. Which file, when
| When | File |
|---|---|
| Tonight | `00_START_HERE.md` (TONIGHT section), `DEMO_TECH_GUIDE.md` section 5 |
| Arrival | `DAY_OF_RUNBOOK.md` (print), this playbook |
| 10:00, each person | `ANTIGRAVITY_KICKOFF_PROMPT.md` + your role in `AGENT_PROMPTS.md`. Attach: `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASES.md`, `DESIGN.md`, `DESIGN_TOKENS.md`, `MEMORY.md`, `repo/docs/API_CONTRACT.md` |
| UI | Your Stitch folder, `responder_reference/`, `STITCH_RESPONDER_FINAL_PROMPT.md`, `STITCH_PROMPT.md` |
| Repo | the `repo/` kit (or `rakshalink-repo.zip`), `REPO_SETUP_GUIDE.md` |
| Demo and pitch | `DEMO_TECH_GUIDE.md`, `WINNING.md` |
| Submission | `DEVFOLIO_SUBMISSION.md` |

## 1. Before 10:00
1. Ask organizers: are pre-made designs (your Stitch folder, logo) and a pre-written README allowed? Rule from the FAQ: code and designs must be created inside the window.
2. **If yes:** use the Stitch folder and push the repo kit at 10:00.
3. **If no or no answer:** keep the Stitch folder on your laptop, outside the repo. Role D regenerates the screens in Stitch in the first hour using `STITCH_RESPONDER_FINAL_PROMPT.md` (about 30 minutes), and you remove `assets/` and `docs/design/` from the kit and recreate them later.

## 2. 10:00 to 10:45: Gate G0 (everyone at once)
### 2.1 Create the repo (Role A)
```bash
mkdir rakshalink && cd rakshalink
# unzip rakshalink-repo.zip so README.md is at the top level of this folder
git init
git add .
git commit -m "chore: project kit"
git branch -M main
git remote add origin https://github.com/<your-username>/rakshalink.git   # create the empty repo on github.com first
git push -u origin main
```
Everyone else: `git clone https://github.com/<your-username>/rakshalink.git`.
Daily rhythm for each person: `git pull --rebase`, work only in your own folder, then `git add -A && git commit -m "feat(server): ..." && git push`.
Tag the gates: `git tag g2-e2e && git push --tags`.

### 2.2 Antigravity, step by step (every person, own laptop)
1. Open Antigravity and sign in with your Google account.
2. **Open Folder**, choose your cloned `rakshalink` folder.
3. Open the agent panel and start a **new task/conversation**. If there is a Planning mode, use it for the first message.
4. Attach or drag in the files from section 0 ("10:00, each person"). If attaching is awkward, they are inside the repo's `docs/` folder anyway: copy them there first (`PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `PHASES.md`, `DESIGN.md`, `DESIGN_TOKENS.md`, `MEMORY.md`).
5. Paste `ANTIGRAVITY_KICKOFF_PROMPT.md`. Fill in **My role** and **My folder** at the top.
6. Then paste your role block from `AGENT_PROMPTS.md`.
7. Read the plan it proposes. Reply: **"Go. Gate G0 only."**
8. When it asks to run commands, run them yourself, check the output, and approve.
9. After each gate, tell it: "Update MEMORY.md with what passed and the real output." Commit.
10. If it breaks something, paste the exact error and ask for a fix. Keep each request small. Never let two people's agents edit the same folder.
If Antigravity is slow or limited, any coding agent works with the same prompts.

### 2.3 The Stitch folder (Role C and D)
- Put it at `web/design/` (if allowed, see 1).
- It is markup and CSS, not a working app. Tell the agent: "Use `web/design/` as the markup and styling base. Replace every hard-coded string with data from the API. Remove the invented content listed in `AGENT_PROMPTS.md` (Stitch strip list)."
- **Check Stitch output against `STITCH_RESPONDER_FINAL_PROMPT.md` Part 4.** The screens I saw contained invented incident IDs, unit numbers, telemetry text, and ETA wording that must not ship.

## 3. The build loop (10:45 to 16:00)
Follow `PHASES.md`: G1 12:00, G2 13:00 (end to end), G3 14:00 (T1 complete), G4 15:30 (T2 cut-off), **G5 16:00 feature freeze**. At every gate: run the demo path, update the README status table (tick only what ran), commit, tag.
Smoke test the server (PowerShell users: `curl.exe`, JSON from a file with `-d @body.json`):
```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/sos -H "Content-Type: application/json" \
  -d '{"category":"medical","trigger":"manual","lat":22.6951,"lng":88.3788,"client_id":"t1"}'
```
You should get matches sorted by distance and the alert should appear on `http://localhost:3000/console`.

## 4. Deploy (optional bonus, after G3 works; never instead of the local demo)
The real demo runs from a laptop. A hosted link is a bonus for judges and for the Devfolio page.
1. Make sure the server is a single service that serves the API, `/console`, and `/r/:token`, listens on `process.env.PORT`, and answers `GET /health`.
2. Choose a host with a free tier (Render, Railway, Fly.io and similar). Check the current free-tier terms, since they change. Create a new web service from your GitHub repo.
3. Settings: root directory `server`, build `npm install`, start `npm start`, health check path `/health`.
4. Environment variables (set them in the host's dashboard, never in the repo): `DEMO_MODE=true`, `PROVIDER=mock`, `BASE_URL=<the service URL>`, `ESCALATE_AFTER_S=20`, `COUNTDOWN_S=20`. Leave the database empty so it uses the in-memory haversine mode (state resets when it restarts).
5. **The public instance must stay on `PROVIDER=mock`.** Never put real SMS keys on a public link.
6. Open the hosted `/console` and `/health` two minutes before any demo, since free services sleep.
7. Mobile build for a downloadable app is optional and slow: `npm i -g eas-cli`, `eas login`, `eas build -p android --profile preview`. Start it by 15:30 or skip it. Judges can also just watch the demo video.

## 5. Final repo (Gate G6, 16:00 to 17:30)
1. Add 4 real screenshots to `assets/screens/` (rider home, status, console, accept page) and embed them in the README "Design" section.
2. Tick the README status table honestly. Move anything unbuilt to the roadmap.
3. Fill the Submission links table (video, slides, live demo).
4. Replace "Getting started" with commands you tested.
5. Test from a clean clone: `git clone <url> test-clone`, follow the README, confirm it runs.
6. Remove `TODO(G6)` comments after checking the stats: `grep -rn "TODO(G6)" .`
7. Check for secrets: `git log -p | grep -iE "token|secret|sid|password"` and confirm `.env` was never committed.
8. `git tag v1.0-recursive && git push --tags`. Make the repo public. Set About, topics and the social preview image (`REPO_SETUP_GUIDE.md`).
9. Open the repo in a private window as a judge would.

## 6. Devfolio submission (about 17:00 to 17:30)
Field names may differ slightly. Use `DEVFOLIO_SUBMISSION.md` for the text.
1. Log in to Devfolio and open the hackathon page (recursiveacm.devfolio.co).
2. Start the project submission (look for a Submit or Create project button).
3. Fill in name, tagline, short description, long description, tech tags and links from `DEVFOLIO_SUBMISSION.md`.
4. Add the cover image (`assets/social-preview.png`) and the demo video.
5. Check that all four teammates are on the team and the right track is selected.
6. Preview, then **Submit**. If the page allows edits later, submit early and refine.
7. Re-open the public project page in a private window. Check the links work and every claim matches the README.

## 7. Last 30 minutes
- Demo script 3 times without stopping. Backup video playing in another tab.
- Phones charged, hotspot ready, mock mode on, reset the data (`POST /api/dev/reset`).
- Roles: presenter, phone operator, second-phone holder, laptop operator.
- Say out loud what is simulated. Do not claim anything the status table does not show.
