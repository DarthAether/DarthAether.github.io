/**
 * console-art.js — Console lightsaber + Yoda message. Runs once on import.
 */
const saber = [
  '                          ',
  '    ||=================>  ',
  '    ||                    ',
  '  ======                  ',
  '  | __ |                  ',
  '  | || |                  ',
  '  | || |                  ',
  '  |____|                  ',
  '                          ',
].join('\n')

console.log(
  '%c' + saber,
  'color: #818cf8; font-family: monospace; font-size: 14px; line-height: 1.2;'
)

console.log(
  '%c A curious developer, you are. %c\n' +
  'The source, strong with you it is.\n' +
  'Seeking allies, I am.\n\n' +
  '%c github.com/DarthAether %c\n' +
  '%c vjkommuri@gmail.com',
  'color: #10b981; font-size: 14px; font-weight: bold;',
  'color: #888; font-size: 12px;',
  'color: #818cf8; font-size: 12px; font-weight: bold; text-decoration: underline;',
  '',
  'color: #818cf8; font-size: 11px;'
)

console.log(
  '%c May the Force be with you. Always.',
  'color: #555; font-style: italic; font-size: 11px;'
)
