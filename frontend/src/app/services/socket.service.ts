import { EventEmitter, Injectable } from '@angular/core';
import {  io } from 'socket.io-client';
import { UserInfo } from './user-info.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  chats = {};
  subscribedForms = [];
  socket;
  notifications = [];

  formDeleted = new EventEmitter()

  constructor(private user: UserInfo) {
    this.socket = io(`${environment.BACKEND_URL}`, { autoConnect: false });

    this.socket.on(
      'newMessage',
      ({ roomId, message, from, name }, acknowledgement) => {
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
        console.log('Message received on frontend for', this.user.name);
        acknowledgement(this.user._id);
      }
    );

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
      this.subscribedForms = result.map((room) => room.roomId);
      console.log(this.subscribedForms);
    });

    this.socket.on('notifications', ({ roomId, roomName }) => {
      this.notifications.push({ roomId, roomName });
      console.log(this.notifications);
    });

    this.socket.on('dbNotifications', ({ result }) => {
      console.log('In the dbNotification listener');
      console.log(result);
      const notificationArray = result.notifications;
      for (let notification of notificationArray) {
        console.log(notification);
        this.notifications.push({
          roomId: notification.roomId,
          roomName: notification.roomName,
        });
      }
      console.log(this.notifications);
    });
  }

  refreshNotifications(){
    this.formDeleted.emit()
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

  leaveChatRoom(roomId, isSubscribed){
    this.socket.emit('leaveChatRoom', {roomId, isSubscribed})
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

  unsubscribeForm(roomId) {
    this.socket.emit('unsubscribe', { roomId, userId: this.user._id });
    this.subscribedForms = this.subscribedForms.filter(
      (formId) => formId !== roomId
    );
  }

  subscribeForm(roomId) {
    this.socket.emit('subscribe', { roomId, userId: this.user._id });
    this.subscribedForms.push(roomId);
  }

  removeNotification(roomId){
    this.socket.emit('removeNotification', {roomId,userId: this.user._id})
    console.log("remove notification called")
    this.notifications = this.notifications.filter(notification => notification.roomId !== roomId)
  }

  removeAllNotifications(){
    this.socket.emit('removeAllNotifications', {userId: this.user._id})
    this.notifications = []
  }

  joinNotify(roomId){
    this.socket.emit('JoinNotifyRoom', {roomId})
  }

  connect(userId, token) {
    this.socket.auth = {token}
    this.socket.connect();
    this.socket.emit('getSubForms', { userId });
    this.socket.emit('getNotifications', { userId });
  }

  disconnect() {
    this.socket.disconnect();
  }

  on(event: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(event, (data: any) => {
        observer.next(data);
      });
    });
  }
}
