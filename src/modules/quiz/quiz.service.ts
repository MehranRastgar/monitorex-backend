import { Injectable } from '@nestjs/common';
@Injectable()
export class QuizService {
  qetAllQuiz() {
    return [1, 2, 3, 'from the service'];
  }
}
