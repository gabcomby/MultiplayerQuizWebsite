import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Game } from '@app/interfaces/game';
import { Player } from '@app/interfaces/match';
import { ApiService } from '@app/services/api.service';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { Subscription } from 'rxjs';
import { Socket } from 'socket.io-client';

const INDEX_NOT_FOUND = -1;
const GAME_CREATION_DELAY = 750;
@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    gamesUnderscoreId: string[] = [];
    deletedGamesId: string[] = [];
    subscription: Subscription;

    // eslint-disable-next-line max-params -- single responsibility principle
    constructor(
        private socketService: SocketService,
        private router: Router,
        private snackbarService: SnackbarService,
        private apiService: ApiService,
        private gameService: GameService,
    ) {}

    async ngOnInit() {
        this.apiService.getGames().then((games) => {
            this.games = games;
        });
        this.gamesUnderscoreId = this.socketService.connect();
    }

    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    deleteGameEvent(gameIdString: string) {
        this.gamesUnderscoreId.push(gameIdString);
        const index = this.gamesUnderscoreId[0].indexOf(gameIdString);
        const gameD = this.games[index];
        if (gameD) {
            this.deletedGamesId.push(gameD.id);
            const goodID = gameD.id;
            if (goodID !== undefined) {
                if (this.gameSelected[goodID]) {
                    this.snackbarService.openSnackBar('Game ' + goodID + ' has been deleted');
                }
            }
        }
    }

    snackbarHiddenGame(game: Game, indexGame: number) {
        let suggestion = '';
        if (indexGame === this.games.length - 1) {
            const newSuggestedGameCase1 = this.games[0];
            suggestion = ' we suggest to play ' + newSuggestedGameCase1.title;
        } else if (this.games.length === 1) {
            suggestion = ' we have no other games to suggest';
        } else {
            const newSuggestedGame = this.games[indexGame + 1];
            suggestion = ' we suggest you to play ' + newSuggestedGame.title;
        }
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been hidden' + suggestion);
    }

    snackbarDeletedGame(game: Game, indexGame: number) {
        let suggestion = '';
        if (indexGame === this.games.length - 1) {
            const newSuggestedGameCase1 = this.games[0];
            suggestion = ' we suggest to play ' + newSuggestedGameCase1.title;
        } else if (this.games.length === 1) {
            suggestion = ' we have no other games to suggest';
        } else {
            const newSuggestedGame = this.games[indexGame + 1];
            suggestion = ' we suggest you to play ' + newSuggestedGame.title;
        }
        this.snackbarService.openSnackBar('Game ' + game.title + ' has been deleted' + suggestion);
    }

    async isOriginalGame(game: Game): Promise<boolean> {
        let result = true;
        const newGameArray = await this.apiService.getGames();
        const indexG = newGameArray.findIndex((g) => g.id === game.id);
        if (this.deletedGamesId.indexOf(game.id) !== INDEX_NOT_FOUND) {
            const indexGame = this.games.indexOf(game);
            this.snackbarDeletedGame(game, indexGame);
            result = false;
        } else if (!newGameArray[indexG].isVisible) {
            const indexGame = this.games.indexOf(game);
            this.snackbarHiddenGame(game, indexGame);
            result = false;
        }
        return result;
    }

    async launchGameTest(game: Game): Promise<void> {
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
        } else {
            this.socketService.connect();
            this.gameService.resetGameVariables();
            const player: Player = {
                id: 'test-player-id',
                name: 'Test Player',
                score: 0,
                bonus: 0,
            };
            this.socketService.createRoomTest(game.id, player);
            this.gameService.setupWebsocketEvents();
            setTimeout(() => {
                this.router.navigate(['/game']);
            }, GAME_CREATION_DELAY);
        }
    }

    backHome() {
        this.socketService.disconnect();
    }

    async launchGame(game: Game): Promise<void> {
        const isModified = await this.isOriginalGame(game);
        if (!isModified) {
            this.gameSelected[game.id] = false;
            this.ngOnInit();
        } else {
            this.socketService.connect();
            this.socketService.createRoom(game.id);
            this.gameService.resetGameVariables();
            this.gameService.setupWebsocketEvents();
            setTimeout(() => {
                this.router.navigate(['/gameWait']);
            }, GAME_CREATION_DELAY);
        }
    }
}
