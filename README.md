# LessPaper - Modern Student Exam Application

A beautiful, modern GUI application for taking exams with multiple choice questions (QCM) and coding questions, built with CustomTkinter.

## Features

- 🎨 **Modern UI**: Beautiful CustomTkinter interface with light theme
- 📝 **QCM Questions**: Multiple choice questions with radio buttons
- 💻 **Coding Questions**: Text areas for programming answers
- 💾 **Auto-save**: Automatic saving every 30 seconds with visual feedback
- 📊 **Timestamped Submissions**: Final submissions saved with timestamps
- 🛡️ **Error Handling**: Robust file operations with user-friendly error messages

## Requirements

- Python 3.7+
- CustomTkinter 5.2.0+

## Installation

1. **Install dependencies:**
   ```bash
   ./install_dependencies.sh
   ```
   Or manually:
   ```bash
   pip install customtkinter
   ```


2. **Ensure questions file exists:**
   The application expects a `questions.json` file in the same directory with the following format:
   ```json
   {
     "qcm": [
       {
         "id": "q1",
         "question": "What is 2+2?",
         "options": ["3", "4", "5", "6"]
       }
     ],
     "coding": [
       {
         "id": "c1",
         "description": "Write a function that adds two numbers"
       }
     ]
   }
   ```

## Usage

1. **Run the application:**
   ```bash
   python student/lesspaper.py
   ```

2. **Enter your student ID** and click "Start Exam"

3. **Answer the questions:**
   - Select options for QCM questions using radio buttons
   - Write code in the text areas for programming questions

4. **Auto-save status** is shown at the bottom (green checkmark when saved)

5. **Submit** when finished - your answers will be saved with a timestamp

## File Structure

- `student/lesspaper.py` - Main application
- `submissions/` - Auto-created folder for student submissions
- `questions.json` - Question definitions (you need to create this)
- `requirements.txt` - Python dependencies
- `install_dependencies.sh` - Installation script


1. **Screen Size Geometry**: Sets window geometry to match screen dimensions (`{width}x{height}+0+0`)
2. **Fullscreen Attribute**: Uses `root.attributes("-fullscreen", True)` for native fullscreen support
3. **Topmost Window**: Keeps window on top with `attributes("-topmost", True)`
4. **Focus Enforcement**: Forces window focus with `focus_force()` to prevent alt-tabbing
5. **Periodic Reinforcement**: Every 5 seconds, fullscreen state is re-applied to combat window manager interference

This approach ensures the application works reliably on:
- **Ubuntu (GNOME/KDE)**: Handles window manager quirks that may resist fullscreen
- **Windows**: Native fullscreen support with additional safety measures
- **Other Linux Desktops**: Fallback geometry ensures screen coverage

## Student Submissions

- Auto-saves are stored as `submissions/{student_id}/autosave.json`
- Final submissions are stored as `submissions/{student_id}/soumission_{timestamp}.json`

## Customization

The appearance and behavior can be customized in the code:

### Customization
- **Theme**: Change `ctk.set_default_color_theme("blue")` to "green" or "dark-blue"
- **Mode**: Change `ctk.set_appearance_mode("light")` to "dark" or "system"
- **Colors**: Modify button colors and other UI elements
- **Auto-save interval**: Change `INTERVALLE_AUTOSAVE = 30`

## License

This project is open source and available under the MIT License.
