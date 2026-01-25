"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/retroui/Button";
import { Text } from "@/components/retroui/Text";
import { Badge } from "@/components/retroui/Badge";
import { PageContainer } from "@/components/PageContainer";

const getURL = () => {
  if (typeof window !== 'undefined') {
    const url = window.location.origin.endsWith('/')
      ? window.location.origin
      : `${window.location.origin}/`
    console.log({ url })
    return url
  }

  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ??
    process?.env?.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000/'
  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`
  console.log({ url })
  return url
}

export default function LoginPage() {
  const supabase = createClient();
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${getURL()}auth/callback?next=/app/onboarding`,
      },
    });
  };

  const handleDiscordLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${getURL()}auth/callback?next=/app/onboarding`,
      },
    });
  };

  return (
    <PageContainer
      maxWidth="md"
      gradientFrom="from-pink-200"
      gradientVia="via-yellow-200"
      gradientTo="to-cyan-200"
    >
      {/* Decorative background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 md:w-32 md:h-32 bg-pink-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-12" />
        <div className="absolute bottom-20 right-10 w-24 h-24 md:w-40 md:h-40 bg-yellow-400 border-3 md:border-4 border-black opacity-30 md:transform md:-rotate-6" />
        <div className="absolute top-1/2 right-1/4 w-16 h-16 md:w-28 md:h-28 bg-cyan-400 border-3 md:border-4 border-black opacity-30 md:transform md:rotate-45" />
      </div>

      {/* Main login card */}
      <div className="relative border-4 md:border-6 border-black bg-gradient-to-br from-pink-300 to-orange-300
        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]
        p-6 md:p-10 md:transform md:-rotate-1 transition-all
        hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[4px] md:hover:translate-y-[4px]">

        <div className="flex flex-col items-center gap-6 md:gap-8">
          {/* Logo badge */}
          <div className="bg-yellow-400 border-3 md:border-4 border-black px-6 py-3 md:px-8 md:py-4
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            md:transform md:rotate-2">
            <Badge variant="solid" size="lg" className="text-xl md:text-2xl font-black uppercase bg-transparent border-0 shadow-none">
              🍳 HomeCuistot
            </Badge>
          </div>

          {/* Milestone badge */}
          <div className="bg-green-400 border-3 md:border-4 border-black px-4 py-2 md:px-6 md:py-3
            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
            md:transform md:-rotate-1">
            <Badge variant="solid" size="sm" className="text-xs md:text-sm font-black uppercase bg-transparent border-0 shadow-none">
              ✨ Milestone 2: Mid-Hackathon Checkpoint
            </Badge>
          </div>

          {/* Heading section */}
          <div className="text-center">
            <Text as="h1" className="text-3xl md:text-5xl font-black uppercase mb-2 md:mb-3 leading-tight tracking-tight">
              Welcome Back
            </Text>
            <Text as="p" className="text-base md:text-xl font-bold">
              Sign in to start cooking
            </Text>
          </div>

          {/* Login buttons */}
          <div className="flex flex-col gap-4 md:gap-5 w-full">
            <Button
              onClick={handleGoogleLogin}
              variant="default"
              size="lg"
              className="w-full justify-center gap-3 bg-cyan-400 hover:bg-cyan-500 border-4 border-black font-black uppercase text-base md:text-lg
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[3px] md:hover:translate-y-[3px]
                transition-all md:transform md:hover:rotate-1 py-6 md:py-7"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              onClick={handleDiscordLogin}
              variant="secondary"
              size="lg"
              className="w-full justify-center gap-3 bg-pink-400 hover:bg-pink-500 border-4 border-black font-black uppercase text-base md:text-lg
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[3px] md:hover:translate-y-[3px]
                transition-all md:transform md:hover:-rotate-1 py-6 md:py-7"
            >
              <svg className="h-5 w-5 md:h-6 md:w-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Continue with Discord
            </Button>
          </div>

          {/* Jury instructions */}
          <div className="mt-4 md:mt-6 border-3 md:border-4 border-black bg-purple-200 p-4 md:p-5
            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl md:text-3xl">👨‍⚖️</span>
              <div>
                <Text as="h3" className="text-sm md:text-base font-black uppercase mb-1 md:mb-2">
                  For Jury Members
                </Text>
                <Text as="p" className="text-xs md:text-sm font-bold leading-relaxed">
                  Please log in with Discord. Your profile will be elevated to admin access for the final demo.
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
