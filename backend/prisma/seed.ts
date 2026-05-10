import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import 'dotenv/config'

console.log(process.env.DATABASE_URL)

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Roles
  const adminRole = await prisma.roles.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN', description: 'System administrator' },
  });

  const organizerRole = await prisma.roles.upsert({
    where: { name: 'ORGANIZER' },
    update: {},
    create: { name: 'ORGANIZER', description: 'Tournament organizer' },
  });

  const judgeRole = await prisma.roles.upsert({
    where: { name: 'JUDGE' },
    update: {},
    create: { name: 'JUDGE', description: 'Tournament judge/jury' },
  });

  await prisma.roles.upsert({
    where: { name: 'PARTICIPANT' },
    update: {},
    create: { name: 'PARTICIPANT', description: 'Tournament participant' },
  });

  // Permissions
  const managePermission = await prisma.permissions.upsert({
    where: { code: 'tournament:manage' },
    update: {},
    create: { code: 'tournament:manage', description: 'Create/edit tournaments' },
  });

  const evaluatePermission = await prisma.permissions.upsert({
    where: { code: 'submission:evaluate' },
    update: {},
    create: { code: 'submission:evaluate', description: 'Evaluate submissions' },
  });

  const submitPermission = await prisma.permissions.upsert({
    where: { code: 'submission:create' },
    update: {},
    create: { code: 'submission:create', description: 'Submit work' },
  });

  // Assign permissions to roles
  for (const permissionId of [managePermission.id, evaluatePermission.id, submitPermission.id]) {
    await prisma.role_permissions.upsert({
      where: { role_id_permission_id: { role_id: adminRole.id, permission_id: permissionId } },
      update: {},
      create: { role_id: adminRole.id, permission_id: permissionId },
    });
  }

  await prisma.role_permissions.upsert({
    where: { role_id_permission_id: { role_id: organizerRole.id, permission_id: managePermission.id } },
    update: {},
    create: { role_id: organizerRole.id, permission_id: managePermission.id },
  });

  await prisma.role_permissions.upsert({
    where: { role_id_permission_id: { role_id: judgeRole.id, permission_id: evaluatePermission.id } },
    update: {},
    create: { role_id: judgeRole.id, permission_id: evaluatePermission.id },
  });

  // Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.users.upsert({
    where: { email: 'admin@foldup.io' },
    update: {},
    create: {
      email: 'admin@foldup.io',
      password_hash: passwordHash,
      name: 'Admin User',
      status: 'active',
    },
  });

  const organizer = await prisma.users.upsert({
    where: { email: 'organizer@foldup.io' },
    update: {},
    create: {
      email: 'organizer@foldup.io',
      password_hash: passwordHash,
      name: 'Tournament Organizer',
      status: 'active',
    },
  });

  const judge = await prisma.users.upsert({
    where: { email: 'judge@foldup.io' },
    update: {},
    create: {
      email: 'judge@foldup.io',
      password_hash: passwordHash,
      name: 'Judge User',
      status: 'active',
    },
  });

  const participant = await prisma.users.upsert({
    where: { email: 'team@foldup.io' },
    update: {},
    create: {
      email: 'team@foldup.io',
      password_hash: passwordHash,
      name: 'Team Captain',
      status: 'active',
    },
  });

  // Assign roles to users
  const assignRole = async (userId: number, roleId: number) => {
    const existing = await prisma.user_roles.findFirst({ where: { user_id: userId, role_id: roleId } });
    if (!existing) {
      await prisma.user_roles.create({ data: { user_id: userId, role_id: roleId } });
    }
  };

  await assignRole(admin.id, adminRole.id);
  await assignRole(organizer.id, organizerRole.id);
  await assignRole(judge.id, judgeRole.id);

  // Tournaments
  const ecoQuest = await prisma.tournaments.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      title: 'CODE & PLAY: ECO-QUEST',
      description: 'Командам необхідно за 48 годин розробити прототип браузерної міні-гри на тему екології та сталого розвитку.',
      status: 'registration',
      created_by: organizer.id,
      registration_deadline: new Date('2026-06-15T23:59:59Z'),
      starts_at: new Date('2026-06-20T09:00:00Z'),
      ends_at: new Date('2026-06-22T09:00:00Z'),
      max_teams: 50,
      team_size_min: 3,
      team_size_max: 5,
    },
  });

  const cityChallenge = await prisma.tournaments.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      title: 'CITY CHALLENGE',
      description: 'Хакатон для створення smart-city рішень з акцентом на транспорт, безпеку та open data.',
      status: 'active',
      created_by: organizer.id,
      registration_deadline: new Date('2026-05-01T23:59:59Z'),
      starts_at: new Date('2026-05-05T09:00:00Z'),
      ends_at: new Date('2026-05-10T09:00:00Z'),
      max_teams: 40,
      team_size_min: 3,
      team_size_max: 5,
    },
  });

  // Evaluation criteria for ECO-QUEST
  await prisma.evaluation_criteria.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tournament_id: ecoQuest.id,
      title: 'Технічна якість',
      max_score: 40,
      weight: 0.4,
    },
  });

  await prisma.evaluation_criteria.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      tournament_id: ecoQuest.id,
      title: 'Функціональність',
      max_score: 35,
      weight: 0.35,
    },
  });

  await prisma.evaluation_criteria.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      tournament_id: ecoQuest.id,
      title: 'UX/UI',
      max_score: 25,
      weight: 0.25,
    },
  });

  // Rounds for ECO-QUEST
  await prisma.rounds.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tournament_id: ecoQuest.id,
      title: 'Перший раунд',
      description: 'Базова реалізація гри та архітектура',
      round_order: 1,
      deadline_at: new Date('2026-06-21T09:00:00Z'),
    },
  });

  await prisma.rounds.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      tournament_id: ecoQuest.id,
      title: 'Фінал',
      description: 'Повна реалізація з тестами та документацією',
      round_order: 2,
      deadline_at: new Date('2026-06-22T09:00:00Z'),
    },
  });

  // Create a demo team for CITY CHALLENGE with submission and evaluation
  let demoTeam = await prisma.teams.findFirst({
    where: { name: 'Team Alpha', captain_id: participant.id },
  });
  if (!demoTeam) {
    demoTeam = await prisma.teams.create({
      data: { name: 'Team Alpha', captain_id: participant.id },
    });
  }

  await prisma.tournament_teams.upsert({
    where: { tournament_id_team_id: { tournament_id: cityChallenge.id, team_id: demoTeam.id } },
    update: {},
    create: { tournament_id: cityChallenge.id, team_id: demoTeam.id },
  });

  await prisma.team_members.upsert({
    where: { team_id_user_id: { team_id: demoTeam.id, user_id: participant.id } },
    update: {},
    create: { team_id: demoTeam.id, user_id: participant.id, role: 'captain' },
  });

  const cityRound = await prisma.rounds.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      tournament_id: cityChallenge.id,
      title: 'Фінальний раунд',
      description: 'Фінальна подача',
      round_order: 1,
      deadline_at: new Date('2026-05-09T23:59:59Z'),
    },
  });

  const submission = await prisma.submissions.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      team_id: demoTeam.id,
      round_id: cityRound.id,
      github_url: 'https://github.com/team-alpha/city-challenge',
      video_url: 'https://youtube.com/watch?v=demo',
      description: 'Наше рішення для smart-city інфраструктури.',
      status: 'submitted',
    },
  });

  // Add an evaluation for the demo submission
  await prisma.evaluations.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      submission_id: submission.id,
      jury_id: judge.id,
      total_score: 78.5,
      comment: 'Добре технічне рішення, але UX потребує покращення.',
    },
  });

  // Add a leaderboard entry
  await prisma.results.upsert({
    where: { tournament_id_user_id: { tournament_id: cityChallenge.id, user_id: participant.id } },
    update: {},
    create: {
      tournament_id: cityChallenge.id,
      user_id: participant.id,
      score: 78.5,
      wins: 0,
    },
  });

  // Forum categories
  const forumCategories = [
    { id: 1, title: 'Загальне' },
    { id: 2, title: 'Турніри' },
    { id: 3, title: 'Технічна підтримка' },
    { id: 4, title: 'Пропозиції' },
    { id: 5, title: 'Новини' },
  ];

  for (const cat of forumCategories) {
    await prisma.forum_categories.upsert({
      where: { id: cat.id },
      update: {},
      create: { id: cat.id, title: cat.title },
    });
  }

  console.log('Seed completed!');
  console.log('');
  console.log('Test accounts (all passwords: password123):');
  console.log('  admin@foldup.io    - ADMIN role');
  console.log('  organizer@foldup.io - ORGANIZER role');
  console.log('  judge@foldup.io    - JUDGE role');
  console.log('  team@foldup.io     - PARTICIPANT (no role)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
