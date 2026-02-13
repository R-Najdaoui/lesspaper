#!/usr/bin/env python3

import customtkinter as ctk

# Set appearance before creating window
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")
ctk.set_widget_scaling(1.0)
ctk.set_window_scaling(1.0)

# Create window
root = ctk.CTk()
root.title("Test")

# Create a simple label
label = ctk.CTkLabel(root, text="CustomTkinter is working!")
label.pack(pady=20)


root.attributes("-fullscreen", True)
root.update()

print("CustomTkinter test window created successfully")
print("Press Ctrl+C to exit")

root.mainloop()


