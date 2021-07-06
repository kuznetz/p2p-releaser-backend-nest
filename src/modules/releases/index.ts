import { Module } from '@nestjs/common';
import { Releases } from './mongo';
import { ReleasesController } from './contoller.dto';
import { InfoblocksModule } from '../infoblocks';
import { KeysModule } from '../keys';

@Module({
    imports: [InfoblocksModule,KeysModule],
    controllers: [ReleasesController],
    providers: [Releases],
})
export class ReleasesModule {}