import { CacheModule, Module } from '@nestjs/common';
import { MyGateway } from './gateway.service';
import { SensorsModule } from '../sensors/sensor/sensors.module';
import { DeviceSchema, TempDevicesSchema, ebSeries } from '../devices/devices.model';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketClient } from './socket-client';
import { FromAway } from './fromAway.service';
import { SerialService } from '../serial/serial.service';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { DevicesService } from '../devices/devices.service';

@Module({
  imports: [
    CacheModule.register({
      ttl: 1000 * 60, // the time-to-live (TTL) for cached items in seconds
      max: 1000, // the maximum number of items that can be stored in the cache at one time
    }),
    MongooseModule.forFeature([
      { name: 'Device', schema: DeviceSchema },
      { name: 'Sensor', schema: SensorSchema },
      { name: 'ebSeries', schema: ebSeries },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'TempDevices', schema: TempDevicesSchema },
    ]),
  ],
  providers: [MyGateway, FromAway, SocketClient, DevicesService, SensorsService, SerialService],
})
export class GatewayModule { }
