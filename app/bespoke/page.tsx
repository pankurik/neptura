import Link from "next/link";
import BespokeCommissionForm from "@/components/BespokeCommissionForm";
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

        <BespokeCommissionForm />
      </div>

      <div className="relative z-10 w-full text-center mt-12 py-4 border-t border-neptura-ice/5 text-[0.65rem] text-neptura-silver/30 font-light select-none">
        <p>
          © {new Date().getFullYear()} Neptura Bespoke. Mumbai, India.{" "}
          <Link href="/account#bespoke" className="text-neptura-silver/50 transition-colors hover:text-neptura-crystal">
            View your commissions
          </Link>
        </p>
      </div>
    </div>
  );
}
