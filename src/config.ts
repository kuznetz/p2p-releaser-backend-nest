import fs from 'fs'

export let Config = {
    "port": 3000,
    "mongodb": {
        "uri": "mongodb://releaser:123@127.0.0.1/releaser",
        "dbName": "releaser"
    }
}

export async function LoadConfig():Promise<void> {
    let configBuffer = await fs.promises.readFile('./data/config.json')
    //TODO: норм парсер
    Object.assign(Config, JSON.parse( configBuffer.toString() ));
    console.log('Config',Config)                        
}