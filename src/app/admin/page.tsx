import { Navbar } from "@/components/layout/navbar";
import { Users, FileText, CreditCard, TrendingUp, Activity, Eye } from "lucide-react";

const STATS = [
  { label: "Total Users", value: "12,481", change: "+8.2%", icon: Users, color: "text-accent" },
  { label: "Premium Subscribers", value: "2,847", change: "+12.4%", icon: CreditCard, color: "text-primary" },
  { label: "Articles Published", value: "384", change: "+3.1%", icon: FileText, color: "text-warn" },
  { label: "Monthly Revenue", value: "$82,563", change: "+18.7%", icon: TrendingUp, color: "text-primary" },
  { label: "Active Sessions", value: "1,294", change: "live", icon: Activity, color: "text-accent" },
  { label: "Page Views Today", value: "48,291", change: "+5.3%", icon: Eye, color: "text-muted" },
];

const RECENT_USERS = [
  { name: "Alice Johnson", email: "alice@example.com", plan: "PRO", joined: "2 min ago" },
  { name: "Bob Chen", email: "bob@example.com", plan: "FREE", joined: "5 min ago" },
  { name: "Maria Garcia", email: "maria@example.com", plan: "ENTERPRISE", joined: "12 min ago" },
  { name: "James Wilson", email: "james@example.com", plan: "PRO", joined: "28 min ago" },
  { name: "Yuki Tanaka", email: "yuki@example.com", plan: "FREE", joined: "1 hr ago" },
];

export default function AdminPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 mx-auto max-w-screen-2xl px-6 py-8 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-black">Admin Dashboard</h1>
            <p className="text-muted text-sm mt-1">Platform overview and management</p>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-xl px-4 py-2">
            <Activity className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs font-mono text-primary">All Systems Operational</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 mb-8">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted">{stat.label}</p>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <p className="font-mono text-xl font-bold">{stat.value}</p>
              <p className="text-xs text-primary mt-1">{stat.change}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Users */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-bold">Recent Users</h2>
              <button className="text-xs text-primary hover:underline">View All</button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-mono text-muted pb-2">User</th>
                  <th className="text-left text-xs font-mono text-muted pb-2">Plan</th>
                  <th className="text-left text-xs font-mono text-muted pb-2">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {RECENT_USERS.map((u) => (
                  <tr key={u.email}>
                    <td className="py-2.5">
                      <p className="text-sm font-medium">{u.name}</p>
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="py-2.5">
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${u.plan === "PRO" ? "bg-primary/10 text-primary" : u.plan === "ENTERPRISE" ? "bg-accent/10 text-accent" : "bg-border text-muted"}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="text-xs text-muted py-2.5">{u.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quick Actions */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-display font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New Article", icon: FileText, color: "bg-accent/10 text-accent hover:bg-accent/20" },
                { label: "Manage Users", icon: Users, color: "bg-primary/10 text-primary hover:bg-primary/20" },
                { label: "Revenue Report", icon: CreditCard, color: "bg-warn/10 text-warn hover:bg-warn/20" },
                { label: "System Health", icon: Activity, color: "bg-primary/10 text-primary hover:bg-primary/20" },
              ].map((action) => (
                <button key={action.label} className={`flex items-center gap-3 p-4 rounded-xl transition-colors ${action.color}`}>
                  <action.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
