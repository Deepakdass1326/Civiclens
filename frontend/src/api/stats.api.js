import axiosClient from "./axiosClient";

export const fetchSummary = (params = {}) => axiosClient.get("/stats/summary", { params });
export const fetchHeatmapData = (params = {}) => axiosClient.get("/stats/heatmap", { params });
