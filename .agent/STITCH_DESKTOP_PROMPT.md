# RakshaLink Responder Console: Stitch prompt pack (desktop)
> The FINAL, checked version of the responder screens is `STITCH_RESPONDER_FINAL_PROMPT.md`. Use that one. This pack stays as background.

For hospitals, police stations, mechanics/towing helpers and fuel pumps. The workflow is inspired by ride-hailing driver apps (the "Captain" model); the look is RakshaLink's own.

**Timing:** designs must be created inside the 8-hour event window. Paste these into Stitch on the day (Role D), not before.

## The Captain idea, mapped to responders
| Driver-app step | RakshaLink responder step | Tier |
|---|---|---|
| Go online | **On duty** toggle (off duty means no alerts) | T2 |
| Incoming ride request with a timer | **Incoming alert** rings with an accept-window countdown | T1 |
| Accept / reject | **Accept / Can't respond** (no answer escalates to the next responder) | T1 |
| Navigate to pickup | Map with the rider pin and an "Open in maps" link | T1 |
| On the way, arrived | **On the way, Arrived** (set by the responder only) | T2 |
| Trip complete | **Resolved** | T2 |
| Trip history | **History** | T3 |
Deliberately not copied: earnings, ratings, rider phone numbers, any other brand's visuals.

## How to use
1. In Stitch pick **Web / Desktop** (about 1440 x 900). Paste **Part 1**.
2. When the main screen looks right, paste one prompt from **Part 2** per generation. Start each with: "Same design system as the Live Console."
3. If it drifts, use **Part 4**.

---

## PART 1: Master prompt (paste first)

```
Design a desktop web app called "RakshaLink Responder Console". It is used by hospitals, police stations, mechanics and towing helpers, and fuel pumps to receive and answer highway emergency alerts. The workflow feels like a ride-hailing driver app: go on duty, an incoming request rings with a countdown, accept it, travel, arrive, resolve it. Do not copy any other brand's look. Use the RakshaLink identity below. Canvas 1440 x 900. Calm, clear, high-contrast, readable at a glance by a busy operator.

IDENTITY
Warm off-white background (#EFEBDD), surface colour #FBF9F2. Cards have 12 px rounded corners and thin soft borders, no gradients. Top bar primary green (#274706) with cream text. Headlines in Noto Serif weight 600, everything else DM Sans.
Emergency colours, used everywhere for that category: Fuel green #274706, Breakdown teal #1B4D4F, Accident navy #2B3A67, Medical maroon #5B1F2D. Urgent and destructive actions use error red #BA1A1A, voice/AI purple #3D2A5C, banner amber #D9B25C.

SCREEN: LIVE CONSOLE
1. Top bar: left, a small shield-with-R logo and "Responder Console". Centre, the organisation name "Sample District Hospital" with a role chip "Hospital". Right, an "On duty" toggle (green, ON), a chip "DEMO · SIMULATED RESPONDER NETWORK", and a live clock.
2. Slim left sidebar with icons and labels: Live alerts (active), Map, History, Settings.
3. A stats strip of three small cards, each marked "sample": "Open alerts 1", "Alerts today 4", "Median accept time 14 s".
4. Three columns below:
   COLUMN 1, Alert queue (320 px): cards, newest first. The top card is highlighted with a coloured left edge. Each card shows a category pill (e.g. navy "Road Accident"), a small badge "AUTOMATIC CRASH ALERT", "3.8 km", "just now", and a small circular countdown ring. A second card: maroon "Medical SOS", "5.0 km", "1 min ago", status "Accepted by another responder".
   COLUMN 2, Map (flexible width): an OpenStreetMap-style map. A pulsing rider pin in the alert's category colour. A green marker for this organisation's base. A thin dashed straight line between them with the label "3.8 km straight-line". Zoom controls. Footer text "© OpenStreetMap contributors".
   COLUMN 3, Alert detail (380 px): category pill, badge "AUTOMATIC CRASH ALERT", serif headline "Victim may be unresponsive", "Received 00:12 ago", a location block with coordinates and an "Open in maps" link, a large countdown ring with the text "Escalates to the next responder in 0:20", then a big green "Accept" button and a quieter outlined "Can't respond" button.
5. A slim event log strip at the bottom with the three latest events and timestamps.

RULES FOR EVERYTHING
- The most important thing on screen is the active alert and its Accept button.
- Colour is never the only signal: pair it with an icon and a word.
- Plain short words. No jargon. Large text.
- Show sample data only and label it "sample". Never show real organisation names.
- Never show the rider's phone number.
- Keep the same fonts, corner radius, colours and shadows on every screen.
```

