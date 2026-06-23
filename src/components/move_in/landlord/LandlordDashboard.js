import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Eye,
  FileText,
  Clock,
  CalendarDays,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import { makeRequest2 } from "../../../utils/makeRequest";
import { getLandlordDashboardURL } from "../../../utils/urls";
import Breadcrumb from "../../common/Breadcrumb";

const STAT_META = [
  {
    key: "totalUnits",
    label: "Total Units",
    icon: Building2,
    tone: "brand",
    to: "/move-in/landlord/units",
  },
  {
    key: "listedUnits",
    label: "Listed",
    icon: Eye,
    tone: "success",
    to: "/move-in/landlord/units",
  },
  {
    key: "totalApplications",
    label: "Applications",
    icon: FileText,
    tone: "info",
    to: "/move-in/landlord/applications",
  },
  {
    key: "pendingApplications",
    label: "Pending Review",
    icon: Clock,
    tone: "warning",
    to: "/move-in/landlord/applications",
  },
  {
    key: "totalBookings",
    label: "Total Viewings",
    icon: CalendarDays,
    tone: "purple",
    to: "/move-in/landlord/viewings",
  },
  {
    key: "upcomingBookings",
    label: "Upcoming Viewings",
    icon: TrendingUp,
    tone: "sky",
    to: "/move-in/landlord/viewings",
  },
  {
    key: "unreadMessages",
    label: "Unread Messages",
    icon: MessageSquare,
    tone: "danger",
    to: "/move-in/landlord/messages",
  },
];

const STATUS_CLASSES = {
  pending: "mi-status-badge mi-status-warning",
  approved: "mi-status-badge mi-status-success",
  assigned: "mi-status-badge mi-status-success",
  rejected: "mi-status-badge mi-status-danger",
  completed: "mi-status-badge mi-status-muted",
};

function LandlordDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    const res = await makeRequest2(getLandlordDashboardURL, "GET");
    if (res.success && res.data) {
      setData(res.data.data || res.data);
    } else {
      setError(res.error || "Failed to load landlord dashboard data.");
      setData({ stats: {}, recentApplications: [] });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const s = data?.stats || {};

  return (
    <div>
      <Breadcrumb items={[{ label: "Landlord Dashboard" }]} />

      <div className="d-flex align-items-start justify-content-between flex-wrap gap-3 mb-4">
        <div>
          <h2 className="mi-page-title">Landlord Dashboard</h2>
          <p className="mi-page-subtitle">
            Overview of your listings, applications and viewings
          </p>
        </div>
      </div>

      {error && (
        <div className="mi-alert mi-alert-danger mb-4">
          <RefreshCw size={18} />
          <span className="flex-grow-1">{error}</span>
          <button
            type="button"
            className="btn btn-sm mi-outline-danger"
            onClick={fetchDashboard}
          >
            Retry
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="mi-landlord-stat-grid mb-4">
        {STAT_META.map(({ key, label, icon: Icon, tone, to }) => (
          <Link key={key} to={to} className="mi-stat-link">
            <div className={`mi-stat-card mi-stat-${tone}`}>
              <div className="mi-stat-icon">
                {loading ? (
                  <div className="mi-skeleton mi-skeleton-icon" />
                ) : (
                  <Icon size={20} />
                )}
              </div>
              <div className="mi-stat-content">
                <div className="mi-stat-label">{label}</div>
                {loading ? (
                  <div className="mi-skeleton mi-skeleton-value" />
                ) : (
                  <div className="mi-stat-value">{s[key] ?? 0}</div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Applications */}
      <div className="mi-card">
        <div className="mi-card-header">
          <div className="mi-card-title">Recent Applications</div>
          <Link to="/move-in/landlord/applications" className="mi-card-link">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        <div>
          {loading ? (
            [1, 2, 3].map((n) => (
              <div key={n} className="mi-list-row">
                <div className="mi-skeleton mi-skeleton-avatar" />
                <div className="flex-grow-1">
                  <div className="mi-skeleton mi-skeleton-line mi-skeleton-line-md mb-2" />
                  <div className="mi-skeleton mi-skeleton-line mi-skeleton-line-sm" />
                </div>
              </div>
            ))
          ) : data?.recentApplications?.length > 0 ? (
            data.recentApplications.map((a, idx) => {
              return (
                <div
                  key={a._id}
                  className={`mi-list-row ${idx < data.recentApplications.length - 1 ? "mi-list-row-bordered" : ""}`}
                >
                  <div className="mi-avatar-badge">
                    {(a.tenantName || "T").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1 min-w-0">
                    <div className="mi-list-title">
                      {a.tenantName || "Tenant"}
                    </div>
                    <div className="mi-list-subtitle">{a.unitName || "—"}</div>
                  </div>
                  <span
                    className={
                      STATUS_CLASSES[a.status] || STATUS_CLASSES.completed
                    }
                  >
                    {a.status}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="mi-empty-state">No applications yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LandlordDashboard;
