const API_BASE = "https://api.modrinth.com/v2/user/"

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


async function browserAlarmListener(e) {
    if (e.name == "check-notifications") {
        let s = await browser.storage.sync.get(["user", "token", "notif_enable"])

        if (!s.notif_enable) {
            chrome.browserAction.setBadgeText({text: ""})
            return
        }

        let token = s.token
        let user = s.user
        let resp = await fetchNotifs(user, token)

        if (resp.status == 401) {
            browser.storage.sync.set({notif_enable: false, issue_connecting: 401})
            browser.browserAction.setBadgeText({text: "ERR"});
            return
        } else if (resp.status == 404) {
            browser.storage.sync.set({notif_enable: false, issue_connecting: 404})
            browser.browserAction.setBadgeText({text: "ERR"});
            return
        }

        let parsed = resp.notifications
        let updated = new Map();
        let old = new Map();
        let n_old = 0
        let n_updated = 0
        last_checked = (await browser.storage.sync.get(["last_checked"])).last_checked        
        for (let i = 0; i < parsed.length; i++) {
            let el = parsed[i]
            
            if (last_checked > Date.parse(el.created)) {
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
            browser.browserAction.setBadgeText({text: n_updated.toString()});
        } else {
            browser.browserAction.setBadgeText({text: ""});
        }
        
    }
    console.log("bg")
}

async function setAlarm() {
    
    let check_delay = (await browser.storage.sync.get(["check_delay"])).check_delay
    
    if (check_delay == "0") {
        return
    }

    browser.alarms.create("check-notifications", {
        delayInMinutes: 0.05,
        periodInMinutes: parseFloat(check_delay)
    })
    
    browser.alarms.onAlarm.addListener(browserAlarmListener)
}

setAlarm()
