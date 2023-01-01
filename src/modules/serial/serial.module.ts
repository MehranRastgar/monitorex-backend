import { Module } from '@nestjs/common';
import { SerialService } from './serial.service';
import { SerialController } from './serial.controller';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SensorSchema, sensorseries } from '../sensors/sensor/sensor.model';
import { DevicesService } from '../devices/devices.service';
import { DeviceSchema, TempDevicesSchema } from '../devices/devices.model';
import { MyGateway } from '../gateway/gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Sensor', schema: SensorSchema },
      { name: 'sensorseries', schema: sensorseries },
      { name: 'Device', schema: DeviceSchema },
      { name: 'TempDevices', schema: TempDevicesSchema },
    ]),
  ],
  providers: [SerialService, SensorsService, DevicesService, MyGateway],
  controllers: [SerialController],
})
export class SerialModule {}
