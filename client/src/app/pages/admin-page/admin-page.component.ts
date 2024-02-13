import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import type { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { SocketService } from '@app/services/socket.service';

import assignNewGameAttributes from '@app/utils/assign-new-game-attributes';
import { isValidGame } from '@app/utils/is-valid-game';
import removeUnrecognizedAttributes from '@app/utils/remove-unrecognized-attributes';

const MAX_GAME_NAME_LENGTH = 35;
@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    @ViewChild('downloadLink') downloadLink: ElementRef<HTMLAnchorElement>;
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'export', 'modify', 'delete'];
    dataSource: Game[] = [];
    downloadJson = '';

    // eslint-disable-next-line max-params
    constructor(
        private router: Router,
        private socketService: SocketService,
        private snackbarService: SnackbarService,
        private gameService: GameService,
    ) {}

    ngOnInit() {
        this.gameService
            .getGames()
            .then((games) => {
                this.dataSource = games;
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            });

        this.socketService.connect();
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (!game) return;

        game.isVisible = isVisible;
        this.gameService
            .patchGame(game)
            .then(() => {
                this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            });
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                const json = JSON.stringify(this.removeUnwantedFields(data as unknown as Record<string, unknown>));
                this.downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
                setTimeout(() => {
                    this.downloadLink.nativeElement.click();
                });
                this.snackbarService.openSnackBar('Le jeu a été exporté avec succès.');
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            },
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input?.files?.length) return;
        this.importGamesFromFile(input.files[0]);
    }

    handleError(error: string): void {
        this.snackbarService.openSnackBar(error);
    }

    async getValidGameTitle(game: Game): Promise<string | null> {
        if (!this.isGameNameUnique(game.title)) {
            const newName = await new Promise<string | null>((resolve) =>
                resolve(window.prompt('Le nom de ce jeu existe déjà. Veuillez en choisir un autre :')),
            );

            if (!newName || newName === game.title || newName.length > MAX_GAME_NAME_LENGTH) {
                this.snackbarService.openSnackBar('Le nom du jeu est invalide.');
                return null;
            }
            return newName;
        }
        return game.title;
    }

    async importGamesFromFile(file: File): Promise<void> {
        try {
            const reader = new FileReader();
            reader.readAsText(file);
            const result = await new Promise<string>((resolve, reject) => {
                reader.onload = (e) => resolve((e.target as FileReader).result as string);
                reader.onerror = () => reject('Error reading file');
            });

            const game = JSON.parse(result);
            const validTitle = await this.getValidGameTitle(game);
            if (!validTitle) return;

            game.title = validTitle;
            this.prepareGameForImport(game);
            this.dataSource = [...this.dataSource, game];
            this.gameService.createGame(game);

            this.snackbarService.openSnackBar('Le jeu a été importé avec succès.');
        } catch (error) {
            this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${error}`);
        }
    }

    deleteGame(gameId: string): void {
        const confirmDelete = window.confirm('Êtes-vous sûr de vouloir supprimer ce jeu?');
        if (!confirmDelete) return;

        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
        this.gameService
            .deleteGame(gameId)
            .then(() => {
                this.snackbarService.openSnackBar('Le jeu a été supprimé avec succès.');
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            });
    }

    createGame(): void {
        this.router.navigate(['/create-qgame']);
    }

    formatLastModificationDate(date: string): string {
        return new Date(date).toLocaleString('fr-CA', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private removeUnwantedFields(data: Record<string, unknown>): unknown {
        if (Array.isArray(data)) {
            return data.map((item) => this.removeUnwantedFields(item));
        } else if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach((key) => {
                if (key === '_id' || key === '__v') {
                    delete data[key];
                } else {
                    data[key] = this.removeUnwantedFields(data[key] as Record<string, unknown>);
                }
            });
            return data;
        } else {
            return data;
        }
    }

    private isGameNameUnique(name: string): boolean {
        return !this.dataSource.some((game) => game.title === name);
    }

    private prepareGameForImport(game: Game): void {
        removeUnrecognizedAttributes(game);
        if (!isValidGame(game, this.snackbarService, this.gameService)) return;
        assignNewGameAttributes(game);
    }
}
