# TaiwanRailwayData
每日更新資訊
將會更新以下資訊：
- ODFare (票價）
> [!WARNING]
> 請注意，JSON檔案內容和TDX官方返回的內容些微不同。
> 
> ~~如需與官方版本相同， 請使用 `/TRA/ODFare/{OriginStationID}/{DestinationStationID}_tdx.json`~~ (尚未完成）
```json
{
  ...
  "ODFares": [
    {
      "OriginStationID": "string",
      "OriginStationName": {
        "Zh_tw": "string",
        "En": "string"
      },
      "DestinationStationID": "string",
      "DestinationStationName": {
        "Zh_tw": "string",
        "En": "string"
      },
      "Direction": 0,
      "TrainType": 0,
      "Fares": [
        {
          "TrainType": 0,
          "Fares": [
            {
              "TicketType": 0,
              "FareClass": 0,
              "CabinClass": 0,
              "Price": 0
            }
          ]
        }
      ],
      "TravelDistance": 0
    }
  ],
  ...
}
```
ODFare 將會產生json檔案，`/TRA/ODFare/{OriginStationID}/{DestinationStationID}.json`
- Stations （站點）
  
`/TRA/Stations.json`
