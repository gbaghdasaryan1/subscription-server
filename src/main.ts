import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as process from 'process';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: '*',
  });
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;

  const config = new DocumentBuilder()
    .setTitle('Subscription App API')
    .setDescription('Backend for subscription-based mobile app')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, doc);

  await app.listen(port, () => {
    Logger.log(`Server running on http://localhost:${port}`);
    Logger.log(`Swagger on http://localhost:${port}/api`);
  });
}
void bootstrap();
