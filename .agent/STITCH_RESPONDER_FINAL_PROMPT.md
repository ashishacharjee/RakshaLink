# Stitch prompt: FINAL responder screens (checked against your design file)

Source of truth: `DESIGN_TOKENS.md` (your attached file, theme "RakshaLink Warm Calm Light") and the reference images in `responder_reference/`. The images were rendered from those tokens. They are references, not Stitch output.

## How to use
1. If Stitch lets you attach or import a design system file, attach `DESIGN_TOKENS.md`. If not, the prompt below repeats every token it needs.
2. Choose **Web / Desktop** (about 1440 x 900). Attach `desktop_S0_incoming.png` and paste **Part 1**.
3. Generate the other states one at a time with **Part 2** (desktop) and **Part 3** (mobile, attach `mobile_states.png`).
4. Check every result against **Part 4**.
5. Timing: designs must be created inside the event window. Do this on the day (Role D).

## Two conflicts inside your design file (decided)
- **Serif font:** the file says `display: Fraunces` but every headline style says Noto Serif. This prompt uses **Noto Serif 600** for headlines, because that is what the type scale specifies. If you prefer Fraunces, change it in the file and in this prompt together.
- **Corner radius:** the file's largest radius is 12 px (`xl`), so cards use 12 px. The earlier ChatGPT mockups used 20 to 28 px, which the file does not allow. This prompt uses the file.

---

## PART 1: Desktop, state S0 Incoming (paste first)
```
Design a desktop web screen, 1440 x 900, for "RakshaLink Responder Console": the screen a hospital uses to receive and answer a highway emergency alert. Light theme called "RakshaLink Warm Calm Light". Use the attached design system file and reference images. If a reference image disagrees with this text, THIS TEXT WINS.

DESIGN TOKENS (exact)
Colours: background #EFEBDD, surface #FBF9F2, text #1C2A12, muted text #5E6B57, border rgba(39,71,6,0.14), primary green #274706, teal #1B4D4F, navy #2B3A67, maroon #5B1F2D, purple #3D2A5C, cream #F5F3EA, amber #D9B25C, error red #BA1A1A, light green tint #E2F4CF.
Category colours: Fuel green #274706, Breakdown teal #1B4D4F, Road Accident navy #2B3A67, Medical SOS maroon #5B1F2D.
Fonts: headlines Noto Serif weight 600. Everything else DM Sans (400, 500, 700).
Shape: cards 12 px radius, buttons 10 px, pills fully round. Flat colours, no gradients, thin soft borders.

LAYOUT
TOP BAR (72 px, primary green): left, a small shield logo with the letter R, the name "RakshaLink" in Noto Serif (cream) and under it "Help, when you need it most." Centre: an amber pill "DEMO · SIMULATED RESPONDER NETWORK" with dark text. Right: a "View as" dropdown showing "Hospital", an "On duty" toggle (ON), and an avatar "SC" with the name "Sample City Hospital". No bell, no profile dropdown.
LEFT SIDEBAR (200 px, surface colour): "Home" (active, light green tint with a house icon). Below it "History", "Profile", "Settings" in muted text, each with a small "Coming soon" label.
MAIN AREA, three columns:
1) ALERT QUEUE (320 px card). Title "Live alert queue" with a red count badge "5". Filter chips: "All 5" (selected, green), "Medical 3", "Accident 2". Five rows, exactly:
 - Road Accident · chip "Automatic crash" · 4.2 km · just now · "Sample location" (SELECTED: pale navy tint with a navy left edge)
 - Medical SOS · chip "Manual" · 5.0 km · 1 min ago · "Sample location"
 - Medical SOS · "Manual" · 6.3 km · 4 min ago · "Sample location"
 - Road Accident · "Manual" · 7.1 km · 9 min ago · "Sample location"
 - Medical SOS · "Manual" · 8.4 km · 15 min ago · "Sample location"
 Road Accident rows have a navy circle with a car icon. Medical SOS rows have a maroon circle with a plus icon. Footer text: "All names, distances and times are sample data."
2) ALERT DETAIL (436 px card):
 - Navy circle with a car icon, the title "Road Accident" (Noto Serif), a chip "Automatic crash", and the line "Reported just now · via RakshaLink app".
 - A row: "Victim location" with "GNIT campus, Sodepur (demo)" and "22.6951° N, 88.3788° E". At the right "Distance from you" with "4.2 km" and "straight-line".
 - A pale navy box titled "Automatic crash alert" with "Hard impact and sudden stop detected." and, in bold, "Victim may be unresponsive." Under it two numbers: "Peak impact 8.4 g" and "Speed before impact 72 km/h", with a small label "sample values".
 - One row of three items: a green button "Accept alert" with a check icon, a small box "Escalates in 00:20" (the countdown in red), and an outlined red button "Can't respond".
 - A small muted line: "If nobody accepts, this alert goes to the next-nearest responder."
3) MAP (396 px card): an OpenStreetMap-style map. A navy car pin labelled "Accident location" with a soft pulsing ring. A green marker labelled "You". A thin dashed straight line between them with the label "4.2 km straight-line". An "Open in Maps" button with an external-link icon at top right. Zoom + and - at bottom right. The text "© OpenStreetMap contributors" at bottom left.
UNDER THE DETAIL AND MAP, three equal cards:
 - "Responder information": avatar "SC", "Sample City Hospital", "Hospital responder", chips "On duty" and "Hospital", and "4.2 km straight-line".
 - "Response progress": vertical steps Notified (checked), Accepted, On the way, Arrived, Resolved (all unchecked). At the right a light green box: "Your estimate (shown to the caller)" and "Not available yet".
 - "Responder actions": label "Update status"; buttons "On my way", "Arrived", "Resolved", ALL DISABLED (grey); a disabled text field "e.g. 8 min (optional)" and a disabled "Update" button.
BOTTOM, full width: card "Event log" with columns Time, Event, Details, By. Rows, exactly:
 14:32 | Alert received | Road Accident, automatic crash (demo location) | System
 14:32 | Matching complete | Sample City Hospital 4.2 km, Sample Highway Police 3.8 km | System
 14:33 | Responder notified | Sample City Hospital | System

STATE: INCOMING (before accept). Accept alert, Can't respond and the 00:20 countdown are active. The Accepted step is NOT checked. The event log has NO "Alert accepted" row. All status buttons and Update are disabled.

NEVER SHOW
- any phone number, a "Reported by" row, or any personal data
- any ETA in minutes computed by the system (only the straight-line distance; the estimate box says "Not available yet")
- priority tags (High, Medium, Low), earnings, ratings, or statistics such as success rate or number of active alerts
- Voice alerts, a bell icon, notification badges, profile dropdowns, filter icons, or "View all" links
- gradients, any other brand's style, real hospital or police names
- "Coming soon" on the screen that is currently open
```

