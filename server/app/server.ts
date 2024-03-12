import { Application } from '@app/app';
import { Room } from '@app/classes/room';
import type { IChoice } from '@app/model/questions.model';
import * as http from 'http';
import { AddressInfo } from 'net';
import { Server as SocketIoServer } from 'socket.io';
import { Service } from 'typedi';
import { IQuestion } from './model/game.model';
// import { MatchLobbyService } from './services/match-lobby.service';

const BASE_TEN = 10;
const FIRST_ANSWER_MULTIPLIER = 1.2;

@Service()
export class Server {
    private static readonly appPort: string | number | boolean = Server.normalizePort(process.env.PORT || '3000');

    rooms = new Map<string, Room>();

    private server: http.Server;
    private io: SocketIoServer;

    constructor(private readonly application: Application) {}

    private static normalizePort(val: number | string): number | string | boolean {
        const port: number = typeof val === 'string' ? parseInt(val, BASE_TEN) : val;
        return isNaN(port) ? val : port >= 0 ? port : false;
    }
    init(): void {
        this.application.app.set('port', Server.appPort);

        this.server = http.createServer(this.application.app);

        this.io = new SocketIoServer(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
            },
        });

        // TODO: Move this into the "connect" event
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

            const getRoom = () => {
                const roomsArray = Array.from(socket.rooms);
                return this.rooms.get(roomsArray[1]);
            };

            const setRoom = (room: Room) => {
                const roomsArray = Array.from(socket.rooms);
                this.rooms.set(roomsArray[1], room);
            };

            const roomExists = (roomId: string) => {
                return this.rooms.has(roomId);
            };

            // FONCTIONS DE GESTION DES JOUEURS DANS LA ROOM (REJOINDRE/QUITTER)

            socket.on('create-room', (roomId) => {
                if (!roomExists(roomId)) {
                    socket.join(roomId);
                    setRoom(new Room(roomId));
                    getRoom().idAdmin = socket.id;
                    // eslint-disable-next-line no-console
                    console.log('Created room', roomId, 'room is', this.rooms.get(roomId));
                } else {
                    throw new Error('The room you are trying to create already exists');
                }
            });

            socket.on('join-room', (roomId, playerId) => {
                if (roomExists(roomId)) {
                    socket.join(roomId);
                    getRoom().player.set(socket.id, playerId);
                    getRoom().score.set(playerId, 0);
                    this.io.to(getRoom().roomId).emit('new-player-connected');
                    // eslint-disable-next-line no-console
                    console.log('Joined', roomId, 'room is', this.rooms.get(roomId));
                } else {
                    throw new Error('The room you are trying to join does not exist');
                }
            });

            // TODO: Pourquoi ne pas mettre ça directement dans le "join-room" ?
            // socket.on('new-player', () => {
            //     if (roomExists(getRoom().roomId)) {
            //         this.io.to(getRoom().roomId).emit('new-player-connected');
            //     } else {
            //         throw new Error('Error trying to emit a new player');
            //     }
            // });

            // TODO: Unifier les deux fonctions
            // socket.on('admin-disconnect', () => {
            //     if (roomExists(getRoom().roomId)) {
            //         this.io.to(getRoom().roomId).emit('adminDisconnected');
            //         this.rooms.delete(getRoom().roomId);
            //     } else {
            //         throw new Error('Error trying to disconnect the admin');
            //     }
            // });

            // socket.on('player-disconnect', () => {
            //     const roomsArray = Array.from(socket.rooms);
            //     if (this.rooms.has(roomsArray[1])) {
            //         this.io.to(roomsArray[1]).emit('playerDisconnected', this.rooms.get(roomsArray[1]).player.get(socket.id));
            //         this.rooms.get(roomsArray[1]).player.delete(socket.id);
            //         if (this.rooms.get(roomsArray[1]).player.size === 0) {
            //             this.io.to(roomsArray[1]).emit('lastPlayerDisconnected');
            //         }
            //     }
            // });

            socket.on('leave-room', () => {
                if (roomExists(getRoom().roomId)) {
                    if (getRoom().idAdmin === socket.id) {
                        this.io.to(getRoom().roomId).emit('adminDisconnected');
                        this.rooms.delete(getRoom().roomId);
                    } else {
                        this.io.to(getRoom().roomId).emit('playerDisconnected', getRoom().player.get(socket.id));
                        getRoom().player.delete(socket.id);
                        if (getRoom().player.size === 0) {
                            this.io.to(getRoom().roomId).emit('lastPlayerDisconnected');
                        }
                    }
                } else {
                    throw new Error('Error trying to leave a room that does not exist');
                }
            });

            socket.on('disconnect', () => {
                // eslint-disable-next-line no-console
                console.log('user disconnected');
            });

            // FONCTIONS DE GESTION DU TIMER

            socket.on('set-timer-duration', (duration) => {
                if (roomExists(getRoom().roomId)) {
                    if (parseInt(duration, 10) > 0) {
                        getRoom().duration = parseInt(duration, 10);
                    } else {
                        throw new Error('Invalid duration');
                    }
                } else {
                    throw new Error('The room you are trying to set the timer for does not exist');
                }
            });

            socket.on('start-timer', () => {
                if (roomExists(getRoom().roomId)) {
                    if (!getRoom().isRunning && getRoom().idAdmin === socket.id) {
                        getRoom().isRunning = true;
                        getRoom().firstAnswer = true;
                        getRoom().startCountdownTimer(this.io, getRoom().roomId);
                    }
                } else {
                    throw new Error('Error trying to start the timer of a room that does not exist');
                }
            });

            socket.on('stop-timer', () => {
                if (roomExists(getRoom().roomId)) {
                    if (getRoom().isRunning && getRoom().idAdmin === socket.id) {
                        getRoom().resetTimerCountdown();
                    }
                } else {
                    throw new Error('Error trying to stop the timer of a room that does not exist');
                }
            });

            // TODO: Vérifier pourquoi ces deux fonctions ne sont pas unifiées
            socket.on('answer-submitted', () => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().answersLocked += 1;
                    if (getRoom().answersLocked === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('stop-timer');
                        getRoom().resetTimerCountdown();
                    }
                } else {
                    throw new Error('Error trying to submit the answer');
                }
            });

            // TODO: Vérifier pourquoi ces deux fonctions ne sont pas unifiées
            socket.on('playerAnswer', (answer) => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().playersAnswers.push(answer);
                    if (getRoom().playersAnswers.length === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('sendPlayerAnswers', getRoom().playersAnswers);
                    }
                } else {
                    throw new Error('Error trying to submit the answer');
                }
            });

            socket.on('endGame', () => {
                if (roomExists(getRoom().roomId)) {
                    getRoom().answersLocked += 1;
                    if (getRoom().answersLocked === getRoom().player.size) {
                        getRoom().answersLocked = 0;
                        this.io.to(getRoom().roomId).emit('endGame');
                    }
                } else {
                    throw new Error('Error trying to end the game of a room that does not exist');
                }
            });

            socket.on('assert-answers', async (question: IQuestion, answerIdx: number[]) => {
                const playerId = getRoom().player.get(socket.id);
                const choices: IChoice[] = question.choices;
                this.rooms.get(getRoom().roomId).assertedAnswers += 1;
                if (roomExists(getRoom().roomId)) {
                    if (answerIdx.length === 0) {
                        this.io.to(socket.id).emit('answer-verification', false, 1);
                        return;
                    }
                    const totalCorrectChoices = choices.reduce((count, choice) => (choice.isCorrect ? count + 1 : count), 0);
                    const isMultipleAnswer = totalCorrectChoices > 1;

                    const selectedCorrectAnswers = answerIdx.reduce((count, index) => (choices[index].isCorrect ? count + 1 : count), 0);

                    let isCorrect = false;
                    if (!isMultipleAnswer) {
                        isCorrect = selectedCorrectAnswers === 1 && choices[answerIdx[0]].isCorrect;
                    } else {
                        const selectedIncorrectAnswers = answerIdx.length - selectedCorrectAnswers;
                        const omittedCorrectAnswers = totalCorrectChoices - selectedCorrectAnswers;
                        isCorrect = selectedIncorrectAnswers === 0 && omittedCorrectAnswers === 0;
                    }

                    if (isCorrect && getRoom().firstAnswer) {
                        getRoom().firstAnswer = false;
                        const currentScore = getRoom().score.get(playerId);
                        getRoom().score.set(playerId, FIRST_ANSWER_MULTIPLIER * question.points + currentScore);
                    } else if (isCorrect) {
                        const currentScore = getRoom().score.get(playerId);
                        getRoom().score.set(playerId, question.points + currentScore);
                    }

                    if (getRoom().assertedAnswers === getRoom().player.size) {
                        this.io.to(getRoom().roomId).emit('answer-verification', Array.from(getRoom().score));
                        getRoom().assertedAnswers = 0;
                    }
                } else {
                    throw new Error('Error trying to calculate the score of a room that does not exist');
                }
            });

            socket.on('chatMessage', ({ message, playerName, isHost }) => {
                const senderName = isHost ? 'Organisateur' : playerName;

                socket.broadcast.to(getRoom().roomId).emit('chatMessage', {
                    text: message,
                    sender: senderName,
                    timeStamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                });
            });

            socket.on('goToResult', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('resultView');
                } else {
                    throw new Error('Error trying to go to the result view of a room that does not exist');
                }
            });

            socket.on('goNextQuestion', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('handleNextQuestion');
                } else {
                    throw new Error('Error trying to go to the next question of a room that does not exist');
                }
            });

            socket.on('start', () => {
                if (roomExists(getRoom().roomId)) {
                    this.io.to(getRoom().roomId).emit('game-started');
                } else {
                    throw new Error('Error trying to start the game of a room that does not exist');
                }
            });
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
