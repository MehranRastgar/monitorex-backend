import { Injectable, Inject, CACHE_MANAGER, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Sensor, sensorseries } from '../sensors/sensor/sensor.model';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { ParsedDevicesData } from '../serial/serial.service';
import { Device, ebSeries, SensorType, TempDevice } from './devices.model';
import { Cache } from 'cache-manager';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { MyGateway } from '../gateway/gateway.service';
// const app =  NestFactory.create(AppModule, {
//   logger: ['error', 'warn', 'log'],
// });
@Injectable()
export class DevicesService {
  constructor(
    @InjectModel('Device') public readonly deviceModel: Model<Device>,
    @InjectModel('ebSeries') public readonly ebModel: Model<ebSeries>,
    @InjectModel('Sensor') public readonly sensorModel: Model<Sensor>,
    @InjectModel('sensorseries')
    public readonly sensorseriesModel: Model<sensorseries>,
    @InjectModel('TempDevices')
    public readonly tempDeviceModel: Model<TempDevice>,

    @Inject(forwardRef(() => SensorsService))
    public sensorsService: SensorsService,

    @Inject(forwardRef(() => MyGateway))
    public readonly gateway: MyGateway,
    @Inject(CACHE_MANAGER) public readonly cacheManager: Cache,
  ) {
    console.log('services:', 'DevicesService')



  }

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
  //=============================================================================
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
      // console.count('_id _id_id this.deviceModel.findByIdAndUpdate')
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
  async deleteDevice(deviceId: string) {
    try {
      const id = new mongoose.Types.ObjectId(deviceId);

      const result = await this.deviceModel.findByIdAndDelete(id);
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
  async updateDevicesOnCache() {

    console.log('updateDevicesOnCache')

    const devices = await this.deviceModel
      .find()

    this.cacheManager.set('devices', devices, 1000 * 60 * 2.5);
    // devices?.map((device, index) => {
    //   // console.log(index)
    //   // console.log(device.address)
    //   const cacheKey = `devices-${device.id}`;
    //   this.cacheManager.set(cacheKey, device, 1000 * 60 * 2.5);
    // })
  }
  //=============================================================================
  async getDeviceFromCacheOrDb(address: {
    Multiport: number;
    SMultiport: number;
  }): Promise<any> {
    const cacheKey = `device-${address.Multiport}-${address.SMultiport}`;

    return await this.cacheManager.get(cacheKey);


    // const cacheKey = `device-${address.Multiport}-${address.SMultiport}`;
    // console.time('gettingCache')
    // const cachedDevice = await this.cacheManager.get(cacheKey);
    // console.timeEnd('gettingCache')

    // if (cachedDevice) {
    //   // console.log('device loaded from cache ');
    //   return cachedDevice;
    // }

    // console.count('device load from db')
    // const device = await this.deviceModel
    //   .findOne({
    //     'address.multiPort': address.Multiport,
    //     'address.sMultiPort': address.SMultiport,
    //   })
    //   .exec();

    // if (device) {
    //   await this.cacheManager.set(cacheKey, device, 1000 * 60); // cache for 1 minute
    //   // console.count("cache reseted")
    // }

    // return device;
  }
  //=============================================================================
  async getLastSensorSeriesFromCacheOrDB(sensor: any): Promise<any> {
    const cacheKey = `series-${sensor?._id}`;
    const cachedDevice: { data: object, isvalid: boolean } = await this.cacheManager.get(cacheKey);
    if (cachedDevice?.isvalid) {
      // console.log('series loaded from cache ',);
      return cachedDevice?.data;
    }
    if (sensor?._id === null || sensor?._id === undefined) {
      return null
    }
    // console.log(cacheKey)
    // console.count("sensorseriesModel finded")

    // console.log("sensor id <<<===>>>",)
    const serie = await this.sensorseriesModel
      .findOne({ sensorId: sensor._id })
      .sort({ timestamp: -1 })
    // .exec();

    // if (serie) {
    // console.log("cache saved")
    await this.cacheManager.set(cacheKey, { data: serie, isvalid: true }, 1000 * 45); // cache for 1 minute
    // }
    // console.log("serie ====>>> ", serie, { sensorId: sensor._id })

    return serie;
  }
  //=============================================================================
  async addRecordToCache(
    address: { SMultiport: number; Multiport: number },
    parsedPacket: ParsedDevicesData,
  ) {
    if (parsedPacket.statuse === 240) {
      // console.log('is device');
    } else return;

    if (parsedPacket.end === 230) {
      // console.log('end is true');
    } else return;
    const devices: Device[] = await this.cacheManager.get('devices')
    const device = devices?.find((dev) => (dev?.address?.multiPort !== undefined && dev?.address?.sMultiPort !== undefined) && (dev.address.multiPort === address.Multiport && dev.address.sMultiPort === address?.SMultiport))
    const cacheKey = String(device?._id);
    await this.cacheManager.set(cacheKey, parsedPacket, 1000 * 60);
    // this.gateway.server.emit('device', parsedPacket);
    device?.sensors?.map((sensor, index) => {
      const value = parsedPacket?.sensors?.[index]
      const temp = {
        deviceId: String(device?._id),
        sensorId: String(sensor?._id),
        sensorTitle: sensor?.title,
        deviceTitle: device?.title,
        value: value,
        max: sensor?.maxAlarm,
        min: sensor?.minAlarm,
      }
      // device?.sensors?.[index]._id
      this.gateway.server.emit(String(sensor._id), {
        ...temp,
        createdAt: new Date(),
      });

      // console.log(temp)
    })
    // this.gateway.server.emit(String(sensor._id), temp);

    // this.gateway.server.emit(`device-${device?._id}`,
    //   {

    //   }
    // );
    // const cacheKey = `device-${device.address?.sMultiPort}-${device.address?.multiPort}`;
    // this.cacheManager.set(cacheKey, device, 1000 * 60 * 2.5);
    // console.log(parsedPacket)

  }
  //=============================================================================
  async saveAllSensorsDataWithInterval() {
    const devices: Device[] = await this.cacheManager.get('devices')
    let arrayOfTimeSerieseToSave: any = []
    if (devices === undefined) return
    await Promise.all(
      devices?.map(async (device, indexDev) => {
        const deviceCachedValues: any = await this.cacheManager.get(String(device?._id));
        const date = new Date();
        // console.log(deviceCachedValues)

        device?.sensors?.map((sensor, index) => {
          const newRecord = new this.sensorseriesModel({
            timestamp: this.sensorsService.setToSecondZero(date),
            sensorId: sensor._id,
            metaField: {
              value: deviceCachedValues?.sensors?.[index] ?? null,
            },
          });
          const recforsend = newRecord.toJSON()

          this.gateway.server.emit(String(recforsend.sensorId), {
            deviceId: device?._id,
            createdAt: new Date(),
            sensorId: recforsend.sensorId,
            value: recforsend.metaField.value,
            saved: true
          });
          arrayOfTimeSerieseToSave.push(newRecord)
        })

      }))
    if (arrayOfTimeSerieseToSave?.length > 0) {
      const arraySaved = await this.sensorseriesModel.insertMany(arrayOfTimeSerieseToSave);
      // console.log(arrayOfTimeSerieseToSave)
    }
    // const device = devices?.find((dev) => (dev?.address?.multiPort !== undefined && dev?.address?.sMultiPort !== undefined) && (dev.address.multiPort === address.Multiport && dev.address.sMultiPort === address?.SMultiport))
    // const cacheKey = String(device._id);
  }
  //=============================================================================
  async saveAllEbDataWithInterval() {
    const devices: Device[] = await this.cacheManager.get('devices')
    let arrayOfTimeSerieseToSave: any = [

    ]
    if (devices === undefined) return
    await Promise.all(
      devices?.map(async (device, indexDev) => {
        if (device.type === 'Electrical panel') {
          // console.log(device.title)
          const cacheKey = String(device?._id);
          let lastDataOfEB: any = await this.cacheManager.get(cacheKey);
          if (lastDataOfEB === undefined) {
            lastDataOfEB = {
              Ch1_7: null, Ch8_14: null, Ch15_21: null
            }
            const dateRef = new Date();
            dateRef.setMilliseconds(0);
            const newSerie = new this.ebModel({
              deviceId: device?._id,
              timestamp: new Date(),
              metaField: {
                byte1: null,
                byte2: null,
                byte3: null,
              },
            });
            arrayOfTimeSerieseToSave.push({ ...newSerie })
            newSerie.save()
          } else {

            const dateRef = new Date();
            dateRef.setMilliseconds(0);
            const newSerie = new this.ebModel({
              deviceId: device?._id,
              timestamp: new Date(),
              metaField: {
                byte1: lastDataOfEB?.Ch1_7,
                byte2: lastDataOfEB?.Ch8_14,
                byte3: lastDataOfEB?.Ch15_21,
              },
            });
            arrayOfTimeSerieseToSave.push({ ...newSerie })
            newSerie.save()
          }
          // console.log(lastDataOfEB)

        }
        // const deviceCachedValues: any = await this.cacheManager.get(String(device?._id));
        // const date = new Date();
        // console.log(deviceCachedValues)

        // device?.sensors?.map((sensor, index) => {
        //   const newRecord = new this.sensorseriesModel({
        //     timestamp: this.sensorsService.setToSecondZero(date),
        //     sensorId: sensor._id,
        //     metaField: {
        //       value: deviceCachedValues?.sensors?.[index] ?? null,
        //     },
        //   });
        //   const recforsend = newRecord.toJSON()

        //   this.gateway.server.emit(String(recforsend.sensorId), {
        //     deviceId: device?._id,
        //     createdAt: new Date(),
        //     sensorId: recforsend.sensorId,
        //     value: recforsend.metaField.value,
        //     saved: true
        //   });
        //   arrayOfTimeSerieseToSave.push(newRecord)
        // })

      }))
    if (arrayOfTimeSerieseToSave.length) { }
    // this.ebModel.insertMany(arrayOfTimeSerieseToSave)


    // if (arrayOfTimeSerieseToSave?.length > 0) {
    //   const arraySaved = await this.sensorseriesModel.insertMany(arrayOfTimeSerieseToSave);
    //   // console.log(arrayOfTimeSerieseToSave)
    // }
    // const device = devices?.find((dev) => (dev?.address?.multiPort !== undefined && dev?.address?.sMultiPort !== undefined) && (dev.address.multiPort === address.Multiport && dev.address.sMultiPort === address?.SMultiport))
    // const cacheKey = String(device._id);
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

    // console.log(address);

    const device = await this.getDeviceFromCacheOrDb(address);
    // const device = await this.deviceModel.findOne({
    //   'address.multiPort': address.Multiport,
    //   'address.sMultiPort': address.SMultiport,
    // });

    if (device === null) {
      return;
    }
    const dev = device?.toJSON();
    // console.log('dev.type', dev.type);
    if (dev?.type === 'Electrical panel') {
      // console.log('is tablo');
      return;
    }

    const makeSensorMany: sensorseries[] = [];
    const makeSensorslastSeries: sensorseries[] = [];
    await Promise.all(
      dev.sensors.map(async (sensor, index) => {
        //first i fill the temps

        const value: number = parsedPacket.sensors[index];

        const temp = new this.tempDeviceModel({
          deviceId: device?._id,
          sensorId: sensor?._id,
          sensorTitle: sensor?.title,
          deviceTitle: device?.title,
          value: value,
          max: sensor?.maxAlarm,
          min: sensor?.minAlarm,
        });
        // temp.save();
        // const lastData =
        const date = new Date();
        if (device?._id === undefined) {
          return;
        }

        this.gateway.server.emit(String(device?._id), temp);
        this.gateway.server.emit(String(sensor?._id), temp);
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
        // console.log("sensor ===>******",)
        const lastRec = await this.getLastSensorSeriesFromCacheOrDB(sensor);
        // console.log("lastRecorddddd ===>#######",)
        // const lastRec = await this.sensorseriesModel
        //   .findOne({ sensorId: sensor._id })
        //   .sort({ timestamp: -1 });
        // const lastRec = null;
        // const sensorSettings = await this.sensorModel.findOne({
        //   sensorUniqueName: sensorAddress,
        // });
        let resultCheck = false;
        // console.log(sensorSettings);
        //         const app =await  NestFactory.create(AppModule, {
        //   logger: ['error', 'warn', 'log'],
        // });
        //         const sensorsService = app.get(SensorsService)
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
      // console.count('makeSensorMany sensorseriesModel.insertMany')
      // console.log("makeSensorMany=>>>", makeSensorMany)
      if (makeSensorMany.length > 0) {
        const many = await this.sensorseriesModel.insertMany(makeSensorMany);
        return many;
      } else {
        return []
      }
      //makeSensorMany
      // console.count('this.deviceModel.findByIdAndUpdate')
      // const tt = await this.deviceModel.findByIdAndUpdate(
      //   new mongoose.Types.ObjectId(String(device._id)),
      //   {
      //     $set: {
      //       sensorLastSerie: makeSensorslastSeries,
      //     },
      //   },
      //   { new: true },
      // );


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
    // console.log('eb===>>', packet);
    const ETX: string = packet.substring(packet.length - 2, packet.length);
    // console.log(
    //   'end of packet',
    //   packet.substring(packet.length - 2, packet.length),
    // );

    if (ETX !== 'e6') {
      // console.count('end of packet is damages');
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
    // console.count('2 device load from db')
    // const device = await this.deviceModel.findOne({
    //   'address.multiPort': address.Multiport,
    //   'address.sMultiPort': address.SMultiport,
    // });
    // const dev = await this.getDeviceFromCacheOrDb(address);
    // console.log(address)


    const str: elecChannels = await this.ParseElectricalPacket(packet);
    const devices: Device[] = await this.cacheManager.get('devices')
    const dev = devices?.find((dev) => (dev?.address?.multiPort !== undefined && dev?.address?.sMultiPort !== undefined) && (dev.address.multiPort === address.Multiport && dev.address.sMultiPort === address?.SMultiport))
    const cacheKey = String(dev?._id);
    if (cacheKey === 'undefined') return;
    const lastDataOfEB = await this.cacheManager.get(cacheKey);
    await this.cacheManager.set(cacheKey, str, 1000 * 60);




    if (str === undefined || lastDataOfEB === undefined) {
      return
    }
    // const dev = device?.toJSON();
    // console.log(dev?.title, str)
    const dateRef = new Date();
    dateRef.setMilliseconds(0);
    // dateRef.setSeconds(0);
    // const readLastData = this.LastElectricalData(dev?._id)
    // const lastRec = await this.ebModel
    //   .findOne({ deviceId: dev?._id })
    //   .sort({ timestamp: -1 });
    const newSerie = new this.ebModel({
      deviceId: dev?._id,
      timestamp: dateRef,
      metaField: {
        byte1: str.Ch1_7,
        byte2: str.Ch8_14,
        byte3: str.Ch15_21,
      },
    });
    if (JSON.stringify(lastDataOfEB) !== JSON.stringify(str)) {

      // console.log("save to eb series", lastDataOfEB, str)

      await newSerie.save();
    } else {
      // console.log('no change in eb')
    }
    if (dev?._id === undefined) {
      return;
    }
    this.gateway.server.emit(String(dev?._id), newSerie);
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
