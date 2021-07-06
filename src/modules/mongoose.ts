import { MongooseModule as MongooseModuleBase, MongooseModuleOptions } from '@nestjs/mongoose';
import { Config }  from 'src/config'

export let MongooseModule = MongooseModuleBase.forRootAsync({
/*
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      uri: configService.get<string>('MONGODB_URI'),
    }),
    inject: [ConfigService],
*/
    useFactory: async ():Promise<MongooseModuleOptions> => {
        return {
            uri: Config.mongodb.uri,
            dbName: Config.mongodb.dbName,
            useCreateIndex: true
        }
    }
})
