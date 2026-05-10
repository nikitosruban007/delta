import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { ConsultationStatus } from './enums/consultation-status.enum';
import { ParticipantRole } from './enums/participant-role.enum';
import { ConsultationsLogger } from './utils/logger';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ConsultationsService {
  constructor(private readonly prisma: PrismaService, private readonly logger: ConsultationsLogger) {}

  async createConsultation(dto: CreateConsultationDto, createdById: string) {
    const { title, description, scheduledAt, tournament_id, participantIds = [] } = dto;

    const roomId = crypto.randomUUID();

    const consultation = await this.prisma.consultation.create({
      data: {
        title,
        description,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        createdById,
        tournament_id,
        roomId,
        participants: {
          create: [
            { userId: createdById, role: ParticipantRole.HOST },
            ...participantIds
              .filter((id) => id !== createdById)
              .map((id) => ({ userId: id, role: ParticipantRole.PARTICIPANT })),
          ],
        },
      },
      include: { participants: true },
    });

    this.logger.info('Consultation created', { consultationId: consultation.id, createdById });

    return this.mapConsultation(consultation);
  }

  async startConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');

    if (consultation.createdById !== userId) {
      throw new ForbiddenException('Only host can start consultation');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.ACTIVE, startedAt: new Date() },
    });

    this.logger.info('Consultation started', { consultationId, startedBy: userId });
    return this.mapConsultation(updated);
  }

  async joinConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { participants: true },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');

    let participant = consultation.participants.find((p) => p.userId === userId);
    if (!participant) {
      participant = await this.prisma.consultationParticipant.create({
        data: { consultationId, userId, role: ParticipantRole.PARTICIPANT, joinedAt: new Date() },
      });
    } else {
      participant = await this.prisma.consultationParticipant.update({
        where: { id: participant.id },
        data: { joinedAt: new Date(), leftAt: null },
      });
    }

    this.logger.info('User joined consultation', { consultationId, userId });
    return participant;
  }

  async leaveConsultation(consultationId: string, userId: string) {
    const participant = await this.prisma.consultationParticipant.findFirst({
      where: { consultationId, userId },
    });
    if (!participant) return null;
    const updated = await this.prisma.consultationParticipant.update({
      where: { id: participant.id },
      data: { leftAt: new Date() },
    });
    this.logger.info('User left consultation', { consultationId, userId });
    return updated;
  }

  async endConsultation(consultationId: string, userId: string) {
    const consultation = await this.prisma.consultation.findUnique({ where: { id: consultationId } });
    if (!consultation) throw new NotFoundException('Consultation not found');
    if (consultation.createdById !== userId) {
      throw new ForbiddenException('Only host can end consultation');
    }

    const updated = await this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.ENDED, endedAt: new Date() },
    });

    this.logger.info('Consultation ended', { consultationId, endedBy: userId });
    return this.mapConsultation(updated);
  }

  async getById(consultationId: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { participants: true },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return this.mapConsultation(consultation);
  }

  async getHistoryForUser(userId: string) {
    const consultations = await this.prisma.consultation.findMany({
      where: {
        OR: [
          { createdById: userId },
          { participants: { some: { userId } } },
        ],
      },
      include: { participants: true },
      orderBy: { createdAt: 'desc' },
    });
    return consultations.map((c) => this.mapConsultation(c));
  }

  private mapConsultation(c: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    scheduledAt: Date | null;
    startedAt: Date | null;
    endedAt: Date | null;
    roomId: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
    participants?: { id: string; userId: string; role: string }[];
  }) {
    return {
      id: c.id,
      title: c.title,
      description: c.description,
      status: c.status,
      scheduledAt: c.scheduledAt,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      roomId: c.roomId,
      createdById: c.createdById,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      participants: c.participants ?? [],
    };
  }
}
