import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { BillingModule } from '../billing/billing.module'
@Module({ imports: [BillingModule], providers: [TasksService] })
export class TasksModule {}