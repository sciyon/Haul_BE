import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
})
export class ProductsGateway{
  @WebSocketServer()
  private readonly server: Server;

  handleProductUpdated(){
    this.server.emit('productUpdated');
  }
}