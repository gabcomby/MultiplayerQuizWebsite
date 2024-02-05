import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { Socket, io } from 'socket.io-client';

@Component({
    selector: 'app-new-game-page',
    templateUrl: './new-game-page.component.html',
    styleUrls: ['./new-game-page.component.scss'],
})
export class NewGamePageComponent implements OnInit {
    games: Game[] = [];
    gameSelected: { [key: string]: boolean } = {};
    socket: Socket;
    constructor(private gameService: GameService) {
        this.socket = io('http://localhost:3000');
        console.log('socket');
        this.socket.on('delete', (gameId) => {
            if (this.gameSelected[gameId]) {
                console.log('deleteComponent');
                alert('Game ' + gameId + ' has been deleted');
                window.location.reload();
            } else {
                console.log('deleteComponent');
            }
        });
    }

    ngOnInit() {
        this.gameService.getGames().then((games) => {
            this.games = games;
        });
    }
    selected(game: Game) {
        this.gameSelected[game.id] = !this.gameSelected[game.id];
    }
}
