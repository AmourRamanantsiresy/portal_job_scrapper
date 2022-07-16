const express = require("express");
const axios = require('axios');
const { load } = require('cheerio');
const cors = require("cors")
const app = express();

app.use(express.json())
app.use(cors());

app.get("/:id", (req, response) => {
    try {
        const id = parseInt(req.params.id)
        const urls = `https://www.portaljob-madagascar.com/emploi/liste/secteur/informatique-web/page/${id}`;
        axios.get(urls)
            .then(res => {
                const $ = load(res.data);
                const data = {
                    "last_page": getLastPage($),
                    "information": get_Information($, ".item_annonce")
                };
                response.status(200).json(data);
            });
    } catch {
        response.send("Verify you network")
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is started")
})

//get the last page
function getLastPage($) {
    const result = $(".pagination>ul>li");
    return parseInt($($(result[result.length - 1]).children()).html());
}

//get all information by PortalJob
function get_Information($, selector) {
    let temp = []
    $(selector).each((k, e) => {
        let html = load($(e).html())
        const data = {
            "title": get_Title(html),
            "href": get_Link(html),
            "company": get_Company(html),
            "contract": get_Contract(html),
            "description": get_Description(html),
            "limit_date": get_Date(html)
        }
        temp.push(data);
    });
    return temp;
}

// getters
const get_Link = $ => $(".contenu_annonce>h3>a").attr().href;

const get_Title = $ => $(".contenu_annonce>h3>a>strong").html().trim();

const get_Company = $ => $(".contenu_annonce>h4").html().trim();

const get_Contract = $ => $(".contenu_annonce>h5").html().trim();

const get_Description = $ => $(".contenu_annonce>.description").html().trim();

const get_Date = $ => $($(".contenu_annonce>div>b").children()).html();
