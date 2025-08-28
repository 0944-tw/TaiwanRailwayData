const path = require("path")
const fs = require("fs");
const { json } = require("stream/consumers");
//
const TDX_CLIENT_ID = process.env.TDX_CLIENT_ID;
const TDX_CLIENT_SECRET = process.env.TDX_CLIENT_SECRET;
//

async function getAccessToken() {
    const url = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', TDX_CLIENT_ID);
    params.append('client_secret', TDX_CLIENT_SECRET);

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded'
        },
        body: params
    });

    if (!response.ok) {
        throw new Error(`Token request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
}
//

(async () => {
    console.log(`Executable Path: ${__dirname}`)
   const js_actions = fs.readdirSync(path.join(__dirname,"actions"));
   for (let i= 0; i < js_actions.length; i++){
     const action = require(path.join(__dirname,"actions",js_actions[i]))
     console.log(`Executing: ${action.name }`)
     await action.action()
   }
})();