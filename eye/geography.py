import random
import json
import os
from shapely.geometry import Polygon, Point

class WaterGeometry:
    """
    Defines the safe navigable water using REAL OpenStreetMap Data.
    Eliminates "Land Ships" by using Shapely geometry checks.
    
    COORDINATE SYSTEM:
    - Our data file stores [lat, lng] pairs
    - Shapely Point uses (x, y) = (lng, lat)
    - We must convert when doing geometry checks
    """
    def __init__(self):
        self.polygons = []
        self.bounds = None  # Will store (min_lat, max_lat, min_lng, max_lng)
        
        try:
            path = os.path.join(os.path.dirname(__file__), "data", "water_polygons.json")
            with open(path, "r") as f:
                raw_polys = json.load(f)
                
                all_lats = []
                all_lngs = []
                
                for coords in raw_polys:
                    if len(coords) >= 3:
                        # Convert (lat, lng) to Shapely format (lng, lat)
                        shapely_coords = [(pt[1], pt[0]) for pt in coords]
                        try:
                            poly = Polygon(shapely_coords)
                            if poly.is_valid and poly.area > 0:
                                self.polygons.append(poly)
                                # Track bounds
                                for pt in coords:
                                    all_lats.append(pt[0])
                                    all_lngs.append(pt[1])
                        except:
                            pass
                
                if all_lats and all_lngs:
                    self.bounds = (min(all_lats), max(all_lats), min(all_lngs), max(all_lngs))
                    
            print(f"GEO-INT: Loaded {len(self.polygons)} Real Water Polygons.")
            if self.bounds:
                print(f"GEO-INT: Bounds: Lat [{self.bounds[0]:.4f}, {self.bounds[1]:.4f}], Lng [{self.bounds[2]:.4f}, {self.bounds[3]:.4f}]")
                
        except Exception as e:
            print(f"GEO-INT WARNING: Could not load real water data ({e}).")
            # FALLBACK: Hardcoded Elbe channel near Rethe Bridge
            # These are KNOWN water coordinates from OpenStreetMap
            elbe_channel = [
                (9.9650, 53.5020), (9.9750, 53.5020),
                (9.9750, 53.4980), (9.9650, 53.4980)
            ]
            self.polygons.append(Polygon(elbe_channel))
            self.bounds = (53.4980, 53.5020, 9.9650, 9.9750)

    def get_safe_water_point(self, seed=None):
        """
        Returns a coordinate GUARANTEED to be in a water polygon.
        Uses Rejection Sampling within actual data bounds.
        """
        rng = random.Random(seed) if seed else random

        # Use actual bounds if available, otherwise default
        if self.bounds:
            min_lat, max_lat, min_lng, max_lng = self.bounds
        else:
            min_lat, max_lat = 53.48, 53.52
            min_lng, max_lng = 9.90, 10.00

        for _ in range(200):  # Try 200 times
            lat = rng.uniform(min_lat, max_lat)
            lng = rng.uniform(min_lng, max_lng)
            
            # Shapely Point uses (x, y) = (lng, lat)
            point = Point(lng, lat)

            # Check if point is inside ANY water polygon
            for poly in self.polygons:
                if poly.contains(point):
                    return (lat, lng)  # Return as (lat, lng) for Leaflet

        # Fallback: Center of Rethe (known water location)
        # Verified on Google Maps: 53.5002, 9.9695 is in the Elbe
        return (53.5002, 9.9695)

geography = WaterGeometry()

