// import { CACHE_MANAGER, Inject, Injectable, OnModuleInit, forwardRef } from '@nestjs/common';
// import {
//   MessageBody,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import { Socket } from 'dgram';
// // import { readFileSync } from 'fs';
// // import { createServer } from 'https';
// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { SerialService } from '../serial/serial.service';
// import { InjectModel } from '@nestjs/mongoose';
// import { Device } from '../devices/entities/device.entity';
// import { Model } from 'mongoose';
// import { Sensor, TempDevice, ebSeries } from '../devices/devices.model';
// import { sensorseries } from '../sensors/sensor/sensor.model';
// import { SensorsService } from '../sensors/sensor/sensors.service';
// import { Cache } from 'cache-manager';
// import { DevicesService } from '../devices/devices.service';






// // react app port is important for cors
// @WebSocketGateway(3051, {
//   secure: true,
//   cors: {
//     origin: ['*', process.env.FRONT_URL ?? 'http://localhost:3025'],
//   },
// })
// @Injectable()
// export class MyGateway implements OnModuleInit {
// constructor(
// //   @Inject(forwardRef(() => SensorsService))
// //   private sensorService:SensorsService
//   ){

// }
//   @WebSocketServer()
//   // httpsServer = createServer({
//   //   key: readFileSync('key.pem'),
//   //   cert: readFileSync('cert.pem'),
//   // });
//   // server = new Server(this.httpsServer);
//   server: Server;
//   client: Socket;

//   // serial: SerialService;

//   onModuleInit() {

//   }

//   moduleInitAlternate(){
//      this.server.on('connection', (socket) => {
//       console.log(socket.id);
//       console.log('Connected');

//       // this.serial.packetHandler(socket.id);
//     });




//   }

//   // @SubscribeMessage('newMessage')
//   // onNewMessage(@MessageBody() body: any) {
//   //   // console.log(body);
//   //   // this.server.emit('onMessage', {
//   //   //   msg: 'New Message',
//   //   //   content: body,
//   //   // });
//   //   this.server.emit('onMessage', body);
//   // }
//   @SubscribeMessage('fromDevice')
//   fromDevice(@MessageBody() data: string): string {
//     console.log(data);

//     return data;
//   }

//   // inamAzin() {
//   //   return 'inamAzin';
//   // }
// }
// import * as fs from 'fs';

// import * as https from 'https';

// @WebSocketGateway(3051, {
//   origin: ['http://localhost:3025', process.env.FRONT_URL],
//   // secure: true,
// })
// export class MyGateway implements OnModuleInit {
//   @WebSocketServer()
//   // httpServer = https.createServer({
//   //   key: fs.readFileSync('key.pem'),
//   //   cert: fs.readFileSync('cert.pem'),
//   //   // minVersion: 'TLSv1.2',
//   //   // maxVersion: 'TLSv1.2',
//   // });
//   // options = {
//   //   /* ... */
//   // };
//   server: Server;
//   onModuleInit() {
//     this.server.on('connection', (socket) => {
//       console.log(socket.id);
//       // console.log('Connected');
//     });
//   }

//   @SubscribeMessage('newMessage')
//   onNewMessage(@MessageBody() body: any) {
//     // console.log(body);
//     this.server.emit('onMessage', {
//       msg: 'New Message',
//       content: body,
//     });
//     this.server.emit('onMessage', body);
//   }
// }



import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsResponse,
} from '@nestjs/websockets';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Server, Socket } from 'socket.io';
import { SensorsService } from '../sensors/sensor/sensors.service';
import { Inject, OnModuleInit, forwardRef } from '@nestjs/common';
import { Document, Types } from 'mongoose';
import { Sensor } from '../sensors/sensor/sensor.model';
import { SerialService } from '../serial/serial.service';
import { MyGateway } from './gateway.service';
import { DevicesService } from '../devices/devices.service';

@WebSocketGateway(3051, {
  secure: true,
  cors: {
    origin: '*',
  },
  namespace: 'fromAway'
})
export class FromAway implements OnModuleInit {

  @WebSocketServer()
  server: Server;
  socket: Socket;
  constructor(
    @Inject(forwardRef(() => SerialService))
    private serial: SerialService,
    @Inject(forwardRef(() => MyGateway))
    private gateway: MyGateway,
    @Inject(forwardRef(() => DevicesService))
    private devicesService: DevicesService,
  ) {

  }
  onModuleInit() {
    this.moduleInitAlternate()
  }


  @SubscribeMessage('fromDevice')
  fromDevice(@MessageBody() data: any) {

    // console.log(data)
    this.serial.packetHandler(data)
    return data;
  }

  moduleInitAlternate() {
    this.server.on('connection', (socket) => {
      console.log(socket.id)
      console.log('connected')
    })
    this.server.on('events', (socket) => {
      console.log(socket.id)
      console.log('connected')

    })

  }
}