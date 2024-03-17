import { TestBed } from '@angular/core/testing';

import { MatSnackBarModule } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { ChatService } from './chat.service';
import { SnackbarService } from './snackbar.service';
import { SocketService } from './socket.service';

const DISAPPEAR_DELAY = 12000;

describe('ChatService', () => {
    let service: ChatService;
    let snackbarServiceSpy: jasmine.SpyObj<SnackbarService>;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        const SPY_SNACKBAR_SERVICE = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        const SPY_SOCKET_SERVICE = jasmine.createSpyObj('SocketService', ['onChatMessage', 'sendMessageToServer']);

        SPY_SOCKET_SERVICE.onChatMessage.and.returnValue(of({ text: 'test', sender: 'test', timestamp: new Date() }));

        jasmine.clock().install();

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: SnackbarService, useValue: SPY_SNACKBAR_SERVICE },
                { provide: SocketService, useValue: SPY_SOCKET_SERVICE },
            ],
            imports: [MatSnackBarModule],
        });
        service = TestBed.inject(ChatService);
        snackbarServiceSpy = TestBed.inject(SnackbarService) as jasmine.SpyObj<SnackbarService>;
        socketServiceSpy = TestBed.inject(SocketService) as jasmine.SpyObj<SocketService>;
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should listen for messages', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.listenForMessages();
        expect(socketServiceSpy.onChatMessage).toHaveBeenCalled();
    });

    it('should send message', () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage('test', 'test', 'test', true);
        expect(socketServiceSpy.sendMessageToServer).toHaveBeenCalled();
    });

    it('should handle new message', () => {
        const initialTimestamp = new Date();
        const message = { text: 'test', sender: 'test', timestamp: initialTimestamp };
        service['handleNewMessage'](message);

        const expectedMessage = {
            ...message,
            timestamp: jasmine.any(Date),
            visible: true,
        };

        expect(service.messagesSubject.value[0]).toEqual(expectedMessage);
    });

    it('should hide message', () => {
        const initialTimestamp = new Date();
        const message = { text: 'test', sender: 'test', timestamp: initialTimestamp };
        service['handleNewMessage'](message);
        const messageToHide = service.messagesSubject.value[0];
        service['hideMessage'](messageToHide);

        expect(service.messagesSubject.value[0].visible).toBeFalse();
    });

    it("shouldn't send message if the playerNmae is empty", () => {
        snackbarServiceSpy.openSnackBar.and.returnValue();
        service.sendMessage('test', '', 'test', false);
        expect(socketServiceSpy.sendMessageToServer).not.toHaveBeenCalled();
    });

    it('should handle error when listening for messages fails', () => {
        socketServiceSpy.onChatMessage.and.returnValue(throwError(() => new Error('Error')));

        service.listenForMessages();
        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Pas de salle, vos messages ne seront pas envoyés');
    });

    it('should hide a new message after DISAPPEAR_DELAY', () => {
        const testMessage = { text: 'Test message', sender: 'Tester', timestamp: new Date().toISOString(), visible: true };
        service['handleNewMessage'](testMessage);

        jasmine.clock().tick(DISAPPEAR_DELAY);

        const messages = service.messagesSubject.value;
        expect(messages[messages.length - 1].visible).toBeFalse();
    });

    it('should not send message if not host and no playerName provided', () => {
        const text = 'Hello World';
        const playerName = '';
        const roomId = '123';
        const isHost = false;

        service.sendMessage(text, playerName, roomId, isHost);

        expect(snackbarServiceSpy.openSnackBar).toHaveBeenCalledWith('Vous êtes déconnecté du chat, vos messages ne seront pas envoyés');
        expect(socketServiceSpy.sendMessageToServer).not.toHaveBeenCalled();
    });
});
