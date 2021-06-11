import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { Owner } from './services/owner';
import { Infoblocks } from './services/infoblocks';
import { Releases } from './services/releases';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [Owner,Infoblocks,Releases],
})
export class AppModule {}
