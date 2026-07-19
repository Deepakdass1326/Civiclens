import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import Layout from "../components/layout/Layout";
import Loader from "../components/ui/Loader";

const HomePage = lazy(() => import("../features/home/HomePage"));
const ReportPage = lazy(() => import("../features/report/ReportPage"));
const ResultPage = lazy(() => import("../features/result/ResultPage"));
const DashboardPage = lazy(() => import("../features/dashboard/DashboardPage"));
const TrackPage = lazy(() => import("../features/track/TrackPage"));

const withSuspense = (Component) => (
  <Suspense fallback={<Loader label="Loading..." />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: withSuspense(HomePage) },
      { path: "report", element: withSuspense(ReportPage) },
      { path: "result/:id", element: withSuspense(ResultPage) },
      { path: "dashboard", element: withSuspense(DashboardPage) },
      { path: "track", element: withSuspense(TrackPage) },
      { path: "track/:id", element: withSuspense(ResultPage) },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
