import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { API_BASE_URL } from '@app/app.module';
import { QuestionType, type Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { ChatService } from './chat.service';
import { SnackbarService } from './snackbar.service';
import { SocketService } from './socket.service';

const TIME_BETWEEN_QUESTIONS = 3000;
const LAUNCH_TIMER_DURATION = 5;
const QRL_TIMER_DURATION = 60;
const WAIT_UNTIL_FIRE_DISCONNECTS = 2000;

@Injectable({
    providedIn: 'root',
})
export class GameService {
    apiUrl: string;
    private playerName: string;
    private lobbyCode: string = '';
    private playerList: Player[] = [];
    private isHost: boolean = false;
    private roomLocked: boolean = false;
    private launchTimer: boolean = true;
    private currentQuestionIndex: number = 0;
    private nbrOfQuestions: number = 0;
    private totalQuestionDuration: number = 0;
    private currentQuestion: Question | null;
    private timerStopped: boolean = false;
    private answersClicked: [string, number[]][] = [];
    private answerIndex: number[] = [];
    private allQuestionsFromGame: Question[] = [];
    private allAnswersIndex: [string, number[]][] = [];
    private timerCountdown: number;
    private playerLeftList: Player[] = [];
    private gameTitle = '';
    private answerText: string = '';
    private answersTextQRL: [string, [Player, string][]][];
    private currentPlayer: Player;
    private pointsQRL: [Player, number][];

    // eslint-disable-next-line -- needed for SoC (Separation of Concerns)
    constructor(
        @Inject(API_BASE_URL) apiBaseURL: string,
        private socketService: SocketService,
        private router: Router,
        private snackbar: SnackbarService,
        private chatService: ChatService, // private chatService: ChatService,
    ) {
        this.apiUrl = `${apiBaseURL}/games`;
    }

    get playerNameValue(): string {
        return this.playerName;
    }

    get lobbyCodeValue(): string {
        return this.lobbyCode;
    }

    get playerListValue(): Player[] {
        return this.playerList;
    }

    get playerLeftListValue(): Player[] {
        return this.playerLeftList;
    }

    get isHostValue(): boolean {
        return this.isHost;
    }

    get roomIsLockedValue(): boolean {
        return this.roomLocked;
    }

    get launchTimerValue(): boolean {
        return this.launchTimer;
    }

    get timerCountdownValue(): number {
        return this.timerCountdown;
    }

    get currentQuestionIndexValue(): number {
        return this.currentQuestionIndex;
    }

    get nbrOfQuestionsValue(): number {
        return this.nbrOfQuestions;
    }

    get currentPlayerValue(): Player {
        return this.currentPlayer;
    }

    get totalQuestionDurationValue(): number {
        if (this.launchTimer) {
            return LAUNCH_TIMER_DURATION;
        } else if (this.currentQuestion?.type === QuestionType.QRL) {
            return QRL_TIMER_DURATION;
        } else {
            return this.totalQuestionDuration;
        }
    }

    get currentQuestionValue(): Question | null {
        return this.currentQuestion;
    }

    get timerStoppedValue(): boolean {
        return this.timerStopped;
    }

    get liveAnswersClickedValue(): [string, number[] | string][] {
        return this.answersClicked;
    }

    get allQuestionsFromGameValue(): Question[] {
        return this.allQuestionsFromGame;
    }

    get allAnswersIndexValue(): [string, number[]][] {
        return this.allAnswersIndex;
    }

    get gameTitleValue(): string {
        return this.gameTitle;
    }

    get answersTextQRLValue(): [string, [Player, string][]][] {
        return this.answersTextQRL;
    }
    get answersTextQRLVal() {
        return this.answerText;
    }

    get answersClickedValue(): [string, number[]][] {
        return this.answersClicked;
    }

    set answerIndexSetter(answerIdx: number[]) {
        this.answerIndex = answerIdx;
        this.socketService.sendLiveAnswers(this.answerIndex, this.currentPlayer);
    }
    set answerTextSetter(answerText: string) {
        this.answerText = answerText;
        this.socketService.sendLiveAnswers(this.answerText, this.currentPlayer);
    }

    set playerQRLPoints(points: [Player, number][]) {
        this.pointsQRL = points;
        this.updatePointsQRL();
    }

    updatePointsQRL(): void {
        this.socketService.updatePointsQRL(this.pointsQRL);
    }

    setPlayerName(playerName: string): void {
        this.playerName = playerName;
    }

    leaveRoom(): void {
        this.socketService.leaveRoom();
        setTimeout(() => {
            this.socketService.disconnect();
            this.router.navigate(['/home']);
        }, WAIT_UNTIL_FIRE_DISCONNECTS);
    }

    banPlayer(name: string): void {
        this.socketService.banPlayer(name);
    }

    resetGameVariables(): void {
        this.lobbyCode = '';
        this.playerList = [];
        this.isHost = false;
        this.roomLocked = false;
        this.currentQuestion = null;
        this.answerIndex = [];
        this.answerText = '';
        this.allQuestionsFromGame = [];
        this.allAnswersIndex = [];
        this.answersClicked = [];
        this.playerLeftList = [];
        this.chatService.resetMessages();
    }

    startGame(): void {
        this.socketService.startGame();
    }

    nextQuestion(): void {
        if (this.currentQuestionIndex + 1 === this.nbrOfQuestions) {
            this.socketService.nextQuestion();
        } else {
            setTimeout(() => {
                this.socketService.nextQuestion();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    submitAnswer(): void {
        if (this.currentQuestion?.type === QuestionType.QRL) {
            this.socketService.sendLockedAnswers(this.answerText, this.currentPlayer);
        } else {
            this.socketService.sendLockedAnswers(this.answerIndex, this.currentPlayer);
        }
    }

    setupWebsocketEvents(): void {
        this.socketService.onRoomCreated((roomId, gameTitle: string) => {
            this.lobbyCode = roomId;
            this.isHost = true;
            this.gameTitle = gameTitle;
        });

        this.socketService.onRoomTestCreated((gameTitle: string, playerList: [[string, Player]]) => {
            const playerListOriginal = new Map(playerList);
            const newPlayerList = [...playerListOriginal.values()];
            this.playerList = [...newPlayerList];
            this.gameTitle = gameTitle;
        });

        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
        });

        this.socketService.onPlayerListChange((playerList: [[string, Player]]) => {
            const playerListOriginal = new Map(playerList);
            const newPlayerList = [...playerListOriginal.values()];
            this.playerList = [...newPlayerList];
        });

        this.socketService.onPlayerLeftListChange((playerList: Player[]) => {
            this.playerLeftList = playerList;
        });

        this.socketService.onLobbyDeleted(() => {
            this.snackbar.openSnackBar('The host has left the game', 'Close');
            setTimeout(() => {
                this.socketService.disconnect();
                this.router.navigate(['/home']);
            }, TIME_BETWEEN_QUESTIONS);
        });

        this.socketService.onRoomJoined((roomId: string, gameTitle: string, currentPlayer: Player) => {
            this.lobbyCode = roomId;
            this.gameTitle = gameTitle;
            this.currentPlayer = currentPlayer;
        });

        this.socketService.onBannedFromGame(() => {
            this.leaveRoom();
        });

        this.socketService.onRoomLockStatus((isLocked: boolean) => {
            this.roomLocked = isLocked;
        });

        this.socketService.onGameLaunch((questionDuration: number, nbrOfQuestions: number) => {
            this.launchTimer = true;
            this.timerStopped = false;
            this.nbrOfQuestions = nbrOfQuestions;
            this.totalQuestionDuration = questionDuration;
            this.currentQuestionIndex = 0;
            if (this.isHost) {
                this.router.navigate(['/host-game-page']);
            } else {
                this.router.navigate(['/game']);
            }
        });

        this.socketService.onQuestionTimeUpdated((data: number) => {
            this.launchTimer = false;
            this.totalQuestionDuration = data;
        });

        this.socketService.onQuestion((question: Question, questionIndex: number) => {
            this.timerStopped = false;
            this.currentQuestionIndex = questionIndex;
            this.currentQuestion = question;
        });

        this.socketService.onTimerStopped(() => {
            this.timerStopped = true;
            if (this.currentQuestion?.type === QuestionType.QRL) {
                this.socketService.sendAnswers(this.answerText, this.currentPlayer);
            } else {
                this.socketService.sendAnswers(this.answerIndex, this.currentPlayer);
            }
        });

        this.socketService.onLivePlayerAnswers((answers: [string, number[] | string][]) => {
            const answersClicked: [[string, number[]]] = [[answers[0][0], answers[0][1] as number[]]];
            this.answersClicked = answersClicked;
        });

        this.socketService.onLockedAnswersQRL((answers: [string, [Player, string][]][]) => {
            this.answersTextQRL = answers;
        });

        this.socketService.onGoToResult((playerList: [[string, Player]], questionList: Question[], allAnswersIndex: [string, number[]][]) => {
            const playerListOriginal = new Map(playerList);
            const newPlayerList = [...playerListOriginal.values()];
            this.playerList = [...newPlayerList];
            this.allQuestionsFromGame = questionList;
            this.allAnswersIndex = allAnswersIndex;
            this.router.navigate(['/resultsView']);
        });
    }
}
