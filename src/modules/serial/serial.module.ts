import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialController } from './serial.controller';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
    ]),
  ],
  providers: [SerialService, SensorsService],
  controllers: [SerialController],
})
export class SerialModule {}
