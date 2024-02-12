import { Application } from '@app/app';
import type { IChoice } from '@app/model/questions.model';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';

const ONE_SECOND_IN_MS = 1000;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');
    // eslint-disable-next-line @typescript-eslint/no-magic-numbers
    private static readonly baseDix: number = 10;
    room = {
        duration: 0,
        timerId: 0,
        currentTime: 0,
        isRunning: false,
    };
    private server: http.Server;
    private io: SocketIoServer;
    constructor(private readonly application: Application) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, this.baseDix) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }
    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.io = new SocketIoServer(this.server, {
            cors: {
                origin: 'http://localhost:4200',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            },
        });

        this.io.on('connection', (socket) => {
            socket.on('message', (message) => {
                this.io.emit('message', `Server: ${message}`);
            });
        });

        this.io.on('connect', (socket) => {
            this.application.getIdentification().then((pair) => {
                this.io.emit('messageConnect', pair);
            });
            this.application.watchDelete().then((deletedId) => {
                this.io.emit('deleteId', deletedId);
            });

            socket.on('set-timer-duration', (duration) => {
                if (parseInt(duration, 10) > 0) {
                    this.room.duration = parseInt(duration, 10);
                } else {
                    throw new Error('Invalid duration');
                }
            });

            socket.on('start-timer', () => {
                if (this.room.isRunning) {
                    clearInterval(this.room.timerId);
                }
                this.room.isRunning = true;
                startCountdownTimer(this.room.duration);
            });

            socket.on('stop-timer', () => {
                if (this.room.timerId) {
                    clearInterval(this.room.timerId);
                    this.room.isRunning = false;
                    this.room.currentTime = this.room.duration;
                }
            });

            socket.on('assert-answers', (choices: IChoice[], answerIdx: number[]) => {
                if (answerIdx.length === 0) {
                    this.io.emit('answer-verification', false);
                    return;
                }

                const totalCorrectChoices = choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                const isMultipleAnswer = totalCorrectChoices > 1;

                const selectedCorrectAnswers = answerIdx.reduce((count, index) => (choices[index].isCorrect ? count + 1 : count), 0);

                if (!isMultipleAnswer) {
                    this.io.emit('answer-verification', selectedCorrectAnswers === 1 && choices[answerIdx[0]].isCorrect);
                } else {
                    const selectedIncorrectAnswers = answerIdx.length - selectedCorrectAnswers;
                    const omittedCorrectAnswers = totalCorrectChoices - selectedCorrectAnswers;
                    this.io.emit('answer-verification', selectedIncorrectAnswers === 0 && omittedCorrectAnswers === 0);
                }
            });

            const startCountdownTimer = (duration: number): void => {
                this.room.currentTime = duration;
                this.io.emit('timer-countdown', duration);
                const timerId = setInterval(
                    () => {
                        duration -= 1;
                        this.io.emit('timer-countdown', duration);
                        this.room.currentTime = duration;
                    },
                    ONE_SECOND_IN_MS,
                    duration,
                );
                this.room.timerId = timerId;
            };
        });

        this.server.listen(Server.appPort);
        this.server.on('error', (error: NodeJS.ErrnoException) => this.onError(error));
        this.server.on('listening', () => this.onListening());
    }
    private onError(error: NodeJS.ErrnoException): void {
        if (error.syscall !== 'listen') {
            throw error;
        }
        const bind: string = typeof Server.appPort === 'string' ? 'Pipe ' + Server.appPort : 'Port ' + Server.appPort;
        switch (error.code) {
            case 'EACCES':
                // eslint-disable-next-line no-console
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                // eslint-disable-next-line no-console
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    }

    /**
     * Se produit lorsque le serveur se met à écouter sur le port.
     */
    private onListening(): void {
        const addr = this.server.address() as AddressInfo;
        const bind: string = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
        // eslint-disable-next-line no-console
        console.log(`Listening on ${bind}`);
    }
}
