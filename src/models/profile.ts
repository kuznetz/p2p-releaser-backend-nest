import {serialize,deserialize} from 'bson'
import { SignedBlock } from './signedBlock';

export class Profile extends SignedBlock {

    name: string
    description?: string
    host?: string

    protected serializeContent():Buffer {
        return serialize({
            name: this.name,
            description: this?.description,
            host: this?.host,
        })
    }

    protected deserializeContent(buf :Buffer):void {
        let content = deserialize(buf)
        this.name = content.name
        this.description = content?.description
        this.host = content?.host
    }

}