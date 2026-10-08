# WINNING.md — what to add, what to skip, how to present

The official judging rubric for Recursive is not known to me. Open the Unstop page / brief, copy the criteria here, and map every demo step to one of them.

## What wins hackathons (and what this plan is built around)
1. A live, end-to-end demo that works, with a recorded backup.
2. One memorable moment (ours: the crash countdown, then automatic dispatch).
3. Showing BOTH sides: the person in trouble and the responder who receives it.
4. Honest limits stated before judges find them.

## The four additions (all small, all reuse what is already planned)
| # | Addition | Why it helps |
|---|---|---|
| F8 | **Responder accept page** (link in the SMS opens a mobile web page: Accept / Can't respond) | Completes the loop. Without it, "Responder accepted" has no real source. Lets judges hold a phone as the responder |
| F9 | **Auto-escalation**: no accept within N seconds, alert goes to the next-nearest responder; if all fail, the user is told to call 112 | Makes the "triage agent" visibly an agent. Cheap, because matching already returns the 3 nearest |
| F10 | **Family alert**: up to 2 emergency contacts the user chose get an SMS with a map link | Emotionally strong, uses the same SMS pipeline, and everyone understands it instantly |
| F11 | **Measured time-to-dispatch** from our own logs (`dispatch_log.at - sos_events.created_at`) | A credible number we generate ourselves. Always quote with sample size, e.g. "median X s over n test runs" |

Cheap extras if time remains: Bystander mode ("I'm reporting an accident I see", same flow), Hindi/Bengali labels.

## Deliberately NOT adding
Heatmaps or black-spot maps (no verified data), crash prediction/ML, custom hardware, accounts/KYC, payments, blockchain, drone dispatch. All look impressive on a slide and all risk the working demo.

## Likely judge questions and honest answers
- **Isn't this just an SOS app?** No: category-aware triage, a different responder per emergency, escalation when nobody answers, and a fallback ladder for no-signal. Crash detection fires without any tap.
- **Does Morse reach anyone?** No. It alerts people nearby, and the SOS is queued and sent when signal returns.
- **How accurate is crash detection?** Unknown. It is a prototype heuristic tested on simulated traces only. It needs speed context, an impact, and a sudden stop, and it always gives a 20 s cancel window.
- **False alarms wasting responders' time?** The countdown and cancel, the multi-signal gate, and a production plan to call the user first.
- **Where does responder data come from?** OpenStreetMap. Phone numbers in the demo are team-owned demo numbers, labelled DEMO DATA. Real responder onboarding is future work.
- **Do you replace 112?** No. There is a Call 112 button on every screen, and if no responder accepts, we tell the user to call 112.
- **Are you partnered with NHAI / petrol pumps?** No. Those are proposed sustainability paths.
- **Privacy?** Motion data stays on the phone. We store category, location, time. Family contacts are sent in the request and not stored.
- **How is this different from built-in phone crash detection?** Works across many phones, routes to the right responder type, escalates, has an offline ladder. Verify the current state of Pixel/iPhone features before saying it.

## 2-minute pitch skeleton
0:00 Problem and one MoRTH number (slide 3) | 0:20 Tap SOS, nearest right responder | 0:40 Responder phone: Accept (F8) | 0:55 Crash simulation, countdown, auto-dispatch | 1:20 Airplane mode, Morse, queue, delivered | 1:40 Honest limits and roadmap (as a roadmap) | 1:55 Close.

## Day-of checklist
DEMO_MODE on, verified numbers working, both demo phones charged, hotspot as backup network, airplane-mode run rehearsed 3 times, backup video on the laptop, Twilio log screenshots saved, speed-breaker and crash traces both ready, PPT updated for crash, accept page and escalation.

## Demo staging (two surfaces) — team decision
- **Phone 1 (judges watch):** the User App. **Laptop (facing judges):** the Responder Console. **Phone 2 (a teammate):** receives the real SMS/voice call, as proof the channel is real.
- Pitch hook: "Rapido has a rider app and a Captain app. RakshaLink is that model for emergencies: the victim's app, and the responder's console."
- Say clearly that responders on screen are a simulated network. Do not imply government, police or hospital integration exists.
- Rehearse the order: tap SOS, alert pops on the laptop, Accept, phone timeline updates. Then crash simulation, then ignore an alert to show escalation.
- Honest answer to "how do you get real responders?": onboarding via partnerships is future work, ideally integrated with the official 112 system. Verify how 112 integration works before claiming specifics.

## Update 3 Oct: event intel and positioning
**Format hints from the site:** 8 hours, six tracks, nine judge/mentor domains (AI and agents, distributed systems, design, IoT, security, pitching, and others), "2 min pitch drills" and "Top 6" stage coaching. This suggests short pitches and a small final stage. Prepare a 2-minute stage version and a 4-minute table version.

**Positioning by track (pick at check-in, and ask organizers first):**
- *AI & Intelligent Systems:* the site asks for real-world action loops, edge AI, and no hallucination. Our story: sense (crash or voice) then decide (deterministic triage, any LLM output validated against four values) then act (dispatch) then verify (accept) then escalate. Edge: crash detection and the offline queue run on the phone. Do not call it a "swarm".
- *HealthTech:* time to care. Right responder type, escalation, honest "call 112" fallback.
- *Open Innovation:* the full two-surface system (rider app and responder console).

**What each judge domain will probe, and what to show:**
| Domain | Likely probe | Show |
|---|---|---|
| Systems | What if two alerts arrive? What if the provider fails? | SSE console, escalation, mock/real provider switch, demo reset |
| AI/agents | Is the AI doing anything real? | Deterministic triage plus validated voice classifier; the escalation loop |
| Design | Can a panicked person use it? | Big tiles, 20 s countdown, plain words, Bengali/Hindi if built |
| IoT/sensors | Is crash detection real? | Phone accelerometer plus speed gate; honest "not validated" |
| Security/privacy | What data do you keep? | Motion data stays on the phone, hashed tokens, rate limit, no stored contacts |
| Pitching | Is scope honest? | Say what is simulated before they ask |

**Deck update plan (keep the story, add the new parts):** slide 4 add "Crash detected, 20 s countdown, auto-SOS"; slide 5 add the Responder Console and accept page to the architecture strip; slide 6 add "Escalate if no one answers"; slide 7 keep the roadmap as a roadmap; slide 3 verify the 5%/59% label and every figure against MoRTH; slide 8 remove or source the donut chart. Add real screenshots after the build and a "what is simulated" line.

**Demo-day roles:** presenter, phone operator, second-phone holder (receives the SMS), laptop operator (console). Rehearse swapping roles in case someone is unwell.

**Still needed:** the four official judging criteria. Copy them here and map every demo step to one.

## Update 3 Oct: responder workflow (Captain-style)
- **Pitch line:** "Riders get a rider app. Responders get their own app: go on duty, an alert rings, accept, on the way, arrived, resolved. The rider sees only real steps."
- **Why judges will care:** it shows both sides of a two-sided system and a real state machine (alert, accepted, on the way, arrived, resolved, plus escalation). Systems and design judges can probe it and it holds up.
- **New judge questions:** *Do you compute ETAs?* No. Distance is straight-line and an ETA appears only if the responder types it. *Can responders fake statuses?* Only responders can set them, via tokenised links. A production version needs real responder identity and audit logs.
- **Big-screen option (T3):** the dark Operations overview works well on a projector if time allows.
- **Demo staging:** show the console on the laptop, accept, then mark On the way and Arrived while the phone's timeline updates in real time.
