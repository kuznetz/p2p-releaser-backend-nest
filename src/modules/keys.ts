import { Module, Injectable } from '@nestjs/common'
//import NodeRSA from 'node-rsa'
import crypto from 'crypto'
import * as fs from 'fs'

@Injectable()
export class Keys {

    public privateKey: crypto.KeyObject = null;
    public publicKey: crypto.KeyObject = null;

    constructor() {
        let privateKeyBuf = fs.readFileSync('./data/privatekey.rsa').toString()
        //console.log('privateKeyBuf',privateKeyBuf.toString())

        this.privateKey = crypto.createPrivateKey({
            key: privateKeyBuf.toString(),
            format: "pem",
            type: 'pkcs8'
        })

        console.log('privateKey',
            this.privateKey.type,
            //this.privateKey.export({ format:'pem', type:'pkcs1' }) as string
        )

        this.publicKey = crypto.createPublicKey(this.privateKey)
        console.log('publicKey spki',this.getId())
        //console.log('publicKey pkcs1',this.publicKey.export({ format:'der', type:'pkcs1' }).toString('base64'))

        //crypto.constants.RSA_PKCS1_OAEP_PADDING
        //RSA/ECB/OAEPWithSHA-1AndMGF1Padding
        /*
        let enc = crypto.publicEncrypt({
            key: this.publicKey,
            
        },Buffer.from('123456654321'))
        console.log('enc 123',enc.toString('base64'))
        let dec = crypto.privateDecrypt({
            key: this.privateKey,

        }, enc)
        console.log('dec 123',dec.toString())

        let dec2 = crypto.privateDecrypt(this.privateKey, Buffer.from(
            'WyQRMD7RVgEK5JpbkMGoQuMa3ST1t8w0vrxm9d3NAN81a0jSLfERPgFXU71zcnNpnwu/3kwnQ/gWj2dS8C844w=='
            ,'base64'
        ))
        console.log('dec2 321',dec2.toString())
        */
    }

    getId():string {
        return this.publicKey.export({ format:'der', type:'spki' }).toString('base64')
    }

}


@Module({
    imports: [],
    controllers: [],
    providers: [Keys],
    exports: [Keys],
})
export class KeysModule {}