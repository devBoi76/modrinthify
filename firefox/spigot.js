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
	return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
  }
  
function editDistance(s1, s2) {
s1 = s1.toLowerCase();
s2 = s2.toLowerCase();

var costs = new Array();
for (var i = 0; i <= s1.length; i++) {
	var lastValue = i;
	for (var j = 0; j <= s2.length; j++) {
	if (i == 0)
		costs[j] = j;
	else {
		if (j > 0) {
		var newValue = costs[j - 1];
		if (s1.charAt(i - 1) != s2.charAt(j - 1))
			newValue = Math.min(Math.min(newValue, lastValue),
			costs[j]) + 1;
		costs[j - 1] = lastValue;
		lastValue = newValue;
		}
	}
	}
	if (i > 0)
	costs[s2.length] = lastValue;
}
return costs[s2.length];
}

const svg = '<svg class="h-full absolute" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 777 141.73" aria-hidden="true" class="text-logo"><g><path d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z" transform="translate(-19.79)" fill="var(--color-brand)" fill-rule="evenodd"></path><path transform="translate(-19.79)" fill="var(--color-brand)" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path></g></svg>'

const HTML = `
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
`

const DONATE_HTML = `\
<a target="_blank" href="REDIRECT" class="" style="background-color: #FF5E5B;border-top-left-radius: 0;border-bottom-left-radius: 0;font-weight: 600;display: inline-flex;padding: 4px;font-weight: 600;box-sizing: border-box !important;color: white;width: fit-content;flex-grow: 0;height: 100%;text-decoration: none; padding-right: 10px;" data-tooltip="Support the Author"> <div style="display: inline-block;height: auto;width: 28px;"><img src="${browser.runtime.getURL("icons/kofilogo.png")}" style="height: 100%;"></div>Support the Author
</a>
`

const REGEX = /[\(\[](forge|fabric|forge\/fabric|fabric\/forge|unused|deprecated)[\)\]]/gmi
PLUGIN_PAGE_HTML = `<style>#modrinth-body {
    overflow: hidden;
    display: inline-block;
    height: 32px;
    color: black;
    box-sizing: border-box !important;
    vertical-align: middle;
    font-size: 18px;
    margin: 0.5rem 0;
    width: min-content;
    border-radius: 0.5rem;
    transition: background-color, 0.2s;
  }\
  #modrinth-body:hover {
    text-decoration: none;
    background: #FAFAFA;
  }</style> \
  <a id="modrinth-body" href="MR_HREF" target="_blank" class="" style="  "><div style="display: flex;/*! font-size: 18px; */box-sizing: border-box !important;width: max-content;height: 32px;"><img style="display:inline-block; box-sizing: border-box !important;flex-grow: 0;height: 100%;" src="MR_ICON"><div class="" style="display: inline-block;padding: 7px 0.5rem 7px !important;border-block: 1px solid #d9d9d9;padding: 0;font-weight: 600;line-height: 18px;box-sizing: border-box !important;flex-grow: 0;">MR_NAME</div><div class="" style="display: inline-flex;padding: 4px;font-weight: 600;box-sizing: border-box !important;background: #30B27B;color: white;width: fit-content;flex-grow: 0;height: 100%;"><div style="display: inline-block;height: auto;width: 32px;"><svg class="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 777 141.73" aria-hidden="true" style="fill: currentColor; height: 100%;"><g><path d="M159.07,89.29A70.94,70.94,0,1,0,20,63.52H32A58.78,58.78,0,0,1,145.23,49.93l-11.66,3.12a46.54,46.54,0,0,0-29-26.52l-2.15,12.13a34.31,34.31,0,0,1,2.77,63.26l3.19,11.9a46.52,46.52,0,0,0,28.33-49l11.62-3.1A57.94,57.94,0,0,1,147.27,85Z" transform="translate(-19.79)" fill="var(--color-brand)" fill-rule="evenodd"></path><path transform="translate(-19.79)" fill="var(--color-brand)" d="M108.92,139.3A70.93,70.93,0,0,1,19.79,76h12a59.48,59.48,0,0,0,1.78,9.91,58.73,58.73,0,0,0,3.63,9.91l10.68-6.41a46.58,46.58,0,0,1,44.72-65L90.43,36.54A34.38,34.38,0,0,0,57.36,79.75C57.67,80.88,58,82,58.43,83l13.66-8.19L68,63.93l12.9-13.25,16.31-3.51L101.9,53l-7.52,7.61-6.55,2.06-4.69,4.82,2.3,6.38s4.64,4.94,4.65,4.94l6.57-1.74,4.67-5.13,10.2-3.24,3,6.84L104.05,88.43,86.41,94l-7.92-8.81L64.7,93.48a34.44,34.44,0,0,0,28.72,11.59L96.61,117A46.6,46.6,0,0,1,54.13,99.83l-10.64,6.38a58.81,58.81,0,0,0,99.6-9.77l11.8,4.29A70.77,70.77,0,0,1,108.92,139.3Z"></path></g></svg></div>
  <div style="margin-right: 5px;">
Get on Modrinth
</div>
</div></div></a>`

