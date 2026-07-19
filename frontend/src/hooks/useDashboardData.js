import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadComplaints, loadSummary, loadHeatmap, changeComplaintStatus, changeComplaintVerification, setFilters } from "../store/slices/dashboardSlice";

export function useDashboardData() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.dashboard);

  const refresh = useCallback(() => {
    dispatch(loadComplaints(state.filters));
    dispatch(loadSummary(state.filters));
    dispatch(loadHeatmap(state.filters));
  }, [dispatch, state.filters]);

  useEffect(() => {
    dispatch(loadComplaints(state.filters));
    dispatch(loadSummary(state.filters));
    dispatch(loadHeatmap(state.filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(state.filters)]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      dispatch(loadComplaints(state.filters));
      dispatch(loadSummary(state.filters));
      dispatch(loadHeatmap(state.filters));
    }, 20000);
    return () => window.clearInterval(interval);
  }, [dispatch, state.filters]);

  const updateFilters = useCallback(
    (partial) => {
      dispatch(setFilters(partial));
    },
    [dispatch]
  );

  const updateStatus = useCallback(
    (id, status, adminToken) => dispatch(changeComplaintStatus({ id, status, adminToken })),
    [dispatch]
  );

  const updateVerification = useCallback(
    (id, verificationStatus, verificationNote, adminToken) => dispatch(changeComplaintVerification({ id, verificationStatus, verificationNote, adminToken })),
    [dispatch]
  );

  return { ...state, refresh, updateFilters, updateStatus, updateVerification };
}
