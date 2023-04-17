<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).

nest g co quizcontroller/modules/quiz
nest g mo modules/quiz

pm2 start dist/main.js --name moback

//for seasoning database
yarn add moment

import _ as mongoose from 'mongoose';
import _ as moment from 'moment';

const dbName = `monitorex-${moment().format('YYYY-MM')}`;

export const databaseProviders = [
{
provide: 'DATABASE_CONNECTION',
useFactory: (): Promise<typeof mongoose> =>
mongoose.connect(`mongodb://localhost/${dbName}`, {
useNewUrlParser: true,
useUnifiedTopology: true,
}),
},
];

In this example, we are using the moment library to generate the current year and month, and then we are using that to construct the database name. For example, if the current date is February 2023, the database name will be myapp-2023-02.

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { databaseProviders } from './database.providers';

@Module({
imports: [],
controllers: [AppController],
providers: [AppService, ...databaseProviders],
})
export class AppModule {}

import { Injectable, Inject } from '@nestjs/common';
import { Model } from 'mongoose';
import \* as moment from 'moment';
import { DATABASE_CONNECTION } from './database.constants';
import { User } from './user.schema';

@Injectable()
export class UserService {
private seasonDbName: string;

constructor(@Inject(DATABASE_CONNECTION) private connection) {
this.seasonDbName = `myapp-${moment().format('YYYY-MM')}`;
}

async findUsers(): Promise<User[]> {
const seasonDb = this.connection.useDb(this.seasonDbName);
const UserModel: Model<User> = seasonDb.model<User>('User', UserSchema);
const users = await UserModel.find().exec();
return users;
}
}

//for query of databases list

import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { DATABASE_CONNECTION } from './database.constants';

@Injectable()
export class SeasonService {
constructor(@Inject(DATABASE_CONNECTION) private connection) {}

async findSeasons(): Promise<string[]> {
const adminDb: Db = this.connection.db.admin();
const databases = await adminDb.listDatabases();
const seasonNames = databases.databases
.map((db) => db.name)
.filter((name) => name.startsWith('myapp-'));
return seasonNames;
}
}
