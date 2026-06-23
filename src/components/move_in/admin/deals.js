import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, RotateCcw } from 'lucide-react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Skeleton } from 'primereact/skeleton';
import { makeRequest2 } from '../../../utils/makeRequest';
import { toastify } from '../../../utils/toast';
import Layout from '../component/layout';
import { convertMoveInDealURL, getMoveInCommissionsURL, getMoveInDealsURL } from '../../../utils/urls';

const badge = (value, tone = 'secondary') => (
  <span className={`badge bg-${tone} text-capitalize`}>{value || 'unknown'}</span>
);

const statusTone = (status) => {
  if (status === 'rented' || status === 'synced' || status === 'paid') return 'success';
  if (status === 'failed' || status === 'lost' || status === 'cancelled') return 'danger';
  if (status === 'due' || status === 'pending') return 'warning';
  return 'secondary';
};

const AdminDeals = () => {
  const [deals, setDeals] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [status, setStatus] = useState('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = status === 'all' ? '' : `?status=${encodeURIComponent(status)}`;
      const [dealRes, commissionRes] = await Promise.all([
        makeRequest2(`${getMoveInDealsURL}${query}`, 'GET'),
        makeRequest2(getMoveInCommissionsURL, 'GET'),
      ]);
      if (!dealRes.success) throw new Error(dealRes.error || 'Failed to load deals.');
      if (!commissionRes.success) throw new Error(commissionRes.error || 'Failed to load commissions.');
      setDeals(dealRes.data?.data || []);
      setCommissions(commissionRes.data?.data || []);
    } catch (err) {
      toastify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

  const commissionByDeal = useMemo(() => {
    const map = new Map();
    commissions.forEach((item) => map.set(String(item.dealId), item));
    return map;
  }, [commissions]);

  const convertDeal = async (deal) => {
    setSyncingId(deal._id);
    try {
      const res = await makeRequest2(`${convertMoveInDealURL}/${deal._id}/convert`, 'PUT', {});
      if (!res.success) throw new Error(res.error || 'Failed to convert deal.');
      toastify(res.data?.message || 'Deal conversion completed.', 'success');
      fetchData();
    } catch (err) {
      toastify(err.message, 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const moneyBody = (row) => {
    const commission = commissionByDeal.get(String(row._id));
    if (!commission) return <span className="text-muted">—</span>;
    return `${commission.currency || 'KES'} ${Number(commission.amount || 0).toLocaleString()}`;
  };

  const commissionStatusBody = (row) => {
    const commission = commissionByDeal.get(String(row._id));
    if (!commission) return badge('not due', 'secondary');
    return badge(commission.status, statusTone(commission.status));
  };

  const syncBody = (row) => badge(row.payserveSync?.status || 'not_applicable', statusTone(row.payserveSync?.status));

  const actionsBody = (row) => {
    const canConvert = row.status !== 'rented' || row.payserveSync?.status === 'failed';
    return (
      <button
        type="button"
        className="mi-icon-action"
        title="Convert / retry PayServe sync"
        disabled={!canConvert || syncingId === row._id}
        onClick={() => convertDeal(row)}
      >
        <RotateCcw size={14} />
      </button>
    );
  };

  return (
    <Layout>
      <div className="container-fluid">
        <div className="row mb-3 align-items-center">
          <div className="col">
            <h4 className="mb-0">Move-In Deals</h4>
            <small className="text-muted">Oversee rentals, PayServe sync state, and admin commissions.</small>
          </div>
          <div className="col-auto d-flex gap-2">
            <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              {['all', 'applied', 'reserved', 'offer_sent', 'rented', 'cancelled', 'lost'].map((item) => (
                <option key={item} value={item}>{item.replace('_', ' ')}</option>
              ))}
            </select>
            <button className="btn btn-sm btn-outline-secondary" onClick={fetchData} disabled={loading}>
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-3 bg-white rounded shadow-sm">
            {[1, 2, 3, 4].map((item) => <Skeleton key={item} height="48px" className="mb-2" />)}
          </div>
        ) : (
          <DataTable value={deals} paginator rows={15} stripedRows className="p-datatable-sm" emptyMessage="No Move-In deals found.">
            <Column field="unitName" header="Unit" sortable body={(row) => row.unitName || '—'} />
            <Column header="Tenant" body={(row) => row.tenantName || row.tenantEmail || '—'} />
            <Column header="Source" body={(row) => badge(row.source, row.source === 'payserve' ? 'info' : 'secondary')} />
            <Column header="Deal" body={(row) => badge(row.status, statusTone(row.status))} />
            <Column header="PayServe Sync" body={syncBody} />
            <Column header="Commission" body={moneyBody} />
            <Column header="Commission Status" body={commissionStatusBody} />
            <Column header="Actions" body={actionsBody} style={{ width: 90 }} />
          </DataTable>
        )}
      </div>
    </Layout>
  );
};

export default AdminDeals;
