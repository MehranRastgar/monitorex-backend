import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
@Injectable()
export class QuizService {
  constructor(
    private readonly userService:UsersService

  ){

  }
  async qetAllQuiz() {
    await this.userService.findAll()
    return [1, 2, 3, 'from the service'];
  }
  
}
