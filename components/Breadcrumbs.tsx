import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/data/staticData";

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted">
      {items.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
          <a
            href={crumb.href}
            className={
              crumb.active ? "font-semibold text-heading" : "hover:text-heading"
            }
          >
            {crumb.label}
          </a>
          {index < items.length - 1 && <ChevronRight size={14} />}
        </span>
      ))}
    </nav>
  );
}
