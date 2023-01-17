import { Injectable } from '@nestjs/common';
import { PacketLengthParser, ReadlineParser, SerialPort } from 'serialport';
import { DelimiterParser } from '@serialport/parser-delimiter';
import { TransformOptions } from 'stream';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sensor, sensorseries } from '../sensors/sensor/sensor.model';
import { DevicesService } from '../devices/devices.service';

const portname = 'COM4';
const baudRate = 19200;
//===========================================
interface DelimiterOptions extends TransformOptions {
  delimiter: string | Buffer | number[];

  includeDelimiter?: boolean;
}
//===========================================
export interface ParsedDevicesData {
  statuse: number;
  addrMultiPort: number;
  addrSMultiPort: number;
  end: number;
  sensors: number[];
}
@Injectable()
export class SerialService {
  constructor(
    private sensorsService: SensorsService,
    private devicesService: DevicesService,
  ) {
    // this.test_basic_connect();
    setInterval(() => this.test_basic_connect(), 3000);
    // let mybuffer: string[] = [];
  }
  port = new SerialPort({
    path: portname,
    baudRate: baudRate,
    autoOpen: false,
  });
  parser = this.port.pipe(
    new ReadlineParser({
      delimiter: [250],
      decodeStrings: false,
      encoding: 'hex',
    }),
  );
  //===========================================
  parseSensorPacket(data: string) {
    const faPart = data.substring(0, 2);
    const addr1 = data.substring(2, 4);
    const addr2 = data.substring(4, 6);
    const End = data.substring(data.length - 2, data.length);
    const Sensors = data.substring(6, data.length - 2);

    function checkIfNegativeAndMakeFinalNumber(num: number[]) {
      const checked: number[] = [];
      num.map((numi, index) => {
        if ((index + 1) % 2 !== 0) {
          if (numi === 200 && num[index + 1] === 0) {
            //is disconnect
            checked.push(Number(200000));
          } else {
            if (num?.[index + 1] >= 240) {
              const Number1 =
                '-' +
                numi?.toString() +
                '.' +
                (num?.[index + 1] - 240)?.toString();
              checked.push(Number(Number1));
            } else {
              const Number1 =
                numi?.toString() + '.' + num?.[index + 1]?.toString();
              checked.push(Number(Number1));
            }
          }
        } else {
        }
      });
      return checked;
    }
    const parsdata: number[] = [];
    let twostring = '';
    for (let i = 0; i < Sensors.length; i++) {
      twostring += Sensors[i];
      if (i % 2 !== 0) {
        parsdata.push(parseInt(twostring, 16));
        twostring = '';
      }
    }

    const parsednumbers: number[] = checkIfNegativeAndMakeFinalNumber(parsdata);
    const DeviceMap: ParsedDevicesData = {
      statuse: parseInt(faPart, 16),
      addrMultiPort: parseInt(addr2, 16),
      addrSMultiPort: parseInt(addr1, 16),
      end: parseInt(End, 16),
      sensors: [...parsednumbers],
    };
    return DeviceMap;
    // console.log('sensorPlusEnd:', DeviceMap);
  }
  //===========================================
  parseNewSensorPacket(data: string) {
    const faPart = data.substring(0, 2);
    const addr1 = data.substring(2, 4);
    const addr2 = data.substring(4, 6);
    const End = data.substring(data.length - 2, data.length);
    const Sensors = data.substring(6, data.length - 2);

    function checkIfNegativeAndMakeFinalNumber(num: number[]) {
      const checked: number[] = [];
      num.map((numi, index) => {
        if ((index + 1) % 2 !== 0) {
          if (numi === 200 && num[index + 1] === 0) {
            //is disconnect
            checked.push(Number(200000));
          } else {
            if (num?.[index + 1] >= 240) {
              const Number1 =
                '-' +
                numi?.toString() +
                '.' +
                (num?.[index + 1] - 240)?.toString();
              checked.push(Number(Number1));
            } else {
              const Number1 =
                numi?.toString() + '.' + num?.[index + 1]?.toString();
              checked.push(Number(Number1));
            }
          }
        } else {
        }
      });
      return checked;
    }
    const parsdata: number[] = [];
    let twostring = '';
    for (let i = 0; i < Sensors.length; i++) {
      twostring += Sensors[i];
      if (i % 2 !== 0) {
        parsdata.push(parseInt(twostring, 16));
        twostring = '';
      }
    }

    const parsednumbers: number[] = checkIfNegativeAndMakeFinalNumber(parsdata);
    const DeviceMap: ParsedDevicesData = {
      statuse: parseInt(faPart, 16),
      addrMultiPort: parseInt(addr2, 16),
      addrSMultiPort: parseInt(addr1, 16),
      end: parseInt(End, 16),
      sensors: [...parsednumbers],
    };
    return DeviceMap;
    // console.log('sensorPlusEnd:', DeviceMap);
  }
  //===========================================
  packetHandler(packet: string) {
    if (packet.substring(0, 2) === 'f0') {
      //valid sensor handler
      // console.log(packet);
      // const parsedData: ParsedDevicesData =
      const parsedPacket: ParsedDevicesData = this.parseSensorPacket(packet);
      // console.log(
      //   'ParsedDevicesData',
      //   parsedPacket.addrSMultiPort,
      //   parsedPacket.addrMultiPort,
      //   parsedPacket.sensors,
      // );
      // console.log(parsedPacket?.sensors.length);

      // console.log(
      //   parsedPacket?.sensors,
      //   'address:',
      //   parsedPacket.addrSMultiPort,
      //   parsedPacket.addrMultiPort,
      // );
      const address = {
        SMultiport: parsedPacket.addrSMultiPort,
        Multiport: parsedPacket.addrMultiPort,
        // Port: index,
      };
      this.devicesService.addRecordSeriesWithDevice(address, parsedPacket);
      // if (parsedPacket?.sensors.length)
      //   parsedPacket?.sensors?.map((sensitem, index) => {
      //     const address = {
      //       SMultiport: parsedPacket.addrSMultiPort,
      //       Multiport: parsedPacket.addrMultiPort,
      //       Port: index,
      //     };

      //     this.sensorsService.addRecordSeries(address, sensitem);
      //   });

      // parsedPacket?.sensors?.map((sensitem, index) => {
      //   const createUnique =
      //     parsedPacket.addrSMultiPort.toString() +
      //     '_' +
      //     parsedPacket.addrMultiPort.toLocaleString() +
      //     '_' +
      //     index.toLocaleString();
      //   this.sensorsService.addRecordSeries(createUnique, sensitem);
      // });
    }

    if (packet.substring(0, 2) === 'f5') {
      //ghat handler
    }
  }
  //===========================================
  async test_basic_connect() {
    try {
      // Switches the port into "flowing mode"
      if (this.port.isOpen === true) {
        return true;
      }
      // console.log('inited');
      SerialPort.list().then(
        (ports1) => {
          if (ports1.findIndex((po) => po.path === portname) >= 0) {
            // this.parser.
            this.port = new SerialPort({
              path: portname,
              baudRate: baudRate,
              autoOpen: true,
            });
            this.parser = this.port
              .pipe(
                new ReadlineParser({
                  delimiter: [250],
                  decodeStrings: false,
                  encoding: 'hex',
                }),
              )
              .on('data', (packet) => {
                this.packetHandler(packet);
              });

            console.log('parser listener');
            // console.log(ports1);
          } else {
            this.parser.off('data', (packet) => {
              this.packetHandler(packet);
            });
            // this.port.close();
            // console.log('com port is not connected');
            return false;
          }
          ports1.forEach(console.log);
        },
        (err) => console.error(err),
      );

      // this.port.on('data', function (data) {
      //   console.log('this.mybuffer:', data);
      // });

      return true;

      // Pipe the data into another stream (like a parser or standard out)
      // return this.mybuffer;
    } catch (err) {
      // console.log(err);
      return true;
    }
  }
}
