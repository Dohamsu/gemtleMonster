import { useEffect } from 'react'

interface EventBasedSyncOptions {
  onBeforeUnload?: () => void | Promise<void>
  onVisibilityChange?: () => void | Promise<void>
  enableBeforeUnload?: boolean
  enableVisibilityChange?: boolean
}

/**
 * 브라우저 이벤트 기반으로 동기화를 트리거하는 Hook
 *
 * - beforeunload: 브라우저 창/탭을 닫거나 새로고침할 때
 * - visibilitychange: 탭이 백그라운드로 전환될 때
 *
 * @param options - 이벤트 핸들러 및 활성화 옵션
 */
export function useEventBasedSync(options: EventBasedSyncOptions = {}) {
  const {
    onBeforeUnload,
    onVisibilityChange,
    enableBeforeUnload = true,
    enableVisibilityChange = true
  } = options

  useEffect(() => {
    // beforeunload: 브라우저 닫기/새로고침 시
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      console.log('🚪 [EventSync] beforeunload 감지 - 동기화 실행')

      if (onBeforeUnload) {
        // 동기 함수만 실행 가능 (비동기는 브라우저가 차단)
        onBeforeUnload()
      }

      // 사용자에게 경고 메시지를 표시하지 않음
      // event.preventDefault()
      // event.returnValue = ''
    }

    // visibilitychange: 탭 전환 시
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('👁️ [EventSync] visibilitychange 감지 (hidden) - 동기화 실행')

        if (onVisibilityChange) {
          // 비동기 함수 실행 가능
          Promise.resolve(onVisibilityChange()).catch(error => {
            console.error('❌ [EventSync] visibilityChange 동기화 실패:', error)
          })
        }
      }
    }

    // 이벤트 리스너 등록
    if (enableBeforeUnload && onBeforeUnload) {
      window.addEventListener('beforeunload', handleBeforeUnload)
      console.log('✅ [EventSync] beforeunload 리스너 등록')
    }

    if (enableVisibilityChange && onVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange)
      console.log('✅ [EventSync] visibilitychange 리스너 등록')
    }

    // 클린업
    return () => {
      if (enableBeforeUnload && onBeforeUnload) {
        window.removeEventListener('beforeunload', handleBeforeUnload)
        console.log('🔌 [EventSync] beforeunload 리스너 해제')
      }

      if (enableVisibilityChange && onVisibilityChange) {
        document.removeEventListener('visibilitychange', handleVisibilityChange)
        console.log('🔌 [EventSync] visibilitychange 리스너 해제')
      }
    }
  }, [onBeforeUnload, onVisibilityChange, enableBeforeUnload, enableVisibilityChange])
}
