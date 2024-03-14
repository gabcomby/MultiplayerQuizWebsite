import { Component } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { MatchLobby } from '@app/interfaces/match-lobby';
import { GameService } from '@app/services/game.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    isHost: boolean;
    lobby: MatchLobby;
    unsubscribeSubject: Subscription[];
    constructor(private gameService: GameService) {}
    // ==================== GETTERS USED AFTER REFACTOR ====================
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

    get timerStopped(): boolean {
        return this.gameService.timerStoppedValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    get currentQuestion(): Question | null {
        return this.gameService.currentQuestionValue;
    }

    get isLaunchTimer(): boolean {
        return this.gameService.launchTimerValue;
    }

    // ==================== GETTERS USED AFTER REFACTOR ====================

    get currentGameTitle(): string {
        // return this.gameService.currentGameTitle;
        return 'Placeholder';
    }

    setAnswerIndex(answerIdx: number[]): void {
        this.gameService.answerIndex = answerIdx;
        // this.gameService.clickPlayerAnswer(answerIdx);
    }

    handleGameLeave(): void {
        this.gameService.leaveRoom();
    }
}
