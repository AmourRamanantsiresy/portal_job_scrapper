const express = require("express");
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require("cors")
const app = express();

app.use(express.json())
app.use(cors());

app.get("/:id", (req, response) => {
    try {
        const id = parseInt(req.params.id)
        const urls = `https://www.portaljob-madagascar.com/emploi/liste${id === 1 ? "" : "/page/" + id}`;
        axios.get(urls)
            .then(res => {
                const $ = cheerio.load(res.data);
                const data = [getLastPage($)];
                $(".item_annonce").each((k, e) => {
                    const temp = [];
                    $(e).children().each((k2, e1) => {
                        if (k2 != 0) {
                            $(e1).each((k, e2) => {
                                $(e2).children().each((k, e3) => {
                                    temp.push($(e3).html().trim().replaceAll("\n", "").replaceAll('"', "'"));
                                })
                            })
                        }
                    })
                    data.push(temp);
                });
                response.status(200).json(data);
            });
    } catch {
        response.send("Verify you network")
    }
})

app.listen(8080, () => {
    console.log("Server is started")
})

//get the last page
function getLastPage($) {
    const result = $(".pagination>ul>li");
    return parseInt($($(result[result.length - 1]).children()).html());
}