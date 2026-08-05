import RiskScoreTable from "./RiskScoreTable";
import { customerVisaTypeRiskScores } from "@/data/riskProfilingData";

export default function CustomerVisaTypeRiskPanel() {
  return <RiskScoreTable initialRows={customerVisaTypeRiskScores} />;
}
