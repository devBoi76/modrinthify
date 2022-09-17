// import * as common from "/common"

const API_BASE = "https://api.modrinth.com/v2/user/"
const LINK_BASE = "https://modrinth.com"

const MINUTE = 60 * 1000
const HOUR = 3600 * 1000
const DAY = 86400 * 1000

let global_user = ""
let global_auth_token = ""

const N_VERSIONS = 3;

const version_regex = /The project, .*, has released a new version: (.*)/m

function timeStringForUnix(unix) {
    if (unix > DAY) {
        time_string = Math.round(unix/DAY) + "d"
    } else if (unix > HOUR) {
        time_string = Math.round(unix/HOUR) + "h"
    } else if (unix > MINUTE) {
        time_string = Math.round(unix/MINUTE) + "m"
    } else {
        time_string = Math.round(unix/1000) + "s"
    }
    return time_string
}

async function fetchNotifs(user, token) {
    let resp = await fetch(API_BASE+user+"/notifications", {
        headers: {
            Authorization: token 
        }
    })

    if (resp.status != 200) {
        return {
            status: resp.status,
            notifications: undefined
        }
    }
    let json = await resp.json()
    return {
        status: 200,
        notifications: json,
    }
}

async function toggleSeeOld() {
    let hideable = document.querySelectorAll(".notification.hideable")

    let n_old = document.querySelectorAll(".notification.hideable .version").length
    
    this.setAttribute("is_expanded",!(this.getAttribute("is_expanded") == "true"))

    if (this.getAttribute("is_expanded") == "true") {
        for (const el of hideable) {
            el.style.display = "block"
        }
        this.innerText = "- Less"
    } else {
        for (const el of hideable) {
            el.style.display = "none"
        }
        this.innerText = `+${n_old} Old`
    }
}

function toggleExpandNotif() {
    let hideable = this.parentElement.querySelectorAll(".version.hideable")
    
    this.setAttribute("is_expanded",!(this.getAttribute("is_expanded") == "true"))

    if (this.getAttribute("is_expanded") == "true") {
        for (const el of hideable) {
            el.style.display = "block"
        }
        this.innerText = "- Less"
    } else {
        for (const el of hideable) {
            el.style.display = "none"
        }
        this.innerText = `+${hideable.length} More`
    }
}

