import { Component } from '@angular/core';
import { ChatAdapter } from 'ng-chat';
import { DemoAdapter } from './demo-adapter'
import { Socket } from 'ng-socket-io';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  username;
  joinedUsername;

  public adapter: ChatAdapter = new DemoAdapter();

  constructor(private socket: Socket) { }

  public joinRoom(): void 
  {
    this.socket.emit("join", this.username);
    this.joinedUsername = this.username;
  }
}
