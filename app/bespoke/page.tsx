import Link from "next/link";
import StarField from "@/components/StarField";

export const metadata = {
  title: "Bespoke Commissions | Neptura",
  description: "Shape a unique, custom-certified lab-grown diamond piece under your parameters.",
};

export default function BespokePage() {
  return (
    <div className="relative bg-neptura-void text-neptura-silver min-h-screen pt-28 pb-24 overflow-hidden flex flex-col justify-between">
      <StarField />
      
      <div className="relative z-10 mx-auto max-w-3xl w-full px-6 flex-1 flex flex-col justify-center">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <span className="section-label">Bespoke</span>
          <h1 className="font-display text-4xl md:text-5xl font-light text-neptura-crystal leading-[1.15]">
            Co-create with the <br />
            <span className="italic font-normal text-neptura-ice">cosmos</span>
          </h1>
          <p className="mx-auto max-w-md text-[0.8rem] font-light text-neptura-silver/50 leading-[1.8]">
            Capture planetary physics. Work directly with our gemologists to sculpt a design formed under your parameters.
          </p>
        </div>

        {/* Enquiry Form */}
        <form className="space-y-8 bg-neptura-neptune/20 border border-neptura-ice/5 p-8 md:p-10 backdrop-blur-sm select-none">
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300"
                placeholder="E.g., Devendra Singh"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300"
                placeholder="name@domain.in"
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Preferred Cut */}
            <div className="space-y-2">
              <label htmlFor="cut" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
                Desired Diamond Cut
              </label>
              <select
                id="cut"
                name="cut"
                className="w-full bg-neptura-void/90 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 appearance-none cursor-pointer"
              >
                <option value="emerald">Emerald Cut (Recommended)</option>
                <option value="round">Round Brilliant</option>
                <option value="oval">Oval Cut</option>
                <option value="cushion">Cushion Cut</option>
              </select>
            </div>

            {/* Carat weight */}
            <div className="space-y-2">
              <label htmlFor="carats" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
                Desired Carat Weight
              </label>
              <select
                id="carats"
                name="carats"
                className="w-full bg-neptura-void/90 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 appearance-none cursor-pointer"
              >
                <option value="1-2">1.00 – 1.99 Carats</option>
                <option value="2-3">2.00 – 2.99 Carats</option>
                <option value="3+">3.00+ Carats</option>
              </select>
            </div>
          </div>

          {/* Metal Preference */}
          <div className="space-y-3">
            <span className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
              Preferred Jewelry Material
            </span>
            <div className="grid grid-cols-3 gap-3">
              {["Gold", "White Gold", "Rose Gold"].map((metal) => (
                <label
                  key={metal}
                  className="flex items-center justify-center py-3 border border-neptura-ice/20 text-[0.7rem] uppercase tracking-wider text-neptura-crystal cursor-pointer transition hover:bg-neptura-neptune/30 hover:border-neptura-aurora/50"
                >
                  <input
                    type="radio"
                    name="metal"
                    value={metal.toLowerCase()}
                    className="sr-only"
                  />
                  <span>{metal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label htmlFor="notes" className="block text-[0.62rem] uppercase tracking-[0.2em] text-neptura-aurora">
              Commission Details & Design Inspiration
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full bg-neptura-void/50 border border-neptura-ice/20 px-4 py-3 text-xs text-neptura-crystal tracking-wide focus:border-neptura-aurora outline-none transition duration-300 resize-none"
              placeholder="Describe your vision, alignment, or ring size details..."
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full btn-dark-primary text-center transition duration-300 hover:opacity-90 active:opacity-100"
            >
              Submit Commission request
            </button>
          </div>
        </form>
      </div>

      {/* Footer copyright section at very bottom */}
      <div className="relative z-10 w-full text-center mt-12 py-4 border-t border-neptura-ice/5 text-[0.65rem] text-neptura-silver/30 font-light select-none">
        <p>© {new Date().getFullYear()} Neptura Bespoke. Mumbai, India.</p>
      </div>
    </div>
  );
}
