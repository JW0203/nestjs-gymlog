import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') as string;
  const hostIP = configService.get<string>('HOST_IP') as string;
  await app.listen(port, hostIP);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
