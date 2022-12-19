import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema } from '../sensors/sensor/sensor.model';
import { DevicesController } from './devices.controller';
import { DeviceSchema } from './devices.model';
import { DevicesService } from './devices.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Device', schema: DeviceSchema },
      { name: 'Sensor', schema: SensorSchema },
    ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService],
})
export class DevicesModule {}
