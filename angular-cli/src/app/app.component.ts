import { Component } from '@angular/core';
import { ChatAdapter } from 'ng-chat';
import { DemoAdapter } from './demo-adapter'
import { Socket } from 'ng-socket-io';
import { Http } from '@angular/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  
  userId: string;
  username: string;
  joinedUsername: string;

  public adapter: ChatAdapter;

  constructor(private socket: Socket, private http: Http) {
    this.InitializeSocketListerners();  
  }

  public joinRoom(): void 
  {
    this.socket.emit("join", this.username);
    this.joinedUsername = this.username;
  }

  public InitializeSocketListerners(): void
  {
    this.socket.on("generatedUserId", (userId) => {
      // Initializing the chat with the userId and the adapter with the socket instance
      this.adapter = new DemoAdapter(userId, this.socket, this.http);
      this.userId = userId;
    });
  }
}