export function homeText(language: string) {
  const ru = language.startsWith('ru');
  const translations: Record<string, string> = {
    "Hey, I'm Flowy!": 'Привет, я Flowy!',
    'Got a little room for a new friend?':
      'Найдётся местечко для нового друга?',
    'Flowy could not load. Please refresh to try again.':
      'Не удалось загрузить Flowy. Попробуйте обновить страницу.',
    'A little idea is taking shape.': 'Маленькая идея обретает форму.',
    'A little idea is taking shape...': 'Маленькая идея обретает форму…',
    'Let me put a little joy on this page.':
      'Добавлю немного радости на эту страницу.',
    'Small wins deserve a happy dance.':
      'Маленькие победы заслуживают радостного танца.',
    'A little hello from Flowy.': 'Маленький привет от Flowy.',
    'Hey, human. Nice to meet you!': 'Привет! Рад знакомству!',
    'Pick a little adventure below.': 'Выбирай, чем займёмся сегодня.',
    'A circle, a square... an idea!': 'Круг, квадрат… идея!',
    'Let me make something for you.': 'Сейчас создам кое-что для тебя.',
    'Look at you go!': 'Вот это успех!',
    'That deserves a little celebration.': 'Такое стоит отпраздновать.',
    'Copied!': 'Скопировано!',
    'Select code to copy': 'Выделите код для копирования',
    'Copy code': 'Скопировать код',
    'Nice to meet you!': 'Рад знакомству!',
  };
  return (text: string) => (ru ? (translations[text] ?? text) : text);
}
