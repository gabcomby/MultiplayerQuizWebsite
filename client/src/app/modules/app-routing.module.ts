import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { CreateQGamePageComponent } from '@app/pages/create-qgame-page/create-qgame-page.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GameWaitComponent } from '@app/pages/game-wait/game-wait.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { ModifyQuestionQbankComponent } from '@app/pages/modify-question-qbank/modify-question-qbank.component';
import { NewGamePageComponent } from '@app/pages/new-game-page/new-game-page.component';
import { NewQuestionQbankComponent } from '@app/pages/new-question-qbank/new-question-qbank.component';
import { QuestionBankComponent } from '@app/pages/question-bank/question-bank.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'admin', component: AdminPageComponent, canActivate: [authGuard] },
    { path: 'new-game', component: NewGamePageComponent },
    { path: 'create-qgame', component: CreateQGamePageComponent },
    { path: 'create-qgame/:id', component: CreateQGamePageComponent },
    { path: 'question-bank', component: QuestionBankComponent },
    { path: 'game/:id', component: GamePageComponent },
    { path: 'gameWait/:gameId/:matchLobbyId', component: GameWaitComponent },
    { path: 'new-question-qbank', component: NewQuestionQbankComponent },
    { path: 'modify-question-qbank', component: ModifyQuestionQbankComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
