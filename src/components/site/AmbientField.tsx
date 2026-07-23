// Ambient field — three slow-drifting radial glows pinned behind all
// content (z: -1). Pure CSS animation; reduced-motion users get static
// glows via the global media query.

export default function AmbientField() {
  return (
    <div aria-hidden className="ambient-field">
      <div className="ambient-blob ambient-a" />
      <div className="ambient-blob ambient-b" />
      <div className="ambient-blob ambient-c" />
    </div>
  );
}
