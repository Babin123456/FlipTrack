import { useState } from "react";
// Removed 'json', directly importing useLoaderData from "react-router"
import { useLoaderData } from "react-router";

import styles from "./ai-insights.module.css";
import { AiInsightsHeader } from "~/blocks/ai-insights/ai-insights-header";
import { PlanGateMessage } from "~/blocks/ai-insights/plan-gate-message";
import { BatchAnalysisStatus } from "~/blocks/ai-insights/batch-analysis-status";
import { ItemAnalysisCards } from "~/blocks/ai-insights/item-analysis-cards";
import { DetailedAnalysisModal } from "~/blocks/ai-insights/detailed-analysis-modal";

export interface AiInsightItem {
  id: string;
  name: string;
  sku: string;
  recommendation: 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  targetPrice: number;
  purchasePrice: number;
}

// React Router 7 server loader pattern - returning plain object directly
export async function loader() {
  try {
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/ai/price-insight`);
    
    if (!res.ok) {
      throw new Error(`Failed to fetch insights: ${res.statusText}`);
    }
    
    const insights = await res.json();
    return { insights }; // Plain JavaScript object instead of json() helper
  } catch (error) {
    console.error("AI Insights data pipeline error:", error);
    return { insights: [] }; // Fallback raw structure
  }
}

export default function AiInsightsPage() {
  // Safe parsing fallback from native hook
  const data = useLoaderData() as { insights: AiInsightItem[] };
  const insights = data?.insights || [];
  
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const isPro = true; 

  return (
    <div className={styles.page}>
      <AiInsightsHeader onAnalyzeAll={() => setAnalyzing(true)} isPro={isPro} />
      {!isPro && <PlanGateMessage />}
      {isPro && analyzing && <BatchAnalysisStatus onCancel={() => setAnalyzing(false)} />}
      
      {isPro && <ItemAnalysisCards data={insights} onSelectItem={setSelectedItem} />}
      
      {selectedItem && (
        <DetailedAnalysisModal 
          itemId={selectedItem} 
          data={insights} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}