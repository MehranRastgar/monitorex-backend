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
import { ParsedUrlQuery } from 'querystring';
import { CreateSensorDto } from './dto/CreateSensor.dto';
import { SensorsService } from './sensors.service';

@Controller('sensors')
export class SensorsController {
  constructor(private sensorsService: SensorsService) {}
  @Get('/')
  async getAllSensors(@Query() query: ParsedUrlQuery) {
    return await this.sensorsService.getAllSensors(query);
  }
  @Post('/')
  @HttpCode(201)
  @UsePipes(ValidationPipe)
  async insertSensor(@Body() sensorData: CreateSensorDto) {
    return await this.sensorsService.insertSensor(
      sensorData.deviceId,
      sensorData.title,
      sensorData.type,
      sensorData.unit,
    );
  }

  @Post('/rec')
  async insertRecord(@Body() sensorData) {
    const result = await this.sensorsService.addRecordSeries(
      sensorData.id.toString(),
      sensorData.value,
    );
    return result;
  }
  @Post('/fake')
  async fakeRec(@Body() sensorData) {
    const result = await this.sensorsService.makeFakeData(
      'minute',
      sensorData.id,
      sensorData.fromDate,
      sensorData.toDate,
    );
    return result;
  }

  @Get('/sensor/:id')
  async getSensorChartReport(@Param() param) {
    return param?.id ?? 'no';
  }
  @Delete('/rec/delete')
  async deleteRecordById(@Query() Query) {
    console.log(Query.id);
    const result = await this.sensorsService.removeTimeSeriesById(Query.id);
    return result;
  }
}
