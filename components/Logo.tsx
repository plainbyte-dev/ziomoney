const sizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-4xl",
} as const;

export default function Logo({
  size = "md",
  className = "",
}: {
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <span
      className={`italic font-extrabold tracking-tight leading-normal ${sizeClasses[size]} ${className}`}
    >
      <span className="inline-block bg-gradient-to-r from-[#1E5AA8] to-[#4FA8E0] bg-clip-text pr-1 pb-1 text-transparent">
        Zio
      </span>{" "}
      <span className="inline-block bg-gradient-to-r from-[#2E8B45] to-[#8CC63F] bg-clip-text pr-1 pb-1 text-transparent">
        Money
      </span>
    </span>
  );
}
