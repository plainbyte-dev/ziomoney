import RiskScoreTable from "./RiskScoreTable";
import { paymentModeRiskScores } from "@/data/riskProfilingData";

export default function PaymentModeRiskPanel() {
  return <RiskScoreTable initialRows={paymentModeRiskScores} />;
}
