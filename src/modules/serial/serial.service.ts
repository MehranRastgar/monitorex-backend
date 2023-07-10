import { SubscribeMessage } from '@nestjs/websockets';
import { Injectable, Inject, CACHE_MANAGER, forwardRef } from '@nestjs/common';
import { ReadlineParser, SerialPort } from 'serialport';
import { TransformOptions } from 'stream';

import { DevicesService } from '../devices/devices.service';

import { Cache } from 'cache-manager';
import { ModuleRef } from '@nestjs/core';
import { Server } from 'socket.io';
import { MyGateway } from '../gateway/gateway.service';

// const portname = '/dev/ttyUSB0' ?? process.env.SERIAL_PORT_NAME;
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

    @Inject(forwardRef(() => MyGateway))
    private gateway: MyGateway,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
    // private server: Server,
    // @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    // this.test_basic_connect();
    console.log('services:', 'SerialService')

    setInterval(() => {
      this.test_basic_connect();
      // this.initialApp();
    }, 3000);

    this.initSocket()
    // let mybuffer: string[] = [];
  }
  port = new SerialPort({
    path: process.env.SERIAL_PORT_NAME,
    baudRate: parseInt(process.env.SERIAL_BUADRATE) ?? baudRate,
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

  async initialApp() {
    // console.log(this.gateway.inamAzin());
  }
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
    // this.gateway.server.emit('terminal', packet);

    if (packet.substring(0, 2) === 'f0') {
      const parsedPacket: ParsedDevicesData = this.parseSensorPacket(packet);
      const address = {
        SMultiport: parsedPacket.addrSMultiPort,
        Multiport: parsedPacket.addrMultiPort,
      };
      // this.devicesService.addRecordSeriesWithDevice(address, parsedPacket);
      this.devicesService.addRecordToCache(address, parsedPacket);
      return;
    }
    if (packet.substring(0, 2) === 'eb') {
      const parsedPacket: ParsedDevicesData = this.parseSensorPacket(packet);
      const address = {
        SMultiport: parsedPacket.addrSMultiPort,
        Multiport: parsedPacket.addrMultiPort,
      };
      // console.log(parsedPacket)
      this.devicesService.addElectricalBoardSerries(address, packet);
      // console.log('is electrical');
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
          if (
            ports1.findIndex(
              (po) => po.path === process.env.SERIAL_PORT_NAME,
            ) >= 0
          ) {
            // this.parser.
            this.port = new SerialPort({
              path: process.env.SERIAL_PORT_NAME,
              baudRate: parseInt(process.env.SERIAL_BUADRATE) ?? baudRate,
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
            console.log(ports1);
          } else {
            this.parser.off('data', (packet) => {
              this.packetHandler(packet);
            });
            // this.port.close();
            // console.log('com port is not connected', ports1);

            return false;
          }
          // ports1.forEach(console.log);
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
  async initSocket() {
    // await this.gateway.onModuleInit()
    // this.gateway.moduleInitAlternate()
  }
}
