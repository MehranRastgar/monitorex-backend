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
} from '@nestjs/common';
import { CreateSensorDto } from './dto/CreateSensor.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}
  @Get('/')
  async getAllSensors(@Query() getData: any) {
    return await this.sensorsService.getAllSensors(Number(getData?.limit));
  }
  @Post('/')
  @HttpCode(201)
  @UsePipes(ValidationPipe)
  async insertSensor(@Body() sensorData: CreateSensorDto) {
    return await this.sensorsService.insertSensor(
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

  @Post('/rec')
  async insertRecord(@Body() sensorData) {
    const result = await this.sensorsService.addRecorSeries(
      sensorData.id,
      sensorData.value,
    );
    return result;
  }
}
