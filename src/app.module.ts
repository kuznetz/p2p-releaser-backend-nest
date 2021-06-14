import { Module } from '@nestjs/common';
import { InnerReleasesController } from './controllers/inner/releases';
import { Owner } from './services/owner';
import { Infoblocks } from './services/infoblocks';
import { Releases } from './services/releases';

@Module({
  imports: [],
  controllers: [InnerReleasesController],
  providers: [Owner,Infoblocks,Releases],
})
export class AppModule {}
