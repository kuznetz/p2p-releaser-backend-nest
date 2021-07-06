import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { Config, LoadConfig }  from './config'
import { AppModule } from './app.module';

async function bootstrap() {
  await LoadConfig()
  
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true })
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Releaser')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('doc', app, document);

  app.enableCors();
  await app.listen(Config.port, '0.0.0.0');
}
bootstrap();
