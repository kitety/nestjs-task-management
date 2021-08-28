import { BadRequestException, PipeTransform } from '@nestjs/common';
import { TaskStatus } from '../task.module';

export class TaskStatusValidationPipe implements PipeTransform {
  readonly allowStatuses = [
    TaskStatus.OPEN,
    TaskStatus.IN_PROGRESS,
    TaskStatus.DONE,
  ];

  private isStatusValid(status: any) {
    return this.allowStatuses.includes(status);
  }

  transform(value: string) {
    value = value?.toUpperCase();
    if (!this.isStatusValid(value)) {
      throw new BadRequestException(`"${value}" is invalid status`);
    }
  }
}
