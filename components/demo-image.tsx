import Image from "next/image";
import type { PortfolioImage } from "@/fixtures/types";

type Crop = "square" | "landscape" | "portrait";
const cropClass: Record<Crop, string> = { square: "aspect-square", landscape: "aspect-[3/2]", portrait: "aspect-[4/5]" };

// D11: stock photo standing in for portfolio work, credited to its real photographer.
// `crop` forces a fixed frame (search thumbnails, comparison headers); without it the photo keeps its own ratio.
export function DemoImage({
  image,
  crop,
  sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
  showCaption = true,
  linkCredit = false,
  className = "",
}: {
  image: PortfolioImage;
  crop?: Crop;
  sizes?: string;
  showCaption?: boolean;
  linkCredit?: boolean;
  className?: string;
}) {
  const credit = `Demo image · Photo: ${image.credit.name} / Unsplash`;
  return (
    <figure className={className}>
      <div className={`relative overflow-hidden rounded-md bg-stone-200 ${crop ? cropClass[crop] : ""}`}>
        {crop ? (
          <Image src={image.src} alt={image.caption ?? ""} fill sizes={sizes} className="object-cover" />
        ) : (
          <Image src={image.src} alt={image.caption ?? ""} width={image.width} height={image.height} sizes={sizes} className="h-auto w-full" />
        )}
        {showCaption && image.caption && (
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-8 text-sm text-white">
            {image.caption}
          </span>
        )}
      </div>
      <figcaption className="mt-1 text-[11px] leading-snug text-stone-500">
        {linkCredit ? (
          <a
            href={`https://unsplash.com/photos/${image.credit.unsplashId}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-stone-800 hover:underline"
          >
            {credit}
          </a>
        ) : (
          credit
        )}
      </figcaption>
    </figure>
  );
}
