import RiskScoreTable from "./RiskScoreTable";
import { sourceOfIncomeRiskScores } from "@/data/riskProfilingData";

export default function SourceOfIncomeRiskPanel() {
  return <RiskScoreTable initialRows={sourceOfIncomeRiskScores} />;
}
