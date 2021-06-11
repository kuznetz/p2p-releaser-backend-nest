import fs from 'fs'

export class ConfigClass {

    static getInstance(): ConfigClass {
        ConfigClass.instance = ConfigClass.instance || new ConfigClass();
        return ConfigClass.instance;
    }
    private static instance: ConfigClass;

    public port: number
    public mongodb: {
        address:string,
        database:string
    }

    constructor() {
        if (ConfigClass.instance) {
            throw new Error("Error - use Singleton.getInstance()");
        }        
        let configBuffer = fs.readFileSync('./data/config.json')        
        Object.assign(this, JSON.parse( configBuffer.toString() ));
        console.log('Config',this)
    }

}

export let Config = new ConfigClass()