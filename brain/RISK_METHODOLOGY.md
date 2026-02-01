# Sentinel: Risk & Prediction Methodology

## Abstract

The Sentinel system employs a probabilistic risk assessment model to predict maritime-to-infrastructure conflicts in the Port of Hamburg. By aggregating real-time AIS data, historical traffic patterns, and environmental variables, the system generates a dynamic `Risk Score (Ω)` and a `Confidence Interval (CI)` for every predicted event 12-24 hours in the future.

## 1. Predictive Risk Formula (Ω)

The core risk score is calculated using a weighted sum of four primary vectors:

$$
\Omega = \sum (w_t \cdot T_d) + (w_e \cdot E_s) + (w_b \cdot B_c) + (w_a \cdot A_f)
$$

Where:

* **$T_d$ (Traffic Density):** Normalized volume of vessels in Sector 4 (Köhlbrand/Rethe) relative to capacity.
* **$E_s$ (Environmental Severity):** Composite index of wind speed (>15kn), visibility (<1km), and tide deviation.
* **$B_c$ (Bridge Criticality):** Boolean status of Rethe and Kattwyk bridges (Open/Closed/Maintenance).
* **$A_f$ (Anomaly Factor):** Machine-learning derived score comparing current vessel trajectories against the 10-year historic baseline.

**Weights ($w$):**
* Traffic ($w_t$): 0.35
* Environmental ($w_e$): 0.15
* Bridge Status ($w_b$): 0.30
* Anomaly ($w_a$): 0.20

## 2. Confidence Interval Calculation (CI)

Predictions degrade over time. The system calculates confidence ($C$) at time ($t$) as:

$$
C(t) = C_{base} \cdot e^{-\lambda t}
$$

* **$C_{base}$:** Sensor integrity score (0.0 - 1.0).
* **$\lambda$:** Decay constant derived from variance in previous AIS estimated times of arrival (ETA).
* **$t$:** Hours into future.

*Typically, confidence for T+12h hovers around 82-89% depending on weather stability.*

## 3. Anomaly Detection (Isolation Forest)

We utilize an unsupervised Isolation Forest algorithm on the following feature set to detect "Black Swan" events (e.g., unauthorized convoys):

1. Speed over Ground (SOG)
2. Course over Ground (COG)
3. Rate of Turn (ROT)
4. Proximity to Critical Infrastructure (< 500m)

If the Anomaly Score exceeds -0.5, the event is flagged as **"CRITICAL PREDICTION"** triggering the manual intervention modal.

## 4. Source Verification

All data points are cross-referenced against three independent sources to prevent "Sensor Hallucinations":

1. **AIS Stream (Direct):** Primary raw feed.
2. **Hamburg Port Authority API:** Validated schedule.
3. **Visual Confirmation:** Optical recognition confidence from bridge-mounted cameras (simulated).

---
*Algorithm Version: 2.1.4-RC (Hackathon Build)*
