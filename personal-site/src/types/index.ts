export interface Star {
  x: number
  y: number
  z: number
  size: number
  alpha: number
  trail: Array<{ sx: number; sy: number }>
}

export interface CodeParticle {
  x: number
  y: number
  z: number
  text: string
  alpha: number
}

export interface GlitchBar {
  id: number
  y: number
  w: number
  x: number
  h: number
}
