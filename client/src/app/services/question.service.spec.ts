import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Question } from '@app/interfaces/game';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
    let service: QuestionService;
    let httpController: HttpTestingController;
    const defaultDate = new Date();

    const question: Question = {
        type: 'QCM',
        id: 'abc123',
        lastModification: new Date('2018-11-13T20:20:39+00:00'),
        text: 'Parmi les mots suivants, lesquels sont des mots clés réservés en JS?',
        points: 40,
        choices: [
            {
                text: 'var',
                isCorrect: true,
            },
            {
                text: 'self',
                isCorrect: false,
            },
            {
                text: 'this',
                isCorrect: true,
            },
            {
                text: 'int',
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [QuestionService],
        });
        service = TestBed.inject(QuestionService);
        httpController = TestBed.inject(HttpTestingController);

        service.questions = [
            {
                id: 'string',
                type: 'string',
                text: 'string',
                points: 40,
                lastModification: defaultDate,
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },
        ];
    });

    afterEach(() => {
        httpController.verify();
        service.questions = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get all questions', () => {
        service.getQuestions().then((questions) => {
            expect(questions).toEqual([]);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions');
        expect(req.request.method).toBe('GET');
        req.flush([]);
    });

    it('should add a question to the question bank', () => {
        service.addQuestionBank(question).then((newQuestion) => {
            expect(newQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions');
        expect(req.request.method).toBe('POST');
        req.flush(question);
    });
    it('should get a question by its id', () => {
        service.getQuestionById('abc123').subscribe((q) => {
            expect(q).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('GET');
        req.flush(question);
    });

    it('should update a question', () => {
        service.updateQuestion('abc123', question).then((updatedQuestion) => {
            expect(updatedQuestion).toEqual(question);
        });

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('PATCH');
        req.flush(question);
    });

    it('should delete a question', () => {
        service.deleteQuestion('abc123');

        const req = httpController.expectOne('http://localhost:3000/api/questions/abc123');
        expect(req.request.method).toBe('DELETE');
        req.flush(null);
    });

    it('should reset questions', () => {
        expect(service.questions.length).toBe(1);

        service.resetQuestions();

        expect(service.questions.length).toBe(0);
    });

    it('should add question', () => {
        service.addQuestion({
            id: 'string',
            type: 'string',
            text: 'string',
            points: 40,
            lastModification: defaultDate,
            choices: [
                { text: 'Ceci est une question de test', isCorrect: true },
                { text: 'Ceci est une question de test 2', isCorrect: false },
            ],
        });

        expect(service.questions.length).toBe(2);
    });

    it('should emit question after being added', () => {
        spyOn(service.onQuestionAdded, 'emit');
        const questionInstance = {
            id: 'string',
            type: 'string',
            text: 'string',
            points: 40,
            lastModification: defaultDate,
            choices: [
                { text: 'Ceci est une question de test', isCorrect: true },
                { text: 'Ceci est une question de test 2', isCorrect: false },
            ],
        };
        service.addQuestion(questionInstance);

        expect(service.onQuestionAdded.emit).toHaveBeenCalledWith(questionInstance);
    });

    it('should return the questions of the service', () => {
        const questions = service.getQuestion();

        expect(questions).toEqual(service.questions);
    });

    it('should update the question list with the question added', () => {
        const questions = [
            {
                id: 'string',
                type: 'string',
                text: 'string',
                points: 40,
                lastModification: new Date(),
                choices: [
                    { text: 'Ceci est une question de test', isCorrect: true },
                    { text: 'Ceci est une question de test 2', isCorrect: false },
                ],
            },

            {
                id: 'string1',
                type: 'string',
                text: 'string',
                points: 50,
                lastModification: new Date(),
                choices: [
                    { text: 'Ceci est une question de test3', isCorrect: true },
                    { text: 'Ceci est une question de test 4', isCorrect: false },
                ],
            },
        ];
        service.updateList(questions);
        expect(service.questions).toEqual(questions);
    });
});
