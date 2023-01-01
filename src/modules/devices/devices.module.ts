import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyGateway } from '../gateway/gateway';
import { GatewayModule } from '../gateway/gateway.module';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { DevicesController } from './devices.controller';
import { DeviceSchema, TempDevicesSchema } from './devices.model';
import { DevicesService } from './devices.service';

@Module({
  imports: [
    GatewayModule,
    MongooseModule.forFeature([
      { name: 'Device', schema: DeviceSchema },
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'TempDevices', schema: TempDevicesSchema },
    ]),
  ],
  controllers: [DevicesController],
  providers: [DevicesService, SensorsService, MyGateway],
})
export class DevicesModule {}
