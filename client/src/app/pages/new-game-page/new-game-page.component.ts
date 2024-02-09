/* eslint-disable no-restricted-imports */
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';
import { Socket, io } from 'socket.io-client';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
    providers: [SocketService],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    gamesId: string[] = [];
    deletedGamesId: string[] = [];
    constructor(
        private gameService: GameService,
        private socketService: SocketService,
    ) {}

    async ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
            console.log(this.games);
        });
        this.gamesId = this.socketService.connect();
        this.initializeSocket();
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }

    initializeSocket() {
        this.socket = io('http://localhost:3000');
        this.socket.on('deleteId', async (gameId: string) => {
            await this.deleteGameEvent(gameId);
        });
    }

    async deleteGameEvent(gameIdString: string) {
        this.gamesId.push(gameIdString);
        const index = this.gamesId[0].indexOf(gameIdString);
        const gameD = this.games[index];
        this.deletedGamesId.push(gameD.id);
        console.log(gameD);
        const goodID = gameD.id;
        console.log(goodID);
        console.log('allo');
        if (goodID !== undefined) {
            console.log('goodID found');
            if (this.gameSelected[goodID]) {
                alert('Game ' + goodID + ' has been deleted');
                // I want to recreate the component after the alert to update list of games and recall ngOnInit
                this.ngOnInit();
                // this.gamesId = this.socketService.connect();
                // this.deleteGameEvent();
            } else {
                alert('Game ');
                console.log('deleteComponent');
                // I want to recreate the component after the alert to update list of games and recall ngOnInit
                this.ngOnInit();
                // this.gamesId = this.socketService.connect();
                // this.deleteGameEvent();
            }
        } else {
            console.log('tuple undefined');
        }
    }

    isTheGameDeleted(game: Game): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.deletedGamesId.indexOf(game.id) !== -1) {
            return true;
        } else {
            const indexGame = this.games.indexOf(game);
            const newSuggestedGame = this.games[indexGame + 1];
            alert('Game ' + game.id + ' has been deleted' + ' we suggest you to play ' + newSuggestedGame.title);
            return false;
        }
    }

    isTheGameHidden(game: Game): boolean {
        this.gameService.getGames().then((games) => {
            this.games = games;
            console.log(this.games);
        });
        if (game.isVisible === false) {
            const indexGame = this.games.indexOf(game);
            // gestion des différents cas
            const newSuggestedGame = this.games[indexGame + 1];
            alert('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGame.title);
            return false;
        } else {
            return true;
        }
    }
}
