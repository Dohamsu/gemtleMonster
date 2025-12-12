export const getLocalizedError = (error: string): string => {
    if (!error) return '알 수 없는 오류가 발생했습니다.'

    // Supabase & General Auth Errors
    if (error.includes('A user with this email address has already been registered')) {
        return '이미 가입된 이메일 주소입니다.'
    }
    if (error.includes('Invalid login credentials')) {
        return '이메일 또는 비밀번호가 올바르지 않습니다.'
    }
    if (error.includes('Password should be at least 6 characters')) {
        return '비밀번호는 6자 이상이어야 합니다.'
    }
    if (error.includes('User not found')) {
        return '사용자를 찾을 수 없습니다.'
    }
    if (error.includes('To signup, please provide your email')) {
        return '이메일을 입력해주세요.'
    }
    if (error.includes('Signup requires a valid password')) {
        return '유효한 비밀번호를 입력해주세요.'
    }
    if (error.includes('is invalid') && error.includes('Email address')) {
        return '계정 연결에 실패했습니다. 잠시 후 다시 시도해주세요. (내부 오류)'
    }

    return error
}
