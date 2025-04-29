import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { MeetingService } from './meeting/meeting.service';
import { MeetingGateway } from './meeting/meeting.gateway';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService, MeetingService, MeetingGateway],
})
export class AppModule {}
