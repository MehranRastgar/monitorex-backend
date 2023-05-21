import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket } from 'dgram';
import { readFileSync } from 'fs';
import { createServer } from 'https';
// import { Cache } from 'cache-manager';
// import { SensorsService } from '../sensors/sensor/sensors.service';
// import { DevicesService } from '../devices/devices.service';

import { Server } from 'socket.io';

// react app port is important for cors
@WebSocketGateway(3051, {
  secure: true,
  cors: {
    origin: ['*', process.env.FRONT_URL ?? 'http://localhost:3025'],
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  // httpsServer = createServer({
  //   key: readFileSync('key.pem'),
  //   cert: readFileSync('cert.pem'),
  // });
  // server = new Server(this.httpsServer);
  server: Server;
  client: Socket;

  // serial: SerialService;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log(socket.id);
      // console.log('Connected');
      // this.serial.packetHandler(socket.id);
    });
  }
  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
    this.server.emit('onMessage', body);
  }
  @SubscribeMessage('fromDevice')
  fromDevice(@MessageBody() data: string): string {
    console.log(data);
    return data;
  }

  // inamAzin() {
  //   return 'inamAzin';
  // }
}
export const MyGatewayInstance = new MyGateway();
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
