import {
  Controller,
  Get,
  Post,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { CreateSensorDto } from './dto/CreateSensor.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}
  @Get('/')
  getAllSensors() {
    return this.sensorsService.getAllSensors();
  }
  @Post('/')
  @HttpCode(201)
  @UsePipes(ValidationPipe)
  insertSensor(@Body() sensorData: CreateSensorDto) {
    return this.sensorsService.insertSensor(
      sensorData.title,
      sensorData.multiport,
      sensorData.superMultiport,
      sensorData.type,
      sensorData.unit,
      sensorData.title +
        '_' +
        sensorData.multiport.toString() +
        '_' +
        sensorData.superMultiport.toString(),
    );
  }
}
