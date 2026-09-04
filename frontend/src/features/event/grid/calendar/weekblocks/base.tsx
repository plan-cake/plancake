export default function BaseWeekBlock({
  numWeeks,
  children,
}: {
  numWeeks: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="border-foreground/75 grid border"
      style={{
        gridTemplateColumns: "repeat(7, 1fr)",
        gridTemplateRows: `repeat(${numWeeks}, minmax(80px, 1fr))`,
        backgroundImage: `repeating-linear-gradient(
          45deg,
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 0px,
          color-mix(in srgb, var(--color-foreground) 10%, transparent) 8px,
          color-mix(in srgb, var(--color-background) 10%, transparent) 8px,
          color-mix(in srgb, var(--color-background) 10%, transparent) 9.5px
        )`,
      }}
    >
      {children}
    </div>
  );
}
