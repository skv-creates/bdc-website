import Image from "next/image";
import type { Member } from "@/lib/home-content";

export function MemberCard({ name, role, photo }: Member) {
  return (
    <figure className="flex flex-col gap-3">
      <div className="relative aspect-[304/405] w-full overflow-hidden bg-black/5">
        <Image
          src={photo}
          alt={name}
          fill
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 45vw, 304px"
          className="object-cover"
        />
      </div>
      <figcaption>
        <p className="t-body font-bold">{name}</p>
        <p className="t-caption">{role}</p>
      </figcaption>
    </figure>
  );
}
