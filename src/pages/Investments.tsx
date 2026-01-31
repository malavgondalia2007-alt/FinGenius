import { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Card } from "../components/ui/Card";
import {
  TrendingDown,
  ExternalLink,
  RefreshCw,
  Search,
  Filter,
  Info,
  ArrowUpRight,
  AlertCircle,
} from "lucide-react";
import {
  fetchLiveStocks,
  fetchMutualFunds,
  fetchSIPPlans,
  clearCache,
  LiveStock,
  MutualFund,
  SIPPlan,
} from "../services/liveMarketData";
import { useAuth } from "../hooks/useAuth";
import { db } from "../services/database";
import { api } from "../services/api";

type TabType = "stocks" | "mutual-funds" | "sip";

export function Investments() {
  const { user } = useAuth();
  const profile = user ? db.profiles.getByUserId(user.id) : null;

  const isUnder18 = profile && profile.age < 18;
  const isStudent = profile && profile.type === "student";
  const hasRestrictions = isUnder18 || isStudent;

  const [activeTab, setActiveTab] = useState<TabType>("stocks");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] =
    useState<"All" | "Low" | "Moderate" | "High">("All");

  const [stocks, setStocks] = useState<LiveStock[]>([]);
  const [mutualFunds, setMutualFunds] = useState<MutualFund[]>([]);
  const [sipPlans, setSipPlans] = useState<SIPPlan[]>([]);

  /* ✅ SIP RECOMMENDATION STATE */
  const [sipRecommendation, setSipRecommendation] = useState<{
    recommended_amount: number;
    risk_level: string;
    message: string;
  } | null>(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  /* ✅ CORRECT async function */
  const loadMarketData = async () => {
  setLoading(true);
  try {
    const [stocksData, fundsData, sipsData] = await Promise.all([
      fetchLiveStocks(),
      fetchMutualFunds(),
      fetchSIPPlans(),
    ]);

    setStocks(stocksData);
    setMutualFunds(fundsData);
    setSipPlans(sipsData);

    // ✅ SIP Recommendation (NEW)
    const sipRes = await api.sip.getRecommendation();
    setSipRecommendation({
      recommended_amount: sipRes.recommended_sip,
      risk_level: sipRes.risk_level,
      message: sipRes.message,
    });

  } catch (error) {
    console.error("Error loading market data:", error);
  } finally {
    setLoading(false);
  }
};


  const handleRefresh = () => {
    clearCache();
    loadMarketData();
  };

  const handleExternalLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const filteredStocks = stocks.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMutualFunds = mutualFunds.filter(
    (f) =>
      (riskFilter === "All" || f.risk === riskFilter) &&
      (f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSIPs = sipPlans.filter(
    (s) =>
      (riskFilter === "All" || s.risk === riskFilter) &&
      (s.fundName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Investment Guidance</h1>
            <p className="text-gray-600">
              Smart suggestions based on your income
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* ✅ SIP Recommendation Banner */}
        {activeTab === "sip" && sipRecommendation && (
          <div className="p-6 mb-6 border border-green-200 bg-green-50 rounded-xl">
            <h3 className="mb-1 font-bold text-green-900">
              💡 Personalized SIP Suggestion
            </h3>
            <p className="text-sm text-green-800">
              {sipRecommendation.message}
            </p>
            <p className="mt-2 text-sm">
              Recommended SIP:{" "}
              <strong>
                ₹{sipRecommendation.recommended_amount}/month
              </strong>{" "}
              | Risk:{" "}
              <strong>{sipRecommendation.risk_level}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("stocks")}>Stocks</button>
        <button onClick={() => setActiveTab("mutual-funds")}>
          Mutual Funds
        </button>
        <button onClick={() => setActiveTab("sip")}>SIP Plans</button>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && activeTab === "sip" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSIPs.map((sip) => (
            <Card key={sip.id}>
              <h3 className="font-bold">{sip.fundName}</h3>
              <p>{sip.category}</p>
              <p className="mt-2 font-semibold">
                ₹{sip.minSIP}/month
              </p>
            </Card>
          ))}
        </div>
      )}
    </Layout>
  );
}
