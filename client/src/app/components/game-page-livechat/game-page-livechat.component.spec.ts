import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ChatService } from '@app/services/chat/chat.service';
import { of } from 'rxjs';
import { GamePageLivechatComponent } from './game-page-livechat.component';

describe('GamePageLivechatComponent', () => {
    let component: GamePageLivechatComponent;
    let fixture: ComponentFixture<GamePageLivechatComponent>;
    let chatServiceMock: jasmine.SpyObj<ChatService>;

    beforeEach(async () => {
        chatServiceMock = jasmine.createSpyObj('ChatService', [
            'listenForMessages',
            'listenForSystemMessages',
            'sendMessage',
            'stopListeningForMessages',
            'stopListeningForSystemMessages',
        ]);
        chatServiceMock.messages$ = of([]);
        await TestBed.configureTestingModule({
            declarations: [GamePageLivechatComponent],
            imports: [FormsModule, MatIconModule],
            providers: [{ provide: ChatService, useValue: chatServiceMock }],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageLivechatComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        fixture.destroy();
    });

    it('should listen for messages on init', () => {
        component.ngOnInit();
        expect(chatServiceMock.listenForMessages).toHaveBeenCalled();
    });

    it('should call sendMessage when onChatInput is triggered', () => {
        component.playerName = 'John Doe';
        component.roomId = 'room123';
        component.isHost = true;

        const event = new Event('input');
        spyOn(event, 'preventDefault');

        component.onChatInput(event);

        expect(event.preventDefault).toHaveBeenCalled();
        expect(chatServiceMock.sendMessage).toHaveBeenCalledWith({
            text: '',
            playerName: 'John Doe',
            roomId: 'room123',
            isHost: true,
        });
        expect(component.text).toBe('');
    });
});
