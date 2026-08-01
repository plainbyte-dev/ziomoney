import SettlementFlowGraphic from "./SettlementFlowGraphic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0B2E22] via-[#0F3B3A] to-[#123B5C] px-12 py-12 text-white lg:flex">
        <div className="flex items-center gap-2">
          <span className="text-xl font-extrabold tracking-tight">Zio</span>
          <span className="text-xl font-extrabold tracking-tight text-brand-green">
            Money
          </span>
        </div>

        <div className="flex flex-col gap-8">
          <div className="max-w-sm">
            <h1 className="text-3xl font-bold leading-snug">
              Every transfer, traced end to end.
            </h1>
            <p className="mt-3 text-sm text-white/70">
              From customer collection through to head-office settlement — one
              admin panel, fully reconciled at every stage.
            </p>
          </div>

          <SettlementFlowGraphic />
        </div>

        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} Zio Money. All rights reserved.
        </p>
      </div>

      <div className="flex w-full flex-1 flex-col items-center justify-center px-6 py-12 lg:w-[58%]">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <span className="text-xl font-extrabold tracking-tight text-brand-blue">
            Zio
          </span>
          <span className="text-xl font-extrabold tracking-tight text-brand-green">
            Money
          </span>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  );
}
