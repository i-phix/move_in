import React, { useEffect, useState } from "react";
import {
  FileText,
  CalendarDays,
  Home,
  Bell,
  Clock,
  TrendingUp,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import { makeRequest2 } from "../../../utils/makeRequest";
import { getMoveInDashboardURL } from "../../../utils/urls";
import { Link } from "react-router-dom";
import Breadcrumb from "../../common/Breadcrumb";

const STATUS_COLORS = {
  pending: { bg: "#fef9c3", color: "#854d0e" },
  approved: { bg: "#dcfce7", color: "#166534" },
  assigned: { bg: "#dcfce7", color: "#166534" },
  rejected: { bg: "#fee2e2", color: "#991b1b" },
  completed: { bg: "#e0f2fe", color: "#0369a1" },
};

function StatCard({ icon: Icon, label, value, accent, loading, to }) {
  const card = (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "20px 24px",
        boxShadow: "0 2px 12px rgba(17,24,39,0.06)",
        border: "1px solid var(--mi-line)",
        display: "flex",
        alignItems: "center",
        gap: 16,
        transition: "box-shadow 0.15s",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: accent + "18",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {loading ? (
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: "var(--mi-line)",
            }}
          />
        ) : (
          <Icon size={22} style={{ color: accent }} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="small"
          style={{ color: "var(--mi-muted)", marginBottom: 2 }}
        >
          {label}
        </div>
        {loading ? (
          <div
            style={{
              height: 28,
              width: 48,
              borderRadius: 6,
              background: "var(--mi-line)",
            }}
          />
        ) : (
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "var(--mi-ink)",
              lineHeight: 1,
            }}
          >
            {value ?? 0}
          </div>
        )}
      </div>
      {to && !loading && (
        <ArrowRight
          size={16}
          style={{ color: "var(--mi-muted)", flexShrink: 0 }}
        />
      )}
    </div>
  );

  return to ? (
    <Link to={to} style={{ textDecoration: "none" }}>
      {card}
    </Link>
  ) : (
    card
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getMoveInDashboardURL, "GET");
    if (res.success && res.data) {
      const d = res.data.data || res.data;
      setStats(d.stats || {});
      setRecent(d.recentActivity || []);
    } else {
      setError("Failed to load dashboard data.");
      setStats({});
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  return (
    <div>
      <Breadcrumb items={[{ label: "Dashboard" }]} />
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--mi-ink)",
            marginBottom: 4,
          }}
        >
          My Dashboard
        </h2>
        <p style={{ color: "var(--mi-muted)", margin: 0, fontSize: 14 }}>
          Overview of your rental journey
        </p>
      </div>

      {error && (
        <div
          className="d-flex align-items-center gap-3 p-3 mb-4"
          style={{
            border: "1px solid #fca5a5",
            borderRadius: 14,
            background: "#fff5f5",
            color: "#b91c1c",
          }}
        >
          <RefreshCw size={18} />
          <span className="flex-grow-1 small">{error}</span>
          <button
            className="btn btn-sm"
            style={{
              border: "1px solid #b91c1c",
              color: "#b91c1c",
              borderRadius: 8,
              background: "transparent",
            }}
            onClick={fetchDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16,
          marginBottom: 28,
          width: "100%",
        }}
      >
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={stats?.totalApplications}
          accent="#f5a623"
          loading={loading}
          to="/move-in/applications"
        />
        <StatCard
          icon={TrendingUp}
          label="Pending Review"
          value={stats?.pendingApplications}
          accent="#d97706"
          loading={loading}
          to="/move-in/applications"
        />
        <StatCard
          icon={CalendarDays}
          label="Upcoming Viewings"
          value={stats?.upcomingViewings}
          accent="#1a2456"
          loading={loading}
          to="/move-in/viewings"
        />
        <StatCard
          icon={Home}
          label="Active Reservations"
          value={stats?.activeReservations}
          accent="#059669"
          loading={loading}
          to="/move-in/reservations"
        />
        <StatCard
          icon={Bell}
          label="Unread Notifications"
          value={stats?.unreadNotifications}
          accent="#7c3aed"
          loading={loading}
          to="/move-in/notifications"
        />
      </div>

      {/* Recent Activity */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid var(--mi-line)",
          boxShadow: "0 2px 12px rgba(17,24,39,0.06)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--mi-line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{ fontWeight: 600, fontSize: 15, color: "var(--mi-ink)" }}
            >
              Recent Activity
            </div>
            <div className="small" style={{ color: "var(--mi-muted)" }}>
              Your latest application updates
            </div>
          </div>
          <Link
            to="/move-in/applications"
            className="small"
            style={{
              color: "var(--mi-brand)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            View all
          </Link>
        </div>

        <div style={{ padding: "8px 0" }}>
          {loading ? (
            [1, 2, 3].map((n) => (
              <div
                key={n}
                style={{
                  padding: "14px 24px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: "var(--mi-line)",
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 13,
                      borderRadius: 4,
                      background: "var(--mi-line)",
                      width: "60%",
                      marginBottom: 6,
                    }}
                  />
                  <div
                    style={{
                      height: 11,
                      borderRadius: 4,
                      background: "var(--mi-line)",
                      width: "35%",
                    }}
                  />
                </div>
              </div>
            ))
          ) : recentActivity.length > 0 ? (
            recentActivity.map((item, idx) => {
              const badge = STATUS_COLORS[item.status] || {
                bg: "#f3f4f6",
                color: "#6b7280",
              };
              return (
                <div
                  key={idx}
                  style={{
                    padding: "14px 24px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderBottom:
                      idx < recentActivity.length - 1
                        ? "1px solid var(--mi-line)"
                        : "none",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: "var(--mi-brand-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Clock size={16} style={{ color: "var(--mi-brand)" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 500,
                        color: "var(--mi-ink)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.title || item.description || "Activity"}
                    </div>
                    {item.time && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--mi-muted)",
                          marginTop: 2,
                        }}
                      >
                        {item.time}
                      </div>
                    )}
                  </div>
                  {item.status && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "3px 10px",
                        borderRadius: 20,
                        background: badge.bg,
                        color: badge.color,
                        flexShrink: 0,
                      }}
                    >
                      {item.status}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div style={{ padding: "48px 24px", textAlign: "center" }}>
              <FileText
                size={36}
                strokeWidth={1.3}
                style={{ color: "var(--mi-line)", marginBottom: 12 }}
              />
              <p style={{ color: "var(--mi-muted)", margin: 0, fontSize: 14 }}>
                No activity yet
              </p>
              <p
                style={{
                  color: "var(--mi-muted)",
                  margin: "4px 0 0",
                  fontSize: 13,
                }}
              >
                Browse listings and apply to get started.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
