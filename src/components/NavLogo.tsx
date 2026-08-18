export function NavLogo({ height = 42 }: { height?: number }) {
  return (
    <span
      className="oplogo"
      style={{ ["--oplogo-h" as any]: `${height}px` }}
      aria-label="WhereToYEG"
    >
      <img className="oplogo__mark" src="/logo-horizontal-alpha.png" alt="WhereToYEG" />
      <img className="oplogo__text" src="/logo-horizontal-alpha.png" alt="" aria-hidden="true" />
      <span className="oplogo__shine" aria-hidden="true" />
    </span>
  );
}
