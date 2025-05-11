chrome.browserAction = chrome.action

const API_BASE = "https://api.modrinth.com/v2/user/";

async function fetchNotifs(user, token) {
    let h = new Headers({
        Authorization: token,
        "User-Agent": `devBoi76/modrinthify/${chrome.runtime.getManifest().version}`,
    });
    let resp = await fetch(API_BASE + user + "/notifications", {
        headers: h,
    });

    if (resp.status != 200) {
        return {
            status: resp.status,
            notifications: undefined,
        };
    }
    let json = await resp.json();
    return {
        status: 200,
        notifications: json,
    };
}

async function browserAlarmListener(e) {
    if (e.name == "check-notifications") {
        let s = await chrome.storage.sync.get([
            "user",
            "token",
            "notif_enable",
        ]);

        if (!s.notif_enable) {
            chrome.browserAction.setBadgeText({ text: "" });
            return;
        }

        let token = s.token;
        let user = s.user;
        let resp = await fetchNotifs(user, token);

        if (resp.status == 401) {
            chrome.storage.sync.set({
                notif_enable: false,
                issue_connecting: 401,
            });
            chrome.browserAction.setBadgeText({ text: "ERR" });
            return;
        } else if (resp.status == 404) {
            chrome.storage.sync.set({
                notif_enable: false,
                issue_connecting: 404,
            });
            chrome.browserAction.setBadgeText({ text: "ERR" });
            return;
        }

        let parsed = resp.notifications;
        let n_old = 0;
        let n_updated = 0;
        last_checked = (await chrome.storage.sync.get(["last_checked"]))
            .last_checked;
        for (let i = 0; i < parsed.length; i++) {
            let el = parsed[i];
            let date_created =
                el.body.type == "legacy_markdown"
                    ? el.created
                    : el.date_published;
            if (last_checked > Date.parse(date_created)) {
                n_old += 1;
            } else {
                n_updated += 1;
            }
        }

        if (n_updated > 0) {
            chrome.browserAction.setBadgeText({ text: n_updated.toString() });
        } else {
            chrome.browserAction.setBadgeText({ text: "" });
        }
    }
}

async function setAlarm() {
    let check_delay = parseFloat(
        (await chrome.storage.sync.get(["check_delay"])).check_delay || 10,
    );

    if (check_delay == 0) {
        return;
    }

    chrome.alarms.create("check-notifications", {
        delayInMinutes: 0.05,
        periodInMinutes: parseFloat(check_delay),
    });

    chrome.alarms.onAlarm.addListener(browserAlarmListener);
}

setAlarm();
