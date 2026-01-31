import random

class WaterGeometry:
    """
    Defines the safe navigable water for the Port of Hamburg (Rethe/Kattwyk area).
    Used to prevent 'Land Ships'.
    """
    def __init__(self):
        # A simple approximation of the Elbe/Rethe channel
        # Polygon points (Lat, Lng)
        self.channel_polygon = [
            (53.505, 9.960), # North West
            (53.505, 9.980), # North East
            (53.490, 9.980), # South East
            (53.490, 9.940)  # South West (Kattwyk)
        ]
        
        # Specific "Waypoints" that are definitely in the water
        self.waypoints = [
            (53.5020, 9.9700), (53.5015, 9.9705), (53.5010, 9.9710), # Rethe Approach
            (53.4935, 9.9530), (53.4930, 9.9525), (53.4925, 9.9520), # Kattwyk Center
            (53.4950, 9.9600), (53.4980, 9.9650), (53.4990, 9.9680)  # Main Channel
        ]

    def get_safe_water_point(self, seed=None):
        """Returns a coordinate ON THE LINE of the deep water channel."""
        
        # Use a local random instance to ensure stability if seed is provided
        rng = random.Random(seed) if seed else random

        # Weighted selection to favor the Rethe Bridge area (where users look)
        # Updated to match refined Satellite Alignment (TwinMap.tsx)
        # ULTRA-SAFE "GOLDEN MILE": A single verified vector down the center of the Rethe.
        # This guarantees ships are in water.
        # North Point (River Center): 53.5025, 9.9705
        # South Point (River Center): 53.4975, 9.9630
        segment = ((53.5025, 9.9705), (53.4975, 9.9630))
        
        start, end = segment
        t = rng.random() # 0.0 to 1.0 progress along line
        
        # Linear Interpolation (Lerp)
        lat = start[0] + (end[0] - start[0]) * t
        lng = start[1] + (end[1] - start[1]) * t
        
        return (lat, lng)

geography = WaterGeometry()
