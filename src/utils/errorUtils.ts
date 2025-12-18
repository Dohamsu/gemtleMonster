/* eslint-disable no-console */
export const getLocalizedError = (error: string): string => {
    if (!error) return '알 수 없는 오류가 발생했습니다.'

    const lowerError = error.toLowerCase()

    // =========================================
    // 로그인 관련 에러
    // =========================================

    // 잘못된 로그인 자격 증명 (비밀번호 틀림 또는 존재하지 않는 이메일)
    if (error.includes('Invalid login credentials')) {
        return '이메일 또는 비밀번호가 올바르지 않습니다. 다시 확인해주세요.'
    }

    // 사용자를 찾을 수 없음
    if (error.includes('User not found') || error.includes('user not found')) {
        return '등록되지 않은 이메일입니다. 회원가입을 해주세요.'
    }

    // 이메일로 등록된 사용자가 없음
    if (error.includes('No user found') || lowerError.includes('email not confirmed')) {
        return '등록되지 않은 이메일이거나 이메일 인증이 필요합니다.'
    }

    // =========================================
    // 회원가입 관련 에러
    // =========================================

    // 이미 등록된 이메일
    if (error.includes('A user with this email address has already been registered') ||
        error.includes('User already registered') ||
        lowerError.includes('already registered')) {
        return '이미 가입된 이메일 주소입니다. 로그인을 시도해주세요.'
    }

    // 비밀번호 길이 부족
    if (error.includes('Password should be at least 6 characters') ||
        error.includes('Password should be at least')) {
        return '비밀번호는 최소 6자 이상이어야 합니다.'
    }

    // 약한 비밀번호
    if (lowerError.includes('weak password') || lowerError.includes('password is too weak')) {
        return '비밀번호가 너무 약합니다. 더 강력한 비밀번호를 사용해주세요.'
    }

    // =========================================
    // 이메일 관련 에러
    // =========================================

    // 이메일 형식 오류
    if (error.includes('Unable to validate email address') ||
        error.includes('invalid email') ||
        lowerError.includes('invalid format') ||
        (error.includes('is invalid') && error.includes('Email'))) {
        return '올바른 이메일 형식을 입력해주세요. (예: example@email.com)'
    }

    // 이메일 필요
    if (error.includes('To signup, please provide your email') ||
        lowerError.includes('email is required')) {
        return '이메일을 입력해주세요.'
    }

    // =========================================
    // 비밀번호 관련 에러
    // =========================================

    // 비밀번호 필요
    if (error.includes('Signup requires a valid password') ||
        lowerError.includes('password is required')) {
        return '비밀번호를 입력해주세요.'
    }

    // =========================================
    // 인증 관련 에러
    // =========================================

    // 이메일 인증 필요
    if (lowerError.includes('email not confirmed') ||
        lowerError.includes('confirm your email')) {
        return '이메일 인증이 필요합니다. 메일함을 확인해주세요.'
    }

    // 세션 만료
    if (lowerError.includes('session expired') ||
        lowerError.includes('refresh token') ||
        lowerError.includes('jwt expired')) {
        return '로그인 세션이 만료되었습니다. 다시 로그인해주세요.'
    }

    // 인증 토큰 오류
    if (lowerError.includes('invalid token') || lowerError.includes('malformed token')) {
        return '인증 정보가 유효하지 않습니다. 다시 로그인해주세요.'
    }

    // =========================================
    // 계정 관련 에러
    // =========================================

    // 계정 비활성화
    if (lowerError.includes('user is banned') || lowerError.includes('account disabled')) {
        return '계정이 비활성화되었습니다. 관리자에게 문의해주세요.'
    }

    // =========================================
    // 네트워크 / 서버 에러
    // =========================================

    // 네트워크 에러
    if (lowerError.includes('network') ||
        lowerError.includes('fetch') ||
        lowerError.includes('connection') ||
        lowerError.includes('timeout')) {
        return '네트워크 연결이 불안정합니다. 인터넷 연결을 확인해주세요.'
    }

    // 서버 에러
    if (lowerError.includes('server error') ||
        lowerError.includes('500') ||
        lowerError.includes('503')) {
        return '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    // 요청 제한
    if (lowerError.includes('rate limit') || lowerError.includes('too many requests')) {
        return '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.'
    }

    // =========================================
    // 일반 에러
    // =========================================

    // 알 수 없는 에러 - 원본 메시지 반환
    // 영어 에러 메시지가 사용자에게 보이지 않도록 일반 메시지로 대체할 수도 있음
    console.warn('Unhandled auth error:', error)

    // 영어 에러 메시지는 일반적인 안내로 대체
    if (/^[A-Za-z\s]+$/.test(error.trim())) {
        return '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
    }

    return error
}
