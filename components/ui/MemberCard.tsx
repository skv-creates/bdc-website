import type { HTMLAttributes } from "react";
import Image from "next/image";
import type { Member } from "@/lib/home-content";

// `photoProps` lets callers scope interactions (e.g. hover) to the photo only.
export function MemberCard({
  name,
  role,
  photo,
  photoHover,
  photoProps,
  showAlt = false,
}: Member & { photoProps?: HTMLAttributes<HTMLDivElement>; showAlt?: boolean }) {
  const sizes = "(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 304px";
  return (
    <figure className="flex flex-col gap-3">
      <div
        {...photoProps}
        className="relative aspect-[304/405] w-full overflow-hidden bg-black/5"
      >
        {photo ? (
          <Image src={photo} alt={name} fill sizes={sizes} className="object-cover" />
        ) : (
          // Portrait pending — Figma placeholder tile.
          <div className="size-full bg-[#9faacb]" aria-hidden />
        )}
        {/* Alternate portrait — cross-fades in while this member is the active
            one (driven by `showAlt`, not CSS :hover, so it stays put across the
            gutter as the reveal does). */}
        {photoHover && (
          <Image
            src={photoHover}
            alt=""
            aria-hidden
            fill
            sizes={sizes}
            className={`object-cover transition-opacity duration-[120ms] ease-out ${showAlt ? "opacity-100" : "opacity-0"}`}
          />
        )}
      </div>
      <figcaption>
        <p className="t-body font-bold">{name}</p>
        <p className="t-caption">{role}</p>
      </figcaption>
    </figure>
  );
}
