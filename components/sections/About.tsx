import { about } from "@/lib/home-content";

export function About() {
  return (
    <section className="py-20 md:py-28">
      <p className="t-label">{about.label}</p>
      <h2 className="t-h02 mt-6 max-w-[851px]">{about.heading}</h2>

      <div className="mt-12 grid max-w-[851px] grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
        {about.paragraphs.map((p, i) => (
          <p key={i} className="t-body">{p}</p>
        ))}
      </div>
    </section>
  );
}
