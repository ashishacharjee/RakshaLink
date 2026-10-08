# START HERE: RakshaLink (Team InitToWinIt)
Last reviewed: 7 Oct 2026. Read this first, then RULES.md, PRD.md, PHASES.md.


## TONIGHT: Wed 7 Oct (the event is TOMORROW, Thu 8 Oct, 10:00 AM)
Earlier versions of this file assumed several days of prep time (Oct 3 to 7). That time is gone, so use this compressed list instead of section 5.
1. **Ask the organizers now** (section 6, especially questions 3, 4, 5, 11) and read FAQ 10 for the four judging criteria. Do not wait for replies: if there is no answer by morning, take the cautious reading and build everything from 10:00.
2. **Roles A to D**: decide in 5 minutes tonight.
3. **Install and log in** (30 minutes): Node LTS, Expo Go on each phone, GitHub login with an empty repo, tunnel tool, Stitch and your coding agent. Docker only if it is already installed (otherwise use the haversine fallback).
4. **Twilio:** if your numbers are not already verified, do not fight it tonight. Start with `PROVIDER=mock` and try real SMS at gate G3.
5. **Designs:** do not make more mockups tonight. Existing mockups are study material until organizers confirm. If unconfirmed by morning, regenerate in Stitch during G0 to G1 with `STITCH_PROMPT.md` and `STITCH_DESKTOP_PROMPT.md` (Part 5 corrections included).
6. **Pack and sleep:** laptops, chargers, power strip, phones fully charged, hotspot, college ID cards. Sleep is the most valuable preparation left.

## 1. Event facts (checked on recursiveacm.in and the Devfolio page on 3 Oct)
| Fact | Value |
|---|---|
| Date and place | Thu 8 Oct 2026, in person, GNIT Sodepur, Kolkata |
| Time | Devfolio schedule: 10:00 AM to 6:00 PM IST. The website says gates open at 09:00 |
| Format | 8-hour sprint (so "demoable in 8 hours" on our slide is now a literal promise) |
| Team size | 2 to 4 (you are 4) |
| Tracks | AI & Intelligent Systems, FinTech, HealthTech & Wellness, Cybersecurity, Web3, Open Innovation |
| Key rule | FAQ 8: all code and designs must be created inside the 8-hour window |
| Judging | The site says every track uses the same four criteria. I could not read them (FAQ 10 is collapsed). Open the site and copy them into WINNING.md |
| Judges and mentors | Sealed until a reveal. Seat domains hint at: distributed systems, AI/agents, UI design, IoT/hardware, security, pitching ("2 min pitch drills", "Top 6" stage coaching), climate, devtools, vision/robotics |

