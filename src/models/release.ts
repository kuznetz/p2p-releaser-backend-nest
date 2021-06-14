import {serialize,deserialize} from 'bson'
import { SignedBlock } from './signedBlock';

export type Spoiler = {
    title: string,
    description: string
}

export class Release extends SignedBlock {

    name: string
    shortDescr?: string
    description?: string
    tags?: string[] = []
    magnet?: string
    torrent?: Buffer

    protected serializeContent():Buffer {
        return serialize({
            name: this.name,
            description: this?.description,
            tags: this?.tags,
        })
    }

    protected deserializeContent(buf :Buffer):void {
        let content = deserialize(buf)
        console.log('content',content)
        this.name = content.name
        this.description = content?.description
        this.tags = content?.tags
    }

}