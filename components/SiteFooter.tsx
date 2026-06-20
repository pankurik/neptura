import Link from "next/link";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-neptura-ice/5 bg-neptura-void px-6 py-16 text-neptura-silver">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-4">
        <div className="space-y-4 md:col-span-2">
          <h3 className="font-display text-lg font-light uppercase tracking-[0.4em] text-neptura-crystal">
            Neptura
          </h3>
          <p className="text-[0.74rem] uppercase tracking-[0.1em] text-neptura-ice/60">
            Rarer than you know
          </p>
          <p className="max-w-xs pt-2 text-[0.72rem] leading-relaxed text-neptura-silver/50">
            Cosmically precipitated lab-grown diamond jewelry designed for an infinite future.
            Recreated on Earth.
          </p>
        </div>

        <div className="space-y-4">
          <h4 className="text-[0.68rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Navigation
          </h4>
          <ul className="space-y-2.5 text-[0.72rem] font-light">
            <li>
              <Link href="/shop" className="transition hover:text-neptura-crystal">
                Collections
              </Link>
            </li>
            <li>
              <Link href="/#origin" className="transition hover:text-neptura-crystal">
                Origin story
              </Link>
            </li>
            <li>
              <Link href="/#science" className="transition hover:text-neptura-crystal">
                The science
              </Link>
            </li>
            <li>
              <Link href="/bespoke" className="transition hover:text-neptura-crystal">
                Bespoke orders
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition hover:text-neptura-crystal">
                Your account
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="text-[0.68rem] uppercase tracking-[0.2em] text-neptura-aurora">
            Inquiries
          </h4>
          <p className="text-[0.72rem] font-light leading-relaxed text-neptura-silver/70">
            Mumbai, India
            <br />
            <a href="mailto:info@neptura.in" className="hover:underline">
              info@neptura.in
            </a>
            <br />
            <span className="text-[0.68rem] text-neptura-silver/40">
              Always INR. Standard Indian formatting.
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-neptura-ice/5 pt-8 text-[0.68rem] font-light text-neptura-silver/40 sm:flex-row">
        <p>© {year} Neptura. All rights reserved.</p>
        <div className="flex gap-6">
          <p>Terms of Service</p>
          <p>Privacy Policy</p>
        </div>
      </div>
    </footer>
  );
}
