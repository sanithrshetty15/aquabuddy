"use client";

import { UserCog, Shield, Mail, Calendar, MoreVertical, Plus } from "lucide-react";

const admins = [
  {
    name: "Sanith Shetty",
    email: "admin@aquabuddy.com",
    role: "ADMIN",
    status: "Active",
    assignedDate: "2026-01-15",
    lastLogin: "2 hours ago",
  },
  {
    name: "Priya Kumar",
    email: "priya.k@aquabuddy.com",
    role: "ADMIN",
    status: "Active",
    assignedDate: "2026-03-20",
    lastLogin: "1 day ago",
  },
  {
    name: "Rahul Nair",
    email: "rahul.n@aquabuddy.com",
    role: "ADMIN",
    status: "Suspended",
    assignedDate: "2026-05-10",
    lastLogin: "2 weeks ago",
  },
];

export default function AdminManagementPage() {
  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <UserCog className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Admin Management</h1>
            <p className="text-sm text-foreground/50 font-light">Manage administrator accounts — Owner access only</p>
          </div>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-xl text-sm font-semibold hover:bg-accent/90 transition-colors cursor-pointer">
          <Plus className="w-4 h-4" />
          Assign Admin
        </button>
      </div>

      {/* Admin Cards */}
      <div className="space-y-3">
        {admins.map((admin) => (
          <div
            key={admin.email}
            className="bg-secondaryBg border border-black/5 dark:border-white/5 rounded-2xl p-6 flex items-center gap-5 hover:border-amber-500/15 transition-all"
          >
            {/* Avatar */}
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
              {admin.name.split(" ").map((n) => n[0]).join("")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-sm font-semibold text-foreground">{admin.name}</h3>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  admin.status === "Active"
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-red-400 bg-red-500/10 border-red-500/20"
                }`}>
                  {admin.status}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-foreground/50">
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{admin.email}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Assigned: {admin.assignedDate}</span>
                <span className="hidden md:flex items-center gap-1"><Shield className="w-3 h-3" />{admin.role}</span>
              </div>
            </div>

            {/* Last Login */}
            <div className="hidden md:block text-xs text-foreground/40 text-right shrink-0">
              <p className="text-foreground/50 font-medium">Last Login</p>
              <p>{admin.lastLogin}</p>
            </div>

            {/* Actions */}
            <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <MoreVertical className="w-4 h-4 text-foreground/40" />
            </button>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex items-start gap-4">
        <Shield className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-foreground">Manual Assignment Only</p>
          <p className="text-xs text-foreground/50 mt-1 leading-relaxed">
            Administrator roles cannot be self-registered. Only the Platform Owner can assign or revoke administrator privileges. All role changes are logged in the Audit Trail.
          </p>
        </div>
      </div>
    </div>
  );
}
