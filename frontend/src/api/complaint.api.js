import axiosClient from "./axiosClient";

// This file is the ONLY place that knows the actual endpoint URLs/shapes.
// Hooks and components never call axios directly — they call these functions.

export const classifyIssue = ({ imageBase64, mimeType, description }) =>
  axiosClient.post("/complaints/classify", { imageBase64, mimeType, description });

export const submitComplaint = ({ classification, lat, lng, inputMode, imageBase64, imageMimeType, reporter, roadType }) =>
  axiosClient.post("/complaints", { classification, lat, lng, inputMode, imageBase64, imageMimeType, reporter, roadType });

export const supportExistingComplaint = (id, { name, contact } = {}) =>
  axiosClient.post(`/complaints/${id}/support`, { name, contact });

export const fetchComplaints = (filters = {}) =>
  axiosClient.get("/complaints", { params: filters });

export const fetchComplaintById = (id) => axiosClient.get(`/complaints/${id}`);

export const updateComplaintStatus = (id, status) =>
  axiosClient.patch(`/complaints/${id}/status`, { status });
