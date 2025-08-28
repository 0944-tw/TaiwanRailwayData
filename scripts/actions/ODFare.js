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
        const should_download = true ?? !(await fs.existsSync("ODFare.json.gz"))
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
            const JSON_PATH = path.join(ODFares_Folder, OriginStationID, `${DestinationStationID}.json`)
            if (!(await fs.existsSync(path.join(ODFares_Folder, OriginStationID)))) await fs.mkdirSync(path.join(ODFares_Folder, OriginStationID))
            // 搞錯ㄌ if (!(await fs.existsSync(path.join(ODFares_Folder, OriginStationID,DestinationStationID)))) await fs.mkdirSync(path.join(ODFares_Folder, OriginStationID,DestinationStationID))
            // 超亂
            // 破防了，所有JSON檔都要重構好煩

            var json = {
                OriginStationID: ODFare["OriginStationID"],
                OriginStationName: ODFare["OriginStationName"],
                DestinationStationID: ODFare["DestinationStationID"],
                DestinationStationName: ODFare["DestinationStationName"],
                Direction: ODFare["Direction"],
                TrainFares: [


                ]
            }
            const FaresObject = {
                TrainType: ODFare["TrainType"],
                Fares: ODFare["Fares"]
            }
            
            if (fs.existsSync(path.join(JSON_PATH))) {
                json = JSON.parse((await fs.readFileSync(JSON_PATH)))
            }
            json.TrainFares.push(FaresObject)
            await fs.writeFileSync(JSON_PATH, JSON.stringify(json));
            // 超美麗
            if (i % 10000 == 0) {
                console.log(`Progress: ${i}/${ODFares_len} ${Math.round(ODFares_len / i)}%`)
            }
            
        }
    }
}