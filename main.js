const fetch = require('node-fetch');
const fs = require('fs');

const fetchIPDetails = async (ip) => {
    try {
        let data = await fetch("http://ip-api.com/json/" + ip);
        let body = await data.text()
        body = JSON.parse(body)
        return {
            error: false,
            data: body,
        }
    } catch (e) {
        return {
            error: true,
            e,
        }
    }
};

const readIPfile = () => {
    try {
        let payload = fs.readFileSync("IP_VISITS", {encoding: "utf-8"})
        return payload.split("\n")
    } catch (e) {
        console.log(e)
    }
};

async function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}


let listOfIPs = readIPfile();

(async () => {
    listOfIPs.forEach( (value, index) => {
        // Rate limited because of API request rate limiter
        var interval = 4000;
    setTimeout(async function (value) {
        if (value == "0.0.0.0") {
            console.log(value, "host")
        } else if ( value.slice(0,3) == "127") {
            console.log("local")
        } else {
            let data = await fetchIPDetails(value);
            if (data.error) {
                //console.log(data.e)
                console.log(`Error while fetching details for ${value}`)
            } else {
                let ipDetails = data.data;
                let line = (`ISP ${ipDetails.isp} Org: ${ipDetails.org} As: ${ipDetails.as}, query: ${ipDetails.query}, country: ${ipDetails.country}, ${ipDetails.city}/${ipDetails.regionName}\n`)
                fs.appendFileSync("INFO.txt", line)
                console.log(line)
            }
        }
    }, interval * index, value);
    })

})()