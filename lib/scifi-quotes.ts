export const scifiQuotes: string[] = [
  'The spice must flow.',
  'Do. Or do not. There is no try.',
  'I have seen things you people wouldn\'t believe.',
  'The future is not set.',
  'Live long and prosper.',
  'May the Force be with you.',
  'All those moments will be lost in time, like tears in rain.',
  'I\'ll be back.',
  'The truth is out there.',
  'To infinity and beyond!',
  'Roads? Where we\'re going, we don\'t need roads.',
  'So say we all.',
  'Resistance is futile.',
  'Open the pod bay doors, HAL.',
  'I am Groot.',
  'The needs of the many outweigh the needs of the few.',
  'It\'s full of stars.',
  'These aren\'t the droids you\'re looking for.',
  'Time is the fire in which we burn.',
  'We are not alone.',
  'The cosmos is within us.',
  'Reality is merely an illusion, albeit a very persistent one.',
  'Per aspera ad astra.',
  'E.T. phone home.',
  'Klaatu barada nikto.',
];

export function getRandomQuote(): string {
  return scifiQuotes[Math.floor(Math.random() * scifiQuotes.length)];
}
