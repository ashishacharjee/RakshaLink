# RakshaLink: Google Stitch prompt pack

Built from your friend's home-screen image. The goal: Stitch designs every other screen in the same style, simple enough that anyone can use it in a panic.

**Timing:** the event rule says designs must be created inside the 8-hour window. Treat this file as text you paste into Stitch on the day (Role D), not before.

**Design source of truth:** `DESIGN_TOKENS.md` (the design system file). Colours and fonts in this prompt follow it.

## How to use it
1. In Stitch, choose **Mobile app**, upload the home-screen image as a reference, and paste **Part 1** into the prompt box.
2. When the Home screen looks right, generate each other screen one at a time with the prompts in **Part 2**. Paste one prompt per generation, never all at once.
3. If Stitch drifts from the style, use the fixes in **Part 4**.

I can't confirm Stitch's current upload and export options, so check what it offers today. If image upload isn't available, Part 1 describes the design fully in words.

---

## PART 1: Master prompt (paste this first)

```
Design a mobile app called RakshaLink: a highway emergency help app for India. Match the attached reference image closely. It must be usable by anyone in a panic, including people who are not comfortable with technology.

DESIGN FEELING: calm, trustworthy, warm. Not a cold hospital app and not a flashy startup app. Big, clear, friendly.

BACKGROUND: warm off-white (#EFEBDD). Cards use the surface colour (#FBF9F2) or a soft tint, with 12 px rounded corners (pills fully round), thin soft borders and no gradients.

COLOUR LANGUAGE (each emergency owns one colour, everywhere in the app):
- Fuel: forest green (#274706)
- Breakdown: teal (#1B4D4F)
- Accident: navy (#2B3A67)
- Medical SOS: maroon (#5B1F2D)
- Call 112: error red (#BA1A1A)
- Voice / AI: purple (#3D2A5C) on a soft lavender card (#ECE8F6)
- Brand and "online": forest green (#274706), with a pale-green pill (#E2F4CF) and a bright green dot
Text on coloured tiles is white. Body text is near-black green (#1C2A12).

TYPOGRAPHY: serif for the app name and big titles (Noto Serif, weight 600), clean sans-serif (DM Sans-style) for everything else. Large sizes. Never tiny text.

HOME SCREEN, top to bottom:
1. Status bar.
2. Header row: a dark-green rounded-square app icon with a white stylised "R", the name "RakshaLink" in a large serif, tagline "Help, when you need it most." Right side: a pill "Online" with a green dot, and a second outlined pill "Offline Beacon Ready" (two lines).
3. Location card (white, rounded): a green map-pin in a circle, "NH-19 · Durgapur Expressway", under it "KM 42.8 · Near Palsit Toll Plaza", a small chip "±3m GPS", a pale-green "Share" button, and a chevron.
4. A 2x2 grid of big emergency tiles. Each tile has: a white circle with a simple icon (top-left), a small translucent chip (top-right), a bold title and a one-line subtitle at the bottom (white), a large faint watermark illustration in the corner, and a small chevron.
   - Fuel (green): fuel-pump icon, chip "2.1 km · 6m", subtitle "Petrol, Diesel & EV assist"
   - Breakdown (teal): wrench icon, chip "3.4 km · Towing", subtitle "Mechanic & towing help"
   - Accident (navy): warning-triangle icon, chip "Police + Hospital", subtitle "Multi-agency crash triage"
   - Medical SOS (maroon): plus icon, chip "Trauma Center", subtitle "Ambulance request"
5. Drive Mode card (white): steering-wheel or globe icon in a pale-green square, "Drive Mode Active" with a small green dot, subtitle "Auto-detects a crash. 20s countdown before alert." and an ON toggle switch (green).
6. Speak for Help card (lavender): a round purple microphone button, title "Speak for Help" with a small "AI TRIAGE" chip, subtitle "Tell us what happened. We'll confirm before sending."
7. A full-width red pill button: phone icon, "CALL 112" in bold, small text "Emergency Helpline", chevron.
8. Small footer line with a tiny shield logo: "Your safety matters".
9. Bottom tab bar with 4 tabs: Home (active, green with underline), Location, History, Settings.

RULES FOR EVERYTHING:
- Every tap target at least 56 px tall. Icons always come with a text label.
- Plain, short words. No jargon, no abbreviations a stranger would not understand.
- One main action per screen. Maximum two buttons visible at once.
- Colour is never the only signal: always pair it with an icon and a word.
- Keep the same fonts, corner radii, shadows and colours on every screen.
- Show sample data only. Never show fake claims such as "help is on the way".
```

---

## PART 2: Screen prompts (one per generation)

Start each with: "Same design system as the Home screen." Then paste:

**A. Voice (Speak for Help)**
```
Voice screen. Purple theme on the warm off-white background. Large pulsing purple microphone in the centre with a soft waveform of purple bars. Text under it: "Listening... say what happened." After listening, show the heard sentence in a large serif quote: "My tyre burst near the toll plaza". Under it a card: "We think this is" with a teal "Breakdown" pill. Two buttons: a big green "Yes, send" and a quiet outlined "Change". Small note: "We always ask before sending." A red "Call 112" pill stays at the bottom.
```

