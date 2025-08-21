import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { TenantsModule } from './tenants/tenants.module'
import { ApiKeysModule } from './api-keys/api-keys.module'
import { ReviewsModule } from './reviews/reviews.module'
import { WidgetsModule } from './widgets/widgets.module'
import { StorageModule } from './storage/storage.module'
import { AnalyticsModule } from './analytics/analytics.module'
import { BillingModule } from './billing/billing.module'
import { WordpressModule } from './integrations/wordpress/wordpress.module'
import { ShopifyModule } from './integrations/shopify/shopify.module'
import appConfig from './config/app.config'
import authConfig from './config/auth.config'
import stripeConfig from './config/stripe.config'
import awsConfig from './config/aws.config'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { EmbedsModule } from './modules/embeds/embeds.module'

@Module({
  controllers:[AppController],
  providers:[AppService],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, authConfig, stripeConfig, awsConfig] }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    ApiKeysModule,
    ReviewsModule,
    WidgetsModule,
    StorageModule,
    AnalyticsModule,
    BillingModule,
    WordpressModule,
    ShopifyModule,
    EmbedsModule,
  ],
})
export class AppModule {}