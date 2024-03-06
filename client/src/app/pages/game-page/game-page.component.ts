import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import type { Question } from '@app/interfaces/game';
import type { Player } from '@app/interfaces/match';
import { MatchLobby } from '@app/interfaces/match-lobby';
// import { AnswerStateService } from '@app/services/answer-state.service';
import { GameService } from '@app/services/game.service';
import { MatchLobbyService } from '@app/services/match-lobby.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit, OnDestroy {
    isHost: boolean;
    lobby: MatchLobby;
    private destroy = new Subject<void>();
    constructor(
        private route: ActivatedRoute,
        private gameService: GameService,
        // private answerStateService: AnswerStateService,
        private matchLobbyService: MatchLobbyService,
    ) {}

    get currentQuestionIndexValue(): number {
        return this.gameService.currentQuestionIndexValue;
    }

    get currentGameLength(): number {
        return this.gameService.currentGameLength;
    }

    get currentGameTitle(): string {
        return this.gameService.currentGameTitle;
    }

    get currentPlayerNameValue(): string {
        return this.gameService.currentPlayerNameValue;
    }

    get currentTimerCountdown(): number {
        return this.gameService.timerCountdownValue;
    }

    get totalGameDuration(): number {
        return this.gameService.totalGameDuration;
    }

    get currentQuestion(): Question {
        return this.gameService.getCurrentQuestion();
    }

    get questionHasExpiredValue(): boolean {
        return this.gameService.questionHasExpired;
    }

    get answerIsCorrectValue(): boolean {
        return this.gameService.answerIsCorrect;
    }

    get playerListValue(): Player[] {
        return this.gameService.playerListFromLobby;
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.setAnswerIndex(answerIdx);
    }

    // REFACTOR DONE
    ngOnInit() {
        this.gameService.initializeLobbyAndGame(this.route.snapshot.params['lobbyId'], this.route.snapshot.params['playerId']);
        // this.matchLobbyService.getLobby(this.route.snapshot.params['lobbyId']).subscribe({
        //     next: (lobby) => {
        //         this.isHost = this.route.snapshot.params['playerId'] === lobby.hostId;
        //         this.lobby = lobby;
        //         console.log(this.lobby);
        //     },
        // });
        this.matchLobbyService
            .getLobby(this.route.snapshot.params['lobbyId'])
            .pipe(takeUntil(this.destroy))
            .subscribe({
                next: (lobby) => {
                    this.isHost = this.route.snapshot.params['playerId'] === lobby.hostId;
                    this.lobby = lobby;
                    console.log(this.lobby);
                },
            });
    }
    ngOnDestroy() {
        this.destroy.next();
        this.destroy.complete();
    }
    handleGameLeave(): void {
        this.gameService.handleGameLeave();
    }
}
