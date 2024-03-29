#!/bin/python3
import shutil
import os

IN_FOLDER = "firefox"
OUT_FOLDER = "autogen_chrome"

OUT_ADDITIONS = "chrome.browserAction = chrome.action\n\n"

ff_path = os.getcwd() + "/" + IN_FOLDER
cr_path = os.getcwd() + "/chrome"
auto_cr_path = os.getcwd() + "/" + OUT_FOLDER

files = []

copy_files = []

# r=root, d=directories, f = files
for r, d, f in os.walk(ff_path):
    for file in f:
        if file.endswith(".js"):
            files.append(os.path.join(r, file))
        else:
            copy_files.append(os.path.join(r, file))

print("TRANSFORM JS\n")

for f in files:
    print("TRANSFORM", f)

    with open(f, "r") as ff_file:
        autogen_cr_filename = f.replace("firefox", OUT_FOLDER)
        os.makedirs(os.path.dirname(autogen_cr_filename), exist_ok=True)
        
        auto_cr_file = open(autogen_cr_filename, "w+")
        auto_cr_file.write(OUT_ADDITIONS)
        ff_text = ff_file.read()
        auto_cr_file.write(ff_text.replace("browser.", "chrome."))
        auto_cr_file.close()

print("\nCOPY SHARED\n")

for f in copy_files:
    print("COPY", f)
    autogen_cr_filename = f.replace("firefox", OUT_FOLDER)
    cr_filename = f.replace("firefox", "chrome")
    os.makedirs(os.path.dirname(autogen_cr_filename), exist_ok=True)
    print(f"cp {cr_filename} {autogen_cr_filename}")
    os.system(f"cp {cr_filename} {autogen_cr_filename}")

print("\nZIP EXTENSIONS\n")
print(f"{os.getcwd()}/firefox.zip")
shutil.make_archive(f"{os.getcwd()}/firefox", "zip", root_dir=f"{os.getcwd()}/firefox", base_dir=f"{os.getcwd()}/firefox")

print(f"{os.getcwd()}/chrome.zip")
shutil.make_archive(f"{os.getcwd()}/chrome", "zip", root_dir=f"{os.getcwd()}/autogen_chrome", base_dir=f"{os.getcwd()}/autogen_chrome")
