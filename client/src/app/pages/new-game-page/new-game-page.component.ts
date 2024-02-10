/* eslint-disable no-restricted-imports */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
        private router: Router,
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
            } else {
                console.log('deleteComponent');
            }
        } else {
            console.log('game is undefined');
        }
    }

    isTheGameDeletedTest(game: Game): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.deletedGamesId.indexOf(game.id) !== -1) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                alert('Game ' + game.title + ' has been deleted' + ' we suggest you to play ' + newSuggestedGameCase1.title);
                return false;
            } else if (this.games.length === 1) {
                alert('Game ' + game.title + ' has been deleted' + ' we have no other games to suggest');
                return false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                alert('Game ' + game.title + ' has been deleted' + ' we suggest you to play ' + newSuggestedGame.title);
                return false;
            }
        } else {
            this.router.navigate(['/game', game.id]);
            return true;
        }
    }

    async isTheGameHiddenTest(game: Game): Promise<boolean> {
        const newGameArray = await this.gameService.getGames();
        console.log('julianne');
        console.log(newGameArray);
        const indexG = newGameArray.findIndex((g) => g.id === game.id);
        console.log(indexG);
        if (newGameArray[indexG].isVisible === false) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                alert('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGameCase1.title);
                return false;
            } else if (this.games.length === 1) {
                alert('Game ' + game.title + ' has been hidden' + ' we have no other games to suggest');
                return false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                alert('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGame.title);
                return false;
            }
        } else {
            this.router.navigate(['/game', game.id]);
            return true;
        }
    }

    isTheGameDeletedPlay(game: Game): boolean {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        if (this.deletedGamesId.indexOf(game.id) !== -1) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                alert('Game ' + game.title + ' has been deleted' + ' we suggest you to play ' + newSuggestedGameCase1.title);
                return false;
            } else if (this.games.length === 1) {
                alert('Game ' + game.title + ' has been deleted' + ' we have no other games to suggest');
                return false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                alert('Game ' + game.title + ' has been deleted' + ' we suggest you to play ' + newSuggestedGame.title);
                return false;
            }
        } else {
            this.router.navigate(['/gameWait', game.id]);
            return true;
        }
    }

    async isTheGameHiddenPlay(game: Game): Promise<boolean> {
        const newGameArray = await this.gameService.getGames();
        console.log('julianne');
        console.log(newGameArray);
        const indexG = newGameArray.findIndex((g) => g.id === game.id);
        console.log(indexG);
        if (newGameArray[indexG].isVisible === false) {
            const indexGame = this.games.indexOf(game);
            if (indexGame === this.games.length - 1) {
                const newSuggestedGameCase1 = this.games[0];
                alert('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGameCase1.title);
                return false;
            } else if (this.games.length === 1) {
                alert('Game ' + game.title + ' has been hidden' + ' we have no other games to suggest');
                return false;
            } else {
                const newSuggestedGame = this.games[indexGame + 1];
                alert('Game ' + game.title + ' has been hidden' + ' we suggest you to play ' + newSuggestedGame.title);
                return false;
            }
        } else {
            this.router.navigate(['/gameWait', game.id]);
            return true;
        }
    }
}
