export interface CreditLimitEntry {
  id: string;
  country: string;
  partner: string;
  agentLimit: number;
  topUpLimit: number;
  currentBalance: number;
  userLimit: number;
  userLimitCurrency: string;
}

export function getTotalLimit(entry: Pick<CreditLimitEntry, "agentLimit" | "topUpLimit">): number {
  return entry.agentLimit + entry.topUpLimit;
}

export function getAvailableLimit(
  entry: Pick<CreditLimitEntry, "agentLimit" | "topUpLimit" | "currentBalance">
): number {
  return getTotalLimit(entry) - entry.currentBalance;
}

export const yourTopUpLimit = { amount: 1500000, currency: "USD" };

export const creditLimitCountryOptions = ["JAPAN"];

export const creditLimitEntries: CreditLimitEntry[] = [
  { id: "CR-0001", country: "JAPAN", partner: "株式会社岩", agentLimit: 1000000, topUpLimit: 0, currentBalance: 0, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0002", country: "JAPAN", partner: "A 1 PVT LTD", agentLimit: 0, topUpLimit: 0, currentBalance: -4000, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0003", country: "JAPAN", partner: "A B CORPORATION PVT LTD", agentLimit: 1000000, topUpLimit: 0, currentBalance: 280915, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0004", country: "JAPAN", partner: "AB CORPORATION CO LTD", agentLimit: 0, topUpLimit: 0, currentBalance: 0, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0005", country: "JAPAN", partner: "AHILYA PVT. LTD.", agentLimit: 0, topUpLimit: 0, currentBalance: 441728, userLimit: 239621052.63, userLimitCurrency: "JPY" },
  { id: "CR-0006", country: "JAPAN", partner: "AISA CO. LTD", agentLimit: 100000, topUpLimit: 0, currentBalance: 866, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0007", country: "JAPAN", partner: "AJIMA CO. LTD", agentLimit: 0, topUpLimit: 0, currentBalance: 53568, userLimit: 235660000, userLimitCurrency: "JPY" },
  { id: "CR-0008", country: "JAPAN", partner: "AJITA CO. LTD FUKUOKA", agentLimit: 600000, topUpLimit: 0, currentBalance: 106793, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0009", country: "JAPAN", partner: "AJITA CO. LTD OKINAWA", agentLimit: 10000000, topUpLimit: 11776476, currentBalance: 19598716, userLimit: 231966666.67, userLimitCurrency: "JPY" },
  { id: "CR-0010", country: "JAPAN", partner: "ALAM DEVI RESTAURANT", agentLimit: 0, topUpLimit: 0, currentBalance: 1049, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0011", country: "JAPAN", partner: "AMRITA PVT LTD", agentLimit: 0, topUpLimit: 0, currentBalance: 0, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0012", country: "JAPAN", partner: "ANIRUSA CO. LTD", agentLimit: 200, topUpLimit: 0, currentBalance: 0, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0013", country: "JAPAN", partner: "BLUE OCEAN KK", agentLimit: 450000, topUpLimit: 0, currentBalance: 64000, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0014", country: "JAPAN", partner: "DAIWA EXCHANGE CO LTD", agentLimit: 890000, topUpLimit: 0, currentBalance: 98000, userLimit: 236900000, userLimitCurrency: "JPY" },
  { id: "CR-0015", country: "JAPAN", partner: "EVERBRIGHT FOREX JAPAN", agentLimit: 100000, topUpLimit: 0, currentBalance: -55920, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0016", country: "JAPAN", partner: "FUKUOKA SETTLEMENT KK", agentLimit: 186000, topUpLimit: 0, currentBalance: 18600, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0017", country: "JAPAN", partner: "GOLDEN GATE JAPAN KK", agentLimit: 212300, topUpLimit: 0, currentBalance: -21230, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0018", country: "JAPAN", partner: "HARBOR VIEW JAPAN LTD", agentLimit: 314000, topUpLimit: 0, currentBalance: 31400, userLimit: 238450000, userLimitCurrency: "JPY" },
  { id: "CR-0019", country: "JAPAN", partner: "IKEBUKURO EXPRESS PAY", agentLimit: 41200, topUpLimit: 0, currentBalance: 3980, userLimit: 241200000, userLimitCurrency: "JPY" },
  { id: "CR-0020", country: "JAPAN", partner: "KOBE PAY SERVICES", agentLimit: 67500, topUpLimit: 0, currentBalance: 6750, userLimit: 241200000, userLimitCurrency: "JPY" },
];

export const PAGE_SIZE = 8;