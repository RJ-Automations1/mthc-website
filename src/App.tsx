import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import JebiSiteHeader from './components/JebiSiteHeader';
import JebiSiteFooter from './components/JebiSiteFooter';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import About from './pages/About';
import History from './pages/History';
import Schedule from './pages/Schedule';
import Donate from './pages/Donate';
import Leaderboard from './pages/Leaderboard';
import BoardMembers from './pages/BoardMembers';
import { JebiLayout } from './pages/jebi/components';
import JebiHome from './pages/jebi/JebiHome';
import JebiAbout from './pages/jebi/JebiAbout';
import JebiTeams from './pages/jebi/JebiTeams';
import JebiSchedule from './pages/jebi/JebiSchedule';
import JebiTickets from './pages/jebi/JebiTickets';
import JebiPartnerships from './pages/jebi/JebiPartnerships';
import JebiMedia from './pages/jebi/JebiMedia';
import JebiShop from './pages/jebi/JebiShop';
import JebiShopInventory from './pages/jebi/JebiShopInventory';
import JebiShopItem from './pages/jebi/JebiShopItem';
import JebiShopOrder from './pages/jebi/JebiShopOrder';
import JebiContact from './pages/jebi/JebiContact';
import { IS_JEBI_SITE } from './lib/siteMode';

/** The nine JEBI pages, mounted under whatever base path the build uses. */
const jebiRoutes = (
  <>
    <Route index element={<JebiHome />} />
    <Route path="about" element={<JebiAbout />} />
    <Route path="teams" element={<JebiTeams />} />
    <Route path="schedule" element={<JebiSchedule />} />
    <Route path="tickets" element={<JebiTickets />} />
    <Route path="partnerships" element={<JebiPartnerships />} />
    <Route path="media" element={<JebiMedia />} />
    <Route path="shop" element={<JebiShop />} />
    <Route path="shop/inventory" element={<JebiShopInventory />} />
    <Route path="shop/order/:ref" element={<JebiShopOrder />} />
    <Route path="shop/:itemId" element={<JebiShopItem />} />
    <Route path="contact" element={<JebiContact />} />
  </>
);

/** /jebi/about → /about on the standalone site. */
function StripJebiPrefix() {
  const { '*': rest } = useParams();
  return <Navigate to={`/${rest ?? ''}`} replace />;
}

function JebiSite() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <JebiSiteHeader />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<JebiLayout />}>
            {jebiRoutes}
          </Route>
          {/* Old in-app links (/jebi/…) still land on the right page */}
          <Route path="/jebi/*" element={<StripJebiPrefix />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <JebiSiteFooter />
    </div>
  );
}

function MthcSite() {
  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/history" element={<History />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/board" element={<BoardMembers />} />

          {/* Jay Edwards Baseball Invitational (in-app fallback when VITE_JEBI_URL isn't set) */}
          <Route path="/jebi" element={<JebiLayout />}>
            {jebiRoutes}
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      {IS_JEBI_SITE ? <JebiSite /> : <MthcSite />}
    </Router>
  );
}

export default App;
