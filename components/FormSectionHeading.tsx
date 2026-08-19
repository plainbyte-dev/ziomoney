// Shared section heading for forms that live inside one shared outer card
// (e.g. CustomerDetailsPanel) — sections are differentiated by a border
// line under the heading rather than each getting its own elevated card.
export default function FormSectionHeading({ title }: { title: string }) {
  return (
    <div className="border-b border-border px-6 py-4">
      <h2 className="text-base font-bold text-heading">{title}</h2>
    </div>
  );
}
