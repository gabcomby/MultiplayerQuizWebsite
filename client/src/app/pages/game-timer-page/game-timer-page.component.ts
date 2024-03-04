import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-timer-page',
    templateUrl: './game-timer-page.component.html',
    styleUrls: ['./game-timer-page.component.scss'],
})
export class GameTimerPageComponent implements OnInit {
    gameId: string;
    timerCountdown: number;
    gameTitle: string;
    idLobby: string;
    idPlayer: string;

    constructor(
        private socketService: SocketService,
        private router: Router,
        private route: ActivatedRoute,
        private gameService: GameService,
    ) {}
    ngOnInit() {
        this.gameId = this.route.snapshot.params['id'];
        this.idLobby = this.route.snapshot.params['idLobby'];
        this.idPlayer = this.route.snapshot.params['idplayer'];
        this.gameService.getGame(this.gameId).subscribe({
            next: (data) => {
                this.gameTitle = data.title;
            },
        });
        this.setupWebSocketEvents();
        this.socketService.startTimer();
    }
    setupWebSocketEvents() {
        this.socketService.connect();
        this.socketService.onTimerCountdown((data) => {
            this.timerCountdown = data;
            if (this.timerCountdown === 0) {
                this.onTimerComplete();
            }
        });
        const timer = 5;
        this.socketService.setTimerDuration(timer);
    }

    onTimerComplete(): void {
        this.socketService.stopTimer();
        this.router.navigate(['/game', this.gameId, this.idLobby, this.idPlayer]);
    }
}
