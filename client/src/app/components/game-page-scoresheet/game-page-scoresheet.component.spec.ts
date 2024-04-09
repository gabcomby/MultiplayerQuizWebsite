import { HttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { API_BASE_URL } from '@app/app.module';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';
import { GameService } from '@app/services/game/game.service';
import { GamePageScoresheetComponent } from './game-page-scoresheet.component';

describe('GamePageScoresheetComponent', () => {
    let component: GamePageScoresheetComponent;
    let fixture: ComponentFixture<GamePageScoresheetComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: API_BASE_URL, useValue: 'http://localhost:3000/api' },
                { provide: HttpClient, useValue: {} },
                { provide: GameService, useValue: {} },
                { provide: GameWaitComponent, useValue: {} },
            ],
            declarations: [GamePageScoresheetComponent],
            imports: [MatCardModule, MatFormFieldModule],
        });
        fixture = TestBed.createComponent(GamePageScoresheetComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
