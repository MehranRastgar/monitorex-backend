import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './modules/quiz/quiz.module';
// import { QuizController } from './modules/quiz/quiz.controller';
import { Database } from './database/database';
import { MongooseModule } from '@nestjs/mongoose';
// import { SensorsService } from './modules/sensors/sensor/sensors.service';
import { SensorsModule } from './modules/sensors/sensor/sensors.module';
import { DevicesModule } from './modules/devices/devices.module';
import { SerialModule } from './modules/serial/serial.module';
import { SensorsService } from './modules/sensors/sensor/sensors.service';
import {
  SensorSchema,
  sensorseries,
} from './modules/sensors/sensor/sensor.model';
import { GatewayModule } from './modules/gateway/gateway.module';
import { MyGateway } from './modules/gateway/gateway';
import { UsersModule } from './users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './users/roles.guard';

@Module({
  imports: [
    GatewayModule,
    QuizModule,
    MongooseModule.forRoot('mongodb://root:password@localhost:27018'),
    SensorsModule,
    DevicesModule,
    SerialModule,
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
    ]),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Database,
    SensorsService,
    MyGateway,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