async function updateNotifs(ignore_last_checked) {
    ignore_last_checked == ignore_last_checked || false
    
    let notif_enable = (await chrome.storage.sync.get("notif_enable")).notif_enable
    let last_status = (await chrome.storage.sync.get(["issue_connecting"])).issue_connecting
    
    // "Notifications disabled"

    if (document.querySelector("#notif-enable-popup")) {
        document.querySelector("#notif-enable-popup").remove()
    }

    if (!notif_enable) {
        document.querySelectorAll("#notifications *").forEach((el) => 
        {
            if (el.id != "up-to-date-notif") {
                el.remove()
            }
        })
        let notif_enable_popup = document.createElement("div")
        notif_enable_popup.classList = "notification"
        notif_enable_popup.id = "notif-enable-popup"
        notif_enable_popup.innerHTML = `<div class="header"><h4>Notifications are disabled</h4><p>Go to settings to enable them</p></div>`
        document.querySelector("#notifications").appendChild(notif_enable_popup)
        chrome.action.setBadgeText({text: ""});
        return
    }

    if(last_status != 0) {
        document.querySelectorAll("#notifications *").forEach((el) => 
        {
            if (el.id != "up-to-date-notif") {
                el.remove()
            }
        })
        restoreSettings()
        return;
    }
    
    document.querySelector("#refresh-icon-a").classList = "spinning"

    global_user = (await chrome.storage.sync.get("user")).user
    
    global_auth_token = (await chrome.storage.sync.get("token")).token
    let resp = await fetchNotifs(global_user, global_auth_token)

    if (resp.status == 401) {
        chrome.storage.sync.set({issue_connecting: 401})
        chrome.action.setBadgeText({text: "ERR"});
        document.querySelector("#refresh-icon-a").classList = ""
        restoreSettings()
        return
    } else if (resp.status == 404) {
        chrome.storage.sync.set({issue_connecting: 404})
        chrome.action.setBadgeText({text: "ERR"});
        document.querySelector("#refresh-icon-a").classList = ""
        restoreSettings()
        return
    }

    let parsed = resp.notifications


    let updated = new Map();
    let old = new Map();
    let n_old = 0
    let n_updated = 0

    for (let i = 0; i < parsed.length; i++) {
        let el = parsed[i]
        let last_checked = (await chrome.storage.sync.get(["last_checked"])).last_checked
        if ((last_checked > Date.parse(el.created))) {
            let a = old.get(el.title) || []
            a.push(el)
            old.set(el.title, a)
            n_old += 1
        } else {
            let a = updated.get(el.title) || []
            a.push(el)
            updated.set(el.title, a)
            n_updated += 1
        }
    }

    if (n_updated > 0) {
        chrome.action.setBadgeText({text: n_updated.toString()});
    } else {
        chrome.action.setBadgeText({text: ""});
    }
    // Do this here to minimize blank time
    document.querySelectorAll("#notifications *").forEach((el) => 
    {
        if (el.id != "up-to-date-notif") {
            el.remove()
        }
    })

    updated.forEach( (val, key) => {
        let notification = document.createElement("div")
        notification.className = "notification"
        
        let s = ""
        if (val.length > 1) {s = "s"}

        notification.innerHTML = `<div class="header"><h4>${key.replaceAll("**", "")}</h4><p>${val.length} new version${s}:</p></div>`
        
        document.querySelector("#notifications").appendChild(notification);
        let i = 0
        for (const notif of val) {
            i++
            let version = document.createElement("a")
            version.className = "version"
            if (i > N_VERSIONS) {
                version.classList = "version hideable"
            }
            version.href = LINK_BASE + notif.link
            version.target = "_blank"

            let time_passed = Date.now() - Date.parse(notif.created)
            
            let time_string = timeStringForUnix(time_passed)
            
            version.setAttribute("after_text", time_string)

            version.innerText = notif.text.match(version_regex)[1]
            notification.appendChild(version);
        }
        if (i > N_VERSIONS) {
            let more = document.createElement("p")
            more.classList = "more"
            more.setAttribute("is_expanded", false)
            more.addEventListener("click", toggleExpandNotif)
            more.innerText = `+${i - N_VERSIONS} More`
            notification.appendChild(more)
        }
    })

    if (n_old > 0) {
        if (document.querySelector("#up-to-date-notif")) {
            document.querySelector("#up-to-date-notif").remove()
        }
        let old_separator = document.createElement("hr")
        document.querySelector("#notifications").appendChild(old_separator)
        let up_to_date = document.createElement("div")
        up_to_date.classList = "notification"
        up_to_date.id = "up-to-date-notif"
        up_to_date.innerHTML = `<div class="header"><h4>See older notifications</h4></div><p id="more-old" class="more">+${n_old} Old</p>`
        document.querySelector("#notifications").appendChild(up_to_date)
        document.querySelector("#more-old").addEventListener("click", toggleSeeOld)

        // Place hidden old notifs
        old.forEach( (val, key) => {
            let notification = document.createElement("div")
            notification.classList = "notification hideable"
            
            let s = ""
            if (val.length > 1) {s = "s"}

            notification.innerHTML = `<div class="header"><h4>${key.replaceAll("**", "")}</h4><p>${val.length} new version${s}:</p></div>`
            
            document.querySelector("#notifications").appendChild(notification);
            let i = 0
            for (const notif of val) {
                i++
                let version = document.createElement("a")
                version.className = "version"
                if (i > N_VERSIONS) {
                    version.classList = "version hideable"
                }
                version.href = LINK_BASE + notif.link
                version.target = "_blank"

                let time_passed = Date.now() - Date.parse(notif.created)
                
                let time_string = timeStringForUnix(time_passed)
                
                version.setAttribute("after_text", time_string)

                version.innerText = notif.text.match(version_regex)[1]
                notification.appendChild(version);
            }
            if (i > N_VERSIONS) {
                let more = document.createElement("p")
                more.classList = "more"
                more.setAttribute("is_expanded", false)
                more.addEventListener("click", toggleExpandNotif)
                more.innerText = `+${i - N_VERSIONS} More`
                notification.appendChild(more)
            }
        })
    }
    document.querySelector("#refresh-icon-a").classList = ""
}

