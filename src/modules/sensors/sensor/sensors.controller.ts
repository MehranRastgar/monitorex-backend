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
  forwardRef,
  Inject,
  UseGuards,
} from '@nestjs/common';
import { ParsedUrlQuery } from 'querystring';
import { CreateSensorDto } from './dto/CreateSensor.dto';
import { SensorsService } from './sensors.service';
import { CheckAbility } from 'src/ability/ability.factory/ability.decorator';
import { AbilityGuard } from 'src/users/ability.guard';
import { AbilityAction } from 'src/users/user.model';

@Controller('sensors')
export class SensorsController {
  constructor(
    @Inject(forwardRef(() => SensorsService))
    private sensorsService: SensorsService) { }
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

  @Get('/sensor/valuedate/:id')
  async getValueDateOfSensor(@Param() param, @Query() query) {
    console.log(param.id);
    const result = await this.sensorsService.getValueDateOfSensorTimeSeries(
      param.id,
      query.limit,
    );
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
  @Post('/report')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: 'reports' })
  @HttpCode(200)
  async getSensorsReport(@Body() body) {
    const result = await this.sensorsService.getSensorsReport(
      body?.sensors,
      body?.start,
      body?.end,
    );
    return result;
  }


  @Post('/v2/report')
  @HttpCode(200)
  async getSensorsReportV2(@Body() body) {
    const result = await this.sensorsService.getSensorsReportV2(
      body?.sensors,
      body?.start,
      body?.end,
    );
    return result;
  }

  @Post('/report/eb')
  @UseGuards(AbilityGuard)
  @CheckAbility({ action: AbilityAction.Read, subject: 'reports' })
  @HttpCode(200)
  async getEBReport(@Body() body) {
    const result = await this.sensorsService.getEBReport(
      body?.deviceId,
      body?.start,
      body?.end,
    );
    return result;
  }
}
