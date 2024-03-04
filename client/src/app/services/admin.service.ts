import { Injectable } from '@angular/core';

import { Game } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { SnackbarService } from '@app/services/snackbar.service';

@Injectable({
    providedIn: 'root',
})
export class AdminService {
    constructor(
        private gameService: GameService,
        private snackbarService: SnackbarService,
    ) {}

    toggleVisibility(game: Game, isVisible: boolean): void {
        if (!this.gameService.getGame(game.id)) return;

        game.isVisible = isVisible;
        this.gameService.patchGame(game).then(() => {
            this.snackbarService.openSnackBar('La visibilité a été mise à jour avec succès.');
            return;
        });
    }

    exportGameAsJson(game: Game): void {
        this.gameService.getGame(game.id).subscribe({
            next: (data) => {
                const json = JSON.stringify(this.removeUnwantedFields(data as unknown as Record<string, unknown>));
                this.snackbarService.openSnackBar('Le jeu a été exporté avec succès.');
                const fileName = `game_data_${game.id}.json`;
                const downloadJson = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
                const link = document.createElement('a');
                link.setAttribute('href', downloadJson);
                link.setAttribute('download', fileName);
                link.click();
            },
            error: (error) => {
                this.snackbarService.openSnackBar(`Nous avons rencontré l'erreur suivante: ${JSON.stringify(error.message)}`);
            },
        });
    }

    private removeUnwantedFields(data: Record<string, unknown>): unknown {
        if (Array.isArray(data)) {
            return data.map((item) => this.removeUnwantedFields(item));
        } else if (typeof data === 'object' && data !== null) {
            Object.keys(data).forEach((key) => {
                if (key === '_id' || key === '__v' || key === 'isVisible') {
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
}
