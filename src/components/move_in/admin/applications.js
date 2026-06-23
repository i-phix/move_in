import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Skeleton } from "primereact/skeleton";
import { makeRequest2 } from "../../../utils/makeRequest";
import { toastify } from "../../../utils/toast";
import Layout from "../component/layout";
import { getMoveInApplicationsURL } from "../../../utils/urls";

const statusColors = {
  pending: "warning",
  assigned: "info",
  approved: "success",
  rejected: "danger",
  completed: "secondary",
};

const MoveInApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await makeRequest2(getMoveInApplicationsURL, "GET");
      if (res.success) {
        setApplications(res.data?.data || []);
      } else {
        toastify(res.error || "Failed to load applications.", "error");
      }
    } catch (err) {
      toastify("Error: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const filtered = applications.filter((a) => {
    const matchSearch =
      !searchTerm ||
      (a.tenantName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.unitName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.tenantEmail || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus =
      statusFilter === "All" ||
      (a.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  const statusBody = (rowData) => {
    const s = (rowData.status || "pending").toLowerCase();
    return (
      <span
        className={`badge bg-${statusColors[s] || "secondary"} text-capitalize`}
      >
        {s}
      </span>
    );
  };

  const dateBody = (rowData) =>
    rowData.createdAt ? new Date(rowData.createdAt).toLocaleDateString() : "—";

  const actionsBody = (rowData) => (
    <button
      type="button"
      className="mi-icon-action"
      title="View"
      onClick={() => setSelected(rowData)}
    >
      <Eye size={14} /> <span>View</span>
    </button>
  );

  return (
    <Layout>
      <div className="page-header bg-light border-bottom">
        <div className="page-block">
          <div className="row align-items-center">
            <div className="col-md-8">
              <ul className="breadcrumb mb-2">
                <li className="breadcrumb-item">
                  <Link to="/move-in/admin/dashboard" className="text-muted">
                    <i className="ti ti-home me-1"></i>Dashboard
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/move-in/admin/dashboard" className="text-muted">
                    Move-In
                  </Link>
                </li>
                <li className="breadcrumb-item active text-dark">
                  Applications
                </li>
              </ul>
              <div className="page-header-title">
                <h2 className="mb-1 text-dark fw-semibold">
                  <i className="ti ti-file-text me-2 text-primary"></i>Tenant
                  Applications
                </h2>
                <p className="mb-0 text-muted">
                  Monitor applications sent directly to landlords.
                </p>
              </div>
            </div>
            <div className="col-md-4 text-end">
              <button
                className="btn btn-primary btn-sm"
                onClick={fetchApplications}
                disabled={loading}
              >
                <i className="ti ti-refresh me-1"></i>Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="page-wrapper">
        <div className="page-body">
          <div className="container-fluid">
            <div className="card border-0 shadow-sm mt-3">
              <div className="card-header bg-white border-bottom">
                <div className="row g-2 align-items-center">
                  <div className="col-md-5">
                    <div className="input-group input-group-sm">
                      <span className="input-group-text">
                        <i className="ti ti-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by tenant, unit, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <select
                      className="form-select form-select-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="col-md-4 text-end">
                    <span className="text-muted small">
                      {filtered.length} application
                      {filtered.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body p-0">
                {loading ? (
                  <div className="p-3">
                    {[1, 2, 3, 4].map((n) => (
                      <Skeleton key={n} height="48px" className="mb-2" />
                    ))}
                  </div>
                ) : (
                  <DataTable
                    value={filtered}
                    paginator
                    rows={15}
                    stripedRows
                    emptyMessage="No applications found."
                    className="border-0"
                  >
                    <Column
                      field="tenantName"
                      header="Tenant"
                      sortable
                      body={(r) => r.tenantName || "—"}
                    />
                    <Column header="Email" body={(r) => r.tenantEmail || "—"} />
                    <Column
                      header="Unit"
                      body={(r) => r.unitName || "—"}
                      sortable
                    />
                    <Column
                      header="Facility"
                      body={(r) => r.facilityName || "—"}
                    />
                    <Column
                      header="Applied On"
                      body={dateBody}
                      sortable
                      sortField="createdAt"
                    />
                    <Column header="Status" body={statusBody} />
                    <Column
                      header="Actions"
                      body={actionsBody}
                      style={{ minWidth: "180px" }}
                    />
                  </DataTable>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-semibold">Application Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setSelected(null)}
                />
              </div>
              <div className="modal-body">
                <div className="small text-muted mb-2">Tenant</div>
                <div className="fw-semibold mb-2">
                  {selected.tenantName || "—"}
                </div>
                <div className="small mb-1">{selected.tenantEmail || "—"}</div>
                <div className="small mb-3">{selected.tenantPhone || "—"}</div>
                <div className="small text-muted mb-2">Unit</div>
                <div className="fw-semibold mb-3">
                  {selected.unitName || "—"}
                </div>
                {selected.message && (
                  <>
                    <div className="small text-muted mb-2">Message</div>
                    <div className="small">{selected.message}</div>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default MoveInApplications;
