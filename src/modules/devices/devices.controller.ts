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
  BadRequestException,
} from '@nestjs/common';
import { Device } from './devices.model';
import mongoose, { Model } from 'mongoose';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) {}

  @Post('/')
  @HttpCode(201)
  async deviceCreate(@Body() deviceData) {
    const result = await this.devicesService.insertDevice(deviceData);
    if (typeof result === 'string') {
      throw new BadRequestException(result);
    } else {
      return result;
    }
  }
  @Put('/:id')
  async deviceUpdate(@Body() deviceData: Device, @Param() param) {
    const result = await this.devicesService.putDevice(param.id, deviceData);
    return result;
  }
  @Delete('/:id')
  async deviceDelete(@Body() deviceData: Device, @Param() param) {
    const result = await this.devicesService.deleteDevice(param.id);
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
