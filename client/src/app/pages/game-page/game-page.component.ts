import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import type { Game, Question } from '@app/interfaces/game';
import type { Match } from '@app/interfaces/match';
import { GameService } from '@app/services/games.service';
import { MatchService } from '@app/services/match.service';
import { PlayerService } from '@app/services/player.service';
import { TimerService } from '@app/services/timer.service';

const TIME_BETWEEN_QUESTIONS = 4000;
@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent implements OnInit {
    gameData: Game;
    currentQuestionIndex: number = 0;
    questionHasExpired: boolean = false;
    currentMatch: Match;

    gameScore: { name: string; score: number }[] = [];

    playerName: string;

    constructor(
        private timerService: TimerService,
        private gameService: GameService,
        private playerService: PlayerService,
        private router: Router,
        private matchService: MatchService,
    ) {}

    get questionTimer(): number {
        return this.gameData?.duration;
    }

    updatePlayerScore(scoreFromQuestion: number): void {
        this.matchService.updatePlayerScore('matchtest', 'playertest', this.currentMatch.playerList[0].score + scoreFromQuestion).subscribe({
            next: (data) => {
                this.currentMatch.playerList[0] = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    handleGameLeave() {
        this.router.navigate(['/']);
        this.timerService.killTimer();
        this.matchService.deleteMatch('matchtest').subscribe();
    }

    ngOnInit() {
        this.fetchGameData('8javry');
        this.initializePlayerScore();
        this.matchService.createNewMatch({ id: 'matchtest', playerList: [] }).subscribe({
            next: (data) => {
                this.currentMatch = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
        this.matchService.addPlayer({ id: 'playertest', name: 'Player 1', score: 0 }, 'matchtest').subscribe({
            next: (data) => {
                this.currentMatch = data;
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    initializePlayerScore() {
        this.playerName = this.playerService.getPlayerName();
        if (this.playerName) {
            this.gameScore.push({ name: this.playerName, score: 0 });
        }
    }

    fetchGameData(gameId: string): void {
        this.gameService.getGame(gameId).subscribe({
            next: (gameData: Game) => {
                this.gameData = gameData;
                this.startQuestionTimer();
            },
            error: (error) => {
                alert(error.message);
            },
        });
    }

    startQuestionTimer() {
        this.timerService.startTimer(this.questionTimer).subscribe({
            complete: () => {
                this.onTimerComplete();
            },
        });
    }

    onTimerComplete(): void {
        this.questionHasExpired = true;
        if (this.currentQuestionIndex < this.getTotalQuestions() - 1) {
            setTimeout(() => {
                this.currentQuestionIndex++;
                this.questionHasExpired = false;
                this.startQuestionTimer();
            }, TIME_BETWEEN_QUESTIONS);
        } else {
            setTimeout(() => {
                this.router.navigate(['/']);
                this.timerService.killTimer();
                this.matchService.deleteMatch('matchtest').subscribe();
            }, TIME_BETWEEN_QUESTIONS);
        }
    }

    getTotalQuestions(): number {
        return this.gameData?.questions.length || 0;
    }

    getCurrentQuestion(): Question {
        return this.gameData.questions[this.currentQuestionIndex];
    }
}
