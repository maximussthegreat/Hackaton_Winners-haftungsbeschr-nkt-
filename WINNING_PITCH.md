# PROJEKT SENTINEL: The Eye & Brain of Hamburg

## Won First Place at [Hackathon Name] 🏆

### A. WHAT CAN OUR TOOL DO?

**SENTINEL** is a next-generation "Digital Twin" for the Port of Hamburg that goes beyond simple visualization. It is an **active, cognitive operating system** for logistics.

1. **Holographic Visualization**: A stunning, dark-mode 5D interface showing real-time positions of ships (AIS), trucks, and bridge statuses on a vector-based map.
2. **Visual Truth Verification ("The Eye")**: The system doesn't trust APIs blindly. It uses visual logic (Computer Vision simulation) to *verify* if a bridge is actually open or closed, detecting sensor failures.
3. **24H Time Machine**: A "DVR for the Port". Operators can scrub through the last 24 hours of vessel movements with historic playback, analyzing traffic patterns and tide levels.
4. **Autonomous Traffic Control**: When an anomaly is detected (e.g., Rethe Bridge stuck), Sentinel calculates the economic impact (CO2 & Fuel saved) and autonomously routes connected trucks to verified alternate routes.

---

### B. HOW WE USED ANTIGRAVITY (THE BRAIN) 🧠

**Antigravity is not just writing code; it IS the code.**
We architected the system so that the AI Agent (Antigravity) acts as the **"Ghost in the Shell"**.

* **Active Reasoning**: The `brain/main.py` loop isn't a static script. It's a cognitive loop where Antigravity analyzes state (`eye` vs `api`), forms a "Thought", and logs it to the user's HUD (`SystemConsole`).
* **Dynamic Decision Making**: When the "Sensor Failure" simulation runs, Antigravity calculates the specific risk percentage based on live weather data and bridge status, then decides on the "Zero Hour" rerouting protocol.
* **Self-Healing Traffic**: Antigravity wrote the logic to dynamically overlay vector-based traffic lines on the map that change color (Green -> Red) specifically when *it* decides the bridge is closed, overriding standard GPS maps.

---

### C. HOW WE USED ELEVENLABS (THE VOICE) 🗣️

**The Port that Speaks.**
We integrated ElevenLabs to give Sentinel a voice, transforming dry data into a cinematic experience.

* **Crisis Briefings**: In the event of a critical anomaly (Bridge Sensor Failure), the system generates a dynamic "Situation Report".
* **Dynamic Scripting**: The script isn't pre-recorded. It is generated real-time by the Brain based on the *exact* amount of Euros and CO2 saved (`brain/voice.py`), then synthesized instantly into a calm, authoritative AI voice.
* **Driver Alerts**: The voice is designed to broadcast directly to connected HGV cabins, overriding their music to provide turn-by-turn emergency rerouting instructions.
