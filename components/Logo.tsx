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
      className={`font-logo italic font-extrabold tracking-tight ${sizeClasses[size]} ${className}`}
    >
      <span className="bg-gradient-to-r from-[#1E5AA8] to-[#4FA8E0] bg-clip-text text-transparent">
        Zio
      </span>{" "}
      <span className="bg-gradient-to-r from-[#2E8B45] to-[#8CC63F] bg-clip-text text-transparent">
        Money
      </span>
    </span>
  );
}