const SEARCH_PAGE_HTML = `<a href="REDIRECT" target="_blank" class="box flex" style="overflow: hidden"><div>\
<img style="display:inline-block; height: 3rem" src="ICON_SOURCE">\
<div class="mx-2 font-bold" style="display: inline-block">MOD_NAME</div>\
<div style="display: inline-block">BUTTON_HTML</div></div></a>`

function main() {
    const api_facets = `facets=[["categories:'bukkit'","categories:'spigot'","categories:'paper'","categories:'purpur'","categories:'sponge'","categories:'bungeecord'","categories:'waterfall'","categories:'velocity'"],["project_type:mod"]]`
    
    const url = document.URL.split("/")

    let is_search = false
    let is_project_page = false
    if (url[3] == "search") {
        is_search = true
    } else if (url[3] == "resources") {
        is_project_page = true
    } else return

    let query = ""
    if (is_search) {
        query = document.querySelector(".titleBar > h1:nth-child(1)").textContent.match(/Search Results for Query: (.*)/)[1]
    
    } else if (is_project_page) {
        query = document.querySelector(".resourceInfo > h1:nth-child(3)").firstChild.textContent
    }

    fetch(`https://api.modrinth.com/v2/search?limit=3&query=${query}&${api_facets}`, {method: "GET", mode: "cors"})
        .then(response => response.json())
        .then(resp => {
            
            if (resp.hits.length == 0) {
                return
            }
            
            let max_sim = 0
            let max_hit = undefined
    
        for (const hit of resp.hits) {
            if (similarity(hit.title.trim(), query) > max_sim) {
                max_sim = similarity(hit.title.trim(), query)
                max_hit = hit
            }
        }
        if (max_sim <= 0.7) {
            return
        }

        if (is_search) {
			let s = document.querySelector("div.pageNavLinkGroup:nth-child(2)")
            let div = document.createElement("div")
            div.outerHTML = s.innerHTML = PLUGIN_PAGE_HTML
			.replace("MR_ICON", max_hit.icon_url)
			.replace("MR_NAME", max_hit.title.trim())
			.replace("MR_HREF", `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`)
			.replace("BUTTON_HTML", HTML) + s.innerHTML

			s.after(div)
			
		} else if (is_project_page) {
			let s = document.querySelector(".innerContent")

			s.innerHTML = PLUGIN_PAGE_HTML
			.replace("MR_ICON", max_hit.icon_url)
			.replace("MR_NAME", max_hit.title.trim())
			.replace("MR_HREF", `https://modrinth.com/${max_hit.project_type}/${max_hit.slug}`)
			.replace("BUTTON_HTML", HTML) + s.innerHTML
		}

        fetch(`https://api.modrinth.com/v2/project/${max_hit.slug}`, {method: "GET", mode: "cors"})
		.then(response_p => response_p.json())
		.then(resp_p => {
			if (resp_p.donation_urls.length > 0) {
                document.querySelector("#modrinth-body div").innerHTML += DONATE_HTML.replace("REDIRECT", resp_p.donation_urls[0].url)
				// if (!is_search) {
				// 	redir.parentNode.parentNode.parentNode.style.marginRight = "-150px"
				// }
			}
		})

           
    })


}

main()
