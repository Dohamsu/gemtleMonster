/**
 * Alchemy Context (연금술 컨텍스트) 관련 타입 정의
 * 고급 연금술 시스템에서 사용되는 환경 및 상태 정보
 */

export interface AlchemyTimeContext {
  gameTime: number // 0-24
  realTime: number // 0-24
  realDayOfWeek: number // 0-6 (Sun-Sat)
  realDateStr: string // "MM-DD"
}

export interface AlchemyEnvContext {
  weather: 'SUNNY' | 'RAIN' | 'SNOW' | 'STORM' | 'CLOUDY'
  temperature: number
  language: string
  country: string
}

export interface AlchemyDeviceContext {
  type: 'MOBILE' | 'DESKTOP'
  os: string
  isDarkMode: boolean
}

export interface AlchemySessionContext {
  idleTimeSec: number
  loginStreak: number
  dailyPlayTimeMin: number
  recentFailCount: number
}

export interface AlchemyPlayerContext {
  alchemyLevel?: number
  catalysts?: string[]
  eventFlags?: string[]
}

export interface AlchemyContext {
  time: AlchemyTimeContext
  env: AlchemyEnvContext
  device: AlchemyDeviceContext
  session: AlchemySessionContext
  player?: AlchemyPlayerContext
}
