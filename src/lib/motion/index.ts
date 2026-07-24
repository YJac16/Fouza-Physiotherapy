import type { Transition, Variants } from "framer-motion";

/** Shared Framer Motion presets — respect reduced motion at the consumer. */

export const premiumEase = [0.22, 1, 0.36, 1] as const;

export const transitionFast: Transition = {
  duration: 0.15,
  ease: premiumEase,
};

export const transitionBase: Transition = {
  duration: 0.22,
  ease: premiumEase,
};

export const transitionSlow: Transition = {
  duration: 0.35,
  ease: premiumEase,
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitionBase },
};

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: transitionSlow },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: { opacity: 1, x: 0, transition: transitionBase },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: transitionBase },
};

export const hoverLift = {
  whileHover: { y: -2, transition: transitionFast },
  whileTap: { scale: 0.98, transition: transitionFast },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: transitionSlow },
  exit: { opacity: 0, y: -4, transition: transitionFast },
};
