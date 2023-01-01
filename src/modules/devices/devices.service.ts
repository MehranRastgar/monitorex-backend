import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MyGateway } from '../gateway/gateway';
import { Sensor, sensorseries } from '../sensors/sensor/sensor.model';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { ParsedDevicesData } from '../serial/serial.service';
import { Device, TempDevice } from './devices.model';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
    @InjectModel('sensorseries')
    private readonly sensorseriesModel: Model<sensorseries>,
    @InjectModel('TempDevices')
    private readonly tempDeviceModel: Model<TempDevice>,
    private sensorsService: SensorsService,
    private gateway: MyGateway,
  ) {}
  //=============================================================================
  async insertDevice(DeviceData: Device) {
    const newDevice = new this.deviceModel({ ...DeviceData });
    try {
      const result = await newDevice.save();
      return result._id;
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
  async getDevices(query: any) {
    try {
      const devices = this.deviceModel.find();
      return devices;
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
  //=============================================================================
  async putDevice(deviceId: string, body: Device) {
    try {
      const id = new mongoose.Types.ObjectId(deviceId);
      delete body['_id'];
      const result = await this.deviceModel.findByIdAndUpdate(
        id,
        {
          $set: {
            ...body,
          },
        },
        { new: true },
      );
      return result;
    } catch (e) {
      console.log(e);
      return e;
    }
  }
  //=============================================================================
  async getDeviceSensors(deviceid: any) {
    // sensorModel.find()
    try {
      return 'result';
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
  //=============================================================================
  async addRecordSeriesWithDevice(
    address: { SMultiport: number; Multiport: number },
    parsedPacket: ParsedDevicesData,
  ) {
    if (parsedPacket.statuse === 240) {
      // console.log('is device');
    } else return;

    if (parsedPacket.end === 230) {
      // console.log('end is true');
    } else return;

    console.log(address);
    const device = await this.deviceModel.findOne({
      'address.multiPort': address.Multiport,
      'address.sMultiPort': address.SMultiport,
    });
    if (device === null) {
      return;
    }
    const dev = device.toJSON();

    // console.log('sensors:', dev.sensors.length);
    // console.log('factors:', dev.factors.length);

    const makeSensorMany: any[] = [];
    await Promise.all(
      dev.sensors.map(async (sensor, index) => {
        //first i fill the temps

        const value: number = parsedPacket.sensors[index];

        const temp = new this.tempDeviceModel({
          deviceId: device._id,
          sensorId: sensor._id,
          value: value,
        });
        temp.save();
        // const lastData =
        const date = new Date();
        this.gateway.server.emit(String(device._id), temp);
        this.gateway.server.emit(String(sensor._id), temp);

        const lastRec = await this.sensorseriesModel
          .findOne({ sensorId: sensor._id })
          .sort({ timestamp: -1 });
        // const sensorSettings = await this.sensorModel.findOne({
        //   sensorUniqueName: sensorAddress,
        // });
        let resultCheck = false;
        // console.log(sensorSettings);

        if (date === null) {
          resultCheck = true;
        } else {
          resultCheck = await this.sensorsService.checkTimeStampWithRsolution(
            sensor.resolution,
            date,
            new mongoose.Types.ObjectId(String(sensor._id)),
          );
        }
        const averageCalc: number =
          ((lastRec?.metaField?.average ?? value) *
            (lastRec?.metaField?.incremental ?? 0) +
            value) /
          ((lastRec?.metaField?.incremental ?? 0) + 1);
        // console.log(averageCalc);
        const newRecord = new this.sensorseriesModel({
          timestamp: this.sensorsService.setToSecondZero(date),
          sensorId: sensor._id,
          metaField: {
            incremental: (lastRec?.metaField?.incremental ?? 0) + 1,

            value: value,
            average: averageCalc,
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
        //newRecord._id
        console.log(sensor._id);

        if (resultCheck === true && value !== 200000)
          makeSensorMany.push(newRecord);
      }),
    );
    try {
      const many = await this.sensorseriesModel.insertMany(makeSensorMany);
      console.log(
        '=================>>>>>>>>>>>>>>>>>>>>>>',
        makeSensorMany.length,
      );
      return many;
      // const result = await many.save();
      // console.log(result);
    } catch (e) {
      console.log(e);
    }
    // const insertMany = new this.sensorseriesModel();
    // const res = await insertMany.insertMany();
    // console.log(insertMany);

    // dev.factors.map((factor, index) => {
    //   console.log(factor, index);
    // });
  }
}

// [
//   {
//     timestamp: 2022-12-31T16:05:53.905Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b38"),
//     metaField: {
//       incremental: 1,
//       value: 21,
//       max: 21,
//       min: 21,
//       average: 21
//     },
//     _id: new ObjectId("63b05de1ac5f4a4fe9183f7c")
//   },
//   {
//     timestamp: 2022-12-31T16:05:53.909Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b39"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b05de1ac5f4a4fe9183f7d")
//   },
//   {
//     timestamp: 2022-12-31T16:05:53.909Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b3a"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b05de1ac5f4a4fe9183f7e")
//   },
//   {
//     timestamp: 2022-12-31T16:05:53.910Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b3b"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b05de1ac5f4a4fe9183f7f")
//   }
// ]
// [
// {
//   timestamp: 2022-12-31T16:17:19.683Z,
//   sensorId: new ObjectId("63af0a208cddd72ced131b38"),
//   metaField: { incremental: 1, value: 21, max: 21, min: 21, average: 21 },
//   _id: new ObjectId("63b0608f8f5849ccb350d16a")
// },
// {
//   timestamp: 2022-12-31T16:17:19.683Z,
//   sensorId: new ObjectId("63af0a208cddd72ced131b39"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d16b")
// },
// {
//   timestamp: 2022-12-31T16:17:19.683Z,
//   sensorId: new ObjectId("63af0a208cddd72ced131b3a"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d16c")
// },
// {
//   timestamp: 2022-12-31T16:17:19.684Z,
//   sensorId: new ObjectId("63af0a208cddd72ced131b3b"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d16d")
// },
// {
//   timestamp: 2022-12-31T16:17:19.684Z,
//   sensorId: new ObjectId("63b0604c8f5849ccb350d034"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d16e")
// },
// {
//   timestamp: 2022-12-31T16:17:19.684Z,
//   sensorId: new ObjectId("63b0604c8f5849ccb350d035"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d16f")
// },
// {
//   timestamp: 2022-12-31T16:17:19.684Z,
//   sensorId: new ObjectId("63b0604c8f5849ccb350d036"),
//   metaField: {
//     incremental: 1,
//     value: 200000,
//     max: 200000,
//     min: 200000,
//     average: 200000
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d170")
// },
// {
//   timestamp: 2022-12-31T16:17:19.684Z,
//   sensorId: new ObjectId("63b0604c8f5849ccb350d037"),
//   metaField: {
//     incremental: 1,
//     value: 35.5,
//     max: 35.5,
//     min: 35.5,
//     average: 35.5
//   },
//   _id: new ObjectId("63b0608f8f5849ccb350d171")
// }
// ]

// [
//   {
//     timestamp: 2022-12-31T16:29:55.829Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b38"),
//     metaField: {
//       incremental: 1,
//       value: 21,
//       max: 21,
//       min: 21,
//       average: 21
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09da"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.831Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b39"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09db"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.832Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b3a"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09dc"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.832Z,
//     sensorId: new ObjectId("63af0a208cddd72ced131b3b"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09dd"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.833Z,
//     sensorId: new ObjectId("63b0604c8f5849ccb350d034"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09de"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.833Z,
//     sensorId: new ObjectId("63b0604c8f5849ccb350d035"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09df"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.834Z,
//     sensorId: new ObjectId("63b0604c8f5849ccb350d036"),
//     metaField: {
//       incremental: 1,
//       value: 200000,
//       max: 200000,
//       min: 200000,
//       average: 200000
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09e0"),
//     __v: 0
//   },
//   {
//     timestamp: 2022-12-31T16:29:55.834Z,
//     sensorId: new ObjectId("63b0604c8f5849ccb350d037"),
//     metaField: {
//       incremental: 1,
//       value: 35.4,
//       max: 35.4,
//       min: 35.4,
//       average: 35.4
//     },
//     _id: new ObjectId("63b063832c4f359bf80d09e1"),
//     __v: 0
//   }
// ]
// is device
// end is true
// { SMultiport: 1, Multiport: 1 }
