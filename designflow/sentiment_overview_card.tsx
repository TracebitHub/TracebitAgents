import React from "react"

interface MarketSentimentWidgetProps {
  sentimentScore: number // value from 0 to 100
  trend: "Bullish" | "Bearish" | "Neutral"
  dominantToken: string
  totalVolume24h: number
  lastUpdated?: string
}

const getSentimentColor = (score: number) => {
  if (score >= 70) return "#4caf50"
  if (score >= 40) return "#ff9800"
  return "#f44336"
}

export const MarketSentimentWidget: React.FC<MarketSentimentWidgetProps> = ({
  sentimentScore,
  trend,
  dominantToken,
  totalVolume24h,
  lastUpdated
}) => {
  return (
    <div className="market-sentiment-widget p-4 bg-white rounded shadow space-y-3">
      <h3 className="text-lg font-semibold">Market Sentiment</h3>
      <div className="sentiment-info flex items-center space-x-4">
        <div
          className="score-circle flex items-center justify-center rounded-full text-white font-bold w-16 h-16"
          style={{
            backgroundColor: getSentimentColor(sentimentScore)
          }}
        >
          {sentimentScore}%
        </div>
        <ul className="sentiment-details text-sm space-y-1">
          <li><strong>Trend:</strong> {trend}</li>
          <li><strong>Dominant Token:</strong> {dominantToken}</li>
          <li><strong>24h Volume:</strong> ${totalVolume24h.toLocaleString()}</li>
          {lastUpdated && <li><strong>Last Updated:</strong> {lastUpdated}</li>}
        </ul>
      </div>
    </div>
  )
}

export default MarketSentimentWidget
