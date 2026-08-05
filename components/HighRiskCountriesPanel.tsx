import RiskScoreTable from "./RiskScoreTable";
import { countryRiskScores } from "@/data/riskProfilingData";

export default function HighRiskCountriesPanel() {
  return <RiskScoreTable initialRows={countryRiskScores} title="High Risk Countries" columnLabel="Country Name" />;
}
