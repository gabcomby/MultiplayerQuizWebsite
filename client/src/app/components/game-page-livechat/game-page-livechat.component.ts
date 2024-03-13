import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

const DISAPPEAR_DELAY = 3000;

interface Message {
    text: string;
    sender: string;
    timestamp?: Date | string;
    visible?: boolean;
}

@Component({
    selector: 'app-game-page-livechat',
    templateUrl: './game-page-livechat.component.html',
    styleUrls: ['./game-page-livechat.component.scss'],
    animations: [
        trigger('fade', [
            transition(':enter', [style({ opacity: 0 }), animate('500ms', style({ opacity: 1 }))]),
            transition(':leave', [animate('500ms', style({ opacity: 0 }))]),
        ]),
    ],
})
export class GamePageLivechatComponent implements OnInit, OnDestroy {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    @Input() isHost: boolean;
    @Input() roomId: string;
    messages: Message[] = [];
    text: string = '';
    private chatSubscription: Subscription;

    constructor(
        private snackbar: SnackbarService,
        private socket: SocketService,
    ) {}

    ngOnInit(): void {
        this.listenForMessages();
    }

    ngOnDestroy() {
        this.chatSubscription?.unsubscribe();
    }

    listenForMessages(): void {
        this.chatSubscription = this.socket.onChatMessage().subscribe({
            next: (message) => this.handleNewMessage(message),
            error: () => this.snackbar.openSnackBar('Pas de salle, vos messages ne seront pas envoyés'),
        });
    }

    onChatInput(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    sendMessage(): void {
        const trimmedText = this.text.trim();
        if (trimmedText) {
            this.handleNewMessage({ text: trimmedText, sender: this.isHost ? 'Organisateur' : this.playerName, timestamp: new Date() });
            this.socket.sendMessageToServer(trimmedText, this.isHost ? 'Organisateur' : this.playerName, this.roomId);
        }
        this.text = '';
    }

    handleNewMessage(message: Message): void {
        const newMessage = { ...message, timestamp: message.timestamp ? new Date(message.timestamp) : new Date(), visible: true };
        this.messages.push(newMessage);
        setTimeout(() => this.hideMessage(newMessage), DISAPPEAR_DELAY);
    }

    hideMessage(message: Message): void {
        const index = this.messages.indexOf(message);
        // eslint-disable-next-line -- Used to hide message
        if (index !== -1) {
            this.messages[index].visible = false;
            this.messages = [...this.messages];
        }
    }
}