---

## PART 2: Screen prompts (one per generation)

**A. On duty, no alerts (empty state)**
```
Same design system as the Live Console. On duty, with no open alerts. Centre of the main area: a calm illustration of a shield with a check, headline "You are on duty", text "New alerts appear here instantly. Keep this tab open." A small switch "Alert sound" (ON). The stats strip and sidebar stay. The map is dimmed in the background.
```

**B. Incoming alert (ringing)**
```
Same design system as the Live Console. A new alert has just arrived and must be impossible to miss. A pulsing banner across the top of the main area in the category colour (navy for Road Accident): "NEW ALERT · ROAD ACCIDENT · AUTOMATIC CRASH ALERT". The alert detail panel expands: very large countdown ring "0:20 to accept", huge green "Accept" button, outlined "Can't respond". A small speaker icon shows the alert sound is playing. The map zooms to the rider pin.
```

**C. Accepted, in progress (the Captain moment)**
```
Same design system as the Live Console. The responder has accepted. Replace the Accept buttons with a four-step progress bar: "Accepted" (done, green), "On the way", "Arrived", "Resolved". One large primary button for the next step: "I am on the way". Below it an optional field "Your estimate to reach (minutes)" with the help text "Shown to the caller as your estimate". A line: "The caller sees each step you mark." The map shows the rider pin and this base with the dashed line. The event log shows "Accepted" with a timestamp.
```

**D. Resolved**
```
Same design system as the Live Console. The alert is resolved. A success banner in the green theme: "Alert resolved". A small summary card: time to accept, time on scene, both marked "sample". Button "Back to live alerts". The alert moves to a "Resolved" section of the queue.
```

**E. Off duty**
```
Same design system as the Live Console. The responder is off duty. The "On duty" toggle is OFF, the top bar slightly desaturated, the queue replaced by a message "You are off duty. You will not receive alerts." and a large green "Go on duty" button.
```

**F. Role variants (generate one at a time)**
```
Same layout and design system as the Live Console, for a police station. Organisation "Sample Highway Police Station", role chip "Police". The queue shows only Road Accident alerts. Everything else stays the same.
```
Repeat with: "Sample Auto Garage", role chip "Mechanic", Breakdown alerts only (teal); and "Sample Petrol Pump", role chip "Fuel pump", Fuel alerts only (green).

**G. History**
```
Same design system as the Live Console. History screen: a clean table of past alerts, columns: time, category pill, distance, your response (Accepted, Can't respond, Missed), time to accept, outcome (Resolved, Escalated). Filters for category and date. Mark all rows "sample". A search box. Friendly empty state text if no rows.
```

**H. Operations overview (big-screen demo view)**
```
Same design system as the Live Console but in a dark "control room" theme (near-black green background, cream text, same category colours). Title "Operations overview · DEMO · SIMULATED RESPONDER NETWORK". A large map filling the centre-left with small icons for hospitals, police, mechanics and fuel pumps, and pulsing coloured circles for active alerts. A right column shows a live timeline of events across all responders (alert received, responder notified, accepted, escalated, resolved). A top row of KPI cards (open alerts, accepted, escalated, median accept time) all marked "sample". Footer "© OpenStreetMap contributors".
```

**I. Sign-in (demo)**
```
Same design system as the Live Console. A simple centred card on the off-white background: shield logo, "Responder Console", a dropdown "Choose organisation (demo)" with the four sample organisations, a role chip that changes, and a large green "Go on duty" button. A small line: "Demo sign-in. No password."
```

**J. Control-room dark mode (optional, after everything looks right)**
```
Create a dark version of the Live Console using the same palette, keeping category colours and contrast high.
```

