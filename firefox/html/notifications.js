const API_BASE = "https://api.modrinth.com/v2";
const LINK_BASE = "https://modrinth.com";

const MINUTE = 60 * 1000;
const HOUR = 3600 * 1000;
const DAY = 86400 * 1000;

const N_VERSIONS = 3;

const version_regex = /The project,? .*,? has released a new version: (.*)/m;

function timeStringForUnix(unix) {
    if (unix > DAY) {
        time_string = Math.round(unix / DAY) + "d";
    } else if (unix > HOUR) {
        time_string = Math.round(unix / HOUR) + "h";
    } else if (unix > MINUTE) {
        time_string = Math.round(unix / MINUTE) + "m";
    } else {
        time_string = Math.round(unix / 1000) + "s";
    }
    return time_string;
}

async function fetchNotifs(user, token) {
    let h = new Headers({
        Authorization: token,
        "User-Agent": `devBoi76/modrinthify/${browser.runtime.getManifest().version}`,
    });
    let resp = await fetch(API_BASE + "/user/" + user + "/notifications", {
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

async function toggleSeeOld() {
    let hideable = document.querySelectorAll(".notification.hideable");

    let n_old = document.querySelectorAll(
        ".notification.hideable .version",
    ).length;

    this.setAttribute(
        "is_expanded",
        !(this.getAttribute("is_expanded") == "true"),
    );

    if (this.getAttribute("is_expanded") == "true") {
        for (const el of hideable) {
            el.style.display = "block";
        }
        this.innerText = "- Less";
    } else {
        for (const el of hideable) {
            el.style.display = "none";
        }
        this.innerText = `+${n_old} Old`;
    }
}

function toggleExpandNotif() {
    let hideable = this.parentElement.querySelectorAll(".version.hideable");

    this.setAttribute(
        "is_expanded",
        !(this.getAttribute("is_expanded") == "true"),
    );

    if (this.getAttribute("is_expanded") == "true") {
        for (const el of hideable) {
            el.style.display = "flex";
        }
        this.innerText = "- Less";
    } else {
        for (const el of hideable) {
            el.style.display = "none";
        }
        this.innerText = `+${hideable.length} More`;
    }
}

function build_notification(
    auth_token,
    project_info,
    versions_info,
    isOldType,
    startHidden = false,
) {
    let notification = document.createElement("div");
    notification.className = "notification";

    let s = "";
    let s1 = (versions_info || []).length;
    let badge_t = (versions_info || []).length;
    if (versions_info && versions_info.length > 1) {
        s = "s";
    } else if (versions_info == null) {
        s = "s: ∞";
        s1 = "Too many! ";
        badge_t = "∞";
    }

    if (versions_info == null) {
    }

    const title = isOldType
        ? project_info.replaceAll("**", "")
        : project_info.title + " has been updated!";

    notification.innerHTML = `<div class="header"><h4>${title}</h4> \
    <p>${s1} new version${s}:</p><div class="clear-all-button">Clear</div></div>`;
    notification.setAttribute("data-notification-count", badge_t);

    document.querySelector("#notifications").appendChild(notification);
    if (versions_info == null) return;

    let version_ids = [];

    let i = 0;
    for (const v of versions_info) {
        i++;
        let version = document.createElement("div");
        version.className = "version";
        if (i > N_VERSIONS) {
            version.classList = "version hideable";
        }
        let version_link = document.createElement("a");
        version_link.className = "version-link";

        const link = isOldType
            ? v.link
            : `/mod/${v.project_id}/version/${v.id}`;
        version_link.href = LINK_BASE + link;
        version_link.target = "_blank";

        const version_number = isOldType
            ? v.text.match(version_regex)[1]
            : v.version_number;
        version_link.innerText = version_number;
        version.appendChild(version_link);
        version.setAttribute("data-notification-id", v.id);
        version_ids.push(v.id);

        let clear_hitbox = document.createElement("div");
        clear_hitbox.className = "clear-hitbox";
        clear_hitbox.innerText = "Clear";

        version.appendChild(clear_hitbox);
        clear_hitbox.addEventListener("click", async (ev) => {
            let el = ev.currentTarget;
            el.parentElement.classList.add("being-cleared");
            let h = new Headers({
                Authorization: auth_token,
                "User-Agent": `devBoi76/modrinthify/${browser.runtime.getManifest().version}`,
            });
            let resp = await fetch(
                API_BASE +
                    `/notification/${el.parentElement.getAttribute("data-notification-id")}`,
                {
                    headers: h,
                    method: "DELETE",
                },
            );
            if (resp.status == 204) {
                let notification_el = el.parentElement.parentElement;
                let n_left = parseInt(
                    notification_el.getAttribute("data-notification-count"),
                );
                if (n_left - 1 > N_VERSIONS) {
                    let to_display = notification_el.querySelector(".hideable");
                    to_display.classList.remove("hideable");

                    let more_button = notification_el.querySelector(".more");
                    let mb_is_closed =
                        more_button.getAttribute("is_expanded") == "false";

                    // Update "more" text
                    if (mb_is_closed) {
                        more_button.innerText = `+${n_left - N_VERSIONS - 1} More`;
                    }

                    notification_el.setAttribute(
                        "data-notification-count",
                        n_left - 1,
                    );
                    el.parentElement.remove();
                } else if (n_left - 1 == 0) {
                    notification_el.remove();
                } else {
                    el.parentElement.remove();
                }
            } else {
                el.parentElement.classList.remove("being-cleared");
            }
        });

        const date_published = isOldType ? v.created : v.date_published;
        let time_passed = Date.now() - Date.parse(date_published);

        let time_string = timeStringForUnix(time_passed);

        version.setAttribute("after_text", time_string);
        if (startHidden) {
            notification.classList.add("hideable");
        }
        notification.appendChild(version);
        notification
            .querySelector(".clear-all-button")
            .addEventListener("click", async (ev) => {
                let query_string = '["' + version_ids.join('","') + '"]';
                let h = new Headers({
                    Authorization: auth_token,
                    "User-Agent": `devBoi76/modrinthify/${browser.runtime.getManifest().version}`,
                });
                let notif = ev.currentTarget.parentElement.parentElement;
                notif.classList.add("being-cleared");

                let resp = await fetch(
                    API_BASE + `/notifications?ids=` + query_string,
                    {
                        headers: h,
                        method: "DELETE",
                    },
                );
                if (resp.status == 204) {
                    notif.remove();
                }
            });
    }
    if (i > N_VERSIONS) {
        let more = document.createElement("p");
        more.classList = "more";
        more.setAttribute("is_expanded", false);
        more.addEventListener("click", toggleExpandNotif);
        more.innerText = `+${i - N_VERSIONS} More`;
        notification.appendChild(more);
    }
}

async function updateNotifs(ignore_last_checked) {
    ignore_last_checked == ignore_last_checked || false;

    let notif_enable = (await browser.storage.sync.get("notif_enable"))
        .notif_enable;
    let last_status = (await browser.storage.sync.get(["issue_connecting"]))
        .issue_connecting;

    // "Notifications disabled"

    if (document.querySelector("#notif-enable-popup")) {
        document.querySelector("#notif-enable-popup").remove();
    }

    if (!notif_enable) {
        document.querySelectorAll("#notifications *").forEach((el) => {
            if (el.id != "up-to-date-notif") {
                el.remove();
            }
        });
        let notif_enable_popup = document.createElement("div");
        notif_enable_popup.classList = "notification";
        notif_enable_popup.id = "notif-enable-popup";
        notif_enable_popup.innerHTML = `<div class="header"><h4>Notifications are disabled</h4><p>Go to settings to enable them</p></div>`;
        document
            .querySelector("#notifications")
            .appendChild(notif_enable_popup);
        browser.browserAction.setBadgeText({ text: "" });
        return;
    }

    if (last_status != 0) {
        document.querySelectorAll("#notifications *").forEach((el) => {
            if (el.id != "up-to-date-notif") {
                el.remove();
            }
        });
        restoreSettings();
        return;
    }

    document.querySelector("#refresh-icon-a").classList = "spinning";

    let global_user = (await browser.storage.sync.get("user")).user;

    let global_auth_token = (await browser.storage.sync.get("token")).token;
    let resp = await fetchNotifs(global_user, global_auth_token);

    if (resp.status == 401) {
        browser.storage.sync.set({ issue_connecting: 401 });
        browser.browserAction.setBadgeText({ text: "ERR" });
        document.querySelector("#refresh-icon-a").classList = "";
        restoreSettings();
        return;
    } else if (resp.status == 404) {
        browser.storage.sync.set({ issue_connecting: 404 });
        browser.browserAction.setBadgeText({ text: "ERR" });
        document.querySelector("#refresh-icon-a").classList = "";
        restoreSettings();
        return;
    }

    let parsed = resp.notifications;

    // New notification type logic

    // To mass fetch version strings
    let version_ids = new Array();
    let project_ids = new Set();

    let notif_ids = new Array();

    for (let i = 0; i < parsed.length; i++) {
        notif = parsed[i];
        if (notif.body) {
            if (notif.body.type != "project_update") {
                continue;
            }

            version_ids.push(notif.body.version_id);
            project_ids.add(notif.body.project_id);
            notif_ids.push(notif.id);
        }
    }

    // fetch titles and add notifications

    // NOTE: Project and version result has the same order as the query parameters

    let pids_query = '["' + Array.from(project_ids).join('","') + '"]';
    let verids_query = '["' + version_ids.join('","') + '"]';
    pro_json = fetch(API_BASE + "/projects?ids=" + pids_query).then(
        (response) => {
            return response.json();
        },
    );
    ver_json = fetch(API_BASE + "/versions?ids=" + verids_query).then(
        (response) => {
            if (response.ok == false) return null;
            return response.json();
        },
    );

    let result = await Promise.all([pro_json, ver_json]);
    let projects = result[0];
    projects.sort((a, b) => {
        unixA = Date.parse(a.updated);
        unixB = Date.parse(b.updated);
        if (unixA > unixB) {
            return -1;
        } else {
            return 1;
        }
    });
    let versions = result[1];

    // Map project_id => [version_info]
    let project_id_to_version_info = new Map();
    for (let i = 0; i < (versions || []).length; i++) {
        let v = versions[i];
        let a = project_id_to_version_info.get(v.project_id) || [];
        a.push(v);
        project_id_to_version_info.set(v.project_id, a);
    }
    // Map project_id => project_info
    let project_id_to_project_info = new Map();
    for (let i = 0; i < projects.length; i++) {
        project_id_to_project_info[projects[i].id] = projects[i];
    }

    // Old notification type logic

    let updated = new Map();
    let old = new Map();
    let n_old = 0;
    let n_updated = 0;

    for (let i = 0; i < parsed.length; i++) {
        let el = parsed[i];
        let last_checked = (await browser.storage.sync.get(["last_checked"]))
            .last_checked;
        let created_date =
            el.body.type == "legacy_markdown" ? el.created : el.date_published;
        notif_ids.push(el.id);
        if (last_checked > Date.parse(created_date)) {
            if (el.body.type == "legacy_markdown") {
                let a = old.get(el.title) || [];
                a.push(el);
                old.set(el.title, a);
            }
            n_old += 1;
        } else {
            if (el.body.type == "legacy_markdown") {
                let a = updated.get(el.title) || [];
                a.push(el);
                updated.set(el.title, a);
            }
            n_updated += 1;
        }
    }
    // end

    // Update "Clear all" button with new IDs
    let cback = async (ev) => {
        let query_string = '["' + notif_ids.join('","') + '"]';
        let h = new Headers({
            Authorization: global_auth_token,
            "User-Agent": `devBoi76/modrinthify/${browser.runtime.getManifest().version}`,
        });
        let resp = await fetch(
            API_BASE + `/notifications?ids=` + query_string,
            {
                headers: h,
                method: "DELETE",
            },
        );
        document
            .querySelectorAll(".notification")
            .forEach((el) => el.classList.add("being-cleared"));
        if (resp.status == 204) {
            document
                .querySelectorAll(".notification")
                .forEach((el) => el.remove());
            updateNotifs(false);
        } else {
            document
                .querySelectorAll(".notification")
                .forEach((el) => el.classList.remove("being-cleared"));
        }
    };
    document.querySelector("#icon-clear-a").removeEventListener("click", cback);
    document.querySelector("#icon-clear-a").addEventListener("click", cback);

    if (document.querySelector("#no-notifs")) {
        document.querySelector("#no-notifs").remove();
    }

    if (n_updated > 0) {
        browser.browserAction.setBadgeText({ text: n_updated.toString() });
    }
    if (n_updated == 0 && n_old == 0) {
        let no_notifs = document.createElement("div");
        no_notifs.classList = "notification";
        no_notifs.id = "no-notifs";
        no_notifs.innerHTML = `<div class="header"><h4>No new notifications</h4></div>`;
        document.querySelector("#notifications").appendChild(no_notifs);
        browser.browserAction.setBadgeText({ text: "" });

        document.querySelector("#refresh-icon-a").classList = "";
        return;
    }
    // Do this here to minimize blank time
    document.querySelectorAll("#notifications *").forEach((el) => {
        if (el.id != "up-to-date-notif") {
            el.remove();
        }
    });

    if (versions == null) {
        warning = document.createElement("h1");
        warning.innerHTML =
            "Clear your notifications! The modrinth API has reached an internal limit and has returned an invalid response.";
        warning.style = "color: red; font-weight: 900;";
        document.querySelector("#notifications").appendChild(warning);
    }

    for (project_info of projects) {
        build_notification(
            global_auth_token,
            project_info,
            project_id_to_version_info.get(project_info.id),
            false,
            false,
        );
    }

    updated.forEach((new_vers, title) => {
        build_notification(global_auth_token, title, new_vers, true, false);
    });

    if (n_old > 0) {
        if (document.querySelector("#up-to-date-notif")) {
            document.querySelector("#up-to-date-notif").remove();
        }
        let old_separator = document.createElement("hr");
        document.querySelector("#notifications").appendChild(old_separator);
        let up_to_date = document.createElement("div");
        up_to_date.classList = "notification";
        up_to_date.id = "up-to-date-notif";
        up_to_date.innerHTML = `<div class="header"><h4>See older notifications</h4></div><p id="more-old" class="more">+${n_old} Old</p>`;
        document.querySelector("#notifications").appendChild(up_to_date);
        document
            .querySelector("#more-old")
            .addEventListener("click", toggleSeeOld);

        // Place hidden old notifs
        old.forEach((new_vers, title) => {
            build_notification(global_auth_token, title, new_vers, true, true);
        });
    }
    document.querySelector("#refresh-icon-a").classList = "";
}

async function saveOptions(e) {
    if (e) {
        e.preventDefault();
    }
    let form = document.querySelector("form");

    const data = new FormData(form);

    let theme = data.get("theme") || "auto";

    const notif_enable = data.get("notif-enable") == "on";
    const check_delay = data.get("notif-check-delay");

    const token = data.get("token").trim();

    if (notif_enable == true && (token == "" || token == undefined)) {
        document.querySelector(".error").innerText =
            "Please fill out these fields to enable notifications";
        document.querySelector(".error").style.display = "block";
        document.querySelector("#token").style.outline = "4px solid #db316255";

        browser.storage.sync.set({
            check_delay: check_delay,
            theme: theme,
            notif_enable: false,
            issue_connecting: 0,
        });

        return false;
    } else if (notif_enable == false) {
        if (token == undefined) {
            token = "";
        }
        await browser.storage.sync.set({
            token: token,
        });
    }

    let old_token = await browser.storage.sync.get("token");

    if (old_token.token != token && notif_enable == true) {
        let close_icon = document.querySelector("#close-icon svg");
        close_icon.classList = "spinning";
        let h = new Headers({
            Authorization: token,
            "User-Agent": `devBoi76/modrinthify/${browser.runtime.getManifest().version}`,
        });

        let resp = await fetch(API_BASE + "/user", {
            headers: h,
        });
        close_icon.classList = "";
        if (resp.status == 401) {
            document.querySelector(".error").innerText =
                "Invalid API authorization token";
            document.querySelector(".error").style.display = "block";
            document.querySelector("#token").style.outline =
                "4px solid #db316255";

            browser.storage.sync.set({
                check_delay: check_delay,
                theme: theme,
                notif_enable: false,
                issue_connecting: 0,
            });
            return false;
        }

        let resp_json = await resp.json();
        browser.storage.sync.set({
            token: token,
            user: resp_json.username,
        });
    }

    await browser.storage.sync.set({
        check_delay: check_delay,
        theme: theme,
        notif_enable: notif_enable,
        issue_connecting: 0,
    });
    document.querySelector(".error").style.display = "none";
    return true;
}

async function restoreSettings() {
    document.querySelector("#settings").style.display = "block";
    document.querySelector("#main").style.display = "none";

    let a = await browser.storage.sync.get([
        "token",
        "user",
        "notif_enable",
        "issue_connecting",
        "theme",
        "check_delay",
    ]);

    document.querySelector("#notif-enable").checked = a.notif_enable || false;
    document.querySelector("#token").value = a.token || "";

    a.theme = a.theme || "auto";
    document.querySelector(`#${a.theme}-theme`).checked = "on";
    document.querySelector("#notif-check-delay").value = a.check_delay || 10;

    if (a.issue_connecting != 0) {
        if (a.issue_connecting == 401) {
            document.querySelector(".error").innerText =
                "There has been an issue connecting to Modrinth:\nError 401 Unauthorized\n(Invalid token)";
            document.querySelector(".error").style.display = "block";
            document.querySelector("#token").style.outline =
                "4px solid #db316255";
        } else if (a.issue_connecting == 404) {
            document.querySelector(".error").innerText =
                "There has been an issue connecting to Modrinth:\nError 404 User not found\n(Invalid token)";
            document.querySelector(".error").style.display = "block";
        }
    }
}

async function closeSettings() {
    document.querySelector(".error").style.display = "none";
    document.querySelector("#token").style.outline = "none";
    let do_close = await saveOptions();
    if (do_close) {
        document.querySelector("#main").style.display = "block";
        document.querySelector("#settings").style.display = "none";
        changeTheme();
        updateNotifs(false);
    }
}

async function updateLastChecked() {
    // Remove notifications
    unix = Date.now();
    browser.storage.sync.set({
        last_checked: unix,
    });
    updateNotifs(false);
}

function updateNotifsNoVar() {
    updateNotifs(false);
}

async function getLastChecked() {
    let a = await browser.storage.sync.get(["last_checked"]).last_checked;
    return a;
}
document
    .querySelector("#settings-icon")
    .addEventListener("click", restoreSettings);
document.querySelector("#close-icon").addEventListener("click", closeSettings);
document.querySelector("form").addEventListener("submit", saveOptions);
document
    .querySelector("#refresh-icon-a")
    .addEventListener("click", updateNotifsNoVar);
// document.querySelector("#icon-clear-a").addEventListener("click",     updateLastChecked)
document.addEventListener("DOMContentLoaded", updateNotifsNoVar);

function changeTheme() {
    browser.storage.sync.get("theme").then((resp) => {
        document.querySelector("body").setAttribute("data-theme", resp.theme);
    });
}
changeTheme();
