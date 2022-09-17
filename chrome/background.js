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
        let s = await chrome.storage.sync.get(["user", "token", "notif_enable"])
        
        if (!s.notif_enable) {
            chrome.action.setBadgeText({text: ""})
            return
        }

        let token = s.token
        let user = s.user
        let resp = await fetchNotifs(user, token)
    
        if (resp.status == 401) {
            chrome.storage.sync.set({notif_enable: false, issue_connecting: 401})
            chrome.action.setBadgeText({text: "ERR"});
            return
        } else if (resp.status == 404) {
            chrome.storage.sync.set({notif_enable: false, issue_connecting: 404})
            chrome.action.setBadgeText({text: "ERR"});
            return
        }
    
        let parsed = resp.notifications
        let updated = new Map();
        let old = new Map();
        let n_old = 0
        let n_updated = 0
        last_checked = (await chrome.storage.sync.get(["last_checked"])).last_checked        
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
            chrome.action.setBadgeText({text: n_updated.toString()});
        } else {
            chrome.action.setBadgeText({text: ""});
        }
        
    }
}

async function setAlarm() {
    
    let check_delay = (await chrome.storage.sync.get(["check_delay"])).check_delay
    
    if (check_delay == "0") {
        return
    }

    chrome.alarms.create("check-notifications", {
        delayInMinutes: 0.05,
        periodInMinutes: parseFloat(check_delay)
    })
    
    chrome.alarms.onAlarm.addListener(browserAlarmListener)
}

setAlarm()
