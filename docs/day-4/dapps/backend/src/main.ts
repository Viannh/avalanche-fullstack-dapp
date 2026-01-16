import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Avalanche Dapp Backend - Trias Oktaviyan (221011400089)')
    .setDescription('The API description for the Avalanche Fullstack Dapp.\n\nDeveloped by:\n**Name:** Trias Oktaviyan\n**NIM:** 221011400089')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
