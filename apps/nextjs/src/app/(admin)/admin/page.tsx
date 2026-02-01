import { PageContainer } from '@/components/PageContainer'
import { InfoCard } from '@/components/shared/InfoCard'

export default function AdminDashboardPage() {
  return (
    <PageContainer
      maxWidth="2xl"
      gradientFrom="from-pink-100"
      gradientVia="via-purple-100"
      gradientTo="to-blue-100"
    >
      <div className="space-y-6 md:space-y-8">
        <InfoCard
          emoji="🧪"
          heading="Demo In Progress"
          variant="orange"
        >
          These pages use mock data and are still being developed.
          Expect changes and incomplete features.
        </InfoCard>

        {/* Header */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10 text-center">
          <h1 className="text-3xl md:text-6xl font-black uppercase">
            Admin Dashboard
          </h1>
        </div>

        {/* Main content card */}
        <div className="border-4 md:border-6 border-black bg-gradient-to-br from-pink-200 to-pink-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-10">
          <div className="space-y-6">
            {/* Coming Soon section */}
            <div className="bg-yellow-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl md:text-3xl font-black uppercase mb-4">
                Coming Soon
              </h2>
              <p className="text-lg font-bold mb-6">
                This admin dashboard will include powerful features to manage your HomeCuistot application:
              </p>

              {/* Feature list */}
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="inline-block w-8 h-8 bg-cyan-400 border-2 border-black flex-shrink-0 flex items-center justify-center font-black">
                    📊
                  </span>
                  <span className="font-bold">
                    <strong>System Analytics</strong> - Monitor user activity, recipe suggestions, and engagement metrics
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-8 h-8 bg-green-400 border-2 border-black flex-shrink-0 flex items-center justify-center font-black">
                    ⚙️
                  </span>
                  <span className="font-bold">
                    <strong>Configuration Management</strong> - Adjust system settings, feature flags, and integrations
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-8 h-8 bg-purple-400 border-2 border-black flex-shrink-0 flex items-center justify-center font-black">
                    👥
                  </span>
                  <span className="font-bold">
                    <strong>User Management</strong> - View and manage user accounts, roles, and permissions
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="inline-block w-8 h-8 bg-orange-400 border-2 border-black flex-shrink-0 flex items-center justify-center font-black">
                    📝
                  </span>
                  <span className="font-bold">
                    <strong>Content Administration</strong> - Manage recipes, ingredients, and suggested items
                  </span>
                </li>
              </ul>
            </div>

            {/* Status badge */}
            <div className="text-center">
              <span className="inline-block bg-pink-400 border-4 border-black px-6 py-3 text-xl font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                🚧 Under Construction 🚧
              </span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
