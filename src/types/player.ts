/**
 * Player (플레이어) 관련 타입 정의
 */

export interface PlayerAlchemy {
  level: number
  experience: number
  workshop_level: number
  global_success_bonus: number
  global_time_reduction: number
}

export interface PlayerState {
  x: number
  y: number
  health: number
}

export interface PlayerResource {
  resource_id: string
  amount: number
}
