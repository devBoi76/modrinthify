chrome.browserAction = chrome.action

async function closeSettings() {
    document.querySelector(".error").style.display = "none"
    document.querySelector("#token").style.outline = "none"
    let do_close = await saveOptions()
    if (do_close) {
        changeTheme()
        // updateNotifs(false)
    }
}
function changeTheme() {

    chrome.storage.sync.get("theme").then((resp) => {
        document.querySelector("body").setAttribute("data-theme", resp.theme)
    })

}
async function saveOptions(e) {
    if (e) {
        e.preventDefault();
    }
    let form = document.querySelector("form")
    
    const data = new FormData(form)
    
    let theme = data.get("theme") || "auto"
    
    const notif_enable = data.get("notif-enable") == "on";
    const check_delay = data.get("notif-check-delay");
    
    const token = data.get("token").trim();
    // console.log(token)

    if (notif_enable == true && (token == "" || token == undefined)) {
        document.querySelector(".error").innerText = "Please fill out these fields to enable notifications"
        document.querySelector(".error").style.display = "block"
        document.querySelector("#token").style.outline = "4px solid #db316255"
        
        chrome.storage.sync.set({
            check_delay: check_delay,
            theme: theme,
            notif_enable: false,
            issue_connecting: 0,
        })

        return false
    } else if (notif_enable == false) {
        if (token == undefined) {
            token = ""
        }
        await chrome.storage.sync.set({
            token: token
        })
    }

    let old_token = await chrome.storage.sync.get("token")
    // console.log(old_token, '"', token)

    if (old_token.token != token && notif_enable == true) {

        let close_icon = document.querySelector("#close-icon svg")
        close_icon.classList = "spinning"
        let h = new Headers({
            "Authorization": token,
            "User-Agent": `devBoi76/modrinthify/${chrome.runtime.getManifest().version}`
        })

        let resp = await fetch(API_BASE+"/user", {
            headers: h
        })
        close_icon.classList = ""
        if (resp.status == 401) {
            document.querySelector(".error").innerText = "Invalid authorization token"
            document.querySelector(".error").style.display = "block"
            document.querySelector("#token").style.outline = "4px solid #db316255"

            chrome.storage.sync.set({
                check_delay: check_delay,
                theme: theme,
                notif_enable: false,
                issue_connecting: 0,
            })
            return false
        }
        
        let resp_json = await resp.json()
        chrome.storage.sync.set({
            token: token,
            user: resp_json.username
        })
    }
    
    await chrome.storage.sync.set({
        check_delay: check_delay,
        theme: theme,
        notif_enable: notif_enable,
        issue_connecting: 0,
    })
    document.querySelector(".error").style.display = "none"
    return true
}

async function restoreSettings() {
    // document.querySelector("#settings").style.display = "block"
    // document.querySelector("#main").style.display = "none"

    let a = await chrome.storage.sync.get(["token", "user", "notif_enable", "issue_connecting", "theme", "check_delay"])
    
    document.querySelector("#notif-enable").checked = a.notif_enable || false;
    document.querySelector("#token").value = a.token || "";

    a.theme = a.theme || "auto"
    document.querySelector(`#${a.theme}-theme`).checked = "on"
    document.querySelector("#notif-check-delay").value = a.check_delay || 5

    if (a.issue_connecting != 0) {
        if (a.issue_connecting == 401) {
            document.querySelector(".error").innerText = "There has been an issue connecting to Modrinth:\nError 401 Unauthorized\n(Invalid token)"
            document.querySelector(".error").style.display = "block"
            document.querySelector("#token").style.outline = "4px solid #db316255"
        }
        else if (a.issue_connecting == 404) {
            document.querySelector(".error").innerText = "There has been an issue connecting to Modrinth:\nError 404 User not found\n(Invalid token)"
            document.querySelector(".error").style.display = "block"
    
        }
    }
    
}

document.querySelector("#close-icon").addEventListener("click", closeSettings);
document.querySelector("form").addEventListener("submit", saveOptions);
document.addEventListener("DOMContentLoaded", restoreSettings)

changeTheme();