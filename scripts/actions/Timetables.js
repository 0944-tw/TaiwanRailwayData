const fs = require("fs")
const zlib = require("zlib")
const { Readable } = require('stream');
const { finished } = require('stream/promises');
const path = require("path");

const DailyTrainTimetable_Folder = path.join(process.cwd(), "TRA", "DailyTrainTimetable")

module.exports = {
    name: "DailyTrainTimetable",
    action: async () => {
        const res = await fetch("https://tdx.transportdata.tw/api/basic/v3/Rail/TRA/DailyTrainTimetable/Today?%24top=114514&%24format=JSON", {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0"
            }
        });
        console.log("Removing TrainTimetables Folder")
        await fs.rmdirSync(DailyTrainTimetable_Folder, {
            recursive: true,
            force: true
        })
        await fs.mkdirSync(DailyTrainTimetable_Folder)

        const json = await res.json();
        const timetables = json["TrainTimetables"];
        const rows = timetables.length;
        const files = new Map();
        for (let i = 0; i < rows.length; i++) {
            files.set(i["TrainInfo"]["TrainNo"],timetables[i])
        }
        
        console.log("Writing Timetables")
        await files.forEach(async (value,key) => {
            await fs.writeFileSync(path.join(DailyTrainTimetable_Folder,`${key}.json`), JSON.stringify(value))
        })

        console.log("Writed Timetables")
    }
}