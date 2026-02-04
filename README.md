# 🦅 PROJECT SENTINEL

**The All-Seeing Port Brain (Digital Twin & AI Prediction Engine)**

Sentinel is an AI-powered Digital Twin for the Port of Hamburg, designed to predict traffic gridlocks, bridge closures, and safety incidents up to 24h in advance using a Hybrid Twin architecture (Real-time Data + Physics Simulation).

![Sentinel](https://cdn.openai.com/labs/images/sentinel-port-twin.png)

## 🚀 HOW TO RUN (ANY MACHINE)

### Prerequisites

* Node.js (v18+)
* Python (3.9+)
* A modern GPU-enabled browser (for 4K Digital Twin render)

### 1. Clone & Setup

```bash
git clone https://github.com/maximussthegreat/Hackaton_Winners-haftungsbeschr-nkt-.git
cd Hackaton_Winners-haftungsbeschr-nkt-
```

### 2. Start the Twin (Frontend)

This launches the Holographic Interface.

```bash
cd twin
npm install
npm run dev
```

> Open `http://localhost:3000`

### 3. Start the Brain (Backend/AI)

This launches the Python reasoning engine (Traffic, Weather, Predictions).

```bash
# In a new terminal (root folder)
pip install -r requirements.txt
python -m brain.main
```

---

## 🎮 DEMO CONTROLS

### **1. 48h Time Slider**

* **Center Red Line**: LIVE Real-time view.
* **Left (-12h)**: Replay historical ship movements (Ghost Ships).
* **Right (+12h)**: AI Looking Glass (Future Predictions).

### **2. The "Matrix Mode" (Cinematic)**

* Drag slider to **T+5.0h** or **T+11.0h**.
* System creates a "Slow-Mo" Matrix effect (2X -> 5X slowdown).
* Watch "MSC PREZIOSA" or "CMA CGM ANTOINE" navigate the bridge.
* **Modal Trigger**: A Red Crisis Alert will pop up automatically.

### **3. Intelligence Layer (Webcams)**

* Click Green dots on map (Teufelsbrück/Bubendey) to open real-time feeds.
* Click "TRACK VESSEL" in Crisis Modal to verify ship existence (MarineTraffic).

---

## 🧠 ARCHITECTURE

* **Frontend**: Next.js 14, Tailwind, React-Leaflet (Holographic Mode).
* **Backend**: Python, OpenAI API, NINA API, Port Hamburg Data.
* **Truth Engine**: Validates all predictions against Physics & Tidal constraints.

*Built for Hamburg Port Hackathon 2026.*
