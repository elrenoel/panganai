import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Bell,
  BarChart2,
  Gift,
  Truck,
  Table2,
  FileText,
  ChevronLeft,
  ChevronRight,
  Wheat,
} from "lucide-react";
import { PiUserCircle } from "react-icons/pi";

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "AI Analytics",
    items: [
      { to: "/prediksi", label: "Prediksi Harga", icon: TrendingUp },
      { to: "/demand", label: "Demand Analysis", icon: BarChart2 },
      { to: "/alert", label: "Alert System", icon: Bell },
    ],
  },
  {
    label: "Recommendations",
    items: [
      { to: "/subsidi", label: "Subsidi Pangan", icon: Gift },
      { to: "/distribusi", label: "Peluang Distribusi", icon: Truck },
    ],
  },
  {
    label: "Data & Reports",
    items: [
      { to: "/harga-harian", label: "Tabel Harga Harian", icon: Table2 },
      { to: "/laporan", label: "Laporan & Ekspor", icon: FileText },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  return (
    <aside className={`sidebar${collapsed ? " collapsed" : ""}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-text">
          <h1>PanganAI</h1>
          <p>Monitoring & Prediksi</p>
        </div>
      </div>

      {/* Toggle button */}
      <div className="sidebar-toggle">
        <button
          className="toggle-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="sidebar-nav-group">
            <div className="sidebar-nav-group-label">{group.label}</div>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `nav-link${isActive ? " active" : ""}`
                }
                title={collapsed ? label : undefined}
                aria-label={label}
              >
                <span className="nav-link-icon">
                  <Icon size={18} />
                </span>
                <span className="nav-link-text">{label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            <PiUserCircle color="#2d2c2cff" size={32} />
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">Admin</div>
            <div className="sidebar-user-role">Analis Kebijakan</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
