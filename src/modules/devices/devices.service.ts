import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MyGateway } from '../gateway/gateway';
import { Sensor, sensorseries } from '../sensors/sensor/sensor.model';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { ParsedDevicesData } from '../serial/serial.service';
import { Device, ebSeries, SensorType, TempDevice } from './devices.model';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
    @InjectModel('ebSeries') private readonly ebModel: Model<ebSeries>,
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
    @InjectModel('sensorseries')
    private readonly sensorseriesModel: Model<sensorseries>,
    @InjectModel('TempDevices')
    private readonly tempDeviceModel: Model<TempDevice>,
    private sensorsService: SensorsService,
    private gateway: MyGateway,
  ) {}
  //=============================================================================
  async insertDevice(DeviceData: Device): Promise<Device | string> {
    const newDevice = new this.deviceModel({ ...DeviceData });
    try {
      const result = await newDevice.save();
      return result;
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
    // console.log('dev.type', dev.type);
    if (dev?.type === 'Electrical panel') {
      console.log('is tablo');
      return;
    }

    const makeSensorMany: sensorseries[] = [];
    const makeSensorslastSeries: sensorseries[] = [];
    await Promise.all(
      dev.sensors.map(async (sensor, index) => {
        //first i fill the temps

        const value: number = parsedPacket.sensors[index];

        const temp = new this.tempDeviceModel({
          deviceId: device._id,
          sensorId: sensor._id,
          value: value,
          max: sensor.maxAlarm,
          min: sensor.minAlarm,
        });
        temp.save();
        // const lastData =
        const date = new Date();
        this.gateway.server.emit(String(device._id), temp);
        this.gateway.server.emit(String(sensor._id), temp);
        if (temp?.value > sensor.maxAlarm) {
          this.gateway.server.emit('alarms', {
            message: 'maximum Range',
            value: sensor.maxAlarm,
            sensorId: sensor._id,
            sensorTitle: sensor.title,
          });
        }
        if (temp?.value < sensor.minAlarm) {
          this.gateway.server.emit('alarms', {
            message: 'minimum Range',
            value: sensor.minAlarm,
            sensorId: sensor._id,
            sensorTitle: sensor.title,
          });
        }
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
        //

        // console.log(sensor._id);
        if (resultCheck === true && value !== 200000)
          makeSensorMany.push(newRecord);
        makeSensorslastSeries.push(newRecord);
      }),
    );
    try {
      const many = await this.sensorseriesModel.insertMany(makeSensorMany); //makeSensorMany

      const tt = await this.deviceModel.findByIdAndUpdate(
        new mongoose.Types.ObjectId(String(device._id)),
        {
          $set: {
            sensorLastSerie: makeSensorslastSeries,
          },
        },
        { new: true },
      );

      // console.log(
      //   '=================>>>>>>>>>>>>>>>>>>>>>>',
      //   makeSensorMany.length,
      //   makeSensorslastSeries.length,
      // );
      return many;
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
  //=============================================================================
  async ParseElectricalPacket(packet: string): Promise<elecChannels> {
    console.log('eb===>>', packet);
    const ETX: string = packet.substring(packet.length - 2, packet.length);
    console.log(
      'end of packet',
      packet.substring(packet.length - 2, packet.length),
    );

    if (ETX !== 'e6') {
      console.log('end of packet is damages');
      return;
    }
    const data = packet.substring(6, packet.length - 2);
    const Ch1_7 = data.substring(0, 2);
    const Ch8_14 = data.substring(2, 4);
    const Ch15_21 = data.substring(4, 6);
    // const hen = data.length / 2;
    // let str = '';
    // for (let i = 0; i < hen; i++) {
    //   const x = data.substring(i * 2, i * 2 + 2);
    //   str += parseInt(x, 16).toString(2).substring(0, 7);
    // }
    // console.log(Ch1_7, Ch8_14, Ch15_21);
    return {
      Ch1_7: parseInt(Ch1_7, 16),
      Ch8_14: parseInt(Ch8_14, 16),
      Ch15_21: parseInt(Ch15_21, 16),
    } as elecChannels;
  }
  //=============================================================================
  async addElectricalBoardSerries(
    address: { SMultiport: number; Multiport: number },
    packet: string,
  ) {
    const device = await this.deviceModel.findOne({
      'address.multiPort': address.Multiport,
      'address.sMultiPort': address.SMultiport,
    });
    const dev = device.toJSON();
    const str: elecChannels = await this.ParseElectricalPacket(packet);
    const dateRef = new Date();
    dateRef.setMilliseconds(0);
    dateRef.setSeconds(0);
    const lastRec = await this.ebModel
      .findOne({ deviceId: device._id })
      .sort({ timestamp: -1 });
    const newSerie = new this.ebModel({
      deviceId: device._id,
      timestamp: dateRef,
      metaField: {
        byte1: str.Ch1_7,
        byte2: str.Ch8_14,
        byte3: str.Ch15_21,
      },
    });

    if (
      lastRec?.timestamp < dateRef ||
      lastRec?.timestamp === undefined ||
      newSerie.metaField.byte1 !== lastRec.metaField.byte1 ||
      newSerie.metaField.byte2 !== lastRec.metaField.byte2 ||
      newSerie.metaField.byte3 !== lastRec.metaField.byte3
    ) {
      await newSerie.save();
    }
    this.gateway.server.emit(String(device._id), newSerie);
    // console.log(str, dev);
  }
}
//   {
//     timestamp: mongoose.Schema.Types.Date,
//     deviceId: mongoose.Schema.Types.ObjectId,
//     metaField: {
//       byte1: Number,
//       byte2: Number,
//       byte3: Number,
//     },
//   },

export interface elecChannels {
  Ch1_7: number;
  Ch8_14: number;
  Ch15_21: number;
}
