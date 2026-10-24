/**
 * Created by Abhinav Dogra (23ucs507) and Abhinav Thulal (23ucs508)
 */

import Image from "next/image"
import { LoginForm } from "@/components/auth/login-form"

export default function HomePage() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#120b07] font-sans">
      {/* Warm Sunlit LNMIIT Campus Aerial Background */}
      <Image
        src="/campus-warm-bg.jpg"
        alt="LNMIIT Campus Aerial View"
        fill
        priority
        className="object-cover object-center filter brightness-[0.72] contrast-[1.08] transform scale-105"
      />

      {/* Rich Warm Coffee & Espresso Architectural Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a110a]/80 via-[#26190f]/45 to-[#120a06]/85 backdrop-blur-[1px]" />

      {/* Content strictly contained in 100vh */}
      <div className="relative z-10 flex h-full w-full flex-col overflow-hidden">
        <LoginForm />
      </div>
    </div>
  )
}
