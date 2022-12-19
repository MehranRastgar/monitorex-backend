import { DevicesService } from './devices.service';
import {
  Controller,
  Get,
  Post,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Body,
  Param,
  Query,
  Res,
  HttpStatus,
  Response,
  Delete,
} from '@nestjs/common';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('/')
  async deviceCreate(@Body() deviceData) {
    const result = await this.devicesService.insertDevice(deviceData);
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
