import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PasswordDialogComponent } from '@app/components/password-dialog/password-dialog.component';
import { PlayerNameDialogComponent } from '@app/components/player-name-dialog/player-name-dialog.component';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { Player } from '@app/interfaces/match';
import { AuthService } from '@app/services/auth.service';
import { GameService } from '@app/services/game.service';
import { RoomService } from '@app/services/room.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';
import { generateNewId } from '@app/utils/assign-new-game-attributes';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';

    // eslint-disable-next-line max-params
    constructor(
        private authService: AuthService,
        private router: Router,
        public dialog: MatDialog,
        private snackbarService: SnackbarService,
        private socketService: SocketService,
        private gameService: GameService,
        private roomService: RoomService,
    ) {}

    openAdminDialog(): void {
        const dialogRef = this.dialog.open(PasswordDialogComponent, { width: '300px' });
        dialogRef.afterClosed().subscribe(this.handleDialogClose);
    }

    async handleGameJoin(): Promise<void> {
        const dialogRef = this.dialog.open(PlayerNameDialogComponent, {
            width: '300px',
            data: {
                isShown: true,
            },
        });
        const result = await lastValueFrom(dialogRef.afterClosed());

        if (this.isEmpyDialog(result)) {
            this.snackbarService.openSnackBar("Veuillez entrer un nom d'utilisateur et un code de salon");
            return;
        }
        const newPlayer: Player = {
            name: result.userName,
            id: generateNewId(),
            score: 0,
            bonus: 0,
        };

        this.roomService.verifyPlayerCanJoin(result.lobbyCode, newPlayer).subscribe({
            next: (canJoin: boolean) => {
                if (canJoin) {
                    this.socketService.connect();
                    this.socketService.joinRoom(result.lobbyCode, newPlayer);
                    this.gameService.setPlayerName(result.userName);
                    this.gameService.resetGameVariables();
                    this.gameService.setupWebsocketEvents();
                    this.router.navigate(['/gameWait']);
                } else {
                    this.snackbarService.openSnackBar("Vous n'avez pas pu rejoindre cette partie.");
                }
            },
            error: () => {
                this.snackbarService.openSnackBar('Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?');
            },
        });
    }

    private isEmpyDialog(result: { userName: string; lobbyCode: string }): boolean {
        return result.userName.trim() === '' || result.lobbyCode.trim() === '';
    }

    private handleDialogClose = (password: string) => {
        if (password) {
            this.authenticateUser(password);
        }
    };

    private authenticateUser(password: string): void {
        this.authService.authenticate(password).subscribe({
            next: this.handleAuthenticationSuccess,
            error: this.handleAuthenticationError,
        });
    }

    private handleAuthenticationSuccess = (authenticate: boolean) => {
        if (authenticate) {
            this.router.navigate(['/admin']);
        }
    };

    private handleAuthenticationError = (error: HttpErrorResponse) => {
        if (error.error.body === 'Invalid password') {
            this.snackbarService.openSnackBar('Mot de passe invalide');
        } else {
            this.dialog.open(ServerErrorDialogComponent, {
                data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
            });
        }
    };
}
