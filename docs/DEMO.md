# Demo guide

Open `http://localhost:3000/`. The **Live demo** tab shows the rider phone and the responder console side by side at full size. Other tabs show each interface alone and the 3D simulation. **How to demo** and **Reset demo** are in the top right.

## Four-minute script
1. **Problem** (20 s): one MoRTH number from the README.
2. **Tap Medical SOS** on the phone. The alert appears in the console with a 20 s escalation countdown. The phone says "Waiting for a responder" and nothing more.
3. **Accept alert** in the console. The phone changes to "Responder accepted". Press **On my way**, type an estimate, **Arrived**, **Resolved**. The phone shows each real step.
4. **Simulate crash** on the phone. The detector arms, sees the impact and the stop, and starts a 20 s countdown. Let it run (or tap Send help now): an Automatic crash alert goes to a hospital and the police, with the crash data.
5. **Speed-breaker test:** spike, car keeps moving, nothing is sent.
6. **Escalation:** leave an alert alone for 20 s. It moves to the next-nearest responder and the log says so.
7. **Offline:** open **Demo tools** on the phone and tick "Pretend there is no signal" (or use airplane mode), then tap an emergency. The screen flashes a Morse SOS and the alert is saved. Press **Turn signal back on (demo)**: it is delivered and tagged "Delivered from queue".

If you open only the console, use **Demo tool: send a sample alert** in the queue panel to create an alert.
8. **3D simulation** (`/simulation/`): the crash, the offline relay concept and the help response in 3D.
9. **Honest limits** (below).

## Phone on the same Wi-Fi
`http://<laptop-ip>:3000/rider`. Do not refresh the page while offline.

## What is real and what is simulated
Responders are sample data and dispatch is a labelled simulation. Crash detection runs prepared traces through the real detector, not live sensors. Morse alerts people nearby and does not send data. The SMS fallback builds the text and the server can parse it, but no SMS gateway is connected. The relay shown in the 3D simulation is a roadmap concept.
