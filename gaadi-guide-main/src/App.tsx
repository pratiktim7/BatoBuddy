import { Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { siteUrlMappings } from "./constants/siteConfigs";
import { MapPagesLayout, PageLayout } from "./components/layouts";

const RoutesPage = lazy(() => import("@/pages/RoutesPage"));
const Contact = lazy(() => import("@/pages/Contact"));
const About = lazy(() => import("@/pages/About"));
const StopsPage = lazy(() => import("@/pages/StopsPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const AddNewRoutePage = lazy(() => import("@/pages/AddNewRoutePage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const BusRoutesPage = lazy(() => import("@/pages/bus/BusRoutesPage"));
const BusRouteDetailsPage = lazy(
  () => import("@/pages/bus/BusRouteDetailsPage")
);
const BusOperatorsPage = lazy(
  () => import("./pages/operators/BusOperatorsPage")
);
const BusOperatorDetailsPage = lazy(
  () => import("./pages/operators/BusOperatorDetailsPage")
);

const App = () => {
  return (
    <Suspense
      fallback={
        <main className="grid w-full min-h-screen place-items-center bg-gradient-to-br from-background via-surface-1 to-surface-2">
          <div className="flex flex-col text-center items-center p-8 rounded-2xl bg-surface-1/50 backdrop-blur-sm border border-accent/20">
            <div className="text-6xl mb-6 animate-bounce-gentle">🚌</div>
            <div className="flex items-center gap-2 text-3xl font-bold text-text mb-3">
              <span>Bato</span>
              <span className="text-accent">Buddy</span>
            </div>
            <p className="text-offText animate-pulse text-lg">
              Preparing your travel companion...
            </p>
          </div>
        </main>
      }
    >
      <Routes>
        <Route element={<MapPagesLayout />}>
          <Route path={`/${siteUrlMappings.routes}`} element={<RoutesPage />} />
          <Route path={`/${siteUrlMappings.stops}`} element={<StopsPage />} />
          <Route path={`/${siteUrlMappings.search}`} element={<SearchPage />} />
        </Route>

        <Route element={<PageLayout />}>
          <Route
            index
            path={`/${siteUrlMappings.contact}`}
            element={<Contact />}
          />
          <Route index path={`/${siteUrlMappings.about}`} element={<About />} />

          <Route path={`/${siteUrlMappings.bus}`}>
            <Route index element={<BusRoutesPage />} />
            <Route path=":id" element={<BusRouteDetailsPage />} />
          </Route>

          <Route path={`/${siteUrlMappings.operators}`}>
            <Route index element={<BusOperatorsPage />} />
            <Route path=":name" element={<BusOperatorDetailsPage />} />
          </Route>

          <Route path="/add-route" element={<AddNewRoutePage />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default App;
