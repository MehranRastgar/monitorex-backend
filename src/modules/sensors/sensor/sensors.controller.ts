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
    return await this.sensorsService.getAllSensorsNew(query);
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
  @Get('/sensor/lastrecord/:id')
  async getLastRecordOfSensor(@Param() param) {
    const result = await this.sensorsService.getLastRecordOfSeries(param.id);
    return result;
  }
  @Delete('/rec/delete')
  async deleteRecordById(@Query() Query) {
    console.log(Query.id);
    const result = await this.sensorsService.removeTimeSeriesById(Query.id);
    return result;
  }

  @Get('/sensor/xy/:id')
  async getXYOfSensor(@Param() param) {
    console.log(param.id);
    const result = await this.sensorsService.getXYOfSensorTimeSeries(param.id);
    return result;
  }
  @Get('/sensor/xyspec/:id')
  async getXYOfSensorWithSpec(@Param() param, @Query() query) {
    console.log(param.id);
    const startTime = new Date(query.St);
    const endTime = new Date(query.Et);
    const resolution = new Date(query.Res);
    const result = await this.sensorsService.getXYOfSensorTimeSeries(param.id);
    return result;
  }
  @Get('/sensor/withgranularity/:id')
  async getWithGranularity(@Param() param) {
    const result = await this.sensorsService.getsensorseriesWithGranularity(
      param.id,
    );
    return result;
  }
}
