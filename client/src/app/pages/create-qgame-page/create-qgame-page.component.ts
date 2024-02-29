import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { Game } from '@app/interfaces/game';
// import { GameValidationService } from '@app/services/game-validation.service';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
// import { SnackbarService } from '@app/services/snackbar.service';
// import { generateNewId } from '@app/utils/assign-new-game-attributes';
// import { isValidGame } from '@app/utils/is-valid-game';

@Component({
    selector: 'app-create-qgame-page',
    templateUrl: './create-qgame-page.component.html',
    styleUrls: ['./create-qgame-page.component.scss'],
})
export class CreateQGamePageComponent implements OnInit {
    @Input() game: Game;
    fromBank: boolean = false;
    modifiedQuestion: boolean = false;
    gameId: string | null;
    games: Game[] = [];
    gameModified: Game = {
        id: '',
        title: '',
        description: '',
        isVisible: false,
        duration: 10,
        lastModification: new Date(),
        questions: [],
    };
    gameForm: FormGroup;
    dataReady: boolean = false;
    // eslint-disable-next-line max-params
    constructor(
        private questionService: QuestionService,
        private gameService: GameService,
        private route: ActivatedRoute,
        private router: Router,
        // private snackbarService: SnackbarService,
        // private gameValidationService: GameValidationService,
        public dialog: MatDialog,
    ) {
        this.questionService.resetQuestions();
        this.gameForm = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('', Validators.required),
            time: new FormControl('', Validators.required),
        });
    }
    async ngOnInit(): Promise<void> {
        this.route.paramMap.subscribe((params) => (this.gameId = params.get('id')));
        if (this.gameId) {
            try {
                this.games = await this.gameService.getGames();
                this.getGame(this.gameId);
                this.insertIfExist();
                this.dataReady = true;
            } catch (error) {
                this.handleServerError();
            }
        }
    }

    getGame(gameId: string): void {
        const findGame = this.games.find((gameSelected) => gameSelected.id === gameId);
        if (findGame) {
            this.gameModified = findGame;
        } else {
            throw new Error(`Game with id ${gameId} not found`);
        }
    }

    async onSubmit() {
        const newGame: Game = this.gameService.createNewGame(true, this.gameForm, this.gameModified);
        try {
            if (this.gameId) {
                if (await this.gameService.gameValidationWhenModified(this.gameForm, this.gameModified)) {
                    this.router.navigate(['/admin']);
                }
            } else if (await this.gameService.isValidGame(newGame)) {
                await this.gameService.createGame(newGame);
                this.router.navigate(['/admin']);
            }
        } catch (error) {
            this.handleServerError();
        }
    }
    toggleModifiedQuestion() {
        this.modifiedQuestion = !this.modifiedQuestion;
    }

    insertIfExist() {
        this.gameForm.patchValue({
            name: this.gameModified.title,
            description: this.gameModified.description,
            time: this.gameModified.duration,
            visibility: this.gameModified.isVisible,
        });
    }

    // async gameValidationWhenModified() {
    //     const modifiedGame = this.createNewGame(false);
    //     try {
    //         if (await isValidGame(modifiedGame, this.snackbarService, this.gameService)) {
    //             if (await this.gameService.validateDeletedGame(modifiedGame)) {
    //                 await this.gameService.patchGame(modifiedGame);

    //                 this.router.navigate(['/admin']);
    //             } else {
    //                 await this.gameService.createGame(modifiedGame);
    //                 this.router.navigate(['/admin']);
    //             }
    //         }
    //     } catch (error) {
    //         this.handleServerError();
    //     }
    // }

    // createNewGame(isNewGame: boolean) {
    //     return {
    //         id: isNewGame ? generateNewId() : this.gameModified.id,
    //         title: this.gameForm.get('name')?.value,
    //         description: this.gameForm.get('description')?.value,
    //         isVisible: isNewGame ? false : this.gameFromDB.isVisible,
    //         duration: this.gameForm.get('time')?.value,
    //         lastModification: new Date(),
    //         questions: isNewGame ? this.questionService.getQuestion() : this.gameFromDB.questions,
    //     };
    // }

    handleServerError = () => {
        this.dialog.open(ServerErrorDialogComponent, {
            data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
        });
    };
}
