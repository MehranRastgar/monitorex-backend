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
  UseGuards,
} from '@nestjs/common';
import { Device } from './devices.model';
import mongoose, { Model } from 'mongoose';
import { AbilityGuard } from 'src/users/ability.guard';
import { AbilityAction } from 'src/users/user.model';
import { CheckAbility } from 'src/ability/ability.factory/ability.decorator';

@Controller('devices')
export class DevicesController {
  constructor(private devicesService: DevicesService) { }

  @Post('/')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'device' })
  @HttpCode(201)
  async deviceCreate(@Body() deviceData) {
    const result = await this.devicesService.insertDevice(deviceData);
    this.devicesService.updateDevicesOnCache();

    if (typeof result === 'string') {
      throw new BadRequestException(result);
    } else {
      return result;
    }
  }
  @Put('/:id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'device' })
  async deviceUpdate(@Body() deviceData: Device, @Param() param) {
    const result = await this.devicesService.putDevice(param.id, deviceData);
    this.devicesService.updateDevicesOnCache();

    return result;
  }
  @Delete('/:id')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Manage, subject: 'device' })
  async deviceDelete(@Body() deviceData: Device, @Param() param) {
    const result = await this.devicesService.deleteDevice(param.id);
    this.devicesService.updateDevicesOnCache();

    return result;
  }
  @Get('/')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: 'device' })
  async getDevices(@Query() query) {
    const result = await this.devicesService.getDevices(query);
    return result;
  }
  @Get('/devicesensors')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: 'device' })
  async deviceSensors(@Query() query) {
    const result = await this.devicesService.getDeviceSensors(query.deviceid);
    return result;
  }
}
