import { animate, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

const DISAPPEAR_DELAY = 10000;
const MESSAGE_NOT_FOUND = -1;

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
export class GamePageLivechatComponent {
    @ViewChild('textbox') textbox: ElementRef;
    @Input() playerName: string;
    @Input() isHost: boolean = false;
    messages: { text: string; sender: string; visible: boolean }[] = [];
    newMessage: string = '';

    onChatClick(): void {
        this.textbox.nativeElement.focus();
    }

    onChatEnterPressed(event: Event): void {
        event.preventDefault();
        this.sendMessage();
    }

    sendMessage(): void {
        this.newMessage = this.newMessage.trim();
        if (this.newMessage) {
            this.addMessageToData();
        }
        this.newMessage = '';
    }

    hideMessage(message: { text: string; sender: string; visible: boolean }): void {
        message.visible = false;
        const index = this.messages.indexOf(message);
        if (index !== MESSAGE_NOT_FOUND) {
            this.messages.splice(index, 1);
        }
    }

    private addMessageToData(): void {
        const message = { text: this.newMessage, sender: this.playerName ? this.playerName : '' + this.isHost ? ' Organisateur' : '', visible: true };
        this.messages.push(message);
        setTimeout(() => this.hideMessage(message), DISAPPEAR_DELAY);
    }
}
