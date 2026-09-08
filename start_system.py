"""
Launch Script for Underground Mine Safety & Autonomous Rover System
Runs backend REST API, SSE Stream, Background Simulator, and launches Web UI.
"""

import os
import sys
import webbrowser
import time

# Ensure project root is in python path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, PROJECT_ROOT)

from backend.app import app

def main():
    print("=" * 70)
    print(" 🚀 UNDERGROUND MINE SAFETY & AUTONOMOUS ROVER SYSTEM")
    print("=" * 70)
    print(" [✓] Initializing SQLite Telemetry Database...")
    print(" [✓] Starting Background Multi-Zone Mine Simulator...")
    print(" [✓] Starting AI Risk Analysis Neural Fusion Engine...")
    print(" [✓] Launching Flask Server on http://127.0.0.1:5000")
    print("=" * 70)
    print(" Press CTRL+C to stop system.")
    print("=" * 70)

    # Open Web Browser automatically after 1.5 seconds
    def open_browser():
        time.sleep(1.5)
        webbrowser.open("http://127.0.0.1:5000")

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    app.run(host="0.0.0.0", port=5000, debug=False, threaded=True)

if __name__ == "__main__":
    main()
