import { Injectable, OnModuleInit } from "@nestjs/common";
import { io, Socket } from 'socket.io-client'
@Injectable()
export class SocketClient implements OnModuleInit {

  public socketClient: Socket
  constructor() {
    this.socketClient = io('http://localhost:3051')
  }
  onModuleInit() {
    this.registerEvents()
  }
  private registerEvents() {
    this.socketClient.on('connect', () => {
      console.log('connected to mygateway')
    })
    this.socketClient.on('eve', (data) => {
      // console.log(data)
    })
  }

}