import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConfirmDialogComponent } from '@app/components/confirm-dialog/confirm-dialog.component';
import { InputDialogComponent } from '@app/components/input-dialog/input-dialog.component';
import type { Game, GamePlayed } from '@app/interfaces/game';
import { AdminService } from '@app/services/admin.service';
import { GamePlayedService } from '@app/services/game-played.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'export', 'modify', 'delete'];
    displayedHistoricColumns: string[] = ['title', 'creationDate', 'numberPlayers', 'bestScore'];
    dataSource: Game[] = [];
    historicDataSource: GamePlayed[] = [];

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private dialog: MatDialog,
        private adminService: AdminService,
        private gamePlayedService: GamePlayedService,
    ) {}

    async ngOnInit() {
        this.dataSource = await this.adminService.init();
        this.historicDataSource = await this.gamePlayedService.getGamesPlayed();
        console.log(this.historicDataSource);
    }

    toggleVisibility(game: Game, isVisible: boolean) {
        this.adminService.toggleVisibility(game, isVisible);
    }

    exportGameAsJson(game: Game): void {
        this.adminService.exportGameAsJson(game);
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) return;
        this.importGamesFromFile(input.files[0]);
    }

    async importGamesFromFile(file: File): Promise<void> {
        const game = (await this.adminService.readFileFromInput(file)) as Game;

        const gameTitle = await this.getValidGameTitle(game);
        if (!gameTitle) return;

        this.dataSource = this.adminService.addGame(game, gameTitle, this.dataSource);
    }

    async getValidGameTitle(originalGame: Game): Promise<string | null> {
        let gameTitle: string = originalGame.title;
        while (this.adminService.hasValidInput(gameTitle, originalGame.title, this.dataSource)) {
            const dialogRef = this.dialog.open(InputDialogComponent, {
                width: '350px',
                data: {
                    title: 'Le nom de ce jeu existe déjà, ou est invalide. Veuillez en choisir un autre :',
                    label: 'MAX 35 caractères',
                },
            });

            const newTitle: string | null = await firstValueFrom(dialogRef.afterClosed());

            if (newTitle === null || newTitle === '') return null;
            else gameTitle = newTitle;
        }

        return gameTitle;
    }

    deleteGame(gameId: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            width: '300px',
            data: {
                title: 'Confirmer la suppression',
                message: 'Êtes-vous sûr de vouloir supprimer ce jeu?',
            },
        });
        dialogRef.afterClosed().subscribe((confirmDelete) => {
            if (!confirmDelete) return;
            this.adminService.deleteGame(gameId).then(() => {
                this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
            });
        });
    }

    createGame(): void {
        this.router.navigate(['/create-qgame']);
    }

    formatDate(date: string): string {
        return this.adminService.formatLastModificationDate(date);
    }
}
