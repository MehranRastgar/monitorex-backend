import { Module, CacheModule } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialController } from './serial.controller';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';
import { DevicesService } from '../devices/devices.service';
import {
  DeviceSchema,
  TempDevicesSchema,
  ebSeries,
} from '../devices/devices.model';
import { MyGateway } from '../gateway/gateway.service';
// import { MyGateway } from '../gateway/gateway';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1000 * 60, // the time-to-live (TTL) for cached items in seconds
      max: 1000, // the maximum number of items that can be stored in the cache at one time
    }),
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'ebSeries', schema: ebSeries },
      { name: 'Device', schema: DeviceSchema },
      { name: 'TempDevices', schema: TempDevicesSchema },
    ]),
  ],
  providers: [SerialService, SensorsService, DevicesService, MyGateway],
  controllers: [SerialController],
})
export class SerialModule { }
