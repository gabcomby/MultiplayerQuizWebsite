import { Injectable } from '@angular/core';
import type { Message } from '@app/interfaces/message';
import { SocketService } from '@app/services/socket.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    messagesSubject = new BehaviorSubject<Message[]>([]);
    messages$ = this.messagesSubject.asObservable();

    private messages: Message[] = [];
    private listenToMessageSubscription: Subscription | undefined;

    constructor(
        private snackbar: SnackbarService,
        private socket: SocketService,
    ) {}

    listenForMessages(): void {
        this.listenToMessageSubscription = this.socket.onChatMessage().subscribe({
            next: (message) => this.handleNewMessage(message),
            error: () => this.snackbar.openSnackBar('Pas de salle, vos messages ne seront pas envoyés'),
        });

        this.listenForSystemMessages();
    }

    stopListeningForMessages(): void {
        this.listenToMessageSubscription?.unsubscribe();
    }

    resetMessages(): void {
        this.messagesSubject = new BehaviorSubject<Message[]>([]);
        this.messages$ = this.messagesSubject.asObservable();
        this.messages = [];
    }

    // eslint-disable-next-line -- needed to send message
    sendMessage(text: string, playerName: string, roomId: string, isHost: boolean): void {
        const trimmedText = text.trim();
        if (!isHost && !playerName) {
            this.snackbar.openSnackBar('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
            return;
        }

        if (trimmedText) {
            const message: Message = {
                text: trimmedText,
                sender: isHost ? 'Organisateur' : playerName,
                timestamp: new Date(),
                visible: true,
            };
            this.handleNewMessage(message);
            this.socket.sendMessageToServer(trimmedText, message.sender, roomId);
        }
    }

    private handleNewMessage(message: Message): void {
        const newMessage = { ...message, timestamp: new Date(message.timestamp as unknown as string), visible: true };
        this.messages.push(newMessage);
        this.messagesSubject.next(this.messages);
    }

    private listenForSystemMessages(): void {
        this.socket.onSystemMessage().subscribe({
            next: (message) => this.handleNewMessage(message),
            error: () => this.snackbar.openSnackBar('Erreur lors de la réception des messages système'),
        });
    }
}
