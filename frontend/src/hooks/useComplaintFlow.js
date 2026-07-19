import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { runClassification, submitNewComplaint, confirmSupport, resetComplaintFlow } from "../store/slices/complaintSlice";

/**
 * The single hook every "report an issue" UI component uses.
 * Components never dispatch thunks directly — they call these named actions.
 */
export function useComplaintFlow() {
  const dispatch = useDispatch();
  const state = useSelector((s) => s.complaint);

  const classify = useCallback(
    (payload) => dispatch(runClassification(payload)),
    [dispatch]
  );

  const submit = useCallback(
    (payload) => dispatch(submitNewComplaint(payload)),
    [dispatch]
  );

  const support = useCallback(
    (id, reporter) => dispatch(confirmSupport({ id, reporter })),
    [dispatch]
  );

  const reset = useCallback(() => dispatch(resetComplaintFlow()), [dispatch]);

  return { ...state, classify, submit, support, reset };
}
