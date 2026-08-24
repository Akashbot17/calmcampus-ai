import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  glass?: boolean;
}

export default function Card({ children, glass = false, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl3 border border-ink/5 ${glass ? "glass" : "bg-white"} shadow-calm p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