---

## PART 2: Desktop follow-ups (one per generation)

**S1 Accepted**
```
Same design system and layout as the previous screen. State: ACCEPTED. Changes only:
- In the alert detail header, replace "Reported just now · via RakshaLink app" with a green pill "Alert accepted" (check icon) followed by "Reported 2 min ago". Keep the "Automatic crash" chip.
- Remove the Accept alert button, the Can't respond button and the countdown box. In their place show ONE full-width green button "On my way" with a car icon, and under it the muted line "Tap when you leave. The caller sees each step you mark."
- Response progress: Notified and Accepted checked; On the way, Arrived, Resolved unchecked.
- Responder actions: "On my way" ENABLED (green), "Arrived" and "Resolved" disabled. The estimate field is enabled, "Update" stays disabled until something is typed.
- Queue: the selected row's last line reads "Accepted by you" in green.
- Event log: add a fourth row: 14:34 | Alert accepted | Accepted by Sample City Hospital | Sample City Hospital
```

**S2 On the way**
```
Same as the Accepted state, with these changes. The detail header pill reads "On the way". The big button reads "Arrived". Progress: Notified, Accepted, On the way checked. Actions: only "Arrived" enabled. If the responder typed an estimate, the estimate box shows it as "Your estimate: 8 min" (otherwise still "Not available yet"). Log adds: 14:36 | On the way | Marked by Sample City Hospital | Sample City Hospital
```

**S3 Arrived**
```
Same as the On the way state. Header pill "Arrived". The big button reads "Resolved". Progress: Notified, Accepted, On the way, Arrived checked. Actions: only "Resolved" enabled. Log adds: 14:41 | Arrived | Marked by Sample City Hospital | Sample City Hospital
```

