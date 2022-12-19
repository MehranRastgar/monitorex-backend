import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuizModule } from './modules/quiz/quiz.module';
// import { QuizController } from './modules/quiz/quiz.controller';
import { Database } from './database/database';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorsService } from './modules/sensors/sensor/sensors.service';
import { SensorsModule } from './modules/sensors/sensor/sensors.module';
import { DevicesModule } from './modules/devices/devices.module';

@Module({
  imports: [
    QuizModule,
    MongooseModule.forRoot('mongodb://root:password@localhost:27018'),
    SensorsModule,
    DevicesModule,
  ],
  controllers: [AppController],
  providers: [AppService, Database],
})
export class AppModule {}
