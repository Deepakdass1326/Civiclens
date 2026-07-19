import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as complaintApi from "../../api/complaint.api";
import * as statsApi from "../../api/stats.api";
import { updateStatusWithAuth, updateVerificationWithAuth } from "../../api/admin.api";

export const loadComplaints = createAsyncThunk(
  "dashboard/loadComplaints",
  async (filters = {}) => {
    const res = await complaintApi.fetchComplaints(filters);
    return res.complaints;
  }
);

export const loadSummary = createAsyncThunk("dashboard/loadSummary", async (filters = {}) => {
  const res = await statsApi.fetchSummary({ source: filters.source });
  return res.summary;
});

export const loadHeatmap = createAsyncThunk("dashboard/loadHeatmap", async (filters = {}) => {
  const res = await statsApi.fetchHeatmapData({ source: filters.source });
  return res.points;
});

export const changeComplaintStatus = createAsyncThunk(
  "dashboard/changeStatus",
  async ({ id, status, adminToken }) => {
    const res = await updateStatusWithAuth(id, status, adminToken);
    return res.complaint;
  }
);

export const changeComplaintVerification = createAsyncThunk(
  "dashboard/changeVerification",
  async ({ id, verificationStatus, verificationNote, adminToken }) => {
    const res = await updateVerificationWithAuth(id, verificationStatus, verificationNote, adminToken);
    return res.complaint;
  }
);

const initialState = {
  complaints: [],
  summary: null,
  heatmapPoints: [],
  status: "idle",
  error: null,
  filters: { ward: "", department: "", severity: "", status: "", source: "real" },
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadComplaints.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadComplaints.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.complaints = action.payload;
      })
      .addCase(loadComplaints.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(loadSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })
      .addCase(loadHeatmap.fulfilled, (state, action) => {
        state.heatmapPoints = action.payload;
      })
      .addCase(changeComplaintStatus.fulfilled, (state, action) => {
        const idx = state.complaints.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.complaints[idx] = action.payload;
      })
      .addCase(changeComplaintStatus.rejected, (state, action) => {
        state.error = action.error.message || "Status update failed";
      })
      .addCase(changeComplaintVerification.fulfilled, (state, action) => {
        const idx = state.complaints.findIndex((c) => c._id === action.payload._id);
        if (idx !== -1) state.complaints[idx] = action.payload;
      })
      .addCase(changeComplaintVerification.rejected, (state, action) => {
        state.error = action.error.message || "Verification update failed";
      });
  },
});

export const { setFilters } = dashboardSlice.actions;
export default dashboardSlice.reducer;
