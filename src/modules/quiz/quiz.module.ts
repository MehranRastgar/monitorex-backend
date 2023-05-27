import { Module } from '@nestjs/common';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { AppService } from 'src/app.service';
import { UsersService } from 'src/users/users.service';
import { UserSchema } from 'src/users/user.model';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports:[
    MongooseModule.forFeature([

      { name: 'User', schema: UserSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [AppService,UsersService,QuizService],
})
export class QuizModule {}
