import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Game, Question } from '@app/interfaces/game';
import { Match } from '@app/interfaces/match';
import { ApiService } from '@app/services/api.service';
import { MatchService } from '@app/services/match.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { of, throwError } from 'rxjs';
import { GamePageComponent } from './game-page.component';

// const TEN = 10;

const TIME_BETWEEN_QUESTIONS = 3000;

const questionMock: Question[] = [
    {
        type: 'multiple-choice',
        text: 'Question 1?',
        points: 10,
        choices: [
            { text: 'Answer 1', isCorrect: false },
            { text: 'Answer 2', isCorrect: true },
        ],
        lastModification: new Date(),
        id: 'q1',
    },
    {
        type: 'multiple-choice',
        text: 'Question 2?',
        points: 10,
        choices: [
            { text: 'Answer 1', isCorrect: true },
            { text: 'Answer 2', isCorrect: false },
        ],
        lastModification: new Date(),
        id: 'q2',
    },
];
const mockedGameData: Game = {
    id: 'game123',
    title: 'Test Game',
    description: 'Test Game Description',
    isVisible: true,
    duration: 10,
    lastModification: new Date(),
    questions: questionMock,
};
const mockedMatchData: Match = {
    id: 'match123',
    playerList: [],
};
const updatedMatchDataWithPlayer: Match = {
    ...mockedMatchData,
    playerList: [{ id: 'playertest', name: 'Player 1', score: 0 }],
};

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let matchService: jasmine.SpyObj<MatchService>;
    let socketService: jasmine.SpyObj<SocketService>;
    let router: Router;

    beforeEach(async () => {
        const mockActivatedRoute = {
            snapshot: {
                params: { id: 'testGameId' },
            },
        };

        matchService = jasmine.createSpyObj('MatchService', ['createNewMatch', 'addPlayer', 'deleteMatch', 'updatePlayerScore']);
        socketService = jasmine.createSpyObj('SocketService', [
            'connect',
            'disconnect',
            'startTimer',
            'stopTimer',
            'onTimerCountdown',
            'onAnswerVerification',
            'setTimerDuration',
            'verifyAnswers',
        ]);

        matchService.createNewMatch.and.returnValue(of(mockedMatchData));
        matchService.addPlayer.and.returnValue(of(updatedMatchDataWithPlayer));

        await TestBed.configureTestingModule({
            declarations: [GamePageComponent],
            imports: [RouterTestingModule, HttpClientTestingModule, MatSnackBarModule],
            providers: [
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: MatchService, useValue: matchService },
                { provide: SocketService, useValue: socketService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(GamePageComponent);
        router = TestBed.inject(Router);
        spyOn(router, 'navigate');
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should correctly initialize match and add player on init', async () => {
        spyOn(component, 'createMatch').and.callThrough();
        spyOn(component, 'addPlayerToMatch').and.callThrough();

        fixture.detectChanges();

        await fixture.whenStable();

        expect(matchService.createNewMatch).toHaveBeenCalledWith({ id: jasmine.any(String), playerList: [] });
        expect(matchService.addPlayer).toHaveBeenCalledWith({ id: 'playertest', name: 'Player 1', score: 0 }, jasmine.any(String));

        expect(component.currentMatch).toEqual(updatedMatchDataWithPlayer);

        expect(component.createMatch).toHaveBeenCalled();
        expect(component.addPlayerToMatch).toHaveBeenCalledWith(component.matchId);
    });

    it('should correctly setup WebSocket events', async () => {
        spyOn(component, 'setupWebSocketEvents').and.callThrough();
        component.gameData = mockedGameData;

        fixture.detectChanges();

        await fixture.whenStable();

        expect(socketService.connect).toHaveBeenCalled();
        expect(socketService.onTimerCountdown).toHaveBeenCalled();
        expect(socketService.setTimerDuration).toHaveBeenCalledWith(component.gameData.duration);
        expect(socketService.onAnswerVerification).toHaveBeenCalled();
        expect(component.setupWebSocketEvents).toHaveBeenCalled();
    });

    // it('should correctly handle timer countdown', () => {
    //     spyOn(component, 'onTimerComplete').and.callThrough();

    //     fixture.detectChanges();

    //     fixture.whenStable().then(() => {
    //         socketService.onTimerCountdown.calls.mostRecent().args[0](0);

    //         expect(component.onTimerComplete).toHaveBeenCalled();
    //     });
    // });

    // it('should correctly update player score', () => {
    //     spyOn(component, 'updatePlayerScore').and.callThrough();

    //     fixture.detectChanges();

    //     fixture.whenStable().then(() => {
    //         component.updatePlayerScore(TEN);

    //         expect(matchService.updatePlayerScore).toHaveBeenCalledWith(component.matchId, 'playertest', TEN);
    //         expect(component.updatePlayerScore).toHaveBeenCalledWith(TEN);
    //     });
    // });

    it('should fetch game data on init and handle errors', () => {
        const apiService = TestBed.inject(ApiService);
        spyOn(apiService, 'getGame').and.returnValue(throwError(() => new Error('Failed to fetch game data')));
        const snackbarService = TestBed.inject(SnackbarService);
        spyOn(snackbarService, 'openSnackBar');

        component.ngOnInit();

        expect(apiService.getGame).toHaveBeenCalledWith('testGameId');
        expect(snackbarService.openSnackBar).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('should transition to the next question correctly', fakeAsync(() => {
        component.gameData.questions = questionMock;
        component.currentQuestionIndex = 0;

        component.handleNextQuestion();
        tick(TIME_BETWEEN_QUESTIONS);

        expect(component.currentQuestionIndex).toBe(1);
        expect(component.questionHasExpired).toBeFalse();
        expect(socketService.startTimer).toHaveBeenCalled();
    }));

    it('should fetch game data on init and set gameData property', async () => {
        const apiService = TestBed.inject(ApiService);

        spyOn(apiService, 'getGame').and.returnValue(of(mockedGameData));

        fixture.detectChanges();
        await fixture.whenStable();

        expect(apiService.getGame).toHaveBeenCalledWith('testGameId');
        expect(component.gameData).toEqual(mockedGameData);
    });

    it('should catch the error in createAndSetupMatch and show an alert', fakeAsync(() => {
        const errorMessage = 'Test error message';
        spyOn(component, 'createMatch').and.returnValue(throwError(() => new Error(errorMessage)));
        spyOn(window, 'alert');

        component.createAndSetupMatch();
        tick();

        expect(window.alert).toHaveBeenCalledWith(errorMessage);
    }));

    it('should handle timer countdown correctly', () => {
        component.gameData = mockedGameData;
        spyOn(component, 'onTimerComplete').and.callThrough();

        socketService.onTimerCountdown.and.callFake((callback: (data: number) => void) => {
            callback(1);
            callback(0);
        });

        component.setupWebSocketEvents();

        expect(component.onTimerComplete).toHaveBeenCalled();
    });

    it('should stop the timer, disconnect, and navigate to "/new-game" on successful match deletion', () => {
        matchService.deleteMatch.and.returnValue(of(mockedMatchData));

        component.handleGameLeave();

        expect(matchService.deleteMatch).toHaveBeenCalledWith(component.matchId);
        expect(socketService.stopTimer).toHaveBeenCalled();
        expect(socketService.disconnect).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith(['/new-game']);
    });
});