## 2. What changed in this update
1. The build window is 8 hours, so PHASES.md is now an hour-by-hour battle plan with 3 tiers and hard gates.
2. Created-in-window rule: do NOT write product code or generate Stitch designs before 10:00 on Oct 8 (section 4).
3. Crash countdown decided: **20 s** (one config value, COUNTDOWN_S).
4. Call 112 is a filled red button (teammate's design).
5. New small features that fix demo risks: demo location override, demo reset, mock dispatch provider.
6. PostGIS has a 20-minute rule: if it is not working by then, use an in-memory haversine search.
7. Rules R12 to R14 added (event rules, honesty about mock dispatch, security basics, no dead buttons).
8. Responder Console upgraded to a Captain-style workflow (on duty, ringing alert, accept, on the way, arrived, resolved, role views) with its own Stitch prompt pack: STITCH_DESKTOP_PROMPT.md.
9. KICKOFF prompt and MEMORY rewritten cleanly (earlier versions had patches stacked on patches).

## 3. Gap audit: what could still lose you the hackathon
| Severity | Gap | Fix |
|---|---|---|
| CRITICAL | Scope was far bigger than 8 hours with 4 people | Tiers T1/T2/T3 in PHASES.md. Only T1 must work. Cut order is written down |
| CRITICAL | Pre-building is banned | Section 4. Prep specs, accounts, practice only |
| HIGH | Judging criteria unknown | Read FAQ 10, ask on Discord, map each demo step to a criterion |
| HIGH | Our theme (Road Safety) is not one of the six tracks | Ask which track to enter. Positioning for each is in WINNING.md |
| HIGH | SMS/voice to Indian numbers may be blocked (DLT rules, trial limits, verification delays) | Test Twilio on Oct 4. Build the mock provider on day one so the demo never depends on a carrier. Keep Twilio console logs as proof |
| HIGH | Indoor GPS is poor, so matching would look random on stage | Demo location override with two presets (campus and an NH-19 sample point) |
| HIGH | Venue Wi-Fi may fail | Backend on a laptop, phones on a hotspot, tunnel only for webhooks, backup video |
| MEDIUM | Devfolio final submission requirements unknown (repo, video, deck, link?) | Ask. Prepare a README, a 2-minute video and the updated deck anyway |
| MEDIUM | The submitted deck does not show crash detection, the console, or escalation | Deck update plan in WINNING.md. Keep the core story identical, because judges have read the deck |
| MEDIUM | Stats on the deck need checking (5%/59%, donut chart values) | Open the MoRTH report, fix labels, remove anything unverified |
| MEDIUM | No roles defined | Roles A to D in PHASES.md |
| MEDIUM | "Top 6" and "2 min pitch" hints | Rehearse a 2-minute stage pitch, plus a 4-minute table demo |
| LOW | OSM data needs attribution; AI tools may need disclosure | R12 |
| LOW | Fatigue, food, battery | Sleep on Oct 7, chargers, power strip, shifts for meals |

## 4. Before Oct 8: what is safe and what is not (conservative reading of the rule)
**Safe:** these docs and prompts (plans), creating accounts and API keys, installing tools, practice on a throwaway project to learn a tool (never reuse it), pitch rehearsal, reading docs.
**Not safe:** writing product code, committing it, generating the product's UI designs in Stitch or Figma, pre-building the database or seed data.
**Unsure:** ask organizers (section 6). When unsure, wait until 10:00.

## 5. Original countdown plan (superseded by TONIGHT above)
- **Oct 3 (today):** agree the decisions in this file. Post the questions in section 6. Assign roles A to D.
- **Oct 4:** Twilio account, verify all team numbers, send one test SMS and one test call to each phone (check India delivery). GitHub repo created empty. Docker and the PostGIS image installed (or decide on haversine). Node LTS installed. A tunnel tool (ngrok or cloudflared) installed. Expo Go on every phone. Stitch and your coding agent logged in.
- **Oct 5:** toolchain rehearsal on throwaway projects: phone and laptop talk over a hotspot, a webhook reaches the laptop through the tunnel, a blank Expo Go app shows torch and accelerometer working (check, do not assume). Do not build product code.
- **Oct 6:** read the submitted deck aloud as a team. Verify the MoRTH numbers. Write the 2-minute pitch. Prepare the deck update plan.
- **Oct 7:** rest. Charge everything. Pack: laptops, chargers, power strip, two phones with data plans, hotspot, college ID cards, a cable for the projector, water.
- **Oct 8:** arrive early. Ask the questions you still have. Start building at 10:00.

## 6. Questions to ask organizers (Discord or the help channel)
1. Which track should an emergency-response / road-safety project enter?
2. What are the four judging criteria and their weights?
3. Are AI coding assistants allowed? Boilerplate, templates, open-source libraries, and public APIs (Twilio, OpenStreetMap)?
4. Can we bring written plans, prompts and API accounts prepared in advance? Can we create a blank repo beforehand?
5. Are design tools (Stitch, Figma) fine inside the window?
6. What exactly must be submitted on Devfolio (repo, video, deck, live link)? When is the deadline?
7. Demo format: table demos or stage? Minutes per team? How many finalists present on stage?
8. Wi-Fi quality, power sockets, and can we use our own hotspots, extension cords, and a monitor?
9. Start time (09:00 gates versus 10:00 start), meal timing, and when judging begins.
10. Any sponsor-specific prizes (for example n8n or Aqyron Labs)?
11. Can we bring a pre-made logo/branding and a README/docs template, and create an empty GitHub repo before the event?

## 7. File index and precedence
If two files disagree, trust them in this order: RULES.md, PRD.md, ARCHITECTURE.md, PHASES.md, DESIGN.md.
- `RULES.md`: non-negotiables (honesty, safety, event rules).
- `PRD.md`: features, acceptance criteria, tiers.
- `ARCHITECTURE.md`: stack, data, APIs, crash module, fallbacks.
- `PHASES.md`: the 8-hour plan, roles, gates, cut order.
- `TOMORROW_PLAYBOOK.md`: every step in order (Antigravity, repo, deploy, final repo, Devfolio). START HERE tomorrow.
- `AGENT_PROMPTS.md`: paste-ready prompts per role (A to D), plus the Stitch strip list.
- `DEVFOLIO_SUBMISSION.md`: ready text for the Devfolio submission and the 2-minute video script.
- `DAY_OF_RUNBOOK.md`: the one-page plan for tomorrow (print it).
- `DEMO_TECH_GUIDE.md`: how crash, laptop link and offline demo physically work (print it).
- `repo/docs/API_CONTRACT.md`: the shared API contract.
- `DESIGN_TOKENS.md` (your design file, the token source of truth), `DESIGN.md`, `STITCH_PROMPT.md` (rider app), `STITCH_RESPONDER_FINAL_PROMPT.md` (FINAL responder screens, use this one), `STITCH_DESKTOP_PROMPT.md` (older background pack), and the reference images in `responder_reference/`.
- `WINNING.md`: pitch, judge Q&A, positioning, deck update plan.
- `MEMORY.md`: running state for the coding agent.
- `ANTIGRAVITY_KICKOFF_PROMPT.md`: paste on event day (one per teammate, scoped to their folder).
- `rakshalink_ui_prototype.html`: an older flow sketch. It is not a build artifact.

## 8. Added: repo kit (3 Oct)
`repo/` is a ready GitHub kit (README, docs, logo, banner, license, templates, empty folders). Question 11 for organizers: "Can we bring a pre-made logo/branding and a README/docs template, and create an empty repo before the event?" Until they answer, do NOT push the kit. See `REPO_SETUP_GUIDE.md`.
