import Lottie from 'lottie-react'

interface LottieLoaderProps {
    animationData: any
    width?: number | string
    height?: number | string
    loop?: boolean
    autoplay?: boolean
}

export default function LottieLoader({
    animationData,
    width = 200,
    height = 200,
    loop = true,
    autoplay = true
}: LottieLoaderProps) {
    return (
        <div style={{ width, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Lottie
                animationData={animationData}
                loop={loop}
                autoplay={autoplay}
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    )
}
