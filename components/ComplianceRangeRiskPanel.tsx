import RiskScoreTable from "./RiskScoreTable";
import { complianceRangeRiskScores } from "@/data/riskProfilingData";

export default function ComplianceRangeRiskPanel() {
  return <RiskScoreTable initialRows={complianceRangeRiskScores} />;
}
