import {serialize,deserialize} from 'bson'
import crypto from 'crypto'

export abstract class SignedBlock {

    id: Buffer
    signature: Buffer
    authorId: Buffer

    getId():string {
        return this.id.toString('hex')
    }

    getAuthorId():string {
        return this.authorId.toString('base64')
    }

    makeBlock(privateKey: crypto.KeyObject):Buffer {
        return this.makeBlockBuf(privateKey,this.serializeContent())
    }

    deserialize(buf :Buffer, validate=true):void {
        let contentBuf = this.deserializeBuf(buf)
        if (validate) {
            this.validateBuf(contentBuf)
        }
        this.deserializeContent(contentBuf)
    }

    protected abstract serializeContent():Buffer;
    protected abstract deserializeContent(buf :Buffer):void;

    private validateBuf(content: Buffer):void {
        let validHash = crypto.createHash('SHA256').update(content).digest()
        if (Buffer.compare(validHash, this.id) !== 0) {
            throw new Error('Invalid block hash')
        }
        let pub = crypto.createPublicKey({
            key: this.authorId,
            format: 'der',
            type: 'spki'
        })
        let validId = crypto.publicDecrypt(pub,this.signature)
        if (Buffer.compare(this.id, validId) !== 0) {
            throw new Error('Invalid block signature')
        }
    }

    private makeBlockBuf(privateKey: crypto.KeyObject, content: Buffer):Buffer {
        this.authorId = crypto.createPublicKey(privateKey).export({ format:'der', type:'spki' })
        this.id = crypto.createHash('SHA256').update(content).digest()
        this.signature = crypto.privateEncrypt(privateKey,this.id)
        return serialize({
            id: this.id,
            signature: this.signature,
            authorId: this.authorId,
            content: content
        })
    }

    private deserializeBuf(buf :Buffer):Buffer {
        let data = deserialize(buf)
        this.id = data.id.buffer
        this.signature = data.signature.buffer
        this.authorId = data.authorId.buffer
        return data.content.buffer
    }

}