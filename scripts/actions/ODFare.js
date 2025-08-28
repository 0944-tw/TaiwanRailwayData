const fs = require("fs")
const zlib = require("zlib")
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

const ODFares_Folder = path.join(process.cwd(), "TRA", "ODFare")
module.exports = {
    name: "ODFare",
    action: async () => {
        var fileStream;
        const should_download = true || !(await fs.existsSync("ODFare.json.gz"))
        if (should_download) {
            console.log("Downloading")
            const res = await fetch("https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/ODFare", {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0"
                }
            });
            fileStream = fs.createWriteStream("ODFare.json.gz", { flags: 'wx' });
            await finished(Readable.fromWeb(res.body).pipe(fileStream));
        }
        const data = fs.readFileSync("ODFare.json.gz");
        const jsonStr = zlib.gunzipSync(data).toString();
        const obj = JSON.parse(jsonStr);
        const ODFares_len = obj.ODFares.length;
        console.log(`OFDares: ${obj.ODFares.length}`)
        for (let i = 0; i < ODFares_len; i++) {
            const ODFare = obj.ODFares[i];
            const OriginStationID = ODFare["OriginStationID"];
            const DestinationStationID = ODFare["DestinationStationID"]
            console.log(`Processing: ${OriginStationID}/${DestinationStationID}.json`)
            if (!(await fs.existsSync(path.join(ODFares_Folder, OriginStationID)))) await fs.mkdirSync(path.join(ODFares_Folder, OriginStationID))
            // 搞錯ㄌ if (!(await fs.existsSync(path.join(ODFares_Folder, OriginStationID,DestinationStationID)))) await fs.mkdirSync(path.join(ODFares_Folder, OriginStationID,DestinationStationID))
            // 超亂
            await fs.writeFileSync(path.join(ODFares_Folder, OriginStationID,`${DestinationStationID}.json`),JSON.stringify(ODFare));
            // 超美麗
            console.log(`Progress: ${i}/${ODFares_len}`)
        }
    }
}