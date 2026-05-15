import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../../prisma/prisma.service';
import { NOTIFICATION_PORT } from '../ports/notification.port';
import type { NotificationPort } from '../ports/notification.port';
import { DispatchNotificationUseCase } from '../../../notifications/application/use-cases/dispatch-notification.use-case';
import { NotificationChannel } from '../../../notifications/domain/notification-channel.enum';

export interface RegisterTeamMember {
  fullName: string;
  email: string;
}

export interface RegisterTeamInput {
  tournamentId: string;
  captainId: string;
  captainEmail: string;
  name: string;
  members: RegisterTeamMember[];
  /**
   * When the requester is the tournament organizer (or an ADMIN),
   * skip the "registration closed / deadline passed" checks so the
   * organizer can manually add a team after registration ends.
   * The tournament-full and unique-email checks still apply.
   */
  requesterIsOwnerOrAdmin?: boolean;
}

@Injectable()
export class RegisterTeamUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(NOTIFICATION_PORT) private readonly notifier: NotificationPort,
    private readonly dispatcher: DispatchNotificationUseCase,
  ) {}

  async execute(input: RegisterTeamInput) {
    const tournamentId = Number(input.tournamentId);
    const captainId = Number(input.captainId);

    const tournament = await this.prisma.tournaments.findUnique({
      where: { id: tournamentId },
      include: { _count: { select: { tournament_teams: true } } },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    // Organizer-of-the-tournament (or admin) can bypass the registration
    // window. For everyone else the standard checks apply.
    if (!input.requesterIsOwnerOrAdmin) {
      if (tournament.status !== 'registration') {
        throw new BadRequestException(
          `Registration is closed (tournament status: ${tournament.status})`,
        );
      }

      if (
        tournament.registration_deadline &&
        tournament.registration_deadline.getTime() < Date.now()
      ) {
        throw new BadRequestException('Registration deadline has passed');
      }
    }

    // Cannot register teams once the tournament is finished, even for the organizer.
    if (tournament.status === 'finished') {
      throw new BadRequestException(
        'Cannot register teams for a finished tournament',
      );
    }

    const maxTeams = tournament.max_teams ?? 50;
    if (tournament._count.tournament_teams >= maxTeams) {
      throw new BadRequestException('Tournament is full');
    }

    // Captain + members
    const captainMember: RegisterTeamMember = {
      fullName: '',
      email: (input.captainEmail ?? '').trim().toLowerCase(),
    };

    const extras = (input.members ?? []).map((m) => ({
      fullName: m.fullName.trim(),
      email: m.email.trim().toLowerCase(),
    }));

    const allMembers = [captainMember, ...extras];
    const emails = allMembers.map((m) => m.email).filter(Boolean);
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      throw new BadRequestException('Member emails must be unique');
    }

    const totalSize = allMembers.length;
    const minSize = tournament.team_size_min ?? 1;
    const maxSize = tournament.team_size_max ?? 20;
    if (totalSize < minSize) {
      throw new BadRequestException(
        `Team requires at least ${minSize} members (including captain)`,
      );
    }
    if (totalSize > maxSize) {
      throw new BadRequestException(`Team exceeds maximum size of ${maxSize}`);
    }

    // Captain must not already lead another team in this tournament
    const existing = await this.prisma.tournament_teams.findFirst({
      where: {
        tournament_id: tournamentId,
        teams: { captain_id: captainId },
      },
    });
    if (existing) {
      throw new ConflictException(
        'Captain already has a team registered in this tournament',
      );
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const team = await tx.teams.create({
        data: { name: input.name, captain_id: captainId },
      });

      await tx.tournament_teams.create({
        data: { tournament_id: tournamentId, team_id: team.id },
      });

      await tx.team_members.create({
        data: { team_id: team.id, user_id: captainId, role: 'captain' },
      });

      // For each additional member, link existing user as member if account exists,
      // otherwise create a pending invite.
      for (const m of extras) {
        if (!m.email) continue;
        const user = await tx.users.findUnique({ where: { email: m.email } });
        if (user) {
          await tx.team_members.upsert({
            where: { team_id_user_id: { team_id: team.id, user_id: user.id } },
            create: { team_id: team.id, user_id: user.id, role: 'member' },
            update: {},
          });
        } else {
          await tx.team_invites.create({
            data: {
              team_id: team.id,
              email: m.email,
              token: randomUUID(),
              status: 'pending',
            },
          });
        }
      }

      return team;
    });

    await this.notifier.emitToTournament(
      input.tournamentId,
      'team.registered',
      {
        id: String(result.id),
        name: result.name,
        tournamentId: input.tournamentId,
      },
    );

    // Persist an in-app notification for the tournament organizer.
    if (tournament.created_by) {
      try {
        await this.dispatcher.execute({
          recipients: [{ userId: String(tournament.created_by) }],
          subject: `Нова команда зареєстрована: ${result.name}`,
          body: `Команда «${result.name}» зареєструвалася на турнір «${tournament.title}».`,
          channels: [NotificationChannel.IN_APP],
        });
      } catch (err) {
        // Non-fatal: do not roll back team registration if notification fails.
        console.warn('[register-team] dispatch notification failed', err);
      }
    }

    return {
      id: String(result.id),
      tournamentId: input.tournamentId,
      captainId: input.captainId,
      name: result.name,
      members: allMembers.map((m) => ({
        fullName: m.fullName,
        email: m.email,
      })),
    };
  }
}
