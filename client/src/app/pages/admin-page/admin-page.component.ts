import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Game } from '@app/interfaces/game';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['./admin-page.component.scss'],
})
export class AdminPageComponent implements OnInit {
    displayedColumns: string[] = ['id', 'title', 'isVisible', 'lastUpdate', 'export', 'delete'];
    dataSource: Game[] = [];

    constructor(private http: HttpClient) {}

    ngOnInit() {
        this.loadGames();
    }

    loadGames(): void {
        this.http.get<Game[]>('http://localhost:3000/api/games').subscribe({
            next: (data) => {
                this.dataSource = data;
            },
            error: (error) => {
                alert(error);
            },
        });
    }

    toggleVisibility(gameId: string, isVisible: boolean): void {
        const game = this.dataSource.find((g) => g.id === gameId);
        if (game) {
            game.isVisible = isVisible;
        }
    }

    exportGameAsJson(game: Game): void {
        const exportData = { id: game.id, title: game.title, description: game.description, lastUpdate: game.lastModification };

        const dataStr = JSON.stringify(exportData);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'game_data.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    openImportDialog(): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.onchange = (e) => {
            const target = e.target as HTMLInputElement;
            if (target && target.files && target.files.length) {
                this.importGamesFromFile(target.files[0]);
            }
        };
        fileInput.click();
    }

    importGamesFromFile(file: File): void {
        const reader = new FileReader();
        reader.onload = (e) => {
            const fileReader = e.target;
            if (fileReader && fileReader.result) {
                try {
                    const games = JSON.parse(fileReader.result as string);
                    this.dataSource = [...this.dataSource, ...games];
                } catch (error) {
                    alert('Error parsing JSON');
                }
            }
        };
        reader.readAsText(file);
    }

    deleteGame(gameId: string): void {
        this.dataSource = this.dataSource.filter((game) => game.id !== gameId);
    }

    createGame(): void {
        // Implement logic to create a new game
    }
}
