import { GLITCH_CHARS } from '../constants'

export function corruptText(str: string, corruptionChance: number): string {
  return str
    .split('')
    .map((ch) =>
      Math.random() < corruptionChance
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : ch,
    )
    .join('')
}
