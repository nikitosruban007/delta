type AccentDotProps = {
  tone: "red" | "orange" | "blue";
  className?: string;
};

export function AccentDot({ tone, className = "" }: AccentDotProps) {
  const colors = {
    red: "bg-[#f2474e]",
    orange: "bg-[#ff9812]",
    blue: "bg-[#e8f0ff]",
  };

  return <span aria-hidden className={`pointer-events-none absolute rounded-full ${colors[tone]} ${className}`} />;
}

export function DotGrid({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-28 w-28 opacity-70 [background-image:radial-gradient(#c8d5ef_2px,transparent_2px)] [background-size:18px_18px] ${className}`}
    />
  );
}

export function SoftPageBackground() {
  return (
    <>
      <AccentDot tone="blue" className="-left-16 top-36 h-52 w-52 opacity-60" />
      <AccentDot tone="blue" className="-right-10 top-0 h-72 w-72 opacity-70" />
      <DotGrid className="left-16 top-20" />
      <DotGrid className="right-44 top-96 hidden md:block" />
    </>
  );
}
