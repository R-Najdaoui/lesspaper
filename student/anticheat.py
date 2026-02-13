import customtkinter as ctk
from tkinter import messagebox

class AntiCheatManager:
    def __init__(self, root: ctk.CTk):
        self.root = root
        self.is_locked = False

    def enable_kiosk_mode(self):
        """Active le mode verrouillé complet."""
        self.is_locked = True
        
        # Plein écran et toujours au premier plan
        self.root.attributes("-fullscreen", True)
        self.root.attributes("-topmost", True)
        
        # Bloquer le protocole de fermeture (Alt+F4 / Bouton X)
        self.root.protocol("WM_DELETE_WINDOW", self._prevent_close)
        
        # Sécurités contre la perte de focus
        self.root.bind("<FocusOut>", self._on_focus_loss)
        self.root.bind("<Unmap>", lambda e: self.root.deiconify()) # Empêche de minimiser

    def disable_kiosk_mode(self):
        """Désactive le mode verrouillé (pour la fin de l'examen)."""
        self.is_locked = False
        self.root.attributes("-fullscreen", False)
        self.root.attributes("-topmost", False)

    def _prevent_close(self):
        if self.is_locked:
            messagebox.showwarning("Anti-Triche", "Action interdite pendant l'examen.")

    def _on_focus_loss(self, event):
        if self.is_locked:
            # Force le retour au premier plan après un court délai
            self.root.after(10, self.root.focus_force)