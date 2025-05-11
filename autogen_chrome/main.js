chrome.browserAction = chrome.action

function htmlToElements(html) {
    var t = document.createElement("template");
    t.innerHTML = html;
    return t.content;
}

function similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
        longer = s2;
        shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
        return 1.0;
    }
    return (
        (longerLength - editDistance(longer, shorter)) /
        parseFloat(longerLength)
    );
}

function editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
        var lastValue = i;
        for (var j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    var newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue =
                            Math.min(Math.min(newValue, lastValue), costs[j]) +
                            1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

const new_design_button =
    '<a id="modrinth-body" href="REDIRECT" target="_blank" style="overflow: hidden; margin-top: -1px; display: flex" > <style>#modrinth-body:hover {background-color: #4d4d4d;}#modrinth-body{background-color: #333; height: 36px; text-decoration: none; font-weight: 600; font-family: sans-serif; color: #e5e5e5; --mr-green: #30b27b; transition: background-color 0.15s ease;}#modrinth-body > div{display: flex; align-items: center;}#modrinthify-redirect{display: flex; height: 100%; align-items: center; background-color: var(--mr-green); font-weight: 600; padding-inline: 0.5rem; white-space: nowrap;}#modrinthify-redirect > svg{height: 30px; margin-right: 0.5rem; fill: #e5e5e5;}</style> <div> <img style="display: inline-block; height: 36px; width: 36px" src="ICON_SOURCE"/> <div style="display: inline-block; margin-inline: 1rem; font-weight: 600; white-space: nowrap;" > MOD_NAME </div><div id="modrinthify-redirect" data-tooltip="Get on Modrinth" > <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 141.73 141.73" aria-hidden="true" > <g> <path d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z" transform="translate(-19.79)" fill-rule="evenodd" ></path> <path transform="translate(-19.79)" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z" ></path> </g> </svg> Get on Modrinth </div></div></a>';

const new_design_donation = `<a id="donate-button" target="_blank" href="REDIRECT" data-tooltip="Support the Author" > <style>#donate-button{background-color: #ff5e5b; font-weight: 600; text-decoration: none; display: flex; align-items: center; padding-right: 0.5rem;}#donate-button img{height: 100%; width: 36px;}</style> <img src=${chrome.runtime.getURL("icons/kofilogo.png")}> Support the Author </a>`;

const svg =
    '<svg class="h-full absolute" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 777 141.73" aria-hidden="true" class="text-logo"><g><path d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z" transform="translate(-19.79)" fill="var(--color-brand)" fill-rule="evenodd"></path><path transform="translate(-19.79)" fill="var(--color-brand)" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path></g></svg>';

const HTML = ` \
<div id="modrinthify-redirect" class="button" style="background-color: #30B27B;\
border-top-right-radius: 0;\
border-bottom-right-radius: 0;\
font-weight: 600;"\
 data-tooltip="Get on Modrinth">\
<figure class="icon icon-margin relative w-5 h-4" >\
${svg}
</figure> \
Get on Modrinth\
</div>  \
`;

const DONATE_HTML = `\
<a target="_blank" href="REDIRECT" class="button" style="background-color: #FF5E5B;\
border-top-left-radius: 0;\
border-bottom-left-radius: 0;\
font-weight: 600;"\
data-tooltip="Support the Author"> \
<figure class="icon icon-margin relative w-5 h-4" >\
<img src=${chrome.runtime.getURL("icons/kofilogo.png")}>\
</figure>\
Support the Author
</a> \
`;

const REGEX =
    /[\(\[](forge|fabric|forge\/fabric|fabric\/forge|unused|deprecated)[\)\]]/gim;

const MOD_PAGE_HTML = `<a id="modrinth-body" href="REDIRECT" target="_blank" class="box flex" style="overflow: hidden; height: max-content; margin-top: -1px; display:flex;"><div>\
<img style="display:inline-block; height: 3rem" src="ICON_SOURCE">\
<div class="mx-2 font-bold" style="display: inline-block; margin-inline: 1rem; font-weight: 600;">MOD_NAME</div>\
<div style="display: inline-block">BUTTON_HTML</div></div></a>`;

const SEARCH_PAGE_HTML = `<a href="REDIRECT" target="_blank" class="box flex" style="overflow: hidden"><div>\
<img style="display:inline-block; height: 3rem" src="ICON_SOURCE">\
<div class="mx-2 font-bold" style="display: inline-block">MOD_NAME</div>\
<div style="display: inline-block">BUTTON_HTML</div></div></a>`;

let query = "head title";
const tab_title = document.querySelector(query).innerText;
let mod_name = undefined;
let mod_name_noloader = undefined;
let page = undefined;

function main() {
    const url = document.URL.split("/");
    page = url[4];

    const is_new_design = !document.hostname.startsWith("old.curseforge.com");

    const is_search = is_new_design
        ? url[4].split("?")[0] == "search"
        : url[5].startsWith("search") && url[5].split("?").length >= 2;

    if (is_search) {
        if (is_new_design) {
            search_query = document.querySelector(".search-input-field").value;
        } else {
            search_query = document
                .querySelector(".mt-6 > h2:nth-child(1)")
                .textContent.match(/Search results for '(.*)'/)[1];
        }
    } else {
        if (is_new_design) {
            // search_query = document.querySelector(".project-header > h1:nth-child(2)").innerText
            search_query = document.title.split(" - Minecraft ")[0];
        } else {
            search_query = document
                .querySelector("head meta[property='og:title']")
                .getAttribute("content");
        }
    }

    mod_name = search_query;
    mod_name_noloader = mod_name.replace(REGEX, "");

    if (is_search && is_new_design) {
        page_re = /.*&class=(.*?)&.*/;
        page = (page.match(page_re) || ["", "all"])[1];
    }

    api_facets = "";
    switch (page) {
        //=Mods===============
        case "mc-mods":
            api_facets = `facets=[["categories:'forge'","categories:'fabric'","categories:'quilt'","categories:'liteloader'","categories:'modloader'","categories:'rift'"],["project_type:mod"]]`;
            break;
        //=Server=Plugins=====
        case "mc-addons":
            return;
        case "customization":
            api_facets = `facets=[["project_type:shader"]]`;
            break;
        case "bukkit-plugins":
            api_facets = `facets=[["categories:'bukkit'","categories:'spigot'","categories:'paper'","categories:'purpur'","categories:'sponge'","categories:'bungeecord'","categories:'waterfall'","categories:'velocity'"],["project_type:mod"]]`;
            break;
        //=Resource=Packs=====
        case "texture-packs":
            api_facets = `facets=[["project_type:resourcepack"]]`;
            break;
        //=Modpacks===========
        case "modpacks":
            api_facets = `facets=[["project_type:modpack"]]`;
            break;
        case "all":
            api_facets = ``;
            break;
    }

    fetch(
        `https://api.modrinth.com/v2/search?limit=3&query=${mod_name_noloader}&${api_facets}`,
        { method: "GET", mode: "cors" },
    )
        .then((response) => response.json())
        .then((resp) => {
            let bd = document.querySelector("#modrinth-body");
            if (bd) {
                bd.remove();
            }

            if (page == undefined) {
                return;
            }

            if (resp.hits.length == 0) {
                return;
            }

            let max_sim = 0;
            let max_hit = undefined;

            for (const hit of resp.hits) {
                if (similarity(hit.title.trim(), mod_name) > max_sim) {
                    max_sim = similarity(hit.title.trim(), mod_name.trim());
                    max_hit = hit;
                }
                if (similarity(hit.title.trim(), mod_name_noloader) > max_sim) {
                    max_sim = similarity(
                        hit.title.trim(),
                        mod_name_noloader.trim(),
                    );
                    max_hit = hit;
                }
            }

            if (max_sim <= 0.7) {
                return;
            }
            // Add the buttons

            if (is_search) {
                if (is_new_design) {
                    // query = ".results-count"
                    query = ".search-tags";
                    let s = document.querySelector(query);
                    let buttonElement = htmlToElements(
                        new_design_button
                            .replace("ICON_SOURCE", max_hit.icon_url)
                            .replace("MOD_NAME", max_hit.title.trim())
                            .replace(
                                "REDIRECT",
                                `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`,
                            )
                            .replace("BUTTON_HTML", HTML),
                    );
                    buttonElement.childNodes[0].style.marginLeft = "auto";
                    s.appendChild(buttonElement);
                } else {
                    query = ".mt-6 > div:nth-child(3)";
                    let s = document.querySelector(query);
                    let buttonElement = htmlToElements(
                        SEARCH_PAGE_HTML.replace(
                            "ICON_SOURCE",
                            max_hit.icon_url,
                        )
                            .replace("MOD_NAME", max_hit.title.trim())
                            .replace(
                                "REDIRECT",
                                `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`,
                            )
                            .replace("BUTTON_HTML", HTML),
                    );
                    s.appendChild(buttonElement);
                }
            } else {
                if (is_new_design) {
                    query = ".actions";
                    let s = document.querySelector(query);
                    let buttonElement = htmlToElements(
                        new_design_button
                            .replace("ICON_SOURCE", max_hit.icon_url)
                            .replace("MOD_NAME", max_hit.title.trim())
                            .replace(
                                "REDIRECT",
                                `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`,
                            ),
                    );
                    s.appendChild(buttonElement);
                } else {
                    query = "div.-mx-1:nth-child(1)";
                    let s = document.querySelector(query);
                    let buttonElement = htmlToElements(
                        MOD_PAGE_HTML.replace("ICON_SOURCE", max_hit.icon_url)
                            .replace("MOD_NAME", max_hit.title.trim())
                            .replace(
                                "REDIRECT",
                                `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`,
                            )
                            .replace("BUTTON_HTML", HTML),
                    );
                    s.appendChild(buttonElement);
                }
            }
            // Add donation button if present
            fetch(`https://api.modrinth.com/v2/project/${max_hit.slug}`, {
                method: "GET",
                mode: "cors",
            })
                .then((response_p) => response_p.json())
                .then((resp_p) => {
                    if (document.querySelector("#donate-button")) {
                        return;
                    }
                    if (resp_p.donation_urls.length > 0) {
                        let redir = document.getElementById("modrinth-body");

                        if (is_new_design) {
                            redir.innerHTML += new_design_donation.replace(
                                "REDIRECT",
                                resp_p.donation_urls[0].url,
                            );
                            if (is_search) {
                                redir.style.marginRight = "-195.5px";
                            } else {
                                redir.style.marginRight = "-195.5px";
                            }
                        } else {
                            let donations = resp_p.donation_urls;
                            let dbutton = document.createElement("div");
                            dbutton.innerHTML = DONATE_HTML.replace(
                                "REDIRECT",
                                donations[0].url,
                            );
                            dbutton.style.display = "inline-block";
                            let redir = document.getElementById(
                                "modrinthify-redirect",
                            );
                            redir.after(dbutton);
                            if (!is_search) {
                                redir.parentNode.parentNode.parentNode.style.marginRight =
                                    "-150px";
                            }
                        }
                    }
                });
        });
}

main();

// document.querySelector(".classes-list").childNodes.forEach( (el) => {
// 	el.childNodes[0].addEventListener("click", main)
// })

let lastURL = document.URL;
new MutationObserver(() => {
    let url = document.URL;
    if (url != lastURL) {
        lastURL = url;
        main();
    }
}).observe(document, { subtree: true, childList: true });

// document.querySelector(".search-input-field").addEventListener("keydown", (event) => {
// 	if (event.key == "Enter") {
// 		main()
// 	}
// })
