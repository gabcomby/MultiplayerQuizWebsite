import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Question } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game/game.service';
import { SnackbarService } from '@app/services/snackbar/snackbar.service';
import { SocketService } from '@app/services/socket/socket.service';
import { Subscription, interval } from 'rxjs';
const HISTOGRAMM_UPDATE = 5000;

@Component({
    selector: 'app-host-game-page',
    templateUrl: './host-game-page.component.html',
    styleUrls: ['./host-game-page.component.scss'],
})
export class HostGamePageComponent implements OnInit, OnDestroy {
    isHost: boolean;
    isNoted: boolean = false;
    lobby: MatchLobby;
    currentQuestionQRLIndex: number = 0;
    unsubscribeSubject: Subscription[];
    nextQuestionButtonText: string = 'Prochaine question';
    subscription: Subscription;
    // eslint-disable-next-line max-params
    constructor(
        private gameService: GameService,
        private router: Router,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
    ) {}

    get gameTimerPaused(): boolean {
        return this.gameService.gameTimerPausedValue;
    }
    get lobbyCode(): string {
        return this.gameService.lobbyCodeValue;
    }

    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get nbrOfQuestions(): number {
        return this.gameService.nbrOfQuestionsValue;
    }

    get currentTimerCountdown(): number {
        return this.gameService.timerCountdownValue;
    }

    get totalGameDuration(): number {
        return this.gameService.totalQuestionDurationValue;
    }

    get currentQuestion(): Question | null {
        return this.gameService.currentQuestionValue;
    }

    get timerStopped(): boolean {
        return this.gameService.timerStoppedValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    get playerLeftList() {
        return this.gameService.playerLeftListValue;
    }

    get answersQRL() {
        return this.gameService.answersTextQRLValue;
    }
    get answersClicked() {
        return this.gameService.answersClickedValue;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.launchTimerValue;
    }

    get currentQuestionArray(): Question[] {
        if (this.gameService.currentQuestionValue === null) {
            return [];
        } else {
            return [this.gameService.currentQuestionValue];
        }
    }

    get currentGameTitle(): string {
        return this.gameService.gameTitleValue;
    }
    get nbModified(): number {
        return this.gameService.numberInputModifidedValue;
    }

    @HostListener('window:beforeunload', ['$event'])
    // eslint-disable-next-line no-unused-vars
    beforeUnloadHandler(event: Event) {
        event.preventDefault();
        this.gameService.leaveRoom();
        localStorage.setItem('refreshedPage', '/home');
    }

    ngOnInit(): void {
        const refreshedPage = localStorage.getItem('refreshedPage');
        if (refreshedPage) {
            localStorage.removeItem('refreshedPage');
            this.router.navigate([refreshedPage]);
        }
        this.subscription = interval(HISTOGRAMM_UPDATE).subscribe(() => {
            this.socketService.updateHistogram();
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    setplayerPointsQRL(points: [Player, number][]) {
        this.gameService.playerQRLPoints = points;
    }

    setIsNoted(isNoted: boolean) {
        this.isNoted = isNoted;
    }

    nextQuestion(): void {
        if (this.currentQuestion?.type === 'QRL' && this.answersQRL.length !== 0 && !this.isNoted) {
            this.snackbarService.openSnackBar('Veuillez noter les joueurs', 'Fermer');
            return;
        }
        const timerLength = 1000;
        this.isNoted = false;
        this.gameService.nextQuestion();
        if (this.currentQuestion?.type === 'QRL') this.currentQuestionQRLIndex++;
        let timer = 3;
        this.nextQuestionButtonText = String(timer);
        const intervalId = setInterval(() => {
            timer--;
            if (timer > 0) {
                this.nextQuestionButtonText = String(timer);
            } else {
                clearInterval(intervalId);
                this.nextQuestionButtonText = 'Prochaine question';
            }
        }, timerLength);
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
        this.router.navigate(['/home']);
    }

    handlePauseTimer(): void {
        this.gameService.pauseTimer();
    }

    handlePanicMode(): void {
        this.gameService.enablePanicMode();
    }
}
