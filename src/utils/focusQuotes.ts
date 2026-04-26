const focusQuotes = [
  'One quiet hour can move your whole day forward.',
  'Protect this block and let your mind settle in.',
  'Stay with the work long enough for clarity to arrive.',
  'A calm mind finishes what a restless mind delays.',
  'Small focused steps create deep momentum.',
  'Give this moment your full attention.',
  'Less noise, more progress.',
  'Your best work needs a little silence.',
];

export function getRandomFocusQuote(previousQuote?: string) {
  const availableQuotes =
    previousQuote && focusQuotes.length > 1
      ? focusQuotes.filter((quote) => quote !== previousQuote)
      : focusQuotes;

  return availableQuotes[Math.floor(Math.random() * availableQuotes.length)];
}
