import React from "react"
import SentimentGauge from "./SentimentGauge"
import AssetOverviewPanel from "./AssetOverviewPanel"
import MarketSentimentWidget from "./MarketSentimentWidget"

export const AnalyticsDashboard: React.FC = () => (
  <div className="p-8 bg-gray-100 min-h-screen">
    <header className="mb-6">
      <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
      <p className="text-gray-600 mt-1">Real-time insights into market activity</p>
    </header>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <SentimentGauge symbol="SOL" />
      <AssetOverviewPanel assetId="SOL-01" />
      <MarketSentimentWidget
        sentimentScore={72}
        trend="Bullish"
        dominantToken="SOL"
        totalVolume24h={12500000}
      />
    </div>
  </div>
)

export default AnalyticsDashboard
