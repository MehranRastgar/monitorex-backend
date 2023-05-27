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
} from '@nestjs/common';
import { SerialService } from './serial.service';

@Controller('serial')
export class SerialController {
  constructor(
  ) { }
  // @Get('/')
  // async startAcomPortAndGetData() {
  //   return await this.sensorsService.test_basic_connect();
  // }
}
