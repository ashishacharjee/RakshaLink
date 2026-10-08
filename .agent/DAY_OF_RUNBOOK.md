# DAY-OF RUNBOOK: Thu 8 Oct 2026 (print this)

## Arrive (09:00)
Chargers, power strip, hotspot, ID cards. Find the organizers, ask your leftover questions (`00_START_HERE.md` section 6), read FAQ 10 (the four judging criteria) and write them on a sticky note.

## 10:00 to 10:45: Gate G0 (everyone starts at once)
| Role | First 45 minutes |
|---|---|
| **A Lead** | Create the repo and folders (`server/`, `mobile/`, `web/`, `docs/`). Push the repo kit if organizers allow it (REPO_SETUP_GUIDE.md). Copy `docs/API_CONTRACT.md`, agree changes. Share `.env.example`. Start the deck outline. |
| **B Backend** | `server/` skeleton, `GET /health`. Database decision (PostGIS gets 20 minutes, then haversine). Write the OpenStreetMap seed script for two presets (GNIT campus 22.6951, 88.3788, and an NH-19 sample point). `POST /api/sos` with triage and `PROVIDER=mock`. |
| **C Mobile** | `mobile/` with Expo. Home screen from the reference, location preset toggle, call `POST /api/sos`, status screen. Check torch and accelerometer work in Expo Go. |
| **D Web/Design** | Generate screens in Stitch using `STITCH_PROMPT.md` (mobile accept page) and `STITCH_DESKTOP_PROMPT.md` (console), include the Part 5 corrections. Then build `web/` (console + accept page, served by Express, live updates with Server-Sent Events). |
Each person pastes `ANTIGRAVITY_KICKOFF_PROMPT.md` into their coding agent with their role and folder filled in.

## Clock (T+0 = 10:00)
12:00 G1 parts exist | 13:00 G2 end to end | 14:00 G3 T1 complete | 15:30 G4 T2 cut-off | **16:00 FEATURE FREEZE** | 17:30 submitted and rehearsed | 18:00 end.
If a gate slips 30 minutes, cut the next item on the cut list (PHASES.md). Never cut the console, the accept page, the rehearsal or the backup video.

## Meals
Eat in pairs, 20 minutes, between 13:00 and 14:30. Nobody skips water.

## Demo staging
Laptop facing judges = Responder Console. Phone 1 = rider app. Phone 2 (teammate) = receives the SMS. Presenter, phone operator, phone-2 holder, laptop operator. Hotspot on. Backup video open in a tab.
Say out loud: "responders on screen are a simulated network; SMS goes to our own phones."

## Rules to remember under pressure
1. Never claim help is coming unless a responder accepted.
2. Mock dispatch is labelled SIMULATED DISPATCH.
3. Never contact real emergency services. Never auto-dial 112.
4. No made-up numbers on slides.
5. If real SMS fails after 30 minutes, stay on mock and show provider logs of your tests.

## Before submitting (G6)
Run the demo script 3 times in a row. Record a 2-minute backup video. Update the README (status table, screenshots, setup steps tested from a clean clone, links). Update the deck (crash flow, console, escalation, "what is simulated"). Submit on Devfolio. Check the repo in a private window.
