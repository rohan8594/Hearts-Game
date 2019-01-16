# Hearts Game

Rohan Patel, Jake Carter, Richard Robinson, Guanming Pan

## Introduction

This is a real-time, multiplayer, online application to play the popular card game of Hearts. The game supports 2 and 4 player game rooms.

## Features

- Registration (with encrypted passwords)
- Login / Logout (with sessions)
- Lobby page: contains a lobby chat, list of current games, options to create a game, join an already made game that is not full, observe a game, and rejoin a game.
- The application supports an arbitrary (infinite) number of concurrent games, and a given player can participate in multiple games (in different tabs).
- Game rooms have their own dedicated game chats.
- Game rooms also allow users to join in as observers to just watch the ongoing game.
- Game rooms also contain a nudge button that ends the game on a 30 second timer if no action is taken by an opposing player.
- Game state is persisted in the database. If a user closes a tab, and reconnects to the game, the game will be reloaded for that user.
- Game state is updated in real time in response to user events and interaction with the game using Socket.IO
- All the logic of the standard hearts game has been implemented and tested.

## How to compile and run

### Prerequisites

- Node.js installed
- PostgreSQL installed
- In Postgres, create a database `DATABASE_NAME`

### Clone repo

```
$ git clone https://github.com/rohan8594/Hearts-Game.git
$ cd Hearts-Game
```

### Create a .env file

```
$ touch .env
$ echo DATABASE_URL=postgres://`whoami`@localhost:5432/DATABASE_NAME >> .env
```

### Command line instructions

```
$ npm install
$ npm run db:migrate
$ npm run db:seed:all
$ npm run start:dev
```

The app will then be running locally, and can be accessed at:

`localhost:3000`

## Heroku Link

[Hearts Game](https://hearts-game.herokuapp.com/)
