# Devfolio submission text (paste, then edit to match what you ACTUALLY built)

Rules for this text: keep only what is ticked in the README status table. Fill every [bracket]. Do not add numbers you did not measure. Delete the lines marked (if true) that are not true.

## Project name
RakshaLink

## Tagline (one line)
Highway emergency triage: the right responder, found fast, even offline.

## Short description (about 300 characters)
RakshaLink routes a highway emergency to the right nearby responder (hospital, police, mechanic or fuel pump). One tap, or an automatic crash alert with a 20-second cancel window, notifies them, escalates if nobody answers, and falls back to SMS, a Morse flash and a saved queue when signal is weak.

## Long description (Markdown)
```markdown
## The problem
According to MoRTH's *Road Accidents in India 2023* (as cited in our idea deck), India recorded 4,80,583 road accidents and 1,72,890 deaths in 2023, about 20 deaths every hour. Most emergency apps assume you have signal and can use your phone. On a highway you often can't.

## What RakshaLink does
- **Category-aware triage:** Fuel, Breakdown, Accident, Medical. Each goes to the right kind of responder by real distance, not a generic dispatch.
- **Responder side:** a Responder Console (desktop) and a mobile accept page. Responders accept or decline, then mark On the way, Arrived and Resolved. The rider only ever sees real statuses. [keep only if built]
- **Escalation:** if nobody accepts in time, the alert moves to the next-nearest responder; if everyone fails, the rider is told to call 112. [keep only if built]
- **Drive Mode:** crash detection needs speed context, an impact and a sudden stop, then a 20-second alarm countdown the rider can cancel. [describe honestly: simulated trace and/or live sensor mode]
- **Offline ladder:** prefilled SMS when data is off; a Morse flash and a saved queue when there is no signal; the saved alert is delivered when signal returns. [keep only if built]

## How it works
Rider app (Expo/React Native) -> API (Node/Express) -> triage rules -> nearest responders (PostGIS or haversine search over OpenStreetMap data) -> SMS/voice with an accept link -> Responder Console with live updates.

## What was built during the hackathon
[Copy the ticked rows from the README status table.]

## What is simulated (we say this plainly)
- The responder network in the demo is simulated and labelled so. Responder locations come from OpenStreetMap; phone numbers are team-owned demo numbers.
- Crash detection is a prototype heuristic, tested on [simulated traces / a hand-tap demo mode], not validated on real crashes.
- [SMS/voice went to team phones through (provider) / was mocked and labelled SIMULATED DISPATCH.]
- Morse flashing alerts people nearby; it does not transmit data. Data is sent when signal returns.

## Tech stack
React Native (Expo), Node.js, Express, [PostgreSQL + PostGIS / in-memory haversine], Server-Sent Events, Leaflet, OpenStreetMap, [Twilio], Google Stitch (UI design), [Antigravity] (AI coding assistant).

## Challenges we ran into
[Write 2 or 3 real ones. Prompts: What broke during integration? What did you cut and why? What surprised you about SMS, GPS indoors, or sensors?]

## What we learned
[Two honest sentences.]

## What's next (proposals, not partnerships)
Validate crash detection on real data, pilot on one highway corridor with real responder onboarding alongside the official 112 system, then expand corridor by corridor.

## Team InitToWinIt (GNIT, Kolkata)
Ashish Chandra Acharjee (Team Lead), Pranay Saha, Nitin Agarwal, Ayush Mahato.
```

## Tech tags
`React Native` `Expo` `Node.js` `Express` `PostgreSQL` `PostGIS` `OpenStreetMap` `Leaflet` `Server-Sent Events` `Twilio` `Google Stitch` `Antigravity` (keep only what you used)

## Links
| Field | Value |
|---|---|
| GitHub | https://github.com/[username]/rakshalink |
| Demo video | [YouTube or Drive link, set to anyone-with-link] |
| Live demo | [hosted /console URL, only if deployed and tested] |
| Slides | [link] |

## Cover image
`assets/social-preview.png` (1280 x 640)

## AI and tools disclosure (if the form or judges ask)
All code and designs were created during the 8-hour window using [Antigravity and Google Stitch]. [Edit to be true. If any design reference was made before the window, say so.]

## 2-minute demo video script
| Time | Show | Say |
|---|---|---|
| 0:00 | Slide with one MoRTH number | The problem in one sentence |
| 0:15 | Rider phone, tap Medical SOS | One tap, location captured |
| 0:30 | Laptop console, alert appears, Accept | The responder sees it live and accepts |
| 0:45 | Phone timeline updates | The rider sees only real steps |
| 1:00 | Simulate crash, countdown, auto alert | No tap needed; 20 s to cancel; speed breaker is ignored |
| 1:20 | Airplane mode, Morse, queue, delivered | Offline: saved, signalled, delivered when signal returns |
| 1:40 | Status table and "what is simulated" | Honest limits |
| 1:55 | Logo, GitHub link | Close |
