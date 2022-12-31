import { DevicesService } from './devices.service';
import {
  Controller,
  Get,
  Post,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Body,
  Put,
  Param,
  Query,
  Res,
  HttpStatus,
  Response,
  Delete,
} from '@nestjs/common';
import { Device } from './devices.model';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('/')
  async deviceCreate(@Body() deviceData) {
    const result = await this.devicesService.insertDevice(deviceData);
    return result;
  }
  @Put('/:id')
  async deviceUpdate(@Body() deviceData: Device, @Param() param) {
    const result = await this.devicesService.putDevice(param.id, deviceData);
    return result;
  }
  @Get('/')
  async getDevices(@Query() query) {
    const result = await this.devicesService.getDevices(query);
    return result;
  }
  @Get('/devicesensors')
  async deviceSensors(@Query() query) {
    const result = await this.devicesService.getDeviceSensors(query.deviceid);
    return result;
  }
}
