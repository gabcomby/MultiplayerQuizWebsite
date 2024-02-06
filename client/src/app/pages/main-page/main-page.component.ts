import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PasswordDialogComponent } from '@app/components/password-dialog/password-dialog.component';
import { ServerErrorDialogComponent } from '@app/components/server-error-dialog/server-error-dialog.component';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    readonly title: string = 'LOG2990';
    password: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        public dialog: MatDialog,
        private snackbarService: SnackbarService,
    ) {}

    openAdminDialog(): void {
        const dialogRef = this.dialog.open(PasswordDialogComponent, { width: '300px' });

        dialogRef.afterClosed().subscribe((password) => {
            if (password) {
                this.authService.authenticate(password).subscribe({
                    next: (authenticate) => {
                        if (authenticate) {
                            this.router.navigate(['/admin']);
                        }
                    },
                    error: (error) => {
                        if (error.error.body === 'Invalid password') this.snackbarService.openSnackBar('Mot de passe invalide');
                        else {
                            this.dialog.open(ServerErrorDialogComponent, {
                                data: { message: 'Nous ne semblons pas être en mesure de contacter le serveur. Est-il allumé ?' },
                            });
                        }
                    },
                });
            }
        });
    }
}
