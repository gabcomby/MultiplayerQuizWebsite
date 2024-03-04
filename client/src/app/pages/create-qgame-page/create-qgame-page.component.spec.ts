/* eslint-disable-next-line max-classes-per-file -- Those are  mock class */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { Game, Question } from '@app/interfaces/game';
import { GameService } from '@app/services/game.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
// import * as gameUtilsModule from '@app/utils/is-valid-game';
import { of } from 'rxjs';
import { CreateQGamePageComponent } from './create-qgame-page.component';

import SpyObj = jasmine.SpyObj;

@Component({
    selector: 'app-modified-question',
    template: '',
})
class AppModifiedQuestionStubComponent {
    @Input() questions: unknown[];
}

@Component({
    selector: 'app-new-question',
    template: '',
})
class AppNewQuestionStubComponent {
    @Input() formBank: unknown[];
}

describe('CreateQGamePageComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let gameServiceSpy: SpyObj<GameService>;
    let snackbarServiceMock: SpyObj<SnackbarService>;
    let routerSpy: SpyObj<Router>;
    let component: CreateQGamePageComponent;
    let fixture: ComponentFixture<CreateQGamePageComponent>;
    const defaultDate = new Date();
    // const defaultGame = [
    //     {
    //         id: '123',
    //         title: 'allo',
    //         description: 'test',
    //         isVisible: false,
    //         duration: 10,
    //         lastModification: defaultDate,
    //         questions: [
    //             {
    //                 type: 'QCM',
    //                 text: 'Ceci est une question de test',
    //                 points: 10,
    //                 id: 'dsdsd',
    //                 choices: [
    //                     { text: '1', isCorrect: false },
    //                     { text: '2', isCorrect: true },
    //                 ],
    //                 lastModification: defaultDate,
    //             },
    //         ],
    //     },
    //     {
    //         id: '125',
    //         title: 'bonjour',
    //         description: 'test2',
    //         isVisible: false,
    //         duration: 20,
    //         lastModification: defaultDate,
    //         questions: [
    //             {
    //                 type: 'QCM',
    //                 text: 'Ceci est une question de test',
    //                 points: 10,
    //                 id: 'dsdsd',
    //                 choices: [
    //                     { text: '1', isCorrect: false },
    //                     { text: '2', isCorrect: true },
    //                 ],
    //                 lastModification: defaultDate,
    //             },
    //         ],
    //     },
    // ];

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            updateList: {},
            getQuestion: [
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test',
                    points: 10,
                    id: 'dsdsd',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                },
                {
                    type: 'QCM',
                    text: 'Ceci est une question de test 2',
                    points: 20,
                    id: '45',
                    choices: [
                        { text: '1', isCorrect: false },
                        { text: '2', isCorrect: true },
                    ],
                    lastModification: new Date(),
                } as Question,
            ],
            resetQuestions: {},
        });
        gameServiceSpy = jasmine.createSpyObj('GameService', {
            getGames: [],
            createGame: {},
            patchGame: Promise.resolve({
                id: 'ddwd',
                title: 'string',
                description: 'string',
                isVisible: false,
                duration: 10,
                lastModification: defaultDate,
                questions: [{ type: 'QCM', text: 'Ceci est une question de test', points: 10, id: 'dsdsd', lastModification: defaultDate }],
            } as Game),
            validateDeletedGame: Promise.resolve({}),
            validateDuplicationGame: {},
        });
        snackbarServiceMock = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
    });
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [CreateQGamePageComponent, AppModifiedQuestionStubComponent, AppNewQuestionStubComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: GameService, useValue: gameServiceSpy },
                { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '123' })) } },
                { provide: SnackbarService, useValue: snackbarServiceMock },
                { provide: Router, useValue: routerSpy },
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-empty-function
                { provide: MatDialog, useValue: { open: (_comp: unknown, _obj: unknown) => {} } },
            ],
            imports: [HttpClientTestingModule, MatToolbarModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    }));
    beforeEach(() => {
        fixture = TestBed.createComponent(CreateQGamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });
    it('should create', () => {
        expect(component).toBeTruthy();
    });

    // it('should initialize with default values', () => {
    //     expect(component.modifiedQuestion).toBeFalse();
    //     expect(component.gamesFromDB).toEqual([]);
    //     expect(component.dataReady).toBeFalse();
    //     expect(component.gamesFromDB).toEqual([]);
    // });

    it('initialize forms controls', () => {
        expect(component.gameForm.get('name')).toBeTruthy();
        expect(component.gameForm.get('description')).toBeTruthy();
        expect(component.gameForm.get('time')).toBeTruthy();
    });
    it('ngOnInit should initiliase if theres is an id', async () => {
        spyOn(component, 'getGame');
        spyOn(component, 'insertIfExist');

        await component.ngOnInit();
        expect(component.getGame).toHaveBeenCalled();
        expect(component.insertIfExist).toHaveBeenCalled();
        expect(component.dataReady).toBeTrue();
    });
    it('ngOnInit should initiliase if theres is an id', async () => {
        gameServiceSpy.getGames.and.throwError('test error');
        try {
            await component.ngOnInit();
        } catch (error) {
            expect(component.handleServerError).toHaveBeenCalled();
        }
    });
    // it('get game should find game with id in list should return game if found', () => {
    //     component.gamesFromDB = defaultGame;
    //     component.getGame('123');
    //     expect(component.gameFromDB).toEqual({
    //         id: '123',
    //         title: 'allo',
    //         description: 'test',
    //         isVisible: false,
    //         duration: 10,
    //         lastModification: defaultDate,
    //         questions: [
    //             {
    //                 type: 'QCM',
    //                 text: 'Ceci est une question de test',
    //                 points: 10,
    //                 id: 'dsdsd',
    //                 choices: [
    //                     { text: '1', isCorrect: false },
    //                     { text: '2', isCorrect: true },
    //                 ],
    //                 lastModification: defaultDate,
    //             },
    //         ],
    //     });
    // });
    // it('get game should return undefined game with id if not found', () => {
    //     component.gameFromDB = {
    //         id: '',
    //         title: '',
    //         description: '',
    //         isVisible: false,
    //         duration: 10,
    //         lastModification: defaultDate,
    //         questions: [],
    //     };
    //     component.gamesFromDB = defaultGame;
    //     try {
    //         component.getGame('124');
    //     } catch (error) {
    //         expect(error).toEqual(new Error('Game with id 124 not found'));
    //     }
    //     expect(component.gameFromDB).toEqual({
    //         id: '',
    //         title: '',
    //         description: '',
    //         isVisible: false,
    //         duration: 10,
    //         lastModification: defaultDate,
    //         questions: [],
    //     });
    // });

    // it('initialize forms controls with value when gameId is not null', () => {
    //     const MAGIC_NUMB = 10;
    //     component.gameForm = new FormGroup({
    //         name: new FormControl(''),
    //         description: new FormControl(''),
    //         time: new FormControl(''),
    //     });
    //     component.gameFromDB = defaultGame[0];
    //     component.insertIfExist();
    //     expect(component.gameForm).toBeTruthy();
    //     expect(component.gameForm.get('name')?.value).toBe('allo');
    //     expect(component.gameForm.get('description')?.value).toBe('test');
    //     expect(component.gameForm.get('time')?.value).toBe(MAGIC_NUMB);
    // });

    // it('should call createNewGame when onSubmit', async () => {
    //     spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
    //     component.gameForm = new FormGroup({
    //         name: new FormControl('allo'),
    //         description: new FormControl('chose'),
    //         time: new FormControl('10'),
    //     });
    //     spyOn(component, 'createNewGame');
    //     await component.onSubmit();
    //     fixture.detectChanges();
    //     expect(component.createNewGame).toHaveBeenCalled();
    // });
    // it('should create new game when calling createNewGame', () => {
    //     component.gameForm = new FormGroup({
    //         name: new FormControl(''),
    //         description: new FormControl(''),
    //         visibility: new FormControl(''),
    //         time: new FormControl(''),
    //     });
    //     const MAGIC_NUMB = 10;
    //     component.gameForm.controls['name'].setValue('Test Game');
    //     component.gameForm.controls['description'].setValue('Test Description');
    //     component.gameForm.controls['time'].setValue(MAGIC_NUMB);

    //     const newGame = component.createNewGame(true);
    //     expect(newGame).toBeTruthy();
    //     expect(newGame.id).toBeDefined();
    //     expect(newGame.title).toBe('Test Game');
    //     expect(newGame.description).toBe('Test Description');
    //     expect(newGame.duration).toBe(MAGIC_NUMB);
    //     expect(newGame.lastModification).toBeInstanceOf(Date);
    //     expect(newGame.questions).toEqual(questionServiceSpy.getQuestion());
    // });

    // it('should call gameValidationWhenModified when gameID is not null in onSubmit', async () => {
    //     spyOn(component, 'gameValidationWhenModified');
    //     await component.onSubmit().then(async () => {
    //         expect(component.gameId).toBe('123');
    //         fixture.detectChanges();
    //         expect(component.gameValidationWhenModified).toHaveBeenCalled();
    //     });
    // });
    // it('should call patch when gameID is not null and validateDeletedGame return true in gameValidationModified', async () => {
    //     spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
    //     gameServiceSpy.validateDeletedGame.and.returnValue(Promise.resolve(true));
    //     component.gameValidationWhenModified().then(() => {
    //         fixture.detectChanges();
    //         expect(gameServiceSpy.patchGame).toHaveBeenCalled();
    //     });
    // });
    // it('should call createGame when gameID is not null and validateDeletedGame return false in gameValidationModified', async () => {
    //     spyOn(gameUtilsModule, 'isValidGame').and.returnValue(Promise.resolve(true));
    //     gameServiceSpy.validateDeletedGame.and.returnValue(Promise.resolve(false));
    //     await component.gameValidationWhenModified().then(async () => {
    //         fixture.detectChanges();
    //         expect(gameServiceSpy.createGame).toHaveBeenCalled();
    //     });
    // });
    // it('should throw error if submitting with the server down', async () => {
    //     spyOn(gameUtilsModule, 'isValidGame').and.throwError('test error');

    //     try {
    //         await component.gameValidationWhenModified();
    //     } catch (error) {
    //         expect(component.handleServerError).toHaveBeenCalled();
    //     }
    // });

    it('should toggle modifiedQuestion property', () => {
        expect(component.modifiedQuestion).toBeFalse();

        component.toggleModifiedQuestion();
        expect(component.modifiedQuestion).toBeTrue();

        component.toggleModifiedQuestion();
        expect(component.modifiedQuestion).toBeFalse();
    });
});
