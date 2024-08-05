import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { LoggerService } from './common/Logger/logger.service';

async function bootstrap() {
  initializeTransactionalContext();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(LoggerService));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT') as string;
  const hostIP = configService.get<string>('HOST_IP') as string;
  await app.listen(port, hostIP);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
