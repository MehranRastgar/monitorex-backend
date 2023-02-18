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
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service';
import { UserSchema } from './users/user.model';
import { JwtModule, JwtService } from '@nestjs/jwt/dist';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { DeviceSchema, ebSeries } from './modules/devices/devices.model';
import { Logger } from '@nestjs/common';

@Module({
  imports: [
    GatewayModule,
    QuizModule,
    // MongooseModule.forRoot('mongodb://localhost:27017', {
    //   dbName: 'monitorex',
    //   retryAttempts: 5000,
    //   retryDelay: 5000,
    // }),
    MongooseModule.forRoot('mongodb://root:password@localhost:27018', {
      dbName: 'test',
      retryAttempts: 5000,
      retryDelay: 5,
    }),
    SensorsModule,
    DevicesModule,
    SerialModule,
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'ebSeries', schema: ebSeries },
      { name: 'Device', schema: DeviceSchema },
      { name: 'User', schema: UserSchema },
    ]),
    AuthModule,
    UsersModule,
    JwtModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Database,
    SensorsService,
    MyGateway,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // { provide: APP_GUARD, useClass: RolesGuard },
    AuthService,
    UsersService,
    JwtService,
  ],
})
export class AppModule {}
