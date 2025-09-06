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
        const should_download = false ?? !(await fs.existsSync("ODFare.json.gz"))
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
        console.log("Removing ODFares Folder")
        await fs.rmdirSync(ODFares_Folder, {
            recursive: true,
            force: true
        })
        await fs.mkdirSync(ODFares_Folder)
        console.log("Recreated ODFare Folder")
        const data = fs.readFileSync("ODFare.json.gz");
        const jsonStr = zlib.gunzipSync(data).toString();
        const obj = JSON.parse(jsonStr);
        const rows = obj.ODFares.length;
        console.log(`OFDares: ${obj.ODFares.length}`)
        const files = new Map();
        for (let i = 0; i < rows; i++) {
            const ODFare = obj.ODFares[i];
            if (ODFare.Direction !== 1) continue;
            const fileKey = `${ODFare["OriginStationID"]}-${ODFare["DestinationStationID"]}`;
            var file = files.get(fileKey);
            if (!file) {
                file = {
                    OriginStationID: ODFare["OriginStationID"],
                    OriginStationName: ODFare["OriginStationName"],
                    DestinationStationID: ODFare["DestinationStationID"],
                    DestinationStationName: ODFare["DestinationStationName"],
                    TrainFares: []
                };
                files.set(fileKey, file);
            }
            file.TrainFares.push({
                TrainType: ODFare["TrainType"],
                Fares: ODFare["Fares"]
            })
            files.set(fileKey,file)
        }
        console.log("Map Len: " + files.size)
        await files.forEach(async (value,key) => {
            key = key.split("-")
            const folder_path = path.join(process.cwd(),"TRA","ODFare",key[0])
            if (!(await fs.existsSync(folder_path))) {
               await fs.mkdirSync(path.join(process.cwd(),"TRA","ODFare",key[0]),{
                recursive: true
               });
            }
            const json_path = path.join(process.cwd(),"TRA","ODFare",key[0],`${key[1]}.json`)
            await fs.writeFileSync(json_path,JSON.stringify(value),{
                override: true
            });
        })
    }
}