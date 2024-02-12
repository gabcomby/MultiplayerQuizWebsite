import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Choice, Question } from '@app/interfaces/game';
import { QuestionValidationService } from '@app/services/question-validation.service';
import { QuestionService } from '@app/services/question.service';
import { SnackbarService } from '@app/services/snackbar.service';
import * as gameUtilsModule from '@app/utils/assign-new-game-attributes';
import { NewQuestionComponent } from './new-question.component';
import SpyObj = jasmine.SpyObj;

describe('NewQuestionComponent', () => {
    let questionServiceSpy: SpyObj<QuestionService>;
    let routerSpy: SpyObj<Router>;
    let snackbarServiceSpy: SpyObj<SnackbarService>;
    let questionValidationSpy: SpyObj<QuestionValidationService>;
    let component: NewQuestionComponent;
    let fixture: ComponentFixture<NewQuestionComponent>;
    const defaultDate = new Date();

    beforeEach(() => {
        questionServiceSpy = jasmine.createSpyObj('QuestionService', {
            addQuestion: {},
            addQuestionBank: {},
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
                } as Question,
            ],
            getQuestions: [
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
                } as Question,
            ],
        });
    });

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        snackbarServiceSpy = jasmine.createSpyObj('SnackbarService', ['openSnackBar']);
        questionValidationSpy = jasmine.createSpyObj('SnackbarService', ['validateQuestion']);

        TestBed.configureTestingModule({
            declarations: [NewQuestionComponent],
            providers: [
                { provide: QuestionService, useValue: questionServiceSpy },
                { provide: Router, useValue: routerSpy },
                { provide: SnackbarService, useValue: snackbarServiceSpy },
            ],
        });
        fixture = TestBed.createComponent(NewQuestionComponent);
        // snackbarService = TestBed.inject(SnackbarService);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call addQuestion from service when question comes from a new game with valid data ', () => {
        // spyOn(component, 'validateQuestion').and.returnValue(true);
        questionValidationSpy.validateQuestion.and.returnValue(true);
        // gameServiceSpy.validateDeletedGame.and.returnValue(Promise.resolve(true));

        spyOn(component, 'resetComponent');
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = false;
        component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        expect(component.resetComponent).toHaveBeenCalled();
    });

    it('should call addQuestionBank when coming from the question bank with valid data', async () => {
        questionValidationSpy.validateQuestion.and.returnValue(true);
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));

        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = true;

        await component.addQuestion(newChoices, mockOnlyAddQuestionBank);

        expect(questionServiceSpy.addQuestionBank).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/question-bank']);
    });

    it('should call addQuestion and addQuestionBank when coming from newGame and checkbox checked', async () => {
        // spyOn(component, 'validateQuestion').and.returnValue(true);
        questionValidationSpy.validateQuestion.and.returnValue(true);

        spyOn(component, 'resetComponent');
        spyOn(component, 'validateQuestionExisting').and.returnValue(Promise.resolve(true));
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const mockOnlyAddQuestionBank = false;
        component.addBankQuestion = true;
        await component.addQuestion(newChoices, mockOnlyAddQuestionBank);
        expect(questionServiceSpy.addQuestionBank).toHaveBeenCalled();
        fixture.detectChanges();
        expect(questionServiceSpy.addQuestion).toHaveBeenCalled();
        fixture.detectChanges();
        expect(component.resetComponent).toHaveBeenCalled();
    });
    it('should call addQuestion for every question selected when calling addQuestionFromBank', () => {
        const questionFromBank = [
            {
                type: 'QCM',
                text: 'Ceci est une question de test',
                points: 10,
                id: 'dsdsd',
                lastModification: new Date(),
                choices: [],
            },
            {
                type: 'QCM',
                text: 'question 2',
                points: 10,
                id: 'alala',
                lastModification: new Date(),
                choices: [],
            },
        ];
        component.addQuestionFromBank(questionFromBank);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalledWith(questionFromBank[0]);
        expect(questionServiceSpy.addQuestion).toHaveBeenCalledWith(questionFromBank[1]);
    });
    it('should reset question component whe resetComponent is called', () => {
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        component.resetComponent(newChoices);
        expect(component.question).toEqual({
            text: '',
            points: 10,
            choices: [],
            type: 'QCM',
            id: '12312312',
            lastModification: defaultDate,
        });
        expect(newChoices[0]).toEqual({ isCorrect: false, text: '' });
        expect(newChoices[1]).toEqual({ isCorrect: false, text: '' });

        expect(component.addBankQuestion).toBeFalse();
    });
    it('should create question when createNewQuestion is called', () => {
        spyOn(gameUtilsModule, 'generateNewId').and.returnValue('334');
        const newChoices: Choice[] = [
            { text: '1', isCorrect: false },
            { text: '2', isCorrect: true },
        ];

        component.question = { type: 'QCM', text: 'allo', points: 10, id: '12312312', choices: newChoices, lastModification: defaultDate };
        const newQuestion = component.createNewQuestion(newChoices);
        expect(newQuestion).toEqual({
            text: 'allo',
            points: 10,
            choices: newChoices,
            type: 'QCM',
            id: '334',
            lastModification: new Date(),
        });
    });

    it('should return false when calling validateQuestionExisting with question already in questionBank', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'Ceci est une question de test',
            points: 10,
            id: 'dsdsd',
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
            ],
            lastModification: new Date(),
        };
        const valid = await component.validateQuestionExisting(newQuestion);
        expect(valid).toEqual(false);
    });
    it('should return true when calling validateQuestionExisting with question not in questionBank', async () => {
        const newQuestion = {
            type: 'QCM',
            text: 'Ceci est une question de test 2',
            points: 10,
            id: '1234',
            choices: [
                { text: '1', isCorrect: false },
                { text: '2', isCorrect: true },
            ],
            lastModification: new Date(),
        };
        const valid = await component.validateQuestionExisting(newQuestion);
        expect(valid).toEqual(true);
    });
});
