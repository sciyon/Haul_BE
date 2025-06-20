import { WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  }
})
export class ProductsGateway{
  constructor(private readonly authService: AuthService){}

  @WebSocketServer()
  private readonly server: Server;

  handleProductUpdated(){
    this.server.emit('productUpdated');
  }

  handleConnection(client: Socket){
    try{
      this.authService.verifyToken(client.handshake.auth.Authentication.value);
    }catch(e){  
      throw new WsException("Unauthorized");
    }
  }
}