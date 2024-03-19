import { Component } from '@angular/core';
import { GameService } from '@app/services/game.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-game-wait',
    templateUrl: './game-wait.component.html',
    styleUrls: ['./game-wait.component.scss'],
})
export class GameWaitComponent {
    constructor(
        private socketService: SocketService,
        private gameService: GameService,
    ) {}

    get playerName() {
        return this.gameService.playerNameValue;
    }

    get playerList() {
        return this.gameService.playerListValue;
    }

    get playerLeftList() {
        return this.gameService.playerLeftListValue;
    }

    get isHost() {
        return this.gameService.isHostValue;
    }

    get lobbyCode() {
        return this.gameService.lobbyCodeValue;
    }

    get roomIsLocked() {
        return this.gameService.roomIsLockedValue;
    }

    get currentGameTitle() {
        return this.gameService.gameTitleValue;
    }

    banPlayer(name: string) {
        console.log('Banning player:', name);
        this.gameService.banPlayer(name);
    }

    handleGameLeave() {
        this.gameService.leaveRoom();
    }

    toggleRoomLock() {
        this.socketService.toggleRoomLock();
    }

    handleGameLaunch() {
        this.gameService.startGame();
    }
}
