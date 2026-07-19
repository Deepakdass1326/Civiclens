import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as complaintApi from "../../api/complaint.api";

// Async thunks are the ONLY place components indirectly touch the API layer —
// components/hooks dispatch these and read state back from the slice.

export const runClassification = createAsyncThunk(
  "complaint/classify",
  async (payload) => {
    const res = await complaintApi.classifyIssue(payload);
    return { classification: res.classification, lowConfidence: Boolean(res.lowConfidence) };
  }
);

export const submitNewComplaint = createAsyncThunk(
  "complaint/submit",
  async (payload) => {
    const res = await complaintApi.submitComplaint(payload);
    return res; // { success, duplicate, complaint, message? }
  }
);

export const confirmSupport = createAsyncThunk(
  "complaint/support",
  async ({ id, reporter }) => {
    const res = await complaintApi.supportExistingComplaint(id, reporter);
    return res.complaint;
  }
);

const initialState = {
  classification: null,
  lowConfidence: false,
  classifyStatus: "idle", // idle | loading | succeeded | failed
  classifyError: null,

  submitStatus: "idle",
  submitError: null,

  result: null, // final complaint object shown on the result screen
  isDuplicate: false,
  duplicateMessage: null,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    resetComplaintFlow: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(runClassification.pending, (state) => {
        state.classifyStatus = "loading";
        state.classifyError = null;
      })
      .addCase(runClassification.fulfilled, (state, action) => {
        state.classifyStatus = "succeeded";
        state.classification = action.payload.classification;
        state.lowConfidence = action.payload.lowConfidence;
      })
      .addCase(runClassification.rejected, (state, action) => {
        state.classifyStatus = "failed";
        state.classifyError = action.error.message;
      })

      .addCase(submitNewComplaint.pending, (state) => {
        state.submitStatus = "loading";
        state.submitError = null;
      })
      .addCase(submitNewComplaint.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        state.result = action.payload.complaint;
        state.isDuplicate = Boolean(action.payload.duplicate);
        state.duplicateMessage = action.payload.message || null;
      })
      .addCase(submitNewComplaint.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.submitError = action.error.message;
      })

      .addCase(confirmSupport.fulfilled, (state, action) => {
        state.result = action.payload;
        state.isDuplicate = false;
      });
  },
});

export const { resetComplaintFlow } = complaintSlice.actions;
export default complaintSlice.reducer;