The mobile accept page (opened from the SMS link) is prompt **G** in `STITCH_PROMPT.md`.

---

## PART 3: Honest-copy rules for these screens
| Do | Don't |
|---|---|
| Label everything "sample" or "DEMO · SIMULATED RESPONDER NETWORK" | Use real hospital, police or government names |
| Show "3.8 km straight-line" | Show a driving ETA we did not compute |
| Show an ETA only as "Your estimate", entered by the responder | Imply the caller has an ETA before a responder enters one |
| Let the responder mark On the way, Arrived, Resolved | Auto-advance the steps. The caller must only ever see real events |
| Show the alert, location and category | Show the rider's phone number or personal data |
| Show "Accepted by another responder" in the queue | Say help is coming before someone accepts |

## PART 4: If Stitch drifts
- Wrong layout: "Keep exactly three columns: alert queue, map, alert detail, at 1440 x 900."
- Looks like a generic dashboard: "More space, bigger text, one dominant alert, fewer small widgets."
- Copied another app's style: "Use only the RakshaLink palette and fonts above. No yellow and black."
- Colours inconsistent: "Navy for Road Accident, maroon for Medical SOS, teal for Breakdown, green for Fuel, on every screen."
- Invented data: "Use only the sample data in the prompt and label it sample."

---

## PART 5: Locked corrections and acceptance checklist (from reviewing the teammate's mockups)
Paste these lines into Stitch after the master prompt, and use the checklist to review ANY mockup before it becomes the reference.

**Add to the prompt:**
```
One state per screen. Never stack several states on one screen.
Before accepting: Accept and Can't Respond are active, the escalation countdown is running, the Accepted step is unchecked, and every status button (On the way, Arrived, Resolved, Update) is disabled.
After accepting: the Accept and Can't Respond buttons and the countdown disappear. The header says "Alert accepted" only. Only the next step button is enabled. "On the way" is shown only after the responder presses it.
Final state: after Resolved, show a disabled "Resolved" with a check, and a "Back to alerts" button.
The On the way button uses a vehicle icon, never an X.
Do not show a "Reported by" row. Do not show any rider personal data.
For an automatic crash alert, the detail panel shows: "Automatic crash alert: hard impact and sudden stop detected. Victim may be unresponsive." Optional sample lines: peak impact and speed before impact.
An automatic crash alert is always a Road Accident (navy), never a Medical SOS.
The active screen is never labelled "Coming soon". Only unbuilt items are. Home and Live alerts are one item.
Use one name everywhere: "Sample City Hospital".
```

**Acceptance checklist (tick every line):**
1. No rider phone number or personal data anywhere.
2. No computed ETA. Distance reads "straight-line". An estimate appears only if the responder typed it.
3. No invented statistics and no priority tags.
4. Role view shows only that role's categories, and the filter chips match.
5. The trigger label matches the trigger row. Automatic crash always means Road Accident.
6. Pre-accept state: Accept and Can't Respond active, countdown live, steps disabled, Accepted unchecked.
7. Post-accept state: buttons and countdown gone, only the next step enabled, header says "Alert accepted".
8. Final state: disabled "Resolved" with a check, plus "Back to alerts", only after all steps.
9. One state per screen.
10. Category colours: Fuel green, Breakdown teal, Accident navy, Medical maroon.
11. No dead controls. The active screen is never "Coming soon".
12. DEMO banner, OpenStreetMap credit, consistent sample names.
13. One logo (R shield) and one tagline ("Help, when you need it most.").
14. A crash alert's detail panel shows the crash summary.
15. The demo banner uses a neutral or amber colour, never a category colour (navy means Accident).
16. A crash alert's trigger badge reads "Automatic crash", never "Voice" or "Manual".
17. Desktop, before accept: the escalation countdown is visible next to Accept.
18. Pre-accept screens never show "Accepted" checked or an "Alert accepted" log row.
19. No "ETA" box with minutes. Only "Your estimate (shown to the caller): Not available yet".
20. The final state's Resolved button is disabled with a check. The full state table is in `DESIGN.md` section 15 and wins over any picture.
