import { Module, CacheModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GatewayModule } from '../gateway/gateway.module';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { DevicesController } from './devices.controller';
import { DeviceSchema, ebSeries, TempDevicesSchema } from './devices.model';
import { DevicesService } from './devices.service';
import { MyGateway } from '../gateway/gateway.service';
import { AbilityModule } from 'src/ability/ability.module';

@Module({
  imports: [
    AbilityModule,
    CacheModule.register({
      ttl: 60 * 1000, // the time-to-live (TTL) for cached items in seconds
      max: 1000, // the maximum number of items that can be stored in the cache at one time
    }),
    GatewayModule,
    MongooseModule.forFeature([
      { name: 'Device', schema: DeviceSchema },
      { name: 'Sensor', schema: SensorSchema },
      { name: 'ebSeries', schema: ebSeries },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'TempDevices', schema: TempDevicesSchema },
    ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, SensorsService, MyGateway],
  exports: [DevicesService]
})
export class DevicesModule { }
