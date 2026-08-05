import RiskScoreTable from "./RiskScoreTable";
import { ageGroupRiskScores } from "@/data/riskProfilingData";

export default function AgeGroupRiskPanel() {
  return <RiskScoreTable initialRows={ageGroupRiskScores} />;
}
