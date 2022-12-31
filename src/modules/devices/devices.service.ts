import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Sensor } from '../sensors/sensor/sensor.model';
import { Device } from './devices.model';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel('Device') private readonly deviceModel: Model<Device>,
    @InjectModel('Sensor') private readonly sensorModel: Model<Sensor>,
  ) {}

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
  async getDeviceSensors(deviceid: any) {
    // sensorModel.find()
    try {
      return 'result';
    } catch (err) {
      return 'err:' + JSON.stringify(err);
    }
  }
}
