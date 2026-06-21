import { formatOrderDateShort } from "@/lib/customer-auth/orders";
import type { OrderProgressStep } from "@/lib/customer-auth/types";
import { cn } from "@/lib/utils";

type AccountOrderProgressTrackerProps = {
  steps: OrderProgressStep[];
  className?: string;
};

const DOT_IN_MS = 360;
const LINE_DRAW_MS = 640;
/** Overlap so the next motion begins before the previous one finishes */
const FLOW_OVERLAP_MS = 220;

function isStepReached(step: OrderProgressStep): boolean {
  return step.complete || step.current;
}

function getDotRevealDelay(stepIndex: number): number {
  if (stepIndex === 0) {
    return 0;
  }

  return getLineDrawDelay(stepIndex - 1) + LINE_DRAW_MS - FLOW_OVERLAP_MS;
}

function getLineDrawDelay(segmentIndex: number): number {
  return getDotRevealDelay(segmentIndex) + FLOW_OVERLAP_MS;
}

export default function AccountOrderProgressTracker({
  steps,
  className,
}: AccountOrderProgressTrackerProps) {
  return (
    <div className={cn("mt-8 pt-1", className)} aria-label="Order progress">
      <div className="hidden sm:block">
        <ol className="relative grid grid-cols-4">
          {steps.map((step, index) => {
            const reached = isStepReached(step);
            const nextStep = steps[index + 1];
            const nextReached = nextStep ? isStepReached(nextStep) : false;
            const dotDelay = getDotRevealDelay(index);
            const lineDelay = getLineDrawDelay(index);
            const pulseDelay = dotDelay + DOT_IN_MS;

            return (
              <li key={step.id} className="relative flex flex-col items-center text-center">
                {index < steps.length - 1 ? (
                  <span
                    aria-hidden
                    className={cn(
                      "account-order-progress-track",
                      nextReached
                        ? "account-order-progress-track--complete"
                        : "account-order-progress-track--pending",
                    )}
                    style={{
                      ["--progress-draw-delay" as string]: `${lineDelay}ms`,
                      ["--progress-line-duration" as string]: `${LINE_DRAW_MS}ms`,
                    }}
                  />
                ) : null}

                <span
                  className="account-order-progress-dot account-order-progress-dot--reveal"
                  style={{
                    ["--progress-step-delay" as string]: `${dotDelay}ms`,
                    ["--progress-dot-duration" as string]: `${DOT_IN_MS}ms`,
                  }}
                >
                  {step.current ? (
                    <>
                      <span
                        aria-hidden
                        className="account-order-progress-dot-pulse"
                        style={{ animationDelay: `${pulseDelay}ms` }}
                      />
                      <span
                        aria-hidden
                        className="account-order-progress-dot-pulse account-order-progress-dot-pulse--outer"
                        style={{ animationDelay: `${pulseDelay + 180}ms` }}
                      />
                    </>
                  ) : null}
                  <span
                    className={cn(
                      "block h-full w-full rounded-full",
                      reached
                        ? "bg-neptura-aurora"
                        : "border border-neptura-diamond/70 bg-neptura-neptune",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "mt-4 text-[0.62rem] font-normal uppercase tracking-[0.18em] text-neptura-aurora",
                    step.current && "account-order-progress-label-pulse",
                  )}
                  style={
                    step.current
                      ? { animationDelay: `${pulseDelay}ms` }
                      : undefined
                  }
                >
                  {step.label}
                </span>
                {step.date && reached ? (
                  <span
                    className="mt-1.5 text-[0.65rem] font-light tabular-nums text-neptura-silver/65 account-order-progress-copy--reveal"
                    style={{
                      ["--progress-step-delay" as string]: `${dotDelay + DOT_IN_MS * 0.6}ms`,
                    }}
                  >
                    {formatOrderDateShort(step.date)}
                  </span>
                ) : (
                  <span className="mt-1.5 h-[0.975rem]" aria-hidden />
                )}
              </li>
            );
          })}
        </ol>
      </div>

      <div className="sm:hidden">
        <p
          className={cn(
            "text-[0.62rem] font-normal uppercase tracking-[0.18em] text-neptura-aurora",
            steps.some((step) => step.current) && "account-order-progress-label-pulse",
          )}
        >
          {steps.find((step) => step.current)?.label ?? steps.at(-1)?.label}
        </p>
        {steps.find((step) => step.current)?.date ? (
          <p className="mt-1.5 text-[0.65rem] font-light tabular-nums text-neptura-silver/65">
            {formatOrderDateShort(steps.find((step) => step.current)!.date!)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
