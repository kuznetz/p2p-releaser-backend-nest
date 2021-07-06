import { Injectable } from '@nestjs/common'
import { Infoblocks } from '../infoblocks'
import { Release } from 'src/models/release'
import { Config }  from 'src/config'
import {MongoClient,Db,Collection,ObjectID,Binary,FilterQuery,Condition} from 'mongodb'

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
        const client = new MongoClient(Config.mongodb.uri,{
            useUnifiedTopology: true
        });
        await client.connect()
        const db = client.db(Config.mongodb.dbName)
        this.releases = db.collection('releases')
        this.tags = db.collection('tags')
    }

    async store(buf: Buffer) {
        let newRelease = new Release()
        newRelease.deserialize(buf)

        let exists = false
        try {
            await this.infoblocks.get('releases',newRelease.id)
            exists = true
        } catch (e) {}
        if (exists) throw new Error('Release already exists')
        await this.infoblocks.put('releases',newRelease.id,buf)
        
        await this.insert(newRelease)
    }

    async insert(newRelease: Release) {
        let tagIds:ObjectID[] = []
        for (let tag of newRelease.tags) {
            let curTagIds = await this.getTagIds(tag,true)
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
    }

    async getTagIds(fullTag: string, createMissing=false):Promise<ObjectID[]> {
        let tagParts = fullTag.split('/')
        let lastTagId:ObjectID = null
        let result:ObjectID[] = []
        for (let part of tagParts) {
            let curTag = await this.tags.findOne({ 
                parentId: lastTagId,
                name: part
            })
            if (!curTag) {
                if (!createMissing) {
                    throw new Error('Tag '+part+'not found')
                }
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

    async list(authorId?: Buffer, tag?: string) {
        let q: FilterQuery<ReleaseType> = {}
        if (authorId) {
            q.authorId = new Binary(authorId)
        }
        if (tag) {
            let tagIds = await this.getTagIds(tag)
            q.tagIds = tagIds[tagIds.length-1]
        }

        return await this.releases.find(q).map( (rt)=> rt.id ).toArray()
    }

}
