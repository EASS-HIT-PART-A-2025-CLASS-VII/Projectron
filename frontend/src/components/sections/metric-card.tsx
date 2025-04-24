// src/components/sections/metric-card.tsx
import { motion } from "framer-motion";
import { TrendingUp, Clock, Users } from "lucide-react";

interface MetricCardProps {
  value: string;
  label: string;
  description: string;
  delay?: number;
  isInView?: boolean;
  icon?: "speed" | "time" | "team";
}

const MetricCard = ({
  value,
  label,
  description,
  delay = 0,
  isInView = true,
  icon = "speed",
}: MetricCardProps) => {
  /* ----------------------------- Icon Selectors ---------------------------- */
  const getIcon = () => {
    switch (icon) {
      case "time":
        return <Clock className="text-primary-cta w-6 h-6" />;
      case "team":
        return <Users className="text-primary-cta w-6 h-6" />;
      default:
        return <TrendingUp className="text-primary-cta w-6 h-6" />;
    }
  };

  const getIconByLabel = () => {
    if (label.includes("Less Planning")) {
      return <Clock className="text-primary-cta w-6 h-6" />;
    }
    if (label.includes("Fewer")) {
      return <Users className="text-primary-cta w-6 h-6" />;
    }
    return <TrendingUp className="text-primary-cta w-6 h-6" />;
  };

  /* ---------------------------------- UI ---------------------------------- */
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay }}
      className="relative overflow-hidden rounded-2xl border border-primary-cta/20 bg-secondary-background/80 p-6 shadow-md backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary-cta/40 hover:shadow-xl"
    >
      {/* subtle glow */}
      <span className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-cta/5 via-transparent to-primary-cta/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* top section */}
      <div className="flex items-center gap-1">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-cta/10">
          {getIconByLabel()}
        </div>
        <span className="text-2xl font-bold tracking-tight text-gradient-cta">
          {value}
        </span>
      </div>

      {/* middle section */}
      <div className="mt-4 space-y-1">
        <h3 className="text-lg font-semibold text-primary-text">{label}</h3>
        <p className="text-sm leading-snug text-primary-text/80">
          {description}
        </p>
      </div>

      {/* progress bar */}
      <div className="mt-6 border-t border-divider pt-4">
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/20">
          <div
            className="h-full rounded-full bg-primary-cta/80 bg-gradient-to-r from-primary-cta to-primary-cta/60"
            style={{ width: value }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