// return whether the settings page should close after saving
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
    const user = data.get("user").trim();
    

    if (notif_enable == true && (user == "" || user == undefined || token == "" || token == undefined)) {
        document.querySelector(".error").innerText = "Please fill out these fields to enable notifications"
        document.querySelector(".error").style.display = "block"

        if (user == "" || user == undefined) {
            document.querySelector("#user").style.outline = "4px solid #db316255"
        } 
        if (token == "" || token == undefined) {
            document.querySelector("#token").style.outline = "4px solid #db316255"
        }
        
        chrome.storage.sync.set({
            check_delay: check_delay,
            theme: theme,
            notif_enable: false,
            issue_connecting: 0,
            token: token,
            user: user
        })

        return false
    }

    chrome.storage.sync.set({
        check_delay: check_delay,
        theme: theme,
        notif_enable: notif_enable,
        issue_connecting: 0,
        token: token,
        user: user
    })

    global_user = user
    global_auth_token = token
    document.querySelector(".error").style.display = "none"
    return true
}

async function restoreSettings() {
    document.querySelector("#settings").style.display = "block"
    document.querySelector("#main").style.display = "none"

    let a = await chrome.storage.sync.get(["token", "user", "notif_enable", "issue_connecting", "theme", "check_delay"])
    
    document.querySelector("#notif-enable").checked = a.notif_enable || false;
    document.querySelector("#token").value = a.token || "";
    document.querySelector("#user").value = a.user || "";
    a.theme = a.theme || "auto"
    document.querySelector(`#${a.theme}-theme`).checked = "on"
    document.querySelector("#notif-check-delay").value = a.check_delay || 5

    if (a.issue_connecting != 0) {
        if (a.issue_connecting == 401) {
            document.querySelector(".error").innerText = "There has been an issue connecting to Modrinth:\nError 401 Unauthorized\n(Wrong token)"
            document.querySelector(".error").style.display = "block"
            document.querySelector("#token").style.outline = "4px solid #db316255"
        }
        else if (a.issue_connecting == 404) {
            document.querySelector(".error").innerText = "There has been an issue connecting to Modrinth:\nError 404 User not found"
            document.querySelector(".error").style.display = "block"
            document.querySelector("#user").style.outline = "4px solid #db316255"
        }
    }
    
}

async function closeSettings() {
    document.querySelector(".error").style.display = "none"
    document.querySelector("#token").style.outline = "none"
    document.querySelector("#user").style.outline    = "none"
    let do_close = await saveOptions()
    if (do_close) {
        document.querySelector("#main").style.display = "block"
        document.querySelector("#settings").style.display = "none"
        changeTheme()
        updateNotifs(false)
    }
}

async function updateLastChecked() {
    // unix = Date.parse("2022-09-14T17:47:55.165Z")
    unix = Date.now();
    chrome.storage.sync.set({
        last_checked: unix
    })
    updateNotifs(false)
}

function updateNotifsNoVar() {
    updateNotifs(false)
}

async function getLastChecked() {
    let a = await chrome.storage.sync.get(["last_checked"]).last_checked
    return a
}
document.querySelector("#settings-icon").addEventListener("click", restoreSettings);
document.querySelector("#close-icon").addEventListener("click", closeSettings);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#refresh-icon-a").addEventListener("click", updateNotifsNoVar)
document.querySelector("#icon-clear-a").addEventListener("click",     updateLastChecked
)
document.addEventListener("DOMContentLoaded", updateNotifsNoVar)

function changeTheme() {

    chrome.storage.sync.get("theme").then((resp) => {
        document.querySelector("body").setAttribute("data-theme", resp.theme)
    })

}
changeTheme()