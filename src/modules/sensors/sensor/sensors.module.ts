import { Module } from '@nestjs/common';
import { SensorsController } from './sensors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorsService } from './sensors.service';
import { SensorSchema, sensorseries } from './sensor.model';
import { DeviceSchema, ebSeries } from 'src/modules/devices/devices.model';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'Device', schema: DeviceSchema },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'ebSeries', schema: ebSeries },
    ]),
  ],
  controllers: [SensorsController],
  providers: [SensorsService],
})
export class SensorsModule {}
