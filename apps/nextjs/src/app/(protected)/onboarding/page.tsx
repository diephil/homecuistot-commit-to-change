import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import SignOutButton from "./sign-out-button";
import SayHelloButton from "./say-hello-button";
import { Avatar } from "@/components/retroui/Avatar";
import { Badge } from "@/components/retroui/Badge";
import { Alert } from "@/components/retroui/Alert";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const initials = user.email
    ?.split("@")[0]
    .slice(0, 2)
    .toUpperCase() || "??";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 p-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border-4 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex flex-col items-center gap-6">
            <Avatar className="h-20 w-20">
              <Avatar.Image src={user.user_metadata?.avatar_url} alt={user.email || "User"} />
              <Avatar.Fallback>{initials}</Avatar.Fallback>
            </Avatar>

            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">Welcome!</h1>
                <Badge variant="solid" size="sm">New</Badge>
              </div>
              <p className="text-lg text-zinc-600">{user.email}</p>
            </div>

            <Alert variant="default" status="success" className="w-full">
              <Alert.Title>Successfully authenticated</Alert.Title>
              <Alert.Description>
                You are now logged in and ready to start using Homecuistot.
              </Alert.Description>
            </Alert>

            <div className="flex w-full flex-col gap-3">
              <SayHelloButton />
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
