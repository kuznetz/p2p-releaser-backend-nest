import { Module, Injectable } from '@nestjs/common'
import {LevelDown, default as LevelDownConstructor} from 'leveldown'
import {LevelUp, default as LevelUpConstructor} from 'levelup'

const infoblockTypes = ['releases','profiles','comments'] as const
type infoblockType = typeof infoblockTypes[number]

@Injectable()
export class Infoblocks {

    public dbs: { [key in infoblockType]?: LevelUp<LevelDown> } = {}

    constructor() {
        for (const ibt of infoblockTypes) {
            let levelDownDb = LevelDownConstructor('./data/level/'+ibt);
            this.dbs[ibt] = new LevelUpConstructor<LevelDown>(levelDownDb);
        }
    }

    async put(type: infoblockType, id:Buffer, block: Buffer) {
        await this.dbs[type].put(id,block)
    }

    async get(type: infoblockType, id:Buffer):Promise<Buffer> {
        return (await this.dbs[type].get(id)) as Buffer
    }
    
}

@Module({
    imports: [],
    controllers: [],
    providers: [Infoblocks],
    exports: [Infoblocks],
})
export class InfoblocksModule {}