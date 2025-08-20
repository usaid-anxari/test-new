import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"


async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true })
  app.use(helmet())
  app.use(cookieParser())
  app.enableCors({
    origin: [process.env.FRONTEND_URL!],
    credentials: true,
  })
  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('TrueTestify API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // Enable CORS
  app.enableCors();

  // Start the server
  const port = await app.listen(process.env.PORT || 3000)
  console.log(`Application is running on: http://localhost:${port._connectionKey}`);
  console.log(`API documentation is available at: http://localhost:${port._connectionKey}/api-docs`);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  
}
bootstrap()