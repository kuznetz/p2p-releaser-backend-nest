import { Injectable } from '@nestjs/common'
import { Infoblocks } from './infoblocks'
import { Release } from 'src/models/release'
import { Config }  from 'src/config'
import {MongoClient,Db,Collection,ObjectID,Binary} from 'mongodb'

/*
const assert = require('assert');

// Connection URL
const url = '';

// Database Name
const dbName = 'myproject';
const client = new MongoClient(url);
// Use connect method to connect to the server
client.connect(function(err) {
  assert.equal(null, err);
  console.log('Connected successfully to server');

  const db = client.db(dbName);

  client.close();
});
*/

type ReleaseType = {
    id?: Binary,
    authorId: Binary,
    name: string,
    description?: string,
    tagIds?: ObjectID[]
}

type TagType = {
    _id?: ObjectID,
    parentId?: ObjectID,
    name: string,
    count: number
}

@Injectable()
export class Releases {

    public connected = false
    public releases: Collection<ReleaseType>
    public tags: Collection<TagType>

    constructor(private infoblocks: Infoblocks) {
        this.connect().then(()=>{
            console.log('mongodb connected')
            this.connected = true
        })
    }

    async connect() { //:Promise<void>
        const client = new MongoClient(Config.mongodb.address);
        await client.connect()
        const db = client.db(Config.mongodb.database)
        this.releases = db.collection('releases')
        this.tags = db.collection('tags')
    }

    async store(buf: Buffer) {
        let newRelease = new Release()
        newRelease.deserialize(buf)
        let tagIds:ObjectID[] = []
        for (let tag of newRelease.tags) {
            let curTagIds = await this.getTagIds(tag)
            for (let curTagId of curTagIds) {
                let idx = tagIds.findIndex( (t) => t.equals(curTagId) )
                if (idx === -1) {
                    tagIds.push(curTagId)
                }
            }
        }
        
        await this.releases.insertOne({
            id: new Binary(newRelease.id),
            name: newRelease.name,
            description: newRelease.description,
            authorId: new Binary(newRelease.name),
            tagIds: tagIds
        })
        await this.infoblocks.put('releases',newRelease.id,buf)
    }

    async getTagIds(fullTag: string):Promise<ObjectID[]> {
        let tagParts = fullTag.split('/')
        let lastTagId:ObjectID = null
        let result:ObjectID[] = []
        for (let part of tagParts) {
            let curTag = await this.tags.findOne({ 
                parentId: lastTagId,
                name: part
            })
            if (!curTag) {
                curTag = {
                    name: part,
                    parentId: lastTagId,
                    count: 0
                }
                let result = await this.tags.insertOne(curTag)
                lastTagId = result.insertedId
            } else {
                lastTagId = curTag._id
            }
            result.push(lastTagId)
        }
        return result
    }

    async getTags() {
        let cursor = this.tags.find()
        return cursor.toArray()
    }
    
}
