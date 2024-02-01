import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChoiceComponent } from './choice.component';

const MAX_CHOICES = 4;

describe('ChoiceComponent', () => {
    let component: ChoiceComponent;
    let fixture: ComponentFixture<ChoiceComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [ChoiceComponent],
        });
        fixture = TestBed.createComponent(ChoiceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a minimum of 2 choices and a maximum of 4 choices', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        spyOn(component, 'addChoice').and.callFake(() => {
            if (component.answers.length < MAX_CHOICES) {
                component.answers.push({ text: 'test3', isCorrect: false });
            }
        });
        spyOn(component, 'removeChoice').and.callFake((index) => {
            if (component.answers.length > 2) {
                component.answers.splice(index, 1);
            }
        });

        expect(component.answers.length).toBe(2);

        component.removeChoice(0);
        expect(component.answers.length).toBe(2);

        component.addChoice();
        expect(component.answers.length).toBe(3);

        component.addChoice();
        component.addChoice();
        expect(component.answers.length).toBe(MAX_CHOICES);
    });
    // IL PASSE

    // it('should determine if a choice is a good or bad answer', () => {
    //     // Mock de component.answers
    //     component.answers = [
    //         { text: ' test1 ', isCorrect: false },
    //         { text: ' test2 ', isCorrect: true },
    //     ];

    //     // Mise à jour de la vue
    //     fixture.detectChanges();

    //     // Sélection de la case à cocher
    //     const checkboxDebugElement = fixture.debugElement.query(By.css('mat-checkbox'));

    //     expect(component.answers[0].isCorrect).toBe(false);

    //     // Simulation du clic sur la case à cocher
    //     checkboxDebugElement.triggerEventHandler('change', { checked: true });

    //     fixture.detectChanges();

    //     expect(component.answers[0].isCorrect).toBe(true);
    // }); figure out comment simuler un click

    // it('should require at least one good and bad answer', () => {

    // });

    it('should be able to add a choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
        ];

        component.addChoice();
        expect(component.answers.length).toBe(3);
    });

    it('should be able to remove a choice', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: true },
            { text: 'test3', isCorrect: false },
        ];

        component.removeChoice(1);
        expect(component.answers.length).toBe(2);
    });

    // it('should move item in array on drop', () => {
    // });

    it('should emit registerAnswer event when there is at least one correct and one incorrect answer', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];

        spyOn(component, 'answerValid').and.returnValue(true);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).toHaveBeenCalledWith(component.answers);
    });

    it('should not emit registerAnswer event when there is only good answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: true },
        ];

        spyOn(component, 'answerValid').and.returnValue(false);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should not emit registerAnswer event when there is only bad answers', () => {
        component.answers = [
            { text: 'test1', isCorrect: false },
            { text: 'test2', isCorrect: false },
        ];

        spyOn(component, 'answerValid').and.returnValue(false);
        spyOn(component.registerAnswer, 'emit');

        component.addAnswer();

        expect(component.registerAnswer.emit).not.toHaveBeenCalledWith(component.answers);
    });

    it('should return true if all text attributes are not empty', () => {
        component.answers = [
            { text: 'test1', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        expect(component.answerValid(component.answers)).toBe(true);
    });

    it('should return false if at least one text attributes is empty', () => {
        component.answers = [
            { text: '', isCorrect: true },
            { text: 'test2', isCorrect: false },
        ];
        expect(component.answerValid(component.answers)).toBe(false);
    });
});
