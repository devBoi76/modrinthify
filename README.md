# modrinthify

When looking at Minecraft mods, modpacks, plugins and resource packs on curseforge.com, Modrinthify automatically searches modrinth.com for the mod and shows you a redirect button if it finds it. If you click on that button you will be taken to the project's Modrinth project page

The extension will also show the creator's donation page whenever present

The extension is available for [firefox](https://addons.mozilla.org/en-US/firefox/addon/modrinthify/), [chrome](https://chrome.google.com/webstore/detail/modrinthify/gjjlcbppchpjacimpkjhoancdbdmpcoc) and [as a userscript](https://greasyfork.org/en/scripts/445993-modrinthify), [spigot userscript](https://greasyfork.org/en/scripts/451067-modrinthify-spigot)

![image](https://user-images.githubusercontent.com/77896685/173103271-b4d7d5a5-ce3e-4bd2-96e7-ec8e124a9f81.png)
![image](https://user-images.githubusercontent.com/77896685/173103340-aefd345d-fdee-4fa3-9dfa-92f458a35a34.png)
![image](https://user-images.githubusercontent.com/77896685/173103357-f2915565-a198-438e-8c68-582fe583f11a.png)
![image](https://user-images.githubusercontent.com/77896685/188920913-2f04db54-2fcd-408a-803b-9ebc9cdeb033.png)

Redirects on spigotmc.org:

![image](https://user-images.githubusercontent.com/77896685/189420503-ba50a9d4-69f4-4772-8f50-7530b84f014d.png)

As of version 1.5 the extension also has Modrinth notifications integration!
*note: this works only on firefox and chrome, not with userscripts*

![ext_popup_firefox](https://user-images.githubusercontent.com/77896685/190860461-d2ed396e-3b11-4e61-bc1f-1c3f6bb9b2d2.png)
![ext_popup_chrome](https://user-images.githubusercontent.com/77896685/190860463-91f1db9d-e8cf-4fd0-a46d-641ceb78d721.png)

---


The source code is split into 4 folders, `firefox`, `chrome`, `chrome_autogen` and `greasyfork`, each of them contains the source code used for the platform

The `chrome` folder contains non-javascript files that can't be easily converted from the firefox version
The `chrome_autogen` folder is the output folder for `convert_chrome.py`, which automatically converts firefox javascript files to be compatible with chrome

Feel free to post any issues or suggestions you might have on the issues page

The chrome web store listing might update with a slight delay because of their long review times
