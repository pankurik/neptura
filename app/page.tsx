import Link from "next/link";
import Hero from "@/components/Hero";
import StarField from "@/components/StarField";
import TransitionBand from "@/components/TransitionBand";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allProducts = await getProducts();
  
  // Filter out placeholder products
  const products = allProducts.filter(
    (product) =>
      !product.handle.startsWith("jewelry-example-product") &&
      !product.title.startsWith("Example product")
  );

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section (Dark World) */}
      <Hero />

      {/* 2. Origin Story Section (Dark World) */}
      <section
        id="origin"
        className="relative bg-neptura-void text-neptura-silver px-6 py-24 md:py-36 overflow-hidden border-t border-neptura-ice/5"
      >
        <StarField />
        <div className="relative z-10 mx-auto max-w-6xl grid gap-16 lg:grid-cols-12 items-center">
          <div className="lg:col-span-7 space-y-8">
            <span className="section-label">The origin</span>
            <h2 className="font-display text-3xl md:text-5xl font-light text-neptura-crystal leading-[1.15]">
              Recreating the <br />
              <span className="italic font-normal text-neptura-ice">cosmic rain</span>
            </h2>
            <div className="space-y-6 max-w-xl text-[0.82rem] font-light leading-[1.9] text-neptura-silver/70">
              <p>
                On Neptune and Uranus, temperatures exceed thousands of degrees, and pressures soar to eight million atmospheres. In these deep space voids, methane gas is crushed into pure carbon, falling like diamond rain toward the core.
              </p>
              <p>
                At Neptura, we recreate this cosmic phenomenon in our laboratories on Earth. By replicating these extreme atmospheres, we grow diamonds molecule by molecule. They are physically, chemically, and optically identical to natural stones.
              </p>
              <p className="font-display text-base text-neptura-ice italic font-light">
                We do not mine the earth; we look to the sky.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6 border-l border-neptura-ice/10 pl-6 lg:pl-12">
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-light text-neptura-crystal">8M</p>
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">atmospheres of pressure</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-light text-neptura-crystal">0%</p>
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">terrestrial mining</p>
            </div>
            <div className="space-y-2">
              <p className="font-display text-4xl md:text-5xl font-light text-neptura-crystal">100%</p>
              <p className="text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">cosmic replication</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Process Section (Dark World) */}
      <section
        id="science"
        className="relative bg-neptura-deep text-neptura-silver px-6 py-24 md:py-36 overflow-hidden border-t border-neptura-ice/5"
      >
        <StarField />
        <div className="relative z-10 mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4">
            <span className="section-label">The science</span>
            <h2 className="font-display text-3xl md:text-4xl font-light text-neptura-crystal">
              From Void to Brilliance
            </h2>
            <p className="mx-auto max-w-md text-[0.8rem] font-light text-neptura-silver/50 leading-[1.8]">
              Recreating planetary diamond precipitation atom by atom.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1 */}
            <div className="bg-neptura-neptune/30 border border-neptura-ice/5 p-8 flex flex-col justify-between group hover:border-neptura-aurora/35 transition-colors duration-300">
              <span className="font-display text-lg text-neptura-aurora font-light">01</span>
              <div className="mt-12 space-y-3">
                <h3 className="font-display text-base font-light text-neptura-crystal">Vaporization</h3>
                <p className="text-[0.74rem] leading-[1.8] text-neptura-silver/60 font-light">
                  Methane gas is introduced into a vacuum reactor under hyper-controlled atmospheric settings.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-neptura-neptune/30 border border-neptura-ice/5 p-8 flex flex-col justify-between group hover:border-neptura-aurora/35 transition-colors duration-300">
              <span className="font-display text-lg text-neptura-aurora font-light">02</span>
              <div className="mt-12 space-y-3">
                <h3 className="font-display text-base font-light text-neptura-crystal">Plasmosis</h3>
                <p className="text-[0.74rem] leading-[1.8] text-neptura-silver/60 font-light">
                  Microwave energy triggers a high-temperature plasma gas core, splitting carbon molecules.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-neptura-neptune/30 border border-neptura-ice/5 p-8 flex flex-col justify-between group hover:border-neptura-aurora/35 transition-colors duration-300">
              <span className="font-display text-lg text-neptura-aurora font-light">03</span>
              <div className="mt-12 space-y-3">
                <h3 className="font-display text-base font-light text-neptura-crystal">Precipitation</h3>
                <p className="text-[0.74rem] leading-[1.8] text-neptura-silver/60 font-light">
                  Freed carbon atoms rain downward, bonding layer-by-layer onto flat diamond substrates.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-neptura-neptune/30 border border-neptura-ice/5 p-8 flex flex-col justify-between group hover:border-neptura-aurora/35 transition-colors duration-300">
              <span className="font-display text-lg text-neptura-aurora font-light">04</span>
              <div className="mt-12 space-y-3">
                <h3 className="font-display text-base font-light text-neptura-crystal">Awakening</h3>
                <p className="text-[0.74rem] leading-[1.8] text-neptura-silver/60 font-light">
                  Raw diamond blocks are laser-sliced and hand-faceted into exceptional luxury jewelry.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Transition Band (Dark World -> Light World) */}
      <TransitionBand />

      {/* 5. Featured Products Section (Light World) */}
      <section className="bg-neptura-light-bg text-neptura-light-text px-6 py-24 md:py-32">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-neptura-light pb-6">
            <div className="space-y-4">
              <span className="section-label">The collection</span>
              <h2 className="font-display text-3xl md:text-4xl font-light text-neptura-light-text">
                Selected Stones
              </h2>
            </div>
            <Link
              href="/shop"
              className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-neptura-aurora hover:opacity-80 transition duration-300 flex items-center gap-1 self-start md:self-auto"
            >
              Explore the collection <span className="text-[0.9rem] font-sans">→</span>
            </Link>
          </div>

          {products.length === 0 ? (
            <p className="text-center text-neptura-light-muted py-12 text-sm">
              The cosmic vault is currently loading.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. Bespoke Commission CTA Section (Light World) */}
      <section className="bg-neptura-light-surface text-neptura-light-text px-6 py-24 border-t border-neptura-light">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <span className="section-label">Bespoke</span>
          <h2 className="font-display text-3xl md:text-5xl font-light text-neptura-light-text">
            Co-create with the Cosmos
          </h2>
          <p className="mx-auto max-w-lg text-[0.82rem] font-light leading-[1.9] text-neptura-light-muted">
            Work directly with our master design house and gemologists to shape a unique, cosmic-certified custom ring or jewelry piece tailored specifically for you.
          </p>
          <div className="pt-4">
            <Link href="/bespoke" className="btn-light-secondary inline-block">
              Begin Bespoke Enquiry
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer (Dark World) */}
      <footer className="bg-neptura-void text-neptura-silver px-6 py-16 border-t border-neptura-ice/5">
        <div className="mx-auto max-w-6xl grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display text-lg tracking-[0.4em] uppercase text-neptura-crystal font-light">
              Neptura
            </h3>
            <p className="text-[0.74rem] tracking-[0.1em] text-neptura-ice/60 uppercase">
              Rarer than you know
            </p>
            <p className="text-[0.72rem] max-w-xs text-neptura-silver/50 leading-relaxed pt-2">
              Cosmically precipitated lab-grown diamond jewelry designed for an infinite future. Recreated on Earth.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[0.68rem] uppercase tracking-[0.2em] text-neptura-aurora">Navigation</h4>
            <ul className="space-y-2.5 text-[0.72rem] font-light">
              <li>
                <Link href="/shop" className="hover:text-neptura-crystal transition">Collections</Link>
              </li>
              <li>
                <Link href="/#origin" className="hover:text-neptura-crystal transition">Origin story</Link>
              </li>
              <li>
                <Link href="/#science" className="hover:text-neptura-crystal transition">The science</Link>
              </li>
              <li>
                <Link href="/bespoke" className="hover:text-neptura-crystal transition">Bespoke orders</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-[0.68rem] uppercase tracking-[0.2em] text-neptura-aurora">Inquiries</h4>
            <p className="text-[0.72rem] text-neptura-silver/70 font-light leading-relaxed">
              Mumbai, India <br />
              <a href="mailto:info@neptura.in" className="hover:underline">info@neptura.in</a> <br />
              <span className="text-[0.68rem] text-neptura-silver/40">Always INR. Standard Indian Formatting.</span>
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-16 pt-8 border-t border-neptura-ice/5 flex flex-col sm:flex-row items-center justify-between text-[0.68rem] text-neptura-silver/40 font-light gap-4">
          <p>© {new Date().getFullYear()} Neptura. All rights reserved.</p>
          <div className="flex gap-6">
            <p>Terms of Service</p>
            <p>Privacy Policy</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
