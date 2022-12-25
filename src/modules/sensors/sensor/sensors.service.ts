import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Number } from 'mongoose';
import { ParsedUrlQuery } from 'querystring';
import { order, sort } from '../interface';
import { Sensor, sensorseries } from './sensor.model';
// import * as SerialPort from 'serialport';

@Injectable()
export class SensorsService {
  private sensors: Sensor[] = [];
  // private: sensors: Sensor
  constructor(
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
    @InjectModel('sensorseries')
    private readonly sensorSeriesModel: Model<sensorseries>,
  ) {}
  //==============================================
  async insertSensor(
    deviceId: string,
    title: string,
    type: string,
    unit: string,
  ) {
    const newSensor = new this.sensorModel({
      deviceId: new mongoose.Types.ObjectId(deviceId),
      title,
      type,
      unit,
    });
    try {
      const result = await newSensor.save();
      return result._id;
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
  //==============================================
  async getAllSensors(query: ParsedUrlQuery) {
    // if (typeof limit === undefined) limit = 20;
    // const sortType: = query?.sorttype == "desc" ? 1 : -1;
    const textObject: any = query?.q
      ? {
          $text: {
            $search: query?.q,
            $diacriticSensitive: false,
            $caseSensitive: false,
          },
        }
      : {};
    const order: order = query?.order === 'asc' ? 'asc' : 'desc';
    const sort: sort = query?.sort;
    const perPageLimit = Number(query?.perpage ?? 20);
    const PageNumber = Number(query?.page ?? 1);
    const sortArray: any[] = [[sort, order === 'asc' ? 1 : -1]];
    const findedSensors = await this.sensorModel
      .find(textObject)
      .limit(perPageLimit)
      .skip(PageNumber)
      .sort(sortArray)
      .populate('sensorLastSerie');

    return findedSensors;
  }
  //==============================================
  setToSecondZero(date: Date) {
    date.setMilliseconds(0);
    date.setSeconds(0);
    return date;
  }
  //==============================================
  setToMinuteZero(date: Date) {
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    return date;
  }
  //==============================================
  setToHourZero(date: Date) {
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    return date;
  }
  //==============================================
  async checkTimeStampWithRsolution(
    resolution: 'hour' | 'minute' | 'second' | undefined,
    DateNow: Date,
    sensorId: mongoose.Types.ObjectId,
  ) {
    try {
      if (resolution === 'minute') {
        let dateRef = new Date();
        const dateLt = new Date(
          dateRef.getFullYear(),
          dateRef.getMonth(),
          dateRef.getDate(),
          dateRef.getHours(),
          dateRef.getMinutes() + 1 >= 60 ? 0 : dateRef.getMinutes() + 1,
          0,
          0,
        );
        dateRef = this.setToSecondZero(dateRef);
        const gte = dateRef;
        // const iddd = new mongoose.Types.ObjectId(sensorId);
        const lastRec = await this.sensorSeriesModel.findOne({
          sensorId: sensorId,
          timestamp: {
            $lte: new Date(dateLt.toISOString()),
            $gte: new Date(gte.toISOString()),
          },
        });

        if (lastRec === null) {
          return true;
        }
        if (
          this.setToSecondZero(new Date(lastRec?.timestamp)).toISOString() !==
          this.setToSecondZero(DateNow).toISOString()
        ) {
          return true;
        } else {
          return false;
        }
      }
      //...then is minute
    } catch (err) {
      console.log(err);
    }
  }
  //==============================================
  async addRecordSeries(
    sensorAddress: { SMultiport: number; Multiport: number; Port: number },
    value: number,
  ) {
    if (value === 200000) {
      return {
        status: 203,
        message: 'recordIsNotReady',
      };
    }

    console.log('sssssssssssss', sensorAddress);
    try {
      const date = new Date();
      const FindSensor = await this.sensorModel.findOne({
        superMultiport: sensorAddress.SMultiport,
        multiport: sensorAddress.Multiport,
        port: sensorAddress.Port,
      });

      if (FindSensor === null) {
        console.log('sensor not found', sensorAddress);
        return {
          status: 404,
          err: 'sensor id is Not Found',
        };
      }
      console.log('sensorfound', FindSensor._id);
      const lastRec = await this.sensorSeriesModel
        .findOne({ sensorId: FindSensor._id })
        .sort({ timestamp: -1 });
      // const sensorSettings = await this.sensorModel.findOne({
      //   sensorUniqueName: sensorAddress,
      // });
      let resultCheck = false;
      // console.log(sensorSettings);

      if (date === null) {
        resultCheck = true;
      } else {
        resultCheck = await this.checkTimeStampWithRsolution(
          FindSensor.resolution,
          date,
          FindSensor._id,
        );
      }
      console.log(resultCheck);

      const newRecord = new this.sensorSeriesModel({
        timestamp: date,
        sensorId: FindSensor._id,
        metaField: {
          incremental: (lastRec?.metaField?.incremental ?? 0) + 1,

          value: value,
          average:
            ((lastRec?.metaField?.average ?? value) *
              (lastRec?.metaField?.incremental ?? 0) +
              value) /
            ((lastRec?.metaField?.incremental ?? 0) + 1),
          max:
            value > (lastRec?.metaField?.max ?? value)
              ? value
              : lastRec?.metaField?.max ?? value,
          min:
            value < (lastRec?.metaField?.min ?? value)
              ? value
              : lastRec?.metaField?.min ?? value,
        },
      });

      const findAndup = await this.sensorModel.findOneAndUpdate(
        FindSensor._id,
        {
          ...{
            sensorRealtimeValues: {
              value: value ?? undefined,
              updateTime: new Date(),
            },
          },
        },
      );
      if (resultCheck === true) {
        const rec = await newRecord.save();
        const findAndup = await this.sensorModel.findOneAndUpdate(
          FindSensor._id,
          { ...{ sensorLastSerie: newRecord._id } },
        );
        return { status: 201, record: rec, sensor: FindSensor };
      } else {
        return {
          status: 200,
          message: 'recordIsDuplicateInResolution',
          sensor: FindSensor,
        };
      }
    } catch (err) {
      console.log(err);

      return {
        status: 404,
        err: JSON.stringify(err) ?? 'sensor id is Not Found',
      };
    }
  }
  //==============================================
  // async addRecordSeriesWithFaketime(
  //   sensorId: mongoose.Types.ObjectId,
  //   value: number,
  //   FakeDate: Date,
  // ) {
  //   try {
  //     const date = FakeDate;
  //     const lastRec = await this.sensorSeriesModel
  //       .findOne({ 'metaField.sensorId': sensorId })
  //       .sort({ timestamp: -1 });
  //     const sensorSettings = await this.sensorModel.findById(sensorId);
  //     let resultCheck = false;
  //     console.log(sensorSettings);

  //     if (lastRec === null) {
  //       resultCheck = true;
  //     } else {
  //       resultCheck = await this.checkTimeStampWithRsolution(
  //         sensorSettings.resolution,
  //         date,
  //         sensorId,
  //       );
  //     }
  //     console.log(lastRec);

  //     const newRecord = new this.sensorSeriesModel({
  //       timestamp: date,
  //       metaField: {
  //         incremental: (lastRec?.metaField?.incremental ?? 0) + 1,
  //         sensorId: sensorId,
  //         value: value,
  //         average:
  //           ((lastRec?.metaField?.value ?? value) *
  //             (lastRec?.metaField?.incremental ?? 1) +
  //             value) /
  //           (lastRec?.metaField?.incremental ?? 1),
  //         max:
  //           value > (lastRec?.metaField?.max ?? value)
  //             ? value
  //             : lastRec?.metaField?.max ?? value,
  //         min:
  //           value < (lastRec?.metaField?.min ?? value)
  //             ? value
  //             : lastRec?.metaField?.min ?? value,
  //       },
  //     });
  //     if (resultCheck === true) {
  //       const rec = await newRecord.save();
  //       return { status: 201, record: rec, sensor: sensorSettings };
  //     } else {
  //       return {
  //         status: 200,
  //         message: 'recordIsDuplicateInResolution',
  //         sensor: sensorSettings,
  //       };
  //     }
  //   } catch (err) {
  //     return {
  //       status: 404,
  //       err: JSON.stringify(err) ?? 'sensor id is Not Found',
  //     };
  //   }
  // }
  //==============================================
  getRandomArbitrary(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }
  //==============================================
  async makeFakeData(
    resolution: 'minute' | 'second' | 'hour',
    sensorId: mongoose.Types.ObjectId,
    from: Date,
    to: Date,
  ) {
    console.log(from);
    console.log(to);
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const minutesCount =
      (Number(toDate.getTime().toPrecision()) -
        Number(fromDate.getTime().toPrecision())) /
      60000;
    console.log(
      (Number(toDate.getTime().toPrecision()) -
        Number(fromDate.getTime().toPrecision())) /
        60000,
    );
    for (let i = minutesCount; i > 0; i--) {
      const GoleDate = new Date(
        Number(fromDate.getTime().toPrecision()) + i * 60000,
      );
      console.log(GoleDate);
      // await this.addRecordSeriesWithFaketime(
      //   sensorId,
      //   this.getRandomArbitrary(15, 25),
      //   GoleDate,
      // );
    }
    // await this.addRecordSeriesWithFaketime(
    //   sensorId,
    //   this.getRandomArbitrary(1, 25),
    //   from,
    // );
  }
  //==============================================
  async removeTimeSeriesById(id: mongoose.Types.ObjectId) {
    const iddd = new mongoose.Types.ObjectId(id);
    return await this.sensorSeriesModel.findByIdAndDelete(iddd);
  }
  //==============================================
  async getLastRecordOfSeries(SensorId: mongoose.Types.ObjectId) {
    const iddd = new mongoose.Types.ObjectId(SensorId);
    console.log(SensorId);
    return await this.sensorSeriesModel
      .findOne({ sensorId: iddd })
      .sort({ timestamp: -1 });
  }
  //==============================================
  async getXYOfSensorTimeSeries(SensorId: mongoose.Types.ObjectId) {
    const iddd = new mongoose.Types.ObjectId(SensorId);
    console.log(SensorId);
    return await this.sensorSeriesModel
      .find({ sensorId: iddd })
      .select(['metaField.value', 'timestamp'])
      .sort({ timestamp: -1 });
  }
  //==============================================
  async getSenSorSeriesWithGranularity(SensorId: string) {
    const id = new mongoose.Types.ObjectId(SensorId);
    const startDate = new Date('2022-12-22T18:59:03.599Z');
    const endDate = new Date('2022-12-24T22:59:03.599Z');

    return await this.sensorSeriesModel
      .aggregate([
        {
          $match: {
            sensorId: id,
          },
        },
        {
          $densify: {
            field: 'timestamp',
            range: {
              step: 10,
              unit: 'minute',
              bounds: 'full', //[startDate, endDate],
              // bounds: 'full',
            },
          },
        },
        {
          $group: {
            _id: null,
            data: { $push: { x: '$timestamp', y: '$metaField.value' } },
          },
        },
      ])
      .sort({ timestamp: -1 });
  }
}
//==============================================
// metaField: {
//   sensorId: ObjectId,
//   incremental: Number,
//   value: Number,
//   max: Number,
//   min: Number,
//   average: Number,
// }
