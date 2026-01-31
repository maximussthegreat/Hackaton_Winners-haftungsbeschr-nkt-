from loguru import logger

class ConflictEngine:
    def __init__(self):
        self.state_api = {}
        self.state_visual = {}

    def update_api_state(self, node_id: str, state: str):
        self.state_api[node_id] = state
        self.check_conflict(node_id)

    def update_visual_state(self, node_id: str, state: str):
        self.state_visual[node_id] = state
        self.check_conflict(node_id)

    def check_conflict(self, node_id: str):
        api = self.state_api.get(node_id)
        visual = self.state_visual.get(node_id)

        if api and visual and api != visual:
            logger.warning(f"CONFLICT DETECTED at {node_id}: API={api} VS VISUAL={visual}")
            return True
        return False
