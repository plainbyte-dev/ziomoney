import RiskScoreTable from "./RiskScoreTable";
import { relationRiskScores } from "@/data/riskProfilingData";

export default function RelationRiskPanel() {
  return <RiskScoreTable initialRows={relationRiskScores} />;
}
