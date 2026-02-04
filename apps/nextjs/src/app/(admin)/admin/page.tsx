import { PageContainer } from "@/components/PageContainer";
import { AdminFeatureCard } from "@/components/admin";

export default function AdminDashboardPage() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-100"
      gradientVia="via-purple-100"
      gradientTo="to-blue-100"
    >
      <div className="space-y-6 md:space-y-8">
        {/* Hero section */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-yellow-200 to-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black uppercase mb-3">
            Welcome to Admin
          </h1>
          <p className="text-lg md:text-xl font-bold">
            Manage your HomeCuistot ingredient catalog and system settings
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-6 md:gap-8">
          <AdminFeatureCard
            href="/admin/unrecognized"
            emoji="🧪"
            title="Review Unrecognized Items"
            description="Review ingredients detected during recipe operations and promote them to the database with proper categories."
          />

          {/* Coming soon section */}
          <div className="border-4 md:border-6 border-black bg-gradient-to-br from-blue-200 to-blue-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
              Coming Soon
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">📊</span>
                <span>
                  System Analytics — Monitor user activity and engagement metrics
                </span>
              </li>
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">⚙️</span>
                <span>
                  Configuration Management — Adjust system settings and feature
                  flags
                </span>
              </li>
              <li className="flex items-start gap-3 font-bold">
                <span className="text-xl">👥</span>
                <span>
                  User Management — View and manage user accounts and
                  permissions
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
