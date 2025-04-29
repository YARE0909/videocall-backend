import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  imports: [PrismaModule, ChatModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
