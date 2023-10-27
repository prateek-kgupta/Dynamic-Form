import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { UserInfo } from './user-info.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  // isLoggedIn: boolean;
  chats = {};
  subscribedForms = [];
  socket;
  notifications = [];

  constructor(private user: UserInfo) {
    this.socket = io('http://localhost:3000', { autoConnect: false });

    this.socket.on('newMessage', ({ roomId, message, from, name }) => {
      console.log('Message received from backend\n', {
        roomId,
        message,
        from,
        name,
      });
      if (!this.chats[roomId]) {
        this.chats[roomId] = [];
      }
      this.chats[roomId].push({ from, name, message });
      console.log(this.chats[roomId]);
    });

    this.socket.on('allMessages', ({ allChats }) => {
      console.log('Getting new messages');
      console.log(allChats);
      for (let room of allChats) {
        if (!this.chats[room.roomId]) {
          this.chats[room.roomId] = [];
        }
        // this.chats[room.roomId].push(...room.chat);
        this.chats[room.roomId] = room.chat;
      }
      console.log(this.chats);
    });

    this.socket.on('subForms', ({ result }) => {
      // console.log(result)
      this.subscribedForms = result.map((room) => room.roomId);
      console.log(this.subscribedForms);
    });

    this.socket.on('notifications', ({ roomId }) => {
      this.notifications.push({ roomId });
      console.log(this.notifications);
    });

    this.socket.on('dbNotifications', ({result}) => {
      console.log("In the dbNotification listener")
      console.log(result)
      const notificationArray = result.notifications
      for(let notification of notificationArray){
        console.log(notification)
        this.notifications.push({roomId: notification})
      }
      console.log(this.notifications)

    })
  }

  joinRoom(roomId) {
    console.log('Called join room');
    this.socket.emit('join', {
      roomId,
      userId: this.user._id,
    });
    if (!this.chats[roomId]) {
      this.chats[roomId] = [];
    }
  }

  sendMessage(roomId, message) {
    this.socket.emit('newMessage', {
      roomId,
      message,
      from: this.user._id,
      name: this.user.name,
    });

    if (!this.chats[roomId]) {
      this.chats[roomId] = [];
    }
    this.chats[roomId].push({
      from: this.user._id,
      name: this.user.name,
      message,
    });
  }

  unsubscribeForm(roomId){
    this.socket.emit('unsubscribe', {roomId, userId: this.user._id})
    this.subscribedForms = this.subscribedForms.filter(formId => formId !== roomId)
  }

  subscribeForm(roomId){
    this.socket.emit('subscribe', {roomId, userId: this.user._id})
    this.subscribedForms.push(roomId)
  }

  connect(userId) {
    this.socket.connect();
    this.socket.emit('getSubForms', { userId });
    this.socket.emit('getNotifications', {userId})
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }
}
