import type { PortfolioImage } from "@/fixtures/types";

const ratio = { portrait: "aspect-[4/5]", landscape: "aspect-[3/2]", square: "aspect-square" };

// A8: generated placeholder standing in for a portfolio photo.
export function DemoImage({ image, className = "", showCaption = true }: { image: PortfolioImage; className?: string; showCaption?: boolean }) {
  const h1 = (image.seed * 47) % 360;
  const h2 = (h1 + 40 + ((image.seed * 13) % 60)) % 360;
  const angle = (image.seed * 29) % 360;
  return (
    <div
      className={`relative overflow-hidden rounded-md ${ratio[image.aspect]} ${className}`}
      style={{ background: `linear-gradient(${angle}deg, hsl(${h1} 45% 62%), hsl(${h2} 50% 38%))` }}
    >
      <span className="absolute left-2 top-2 rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        Demo image
      </span>
      {showCaption && image.caption && (
        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6 text-sm text-white">
          {image.caption}
        </span>
      )}
    </div>
  );
}
