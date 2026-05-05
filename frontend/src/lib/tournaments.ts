export type TournamentDetails = {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  goal: string;
  teamRequirement: string;
  mainInfo: {
    teamSize: string;
    teamsCount: string;
    availableSlots: string;
    rounds: string;
  };
  hashtags: string[];
  timeline: string[];
};

export const tournaments: TournamentDetails[] = [
  {
    id: "code-play-eco-quest",
    title: "CODE & PLAY: ECO-QUEST",
    shortTitle: "Code & Play: Eco-Quest",
    description: "Командам необхідно за 48 годин розробити прототип браузерної міні-гри на тему екології та сталого розвитку.",
    goal: "Мета гри: навчити гравця сортувати сміття або керувати енергією віртуального міста.",
    teamRequirement:
      "Головна умова: кожен член команди має відповідати за окрему частину: один за логіку (Backend), другий за візуал (Frontend/UI), третій за контент та правила (Game Design).",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "50",
      availableSlots: "12",
      rounds: "2",
    },
    hashtags: ["#48hours", "#GamedevLearning", "#GreenTechPlay", "#КоманднийКод"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "city-challenge",
    title: "CITY CHALLENGE",
    shortTitle: "City Challenge",
    description: "Хакатон для створення smart-city рішень з акцентом на транспорт, безпеку та open data.",
    goal: "Мета: створити сервіс, що покращує міську інфраструктуру та взаємодію мешканців із містом.",
    teamRequirement:
      "Кожен учасник відповідає за свій модуль: backend/API, frontend/UI та продуктову логіку/дослідження.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "40",
      availableSlots: "9",
      rounds: "2",
    },
    hashtags: ["#CityTech", "#OpenData", "#TeamWork", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "edu-sprint",
    title: "EDU SPRINT",
    shortTitle: "Edu Sprint",
    description: "Змагання з розробки освітніх інструментів, що допоможуть викладачам автоматизувати навчальні процеси.",
    goal: "Мета: створити продукт, який покращує контроль прогресу та взаємодію між викладачами й учнями.",
    teamRequirement:
      "Команда з 3-5 учасників із фокусом на backend, frontend/UI та контент/UX-сценарії використання.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "35",
      availableSlots: "7",
      rounds: "2",
    },
    hashtags: ["#EdTech", "#Learning", "#UX", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "cyber-defense-cup",
    title: "CYBER DEFENSE CUP",
    shortTitle: "Cyber Defense Cup",
    description: "Практичний турнір із кібербезпеки, де команди створюють та захищають сервіси від атак.",
    goal: "Мета: навчитися будувати безпечні системи та реагувати на типові вектори загроз.",
    teamRequirement:
      "Команда: security/backend, frontend та аналітик сценаріїв безпеки й тестування.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "30",
      availableSlots: "8",
      rounds: "2",
    },
    hashtags: ["#Cyber", "#Security", "#CTF", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "ai-for-good",
    title: "AI FOR GOOD",
    shortTitle: "AI for Good",
    description: "Турнір із прототипування AI-рішень для соціально важливих та освітніх задач.",
    goal: "Мета: реалізувати MVP, який приносить практичну користь для користувача або спільноти.",
    teamRequirement:
      "Необхідні ролі: data/backend, frontend та відповідальний за сценарії, етику і валідацію продукту.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "45",
      availableSlots: "10",
      rounds: "2",
    },
    hashtags: ["#AI", "#Impact", "#Product", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "product-ux-lab",
    title: "PRODUCT UX LAB",
    shortTitle: "Product UX Lab",
    description: "Командний інтенсив із розробки зручних цифрових продуктів та UX-патернів.",
    goal: "Мета: створити інтерфейс із продуманим user flow та стабільною технічною реалізацією.",
    teamRequirement:
      "В команді мають бути учасники для frontend/UI, backend логіки та тестування/дослідження користувачів.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "32",
      availableSlots: "6",
      rounds: "2",
    },
    hashtags: ["#UX", "#Product", "#Design", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
  {
    id: "green-energy-hack",
    title: "GREEN ENERGY HACK",
    shortTitle: "Green Energy Hack",
    description: "Турнір з ідеями для енергоефективності, моніторингу споживання та сталого розвитку.",
    goal: "Мета: створити рішення для контролю та оптимізації споживання енергії у щоденних сценаріях.",
    teamRequirement:
      "Команда із backend-розробника, frontend/UI-спеціаліста та учасника, що відповідає за геймдизайн/контент.",
    mainInfo: {
      teamSize: "3-5",
      teamsCount: "38",
      availableSlots: "11",
      rounds: "2",
    },
    hashtags: ["#GreenTech", "#Energy", "#Sustainability", "#FoldUp"],
    timeline: [
      "Кінець реєстрації",
      "Початок турніру",
      "Закінчення першого раунду",
      "Закінчення другого раунду",
      "Початок перевірки - Кінець перевірки",
      "Оголошення результатів",
    ],
  },
];

export function getTournamentById(id: string) {
  return tournaments.find((tournament) => tournament.id === id);
}