**S4 Resolved**
```
Same as the Arrived state. Header pill "Resolved" (green). The big button becomes a disabled grey "Resolved" with a check icon, with an outlined "Back to alerts" button beside it. All five progress steps checked. All status buttons disabled. Log adds: 14:52 | Resolved | Marked by Sample City Hospital | Sample City Hospital
```

**Crash alert vs manual alert (optional)**
```
Same layout. Select the second queue row instead: Medical SOS with the "Manual" chip. In the detail panel, remove the "Automatic crash alert" box entirely (manual alerts have no crash data). Header chip "Manual". Header icon maroon with a plus. Nothing else about the layout changes.
```

---

## PART 3: Mobile accept page (opened from the SMS link, no app)
Attach `mobile_states.png`. Generate one state per screen.

**Mobile S0 Incoming**
```
Same design system as the desktop screen. A mobile web page, 390 x 844, opened from an SMS link. Top: small shield logo, "RakshaLink", "Responder". An amber pill "DEMO · SIMULATED RESPONDER NETWORK". Overline "INCOMING ALERT". A navy circle with a car icon, the title "Road Accident" (Noto Serif), a chip "Automatic crash". A pale navy box: "Automatic crash alert", "Hard impact and sudden stop detected.", bold "Victim may be unresponsive.", and "Peak impact 8.4 g · Speed before 72 km/h" with a tiny label "sample". A card: "Victim location", "GNIT campus, Sodepur (demo)", "4.2 km straight-line", and a full-width white button "Open in Maps" with an external-link icon. A pink-tint box: "Escalates to the next responder in" with "00:20" in red. A full-width green button "Accept alert" with a check icon. A full-width outlined red button "Can't respond". Footer text: "Opened from an SMS link. No app needed." No tab bar, no bottom navigation, no profile.
```

**Mobile S1 Accepted**
```
Same page. State ACCEPTED. A green banner "Alert accepted" with a check. Under it the incident summary (icon, "Road Accident", chip "Automatic crash"). A "Response progress" card with 5 steps: Notified and Accepted checked, On the way, Arrived, Resolved unchecked. A white button "Open in Maps". A field "Your estimate (optional)" with the placeholder "e.g. 8 min. Shown to the caller as your estimate." ONE green button "On my way" with a car icon. Remove the countdown, the Accept button and the Can't respond button. Do not write "on the way" anywhere before the responder presses "On my way".
```

**Mobile S2 and S3**
```
Same page. S2: banner "On the way", the next and only button is "Arrived", progress shows On the way checked. S3: banner "Arrived", the only button is "Resolved", progress shows Arrived checked. Never show two step buttons at once.
```

**Mobile S4 Resolved**
```
Same page. Banner "Resolved" with a check. All five steps checked. A disabled grey button "Resolved" with a check icon, and an outlined button "Back to alerts". No other buttons.
```

---

## PART 4: Check every result (tick all)
1. Colours exactly as the tokens: no gradients, accident navy, medical maroon, fuel green, breakdown teal, error red for countdown and Can't respond, amber demo banner.
2. Headlines Noto Serif 600, everything else DM Sans, cards 12 px.
3. No phone number, no "Reported by", no personal data.
4. No computed ETA. Distance says "straight-line". The estimate box says "Not available yet" unless the responder typed one.
5. No priority tags, no statistics, no Voice alerts, no bell, no profile dropdown, no filter icon, no "View all".
6. Queue: 5 rows, badge 5, chips All 5 / Medical 3 / Accident 2, and the counts match the rows.
7. The crash alert's chip says "Automatic crash". Manual alerts have no crash box.
8. S0: Accept, Can't respond and the countdown are active. Accepted unchecked. No "Alert accepted" log row. All status buttons disabled.
9. S1 to S4: Accept, Can't respond and the countdown are gone. Only the next step button is enabled. The header says only what has actually happened.
10. S4: a disabled "Resolved" with a check, plus "Back to alerts".
11. One state per screen. Never two step buttons at once.
12. Same numbers everywhere: 4.2 km, "Sample City Hospital", demo banner present, OpenStreetMap credit on the map.
13. The sidebar has Home active and the rest "Coming soon". The open screen is never "Coming soon".
14. The mobile page has no tab bar and no profile.
