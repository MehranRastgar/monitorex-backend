import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Number } from 'mongoose';
import { Sensor, sensorseries } from './sensor.model';

@Injectable()
export class SensorsService {
  private sensors: Sensor[] = [];
  // private: sensors: Sensor
  constructor(
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
    @InjectModel('sensorseries')
    private readonly sensorSeriesModel: Model<sensorseries>,
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

  async checkTimeStampWithRsolution(
    resolution: 'hour' | 'minute' | 'second' | undefined,
    olddate: Date,
  ) {
    if (resolution === 'second') {
      const dateRef = new Date();
      dateRef.setMilliseconds(0);
      olddate.setMilliseconds(0);
      if (olddate < dateRef) {
        console.log(olddate, dateRef);

        return true;
      } else {
        return false;
      }
    }

    if (resolution === 'hour') {
      const dateRef = new Date();
      dateRef.setMilliseconds(0);
      dateRef.setSeconds(0);
      dateRef.setMinutes(0);
      olddate.setMilliseconds(0);
      olddate.setSeconds(0);
      olddate.setMinutes(0);
      if (olddate < dateRef) {
        console.log(olddate, dateRef);

        return true;
      } else {
        return false;
      }
    }
    if (resolution === 'minute') {
      const dateRef = new Date();
      dateRef.setMilliseconds(0);
      dateRef.setSeconds(0);
      olddate.setMilliseconds(0);
      olddate.setSeconds(0);
      if (olddate < dateRef) {
        console.log(olddate, dateRef);
        return true;
      } else {
        return false;
      }
    }
    //...then is minute
    const dateRef = new Date();
    dateRef.setMilliseconds(0);
    dateRef.setSeconds(0);
    olddate.setMilliseconds(0);
    olddate.setSeconds(0);
    if (olddate < dateRef) {
      console.log(olddate, dateRef);
      return true;
    } else {
      return false;
    }
  }

  async addRecorSeries(sensorId: mongoose.Types.ObjectId, value: number) {
    try {
      const date = new Date();
      const lastRec = await this.sensorSeriesModel
        .findOne({ sensorId: sensorId })
        .sort({ timestamp: -1 });
      const sensorSettings = await this.sensorModel.findById(sensorId);
      const resultCheck: boolean = await this.checkTimeStampWithRsolution(
        sensorSettings.resolution,
        lastRec.timestamp,
      );
      const newRecord = new this.sensorSeriesModel({
        timestamp: date,
        metadata: {
          incremental: (lastRec?.metadata?.incremental ?? 0) + 1,
          sensorId: sensorId,
          value: value,
          average:
            ((lastRec?.metadata?.value ?? value) *
              (lastRec?.metadata?.incremental ?? 1) +
              value) /
            (lastRec?.metadata?.incremental ?? 1),
          max:
            value > (lastRec?.metadata?.max ?? value)
              ? value
              : lastRec?.metadata?.max ?? value,
          min:
            value < (lastRec?.metadata?.min ?? value)
              ? value
              : lastRec?.metadata?.min ?? value,
        },
      });
      if (resultCheck === true) {
        const rec = await newRecord.save();
        return { status: 201, record: rec, sensor: sensorSettings };
      } else {
        return {
          status: 200,
          message: 'recordIsDuplicateInResolution',
          sensor: sensorSettings,
        };
      }
    } catch (err) {
      return {
        status: 404,
        err: JSON.stringify(err) ?? 'sensor id is Not Found',
      };
    }
  }
}
