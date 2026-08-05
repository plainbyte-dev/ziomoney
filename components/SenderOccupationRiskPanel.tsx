import RiskScoreTable from "./RiskScoreTable";
import { senderOccupationRiskScores } from "@/data/riskProfilingData";

export default function SenderOccupationRiskPanel() {
  return <RiskScoreTable initialRows={senderOccupationRiskScores} />;
}
