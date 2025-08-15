import { Module } from '@nestjs/common'
import { ReviewsController } from './reviews.controller'
import { ReviewsService } from './reviews.service'
import { StorageModule } from '../storage/storage.module'
@Module({ imports: [StorageModule], controllers: [ReviewsController], providers: [ReviewsService] })
export class ReviewsModule {}