import { configureStore } from "@reduxjs/toolkit";
import complaintReducer from "./slices/complaintSlice";
import dashboardReducer from "./slices/dashboardSlice";

export const store = configureStore({
  reducer: {
    complaint: complaintReducer,
    dashboard: dashboardReducer,
  },
});
