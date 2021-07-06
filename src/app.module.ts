import { Module } from '@nestjs/common';
import { ReleasesModule } from './modules/releases';
import { InfoblocksModule } from './modules/infoblocks';
import { KeysModule } from './modules/keys';
import { MongooseModule } from './modules/mongoose';
//import { Infoblocks } from './modules/infoblocks';
//import { Releases } from './modules/releases/mongo';
//import { Mongoose } from './modules/mongoose'

@Module({
  imports: [
    ReleasesModule,
    InfoblocksModule,
    KeysModule,
    MongooseModule
  ],
//  controllers: [ReleasesController],
//  providers: [Owner,Infoblocks,Releases],
})
export class AppModule {}
