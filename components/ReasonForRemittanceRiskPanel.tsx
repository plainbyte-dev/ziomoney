import RiskScoreTable from "./RiskScoreTable";
import { reasonForRemittanceRiskScores } from "@/data/riskProfilingData";

export default function ReasonForRemittanceRiskPanel() {
  return <RiskScoreTable initialRows={reasonForRemittanceRiskScores} />;
}
