from ultralytics import YOLO
import cv2
import numpy as np
from loguru import logger

class VisionEngine:
    def __init__(self, model_path="yolov8n.pt"):
        try:
            self.model = YOLO(model_path)
            logger.info(f"YOLO model loaded from {model_path}")
        except Exception as e:
            logger.warning(f"Could not load YOLO model: {e}. Running in mock mode.")
            self.model = None

        # Optical Flow parameters
        self.feature_params = dict(maxCorners=100, qualityLevel=0.3, minDistance=7, blockSize=7)
        self.lk_params = dict(winSize=(15, 15), maxLevel=2, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 10, 0.03))
        self.prev_gray = None
        self.prev_pts = None

    def process_frame(self, frame):
        result = {"class": "unknown", "confidence": 0.0, "flow_stagnation": False}
        
        if frame is None:
            return result

        # 1. YOLO Inference
        if self.model:
            results = self.model(frame)
            # Todo: Extract specific class (Bridge_Vertical) logic
            # For now, just taking top detection
            if len(results) > 0 and len(results[0].boxes) > 0:
                box = results[0].boxes[0]
                result["class"] = int(box.cls)
                result["confidence"] = float(box.conf)

        # 2. Optical Flow (Stagnation Detection)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        if self.prev_gray is not None:
            if self.prev_pts is None or len(self.prev_pts) == 0:
                 self.prev_pts = cv2.goodFeaturesToTrack(self.prev_gray, mask=None, **self.feature_params)
            
            if self.prev_pts is not None:
                p1, st, err = cv2.calcOpticalFlowPyrLK(self.prev_gray, gray, self.prev_pts, None, **self.lk_params)
                
                # Select good points
                if p1 is not None and st is not None:
                    good_new = p1[st == 1]
                    good_old = self.prev_pts[st == 1]
                    
                    # Calculate movement magnitude
                    movement = np.linalg.norm(good_new - good_old, axis=1)
                    avg_movement = np.mean(movement) if len(movement) > 0 else 0
                    
                    # Threshold for stagnation (if avg movement < 1.0 pixels)
                    if avg_movement < 1.0:
                        result["flow_stagnation"] = True
                    
                    self.prev_pts = good_new.reshape(-1, 1, 2)
                else:
                    self.prev_pts = None

        self.prev_gray = gray
        return result
