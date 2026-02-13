# LessPaper - Modern Student Exam Application

a high-performance, secure desktop application designed for digital examinations. Built specifically for Digital Development students, it replaces outdated paper-based coding exams with a secure IDE-like environment.
# Project Architecture

The project is organized into modular components to separate instructor administration from student execution:

    backend/: The FastAPI hub that manages the database and serves images.

    prof/profweb/: The React-based Teacher Portal for exam management.

    student/: The Python-based Desktop environment for students.

# Launch Instructions (Step-by-Step)

To run the entire project, you must open three separate terminals and follow this exact order:
1. Start the Backend (API Server)

The backend must be running first so the interfaces can connect to the database.
Bash

cd backend
# Activate your virtual environment
source venv/bin/activate  # Windows: venv\Scripts\activate
# Start the server using Uvicorn
uvicorn main:app --reload

The API will be available at http://localhost:8000.
2. Start the Teacher Web Portal
Bash

cd prof/profweb
npm install       # Only needed the first time
npm run dev

Access the dashboard at http://localhost:5173.
3. Launch the Student Application
Bash

cd student
source venv/bin/activate
python lesspaper.py

# Key Features

    🛡️ Anti-Cheat System: Integrated "Kiosk Mode" that locks the workstation in fullscreen during the exam.

    💻 Coding Interface: Dedicated text areas for writing code naturally.

    📊 Activity Dashboard: Teacher portal features "ANALYSE_ACTIVITÉ" charts for real-time monitoring.

    🖼️ Multimedia Support: Dynamically fetches diagrams and images from the FastAPI backend.

    💾 Auto-save: Local draft redundancy every 30 seconds to prevent data loss.

# File Structure

lesspaper/
├── backend/            # FastAPI Server & Database
│   ├── static/         # Uploaded exam images
│   └── main.py         # API Endpoints (Run with Uvicorn)
├── prof/               # Instructor Resources
│   └── profweb/        # React Web Portal (Frontend)
├── student/            # Student Application
│   ├── lesspaper.py    # Main UI & Logic
│   ├── anticheat.py    # Security Manager
│   └── submissions/    # Local auto-save drafts
└── requirements.txt    # Global dependencies

# Anti-Cheat Security (Kiosk Mode)

The anticheat.py module enforces academic integrity through:

    Native Fullscreen: Overrides window decorations to cover the entire screen.

    Topmost Window: Keeps the application above all other system windows.

    Focus Capture: Automatically re-claims focus if the student tries to switch apps.

    Close Prevention: Blocks exit commands like Alt+F4 until the exam is submitted.