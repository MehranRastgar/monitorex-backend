import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { MyGateway } from './modules/gateway/gateway.service';
// import { MyGateway } from './modules/gateway/gateway.service';

async function bootstrap() {

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Cats example')
    .setDescription('The cats API description')
    .setVersion('1.0')
    .addTag('cats')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT);

  const userService = app.get(UsersService)
  const init = await userService.createAdmin('s')
  console.log(init)
  const wsgateway = app.get(MyGateway)
  wsgateway.moduleInitAlternate()



}
bootstrap();
