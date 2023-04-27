import { OnModuleInit } from '@nestjs/common';
import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
//react app port is important for cors
@WebSocketGateway(3051, {
  cors: {
    origin: ['*', process.env.FRONT_URL ?? 'http://192.168.1.99:3025'],
  },
})
export class MyGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      // console.log(socket.id);
      // console.log('Connected');
    });
  }

  @SubscribeMessage('newMessage')
  onNewMessage(@MessageBody() body: any) {
    // console.log(body);
    this.server.emit('onMessage', {
      msg: 'New Message',
      content: body,
    });
    this.server.emit('onMessage', body);
  }
}
