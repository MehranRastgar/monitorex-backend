import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sensor } from './sensor.model';

@Injectable()
export class SensorsService {
  private sensors: Sensor[] = [];
  // private: sensors: Sensor
  constructor(
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
  ) {}
  async insertSensor(
    title: string,
    multiport: number,
    superMultiport: number,
    type: string,
    unit: string,
    sensorUniqueName: string,
  ) {
    const newSensor = new this.sensorModel({
      title,
      multiport,
      superMultiport,
      type,
      unit,
      sensorUniqueName,
    });
    try {
      const result = await newSensor.save();
      return result._id;
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
  async getAllSensors(limit?: number) {
    if (typeof limit === undefined) limit = 20;
    const findedSensors = await this.sensorModel.find().limit(limit);
    return findedSensors;
  }
}
