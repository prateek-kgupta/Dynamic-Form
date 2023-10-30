import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { SocketService } from 'src/app/services/socket.service';
import { UserInfo } from 'src/app/services/user-info.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent {
  message: string = '';
  @Input() roomID;
  chats = [];
  subscribedForms = [];
  isSubscribed = false;
  currentUser = '';

  @ViewChild('chatArea') chatArea: ElementRef;

  constructor(private socket: SocketService, private user: UserInfo) {}

  ngOnInit() {
    this.socket.joinRoom(this.roomID);
    // this.socket.connect()
    this.currentUser = this.user._id;
    this.chats = this.socket.chats[this.roomID];
    console.log(this.socket.subscribedForms, '\n', this.roomID);
    this.isSubscribed = this.socket.subscribedForms.includes(this.roomID);

    this.socket.on('newMessage').subscribe(() => {
      console.log('Data fetched from service');
      this.chats = this.socket.chats[this.roomID];

      this.scrollDiv();
    });

    this.socket.on('allMessages').subscribe(() => {
      console.log('Data fetched from service');
      this.chats = this.socket.chats[this.roomID];
      this.scrollDiv();
    });

    this.socket.on('subForms').subscribe(() => {
      // this.subscribedForms = this.socket.subscribedForms
      console.log(this.socket.subscribedForms, '\n', this.roomID);
      this.isSubscribed = this.socket.subscribedForms.includes(this.roomID);
    });
  }

  sendMessage() {
    if (this.message.trim()) {
      this.socket.sendMessage(this.roomID, this.message);
      this.message = '';
      this.scrollDiv();
    }
  }

  changeSubscription() {
    if (this.isSubscribed) {
      this.socket.unsubscribeForm(this.roomID);
    } else {
      this.socket.subscribeForm(this.roomID);
    }
    // Change subscription status for the UI
    this.isSubscribed = !this.isSubscribed;
  }

  scrollDiv() {
    setTimeout(() => {
      const chatArea = this.chatArea.nativeElement;
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 10);
  }

  ngOnDestroy() {
    console.log('Component dismounted');
    this.socket.leaveChatRoom(this.roomID, this.isSubscribed);
  }
}
