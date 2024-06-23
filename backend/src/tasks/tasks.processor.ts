// tasks.processor.ts
import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';

@Processor('task-queue')
export class TasksProcessor {
  @Process('process-task')
  async handleTask(job: Job) {
    console.log('Processing task:', job.data);
    // Your background task processing logic here
  }
}
