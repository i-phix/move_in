import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  dashboard: {
    totalMoveIns: 0,
    pendingChecklists: 0,
    upcomingHandovers: 0,
    activeTenants: 0,
  },
  checklists: [],
  handovers: [],
  tenants: [],
  loading: false,
  error: null,
};

const moveInSlice = createSlice({
  name: 'MoveIn',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setDashboard: (state, action) => {
      state.dashboard = action.payload;
    },
    setChecklists: (state, action) => {
      state.checklists = action.payload;
    },
    setHandovers: (state, action) => {
      state.handovers = action.payload;
    },
    setTenants: (state, action) => {
      state.tenants = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  setDashboard,
  setChecklists,
  setHandovers,
  setTenants,
} = moveInSlice.actions;

export default moveInSlice.reducer;
