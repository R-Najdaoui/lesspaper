import json
import os
import requests
from datetime import datetime
from typing import Dict, List, Any
from PIL import Image
from io import BytesIO
import customtkinter as ctk
from tkinter import messagebox

from anticheat import AntiCheatManager

class ExamApplication:
    # --- Configuration Style ---
    COLOR_PRIMARY = "#10b981"  # Vert Émeraude
    COLOR_DANGER = "#ef4444"   # Rouge
    COLOR_BG = "#f9fafb"      # Gris ultra léger
    COLOR_CARD = "#ffffff"    # Blanc
    FONT_MAIN = "Inter"

    API_URL = "http://localhost:8000"
    DOSSIER_SAUVEGARDE = "submissions"
    INTERVALLE_AUTOSAVE = 30

    def __init__(self) -> None:
        ctk.set_appearance_mode("light")
        
        os.makedirs(self.DOSSIER_SAUVEGARDE, exist_ok=True)

        self.root = ctk.CTk()
        self.root.title("LessPaper | Espace Étudiant")
        
        # --- INITIALISATION ANTI-TRICHE ---
        self.anticheat = AntiCheatManager(self.root)
        
        self.root.geometry("1000x900")
        self.root.configure(fg_color=self.COLOR_BG)

        # État
        self.student_id = ""
        self.exam_code = ""
        self.questions = {"qcm": [], "coding": [], "short": []}
        self.qcm_vars: Dict[str, ctk.StringVar] = {}
        self.code_texts: Dict[str, ctk.CTkTextbox] = {}
        self.image_refs = []

        self._create_login_frame()
        
        # Frame de l'examen (cachée au début)
        self.exam_container = ctk.CTkFrame(self.root, fg_color=self.COLOR_BG)
        self.exam_scroll = ctk.CTkScrollableFrame(self.exam_container, fg_color=self.COLOR_BG, width=900, height=800)

    def _create_login_frame(self) -> None:
        """Fenêtre de connexion au style épuré."""
        self.login_frame = ctk.CTkFrame(self.root, fg_color=self.COLOR_CARD, corner_radius=15, border_width=1, border_color="#e5e7eb")
        self.login_frame.place(relx=0.5, rely=0.5, anchor="center", relwidth=0.4, relheight=0.5)

        ctk.CTkLabel(self.login_frame, text="LessPaper", font=(self.FONT_MAIN, 32, "bold"), text_color=self.COLOR_PRIMARY).pack(pady=(40, 5))
        ctk.CTkLabel(self.login_frame, text="Espace Étudiant", font=(self.FONT_MAIN, 16), text_color="#6b7280").pack(pady=(0, 30))

        self.student_id_entry = self._create_styled_input(self.login_frame, "Identifiant Étudiant")
        self.exam_code_entry = self._create_styled_input(self.login_frame, "Code de l'Examen")

        ctk.CTkButton(
            self.login_frame, text="Rejoindre l'examen", 
            command=self._start_exam, 
            fg_color=self.COLOR_PRIMARY, hover_color="#059669",
            font=(self.FONT_MAIN, 14, "bold"), height=45, corner_radius=8
        ).pack(pady=40, padx=40, fill="x")

    def _create_styled_input(self, parent, label_text):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(pady=10, padx=40, fill="x")
        ctk.CTkLabel(frame, text=label_text, font=(self.FONT_MAIN, 12, "bold"), text_color="#374151").pack(anchor="w")
        entry = ctk.CTkEntry(frame, placeholder_text=label_text, height=40, corner_radius=8, border_color="#d1d5db", fg_color="#ffffff")
        entry.pack(fill="x", pady=5)
        return entry

    def _start_exam(self) -> None:
        self.student_id = self.student_id_entry.get().strip()
        self.exam_code = self.exam_code_entry.get().strip()

        if not self.student_id or not self.exam_code:
            messagebox.showerror("Champs vides", "Veuillez remplir vos identifiants.")
            return

        try:
            response = requests.get(f"{self.API_URL}/api/exam/{self.exam_code}")
            if response.status_code == 200:
                exam_data = response.json()
                all_q = exam_data.get("questions", [])
                self.questions["qcm"] = [q for q in all_q if q["question_type"] == "MCQ"]
                self.questions["coding"] = [q for q in all_q if q["question_type"] in ["CODE", "SHORT"]]

                self.login_frame.destroy()
                
                # --- ACTIVATION ANTI-TRICHE ---
                self.anticheat.enable_kiosk_mode()
                
                self._show_exam_interface()
            else:
                messagebox.showerror("Erreur", "Code examen invalide.")
        except Exception as e:
            messagebox.showerror("Erreur Serveur", "Impossible de contacter le serveur.")

    def _show_exam_interface(self) -> None:
        self.exam_container.pack(fill="both", expand=True)

        header = ctk.CTkFrame(self.exam_container, fg_color=self.COLOR_CARD, height=70, corner_radius=0, border_width=1, border_color="#e5e7eb")
        header.pack(fill="x", side="top")
        
        ctk.CTkLabel(header, text=f"Examen: {self.exam_code}", font=(self.FONT_MAIN, 18, "bold")).pack(side="left", padx=30)
        ctk.CTkLabel(header, text=f"Étudiant: {self.student_id}", font=(self.FONT_MAIN, 14), text_color="#6b7280").pack(side="left", padx=20)
        
        self.status_label = ctk.CTkLabel(header, text="Auto-save: OK", text_color=self.COLOR_PRIMARY, font=(self.FONT_MAIN, 12, "bold"))
        self.status_label.pack(side="right", padx=30)

        self.exam_scroll.pack(fill="both", expand=True, padx=50, pady=20)

        for q in self.questions["qcm"]:
            self._render_question_card(q, is_qcm=True)
        for q in self.questions["coding"]:
            self._render_question_card(q, is_qcm=False)

        ctk.CTkButton(
            self.exam_scroll, text="TERMINER ET ENVOYER LA COPIE", 
            command=self._submit_exam, 
            fg_color=self.COLOR_PRIMARY, height=60, font=(self.FONT_MAIN, 16, "bold")
        ).pack(pady=50, padx=100, fill="x")

        self._auto_save()

    def _render_question_card(self, q: Dict, is_qcm: bool):
        card = ctk.CTkFrame(self.exam_scroll, fg_color=self.COLOR_CARD, corner_radius=12, border_width=1, border_color="#e5e7eb")
        card.pack(fill="x", pady=15, padx=10)

        ctk.CTkLabel(card, text=q["text"], font=(self.FONT_MAIN, 15, "bold"), wraplength=800, justify="left", text_color="#1f2937").pack(anchor="w", padx=25, pady=(20, 10))

        raw_path = q.get("image_url")
        if raw_path:
            full_url = raw_path if raw_path.startswith("http") else f"{self.API_URL}/{raw_path}"
            try:
                res = requests.get(full_url, timeout=3)
                if res.status_code == 200:
                    img = Image.open(BytesIO(res.content))
                    w, h = img.size
                    display_w = 600
                    display_h = int(display_w * (h / w))
                    ctk_img = ctk.CTkImage(light_image=img, size=(display_w, display_h))
                    lbl = ctk.CTkLabel(card, image=ctk_img, text="")
                    lbl.pack(pady=10)
                    self.image_refs.append(ctk_img)
            except: pass

        if is_qcm:
            var = ctk.StringVar(value="Non répondu")
            self.qcm_vars[str(q["id"])] = var
            try:
                opts = json.loads(q["options_json"])
                for o in opts:
                    txt = o.get("text") if isinstance(o, dict) else o
                    ctk.CTkRadioButton(card, text=str(txt), variable=var, value=str(txt), hover_color=self.COLOR_PRIMARY, fg_color=self.COLOR_PRIMARY, font=(self.FONT_MAIN, 13)).pack(anchor="w", padx=40, pady=5)
            except: pass
        else:
            txt = ctk.CTkTextbox(card, height=150, corner_radius=8, border_width=1, border_color="#d1d5db", fg_color="#fcfcfc")
            txt.pack(fill="x", padx=25, pady=(5, 25))
            self.code_texts[str(q["id"])] = txt

    def _auto_save(self):
        try:
            folder = os.path.join(self.DOSSIER_SAUVEGARDE, self.student_id)
            os.makedirs(folder, exist_ok=True)
            data = {
                "qcm": {qid: v.get() for qid, v in self.qcm_vars.items()},
                "open": {qid: t.get("0.0", "end").strip() for qid, t in self.code_texts.items()}
            }
            with open(os.path.join(folder, "draft.json"), "w") as f:
                json.dump(data, f)
            self.status_label.configure(text="Sauvegarde auto: ✓", text_color=self.COLOR_PRIMARY)
        except: pass
        self.root.after(self.INTERVALLE_AUTOSAVE * 1000, self._auto_save)

    def _submit_exam(self):
        if not messagebox.askyesno("Fin de l'examen", "Voulez-vous envoyer votre copie ?"): return
        
        answers = []
        for qid, v in self.qcm_vars.items(): answers.append({"question_id": int(qid), "answer_text": v.get()})
        for qid, t in self.code_texts.items(): answers.append({"question_id": int(qid), "answer_text": t.get("0.0", "end").strip()})

        try:
            res = requests.post(f"{self.API_URL}/api/submit", params={"exam_code": self.exam_code}, json={"student_name": self.student_id, "answers": answers})
            if res.status_code == 200:
                # --- DÉSACTIVATION ANTI-TRICHE AVANT FERMETURE ---
                self.anticheat.disable_kiosk_mode()
                messagebox.showinfo("Succès", "Copie envoyée !")
                self.root.destroy()
        except: messagebox.showerror("Erreur", "Serveur injoignable.")

    def run(self): self.root.mainloop()

if __name__ == "__main__":
    ExamApplication().run()