import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from '@app/interfaces/game';
import { QuestionService } from '@app/services/question.service';

@Component({
    selector: 'app-question-bank',
    templateUrl: './question-bank.component.html',
    styleUrls: ['./question-bank.component.scss'],
})
export class QuestionBankComponent implements OnInit {
    @Input() fromCreateNewGame: boolean;
    @Output() registerQuestion: EventEmitter<Question[]> = new EventEmitter();
    questionToAdd: Question[] = [];
    displayedColumns: string[] = ['question', 'date', 'delete'];
    dataSource: Question[] = [];

    // Track the selected row IDs
    selectedRowIds: string[] = [];

    constructor(private questionService: QuestionService) {}

    ngOnInit() {
        this.questionService.getQuestions().then((questions) => {
            this.dataSource = questions.sort((a, b) => {
                const dateA = new Date(a.lastModification).getTime();
                const dateB = new Date(b.lastModification).getTime();
                return dateB - dateA;
            });
        });
    }

    deleteQuestion(questionId: string): void {
        this.dataSource = this.dataSource.filter((question) => question.id !== questionId);
        this.questionService.deleteQuestion(questionId);
    }
    addQuestionToGame() {
        this.registerQuestion.emit(this.questionToAdd);
        this.questionToAdd = [];
    }
    onChange(question: Question) {
        if (this.questionToAdd.includes(question)) {
            this.questionToAdd = this.questionToAdd.filter((element) => element.id !== question.id);
        } else {
            this.questionToAdd.push(question);
        }
    }
}
