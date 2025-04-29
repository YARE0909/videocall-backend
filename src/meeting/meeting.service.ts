import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class MeetingService {
  constructor(private readonly prisma: PrismaService) {}

  async createMeeting(userId: string, title?: string) {
    if (!userId) {
      throw new BadRequestException('User ID is required to create a meeting');
    }

    const code = this.generateMeetingCode();

    try {
      const participant = await this.prisma.meetingParticipant.findFirst({
        where: {
          userId,
          status: {
            in: ['JOINED'],
          },
        },
      });

      if (participant) {
        throw new BadRequestException('User is already in the meeting');
      }

      return await this.prisma.meeting.create({
        data: {
          code,
          title: title?.trim() || undefined,
          hostId: userId,
          participants: {
            create: {
              userId,
              status: 'JOINED',
            },
          },
        },
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw new InternalServerErrorException('Failed to create meeting');
    }
  }

  async joinMeeting(code: string, userId: string) {
    if (!code || !userId) {
      throw new BadRequestException('Meeting code and user ID are required');
    }

    const meeting = await this.prisma.meeting.findUnique({ where: { code } });

    if (!meeting) {
      throw new NotFoundException(`No meeting found for code "${code}"`);
    }

    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { userId_meetingId: { userId, meetingId: meeting.id } },
    });

    if (participant && participant.status === 'JOINED') {
      throw new BadRequestException('User is already in the meeting');
    }

    try {
      await this.prisma.meetingParticipant.create({
        data: {
          userId,
          meetingId: meeting.id,
          status: 'JOINED',
        },
      });

      await this.prisma.meeting.update({
        where: { code },
        data: {
          participantCount: meeting.participantCount + 1,
        },
      });

      return meeting;
    } catch (error) {
      console.error('Error adding participant:', error);
      throw new InternalServerErrorException('Failed to add participant');
    }
  }

  async leaveMeeting(code: string, userId: string) {
    if (!code || !userId) {
      throw new BadRequestException('Meeting code and user ID are required');
    }

    const meeting = await this.prisma.meeting.findUnique({ where: { code } });

    if (!meeting) {
      throw new NotFoundException(`No meeting found for code "${code}"`);
    }

    const participant = await this.prisma.meetingParticipant.findUnique({
      where: { userId_meetingId: { userId, meetingId: meeting.id } },
    });

    if (!participant || participant.status === 'LEFT') {
      throw new BadRequestException('User is not in the meeting');
    }

    try {
      await this.prisma.meetingParticipant.update({
        where: { userId_meetingId: { userId, meetingId: meeting.id } },
        data: { status: 'LEFT', leftAt: new Date() },
      });

      await this.prisma.meeting.update({
        where: { code },
        data: {
          participantCount: meeting.participantCount - 1,
        },
      });

      return meeting;
    } catch (error) {
      console.error('Error updating participant:', error);
      throw new InternalServerErrorException(
        'Failed to update participant status',
      );
    }
  }

  async endMeeting(code: string) {
    const meeting = await this.prisma.meeting.findUnique({ where: { code } });

    if (!meeting) {
      throw new NotFoundException(`No meeting found for code "${code}"`);
    }

    if (meeting.status === 'ENDED') {
      throw new BadRequestException('Meeting already ended');
    }

    try {
      // Update meeting status to ended
      await this.prisma.meeting.update({
        where: { code },
        data: {
          status: 'ENDED',
        },
      });

      return meeting;
    } catch (error) {
      console.error('Error ending meeting:', error);
      throw new InternalServerErrorException('Failed to end meeting');
    }
  }

  private generateMeetingCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
