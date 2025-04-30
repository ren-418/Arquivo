import { createRoute } from "@tanstack/react-router";
import { RootRoute } from "./__root";
import HomePage from "../pages/HomePage";
import SecondPage from "@/pages/SecondPage";
import Dashboard from "@/pages/Dashboard";
import Profiles from "@/pages/Profiles";
import SavedPresaleCodes from "@/pages/SavedPresaleCodes";
import EventDetail from "@/pages/EventDetail";
import HistoryPage from "@/pages/History";
import HistoryDetailPage from "@/pages/HistoryDetailPage";

export const HomeRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/2",
  component: HomePage,
});

export const SecondPageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/second-page",
  component: SecondPage,
});

export const DashboardRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/",
  component: Dashboard,
});

export const ProfilesRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/profiles",
  component: Profiles,
});

export const PresalesRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/presale-codes",
  component: SavedPresaleCodes,
});

export const EventRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/event/$eventId",
  component: EventDetail,
});

// History routes
export const HistoryRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/history",
  component: HistoryPage,
});

export const HistoryDetailRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: "/history/$eventId",
  component: HistoryDetailPage,
});

export const rootTree = RootRoute.addChildren([
  HomeRoute,
  SecondPageRoute,
  DashboardRoute,
  ProfilesRoute,
  PresalesRoute,
  EventRoute,
  HistoryRoute,
  HistoryDetailRoute
]);