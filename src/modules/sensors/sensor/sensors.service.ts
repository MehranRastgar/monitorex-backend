import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Number } from 'mongoose';
import { ParsedUrlQuery } from 'querystring';
import { map, timestamp } from 'rxjs';
import { ebSeries } from 'src/modules/devices/devices.model';
import { Device } from 'src/modules/devices/entities/device.entity';
import { order, sort } from '../interface';
import { Sensor, sensorseries } from './sensor.model';
// import * as SerialPort from 'serialport';

@Injectable()
export class SensorsService {
  private sensors: Sensor[] = [];
  // private: sensors: Sensor
  constructor(
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
    @InjectModel('sensorseries')
    private readonly sensorseriesModel: Model<sensorseries>,
    @InjectModel('ebSeries')
    private readonly ebModel: Model<ebSeries>,
  ) {
    console.log('services:', 'SensorsService')


  }
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
  async getAllSensorsNew(query: ParsedUrlQuery) {
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
        const lastRec = await this.sensorseriesModel.findOne({
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

    // console.log('sssssssssssss', sensorAddress);
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
      // console.log('sensorfound', FindSensor._id);
      const lastRec = await this.sensorseriesModel
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
      // console.log(resultCheck);

      const newRecord = new this.sensorseriesModel({
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
  //     const lastRec = await this.sensorseriesModel
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

  //     const newRecord = new this.sensorseriesModel({
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
    return await this.sensorseriesModel.findByIdAndDelete(iddd);
  }
  //==============================================
  async getLastRecordOfSeries(SensorId: mongoose.Types.ObjectId) {
    const iddd = new mongoose.Types.ObjectId(SensorId);
    console.log(SensorId);
    return await this.sensorseriesModel
      .findOne({ sensorId: iddd })
      .sort({ timestamp: -1 });
  }
  //==============================================
  async getXYOfSensorTimeSeries(SensorId: mongoose.Types.ObjectId) {
    const iddd = new mongoose.Types.ObjectId(SensorId);
    console.log(SensorId);
    return await this.sensorseriesModel
      .find({ sensorId: iddd })
      .select(['metaField.value', 'timestamp'])
      .sort({ timestamp: -1 });
  }
  //==============================================
  async getValueDateOfSensorTimeSeries(
    SensorId: mongoose.Types.ObjectId,
    limit?: number,
  ) {
    const id = new mongoose.Types.ObjectId(SensorId);
    console.log(SensorId);
    return await this.sensorseriesModel.aggregate([
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
      // {
      //   $group: {
      //     _id: null,
      //     data: {
      //       $push: {
      //         date: '$timestamp',
      //         value: '$metaField.value',
      //       },
      //     },
      //   },
      // },
      { $sort: { timestamp: -1 } },
      { $limit: limit ?? 5 },
    ]);
  }
  //==============================================
  async getsensorseriesWithGranularity(SensorId: string) {
    const id = new mongoose.Types.ObjectId(SensorId);
    const startDate = new Date('2022-12-22T18:59:03.599Z');
    const endDate = new Date('2022-12-24T22:59:03.599Z');

    return await this.sensorseriesModel
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
  //==============================================
  async getSensorsReport(SensorIds: string[], start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const resultArray: any[] = [];

    await Promise.all(
      SensorIds?.map(async (SensorId, index) => {
        const id = new mongoose.Types.ObjectId(SensorId);
        const sens = await this.deviceModel.findOne({ 'sensors._id': id });
        // const first = await this.sensorseriesModel.findOne({ 'sensorId': id, timestamp: { '$gte': (startDate.toISOString()), '$lte': (endDate.toISOString()), }, },).sort({ timestamp: 1 });
        // const last = await this.sensorseriesModel.findOne({ 'sensorId': id, timestamp: { '$gte': (startDate.toISOString()), '$lte': (endDate.toISOString()), }, },).sort({ timestamp: -1 });

        const result = await this.sensorseriesModel
          .aggregate([
            {
              $match: {
                sensorId: id,
                timestamp: {
                  $gte: new Date(start),
                  $lte: new Date(end),
                },
              },
            },
            {
              $densify: {
                field: "timestamp",
                range: {
                  step: 10,
                  unit: 'minute',
                  bounds: "full",
                }
              },
            },
            {
              $group: {
                _id: id,
                data: {
                  $push: { x: '$timestamp', y: '$metaField.value' },
                },
                max: { $max: "$metaField.value" },
                min: { $min: "$metaField.value" },
                avg: { $avg: "$metaField.value" }
              },
            },
          ])
          .sort({ timestamp: -1 });
        const ind = sens.sensors.findIndex(
          (item) => String(item._id) === SensorId,
        );
        const dataLen = result?.[0]?.data?.length
        if (result?.[0]?.data.length > 0) {
          resultArray.push({
            ...result?.[0],
            sensor: sens.sensors[ind],
            device: sens,
            max: result?.[0]?.max,
            min: result?.[0]?.min,
            average: result?.[0]?.avg,
          });
        }
      }),
    );
    return resultArray;
  }
  //==============================================
  async getSensorsReportV2(SensorIds2: string[], start2: string, end2: string) {

    // {"sensors":["63af0a208cddd72ced131b38","63af0a208cddd72ced131b39","63af0a208cddd72ced131b3a","63af0a208cddd72ced131b3b"],"start":"6/7/2023, 1:33:30 PM","end":"2023-06-22T10:03:30.000Z"}
    const SensorIds = ["63af0a208cddd72ced131b38", "63af0a208cddd72ced131b39", "63af0a208cddd72ced131b3a", "63af0a208cddd72ced131b3b"]
    const start = "2023-06-07T10:03:30.000Z"
    const end = "2023-06-22T22:03:30.000Z"
    const granularity = 5 * 60 * 1000; // 5 minutes in milliseconds

    const startDate = new Date(start);
    const endDate = new Date(end);
    const resultArray: any[] = [];
    console.log(
      'startDate.toISOString(),',
      endDate.toISOString(),
      startDate.toISOString(),
    );


    interface Record extends Document {
      date: Date;
      // other fields
    }

    interface AggregationResult {
      _id: null;
      data: {
        date: Date;
        count: number;
      }[];
    }

    const pipeline: any[] = [
      // Unwind the sensorLastSerie array to get individual documents
      {
        $unwind: '$sensorseries',
      },
      // Group documents by timestamp and sensorId to aggregate the data
      {
        $group: {
          _id: {
            timestamp: {
              $dateToString: {
                format: '%Y-%m-%dT%H:%M:%S.%LZ',
                date: '$sensorseries.timestamp',
                timezone: 'UTC',
              },
            },
            sensorId: '$sensorseries.sensorId',
          },
          values: {
            $push: '$sensorseries.metaField.value',
          },
        },
      },
      // Sort the documents by timestamp
      // {
      //   $sort: {
      //     '_id.timestamp': 1,
      //   },
      // },
      // Project the output to the required format
      {
        $project: {
          _id: 0,
          x: '$_id.timestamp',
          y: '$values',
        },
      },
    ];

    const result = await this.sensorseriesModel.aggregate(pipeline);
    // await Promise.all(
    //   SensorIds?.map(async (SensorId, index) => {
    //     const id = new mongoose.Types.ObjectId(SensorId);
    //     const sens = await this.deviceModel.findOne({ 'sensors._id': id });
    //     const result = await this.sensorseriesModel
    //       .aggregate([
    //         {
    //           $match: {
    //             sensorId: id,
    //             timestamp: {
    //               $gte: new Date(start),
    //               $lte: new Date(end),
    //             },
    //           },
    //         },
    //         {
    //           $densify: {

    //             field: "timestamp",
    //             range: {
    //               step: 1,
    //               unit: 'hour',
    //               bounds: "full",
    //             }
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: id,
    //             data: {
    //               $push: { x: '$timestamp', y: '$metaField.value' },
    //             },
    //           },
    //         },
    //         // {
    //         //   $bucket: {
    //         //     groupBy: "$year_born",                        // Field to group by
    //         //     boundaries: [1840, 1850, 1860, 1870, 1880], // Boundaries for the buckets
    //         //     default: "Other",                             // Bucket ID for documents which do not fall into a bucket
    //         //     output: {                                     // Output for each bucket
    //         //       "count": { $sum: 1 },
    //         //       "artists":
    //         //       {
    //         //         $push: {
    //         //           "name": { $concat: ["$first_name", " ", "$last_name"] },
    //         //           "year_born": "$year_born"
    //         //         }
    //         //       }
    //         //     }
    //         //   }
    //         // },
    //       ])
    //       .sort({ timestamp: -1 });
    //     const ind = sens.sensors.findIndex(
    //       (item) => String(item._id) === SensorId,
    //     );
    //     if (result?.[0]?.data.length > 0) {
    //       resultArray.push({
    //         // ...result?.[0],
    //         // sensor: sens.sensors[ind],
    //         // device: sens,
    //         length: result?.[0]?.data?.length,
    //       });
    //     }
    //   }),
    // );
    return result;
  }
  //==============================================
  async getEBReport(deviceID: string, start: string, end: string) {
    const id = new mongoose.Types.ObjectId(deviceID);
    // const sens = await this.deviceModel.findOne({ 'sensors._id': id });
    const result = await this.ebModel
      .aggregate([
        {
          $match: {
            deviceId: id,
            timestamp: {
              $gte: new Date(start),
              $lte: new Date(end),
            },
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
            _id: id,
            data: {
              $push: { x: '$timestamp', y: '$metaField.value' },
            },
          },
        },
      ])
      .sort({ timestamp: -1 });
    return result;
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
