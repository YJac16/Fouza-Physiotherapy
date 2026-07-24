"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import * as React from "react";

import {
  fadeIn,
  hoverLift,
  pageTransition,
  scaleIn,
  slideUp,
  staggerContainer,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

type MotionDivProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

function useMotionSafe() {
  const prefersReduced = useReducedMotion();
  return !prefersReduced;
}

export function FadeIn({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={fadeIn}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={slideUp}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={scaleIn}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function HoverLift({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div className={cn("will-change-transform", className)} {...hoverLift} {...props}>
      {children}
    </motion.div>
  );
}

export function Stagger({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-40px" }}
      variants={staggerContainer}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ className, children, ...props }: MotionDivProps) {
  const animate = useMotionSafe();
  if (!animate) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function ImageFade({
  className,
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={cn("animate-fade-in object-cover", className)}
      alt={props.alt ?? ""}
      {...props}
    />
  );
}
