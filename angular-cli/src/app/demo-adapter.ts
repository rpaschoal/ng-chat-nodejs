import { ChatAdapter, User, Message, UserStatus } from 'ng-chat';
import { Observable } from "rxjs/Rx";
import { Socket } from 'ng-socket-io';
import { Http, Response } from '@angular/http';

export class DemoAdapter extends ChatAdapter
{
    private socket: Socket;
    private http: Http;
    private userId: string;

    constructor(userId: string, socket: Socket, http: Http) {
        super();
        this.socket = socket;
        this.http = http;
        this.userId = userId;

        this.InitializeSocketListerners();  
    }

    listFriends(): Observable<User[]> {
        // List connected users to show in the friends list
        // Sending the userId from the request body as this is just a demo 
        return this.http.post("http://localhost:3000/listFriends", { userId: this.userId })
        .map((res:Response) => res.json())
        //...errors if any
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    getMessageHistory(userId: any): Observable<Message[]> {
        // This could be an API call to your NodeJS application that would go to the database
        // and retrieve a N amount of history messages between the users.

        return Observable.of([]);
    }
    
    sendMessage(message: Message): void {
        this.socket.emit("sendMessage", message);

        // setTimeout(() => {
        //     let replyMessage = new Message();
            
        //     replyMessage.fromId = message.toId;
        //     replyMessage.toId = message.fromId;
        //     replyMessage.message = "You have typed '" + message.message + "'";
            
        //     let user = this.mockedUsers.find(x => x.id == replyMessage.fromId);

        //     this.onMessageReceived(user, replyMessage);
        // }, 1000);
    }

    public InitializeSocketListerners(): void
    {
      this.socket.on("messageReceived", (messageWrapper) => {
        console.log('message received');

        // Handle the received message to ng-chat
        this.onMessageReceived(messageWrapper.user, messageWrapper.message)
      });
    }
}