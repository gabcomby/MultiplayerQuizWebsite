import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQGamePageComponent } from '@app/pages/create-qgame-page/create-qgame-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameTestComponent } from '@app/pages/game-test/game-test.component';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { ModifyQuestionQbankComponent } from '@app/pages/modify-question-qbank/modify-question-qbank.component';
import { NewGamePageComponent } from '@app/pages/new-game-page/new-game-page.component';
import { NewQuestionQbankComponent } from '@app/pages/new-question-qbank/new-question-qbank.component';
import { QuestionBankComponent } from '@app/pages/question-bank/question-bank.component';
import { QuestionsPageComponent } from '@app/pages/questions-page/questions-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'admin', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'questions', component: QuestionsPageComponent },
    { path: 'new-game', component: NewGamePageComponent },
    { path: 'create-qgame', component: CreateQGamePageComponent },
    { path: 'question-bank', component: QuestionBankComponent },
    { path: 'testGame/:id', component: GameTestComponent },
    { path: 'gameWait/:id', component: GameWaitComponent },
    { path: 'new-question-qbank', component: NewQuestionQbankComponent },
    { path: 'modify-question-qbank', component: ModifyQuestionQbankComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
