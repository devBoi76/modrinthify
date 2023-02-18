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

for f in files:
    print(f)

    with open(f, "r") as ff_file:
        autogen_cr_filename = f.replace("firefox", OUT_FOLDER)
        os.makedirs(os.path.dirname(autogen_cr_filename), exist_ok=True)
        auto_cr_file = open(autogen_cr_filename, "w+")
        
        auto_cr_file.write(OUT_ADDITIONS)
        ff_text = ff_file.read()
        auto_cr_file.write(ff_text.replace("browser.", "chrome."))
        auto_cr_file.close()

for f in copy_files:
    print("COPY", f)
    autogen_cr_filename = f.replace("firefox", OUT_FOLDER)
    cr_filename = f.replace("firefox", "chrome")
    os.makedirs(os.path.dirname(autogen_cr_filename), exist_ok=True)
    os.system(f"cp {cr_filename} {autogen_cr_filename}")
