# PROJEKT SENTINEL: The Eye & Brain of Hamburg

## Won First Place at [Hackathon Name] 🏆

### A. WHAT CAN OUR TOOL DO?

### A. WHAT CAN OUR TOOL DO?

**SENTINEL** is a next-generation "Digital Twin" for the Port of Hamburg that goes beyond simple visualization. It is an **active, cognitive operating system** for logistics.

1. **Holographic Visualization**: A stunning, dark-mode 5D interface showing real-time positions of ships (AIS), trucks, and bridge statuses on a vector-based map.
2. **Visual Truth Verification ("The Eye")**: The system utilizes a Computer Vision architecture (YOLOv8) to cross-reference digital API signals with optical reality, preventing "Sensor Hallucinations."
3. **48H Temporal Machine**: A "DVR for the Port". Operators can scrub smoothly from **T-24h History** (replaying verified vessel paths) to **T+24h Future** (AI-driven probabilistic forecasting).
4. **Predictive Crisis Management**: The system autonomously detects future anomalies—such as an "Ice Accretion" event blocking the Kattwyk Bridge at T+11h—and preemptively routes traffic before the deadlock occurs.
5. **Live Environmental Intelligence**: Integrated real-time weather feeds (OpenMeteo API) drive the physics engine, adjusting ship trajectories and bridge risk scores based on actual wind/tide conditions.

---

### B. THE TRUTH ENGINE (HOW WE PREDICT) 🧠

**1. The Hybrid Twin Architecture (Scientific Legitimacy)**
Most "Digital Twins" are fake. Ours is a **HYBRID**:

* **Static Truth**: We ingest real-time API data from **MarineTraffic (AIS)** and **OpenMeteo (Weather)** to establish the "Base Truth."
* **Dynamic Simulation**: We utilize a custom Physics Engine (`brain/history.py`) initialized with real vessel parameters (Length/Draft/Speed) to simulate *future* states 24 hours ahead.
* **Sequential Anomaly Detection**:
  * *Step 1*: System projects vessel path based on current speed (0.1hr tick).
  * *Step 2*: System overlay OpenMeteo weather forecasts (e.g., Temperature < 0°C at T+11h).
  * *Step 3*: **Crisis Trigger**: If `Vessel_Draft > 14m` AND `Tide < 2m` AND `Bridge_State = LOCKED`, the system flags a "Hydraulic Lock" probability.

**2. Visual Verification ("The Eye")**

* **Camera Integration**: We don't just guess. We connect to **Sector 4 (Neuhof) Webcams** to visually verify the digital signal.
* **Source of Truth**: If the API says "Bridge Open" but the Computer Vision (YOLOv8) sees "Bridge Closed", the system overrides the API and triggers a "Review Alert."

---

### C. EXTERNAL VERIFICATION (WHY YOU CAN TRUST US) 🔗

We provide direct "Proof of Life" links for every prediction:

1. **Vessel Tracking**: Click "TRACK VESSEL" to open the live **MarineTraffic** page for the specific ship (e.g., *MSC PREZIOSA* - IMO:9639206).
2. **Port Schedule**: Direct integration with the **Hamburg Port Authority (HPA)** arrivals list.
3. **Optical Feeds**: Real-time accessible webcams on the map (Teufelsbrück, Bubendey, Neuhof) allow the user to see the physical reality matching the digital twin.

---

### D. HOW WE USED ANTIGRAVITY (THE AGENT) 🤖

**The Port that Speaks.**
We integrated ElevenLabs to give Sentinel a voice, transforming dry data into a cinematic experience.

* **Crisis Briefings**: In the event of a critical anomaly (Bridge Sensor Failure), the system generates a dynamic "Situation Report".
* **Dynamic Scripting**: The script isn't pre-recorded. It is generated real-time by the Brain based on the *exact* amount of Euros and CO2 saved (`brain/voice.py`), then synthesized instantly into a calm, authoritative AI voice.
* **Driver Alerts**: The voice is designed to broadcast directly to connected HGV cabins, overriding their music to provide turn-by-turn emergency rerouting instructions.