**B. Status (after sending)**
```
Status screen after an alert is sent. Top: the category name in its colour (e.g. "ROAD ACCIDENT") and the headline "Help is being arranged". A 3-step vertical timeline: "Alert sent", "Responder notified", "Responder accepted" (filled purple dots when done, grey when pending). Below it a responder card: coloured type pill (Hospital), name "Sample District Hospital", "5.0 km away", and a small badge "DEMO DATA". A small map preview with a pin. Red "Call 112" pill at the bottom.
```

**C. No responder answered**
```
Status screen, failure state. Calm, not alarming. Headline: "No responder answered yet". Text: "Please call 112 now." Make the red "CALL 112" button very large and filled. Below it a small card "Your family was alerted" with a check icon. A secondary outlined button "Try again".
```

**D. Crash countdown**
```
Crash countdown screen. Full-screen deep maroon (#5B1F2D). Overline "CRASH DETECTED", headline in white serif "Are you OK?". A large circular countdown ring (cream stroke draining) with "20" in huge serif in the centre and "seconds" beneath. Text: "We felt a hard impact and a sudden stop. Help is sent automatically at zero." Two buttons at the bottom: a very large cream "I'M OK" button and an outlined "Send help now" button.
```

**E. Offline beacon**
```
Offline mode screen. Near-black warm background. Overline in amber "NO SIGNAL". Headline "Signalling for help". A glowing amber circle (like a torch) with expanding rings, and under it a row of Morse dots and dashes for S-O-S. A card: "Alert saved. It sends automatically when signal returns. The flash and beep help people nearby see you." Buttons: amber "Send by SMS instead" and an outlined "Stop".
```

**F. Emergency contacts (Settings)**
```
Settings screen. Sections as large rounded cards: "Emergency contacts" (two contacts with name and phone, an "Add contact" button, note "They get a message with your location when you send an alert"), "Language" (English, हिन्दी, বাংলা selector), "Drive Mode" (toggle, countdown length), "Text size" (slider), "About". Same bottom tab bar with Settings active.
```

**G. Responder accept page (mobile web, opened from an SMS)**
```
Mobile page opened from an SMS link, no app needed. Overline "INCOMING ALERT". Serif headline "Road accident nearby". A card with a navy "Road Accident" pill and a small badge "AUTOMATIC CRASH ALERT", text "Victim may be unresponsive", "3.8 km from you". A map with a maroon pin. Two big buttons: green "Accept" and outlined "Can't respond". Small footer "RakshaLink responder".
```

**H. Responder Console (desktop web)**
> Superseded: use `STITCH_DESKTOP_PROMPT.md` for every desktop screen (live console, accepted flow, roles, history, operations overview). The prompt below is the short version.
```
Desktop web dashboard for responders, same colours and fonts. Green top bar: "RAKSHALINK · RESPONDER CONSOLE", the name "Sample District Hospital", and a banner chip "DEMO · SIMULATED RESPONDER NETWORK". Left column: list of incoming alert cards (coloured category pill, "Automatic crash alert", distance, time). Right panel: serif headline "Victim may be unresponsive", a large map with a maroon pin, big green "Accept" and outlined "Can't respond" buttons, and a card "Escalates to the next-nearest responder in 20s". Bottom: an event log list.
```

**I. History**
```
History screen: list of past alerts as cards (category colour pill, date, place, status such as "Responder accepted" or "Cancelled by you"). Empty-state friendly message: "No alerts yet. We hope it stays that way." Bottom tab bar with History active.
```

---

## PART 3: What I changed from the image (and why)
The image looks great. I kept the whole look and changed only the words that would claim more than we can honestly deliver, since judges may probe them.

| Image says | Prompt says | Reason |
|---|---|---|
| Accident chip "Police + NHAI" | "Police + Hospital" | We have no NHAI partnership (rule R1). |
| Breakdown "Mechanic & Flatbed en route" | "Mechanic & towing help" | "En route" claims a response that has not happened (rule R10). |
| Medical "ALS Ambulance dispatch" | "Ambulance request" | We route to hospitals; we don't dispatch ALS ambulances. |
| Speak: "dispatches in seconds" | "We'll confirm before sending" | Our rule is never to send an unconfirmed voice guess. |
| Drive Mode "high-G crash & rollover · 20s auto-SOS" | "Auto-detects a crash. 20s countdown" | Not validated, so no big technical claims. |
| 20 s countdown | 20 s | Decided: 20 s everywhere (`COUNTDOWN_S=20`). |

The image's filled red **Call 112** button is better than the outlined one in my earlier design. It is clearer for panicked users. It still only opens the dialer when tapped, and never calls by itself.

The distances and place names in the image (NH-19, KM 42.8, Palsit Toll Plaza) are sample content. In the real app they come from GPS and the responder database.

## PART 4: If Stitch drifts
- Different style: "Keep exactly the same colours, fonts, corner radius and tile style as the Home screen."
- Too busy: "Simplify. One main action. Bigger text. Fewer elements."
- Wrong copy: "Use exactly this text: ..." and paste it.
- Tiles lose their watermark illustrations: "Add the large faint watermark illustration to each tile like the reference."
- Dark mode: only after all screens look right: "Create a dark version using the same palette."
