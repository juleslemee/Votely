"use client";

import React, { createContext, useContext, useState } from 'react';

interface TooltipContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({ children, asChild = false, ...props }: {
  children: React.ReactNode;
  asChild?: boolean;
  [key: string]: any;
}) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipTrigger must be used within Tooltip');

  const { open, setOpen } = context;

  const triggerProps = {
    onMouseEnter: () => {
      console.log('Mouse enter - showing tooltip');
      setOpen(true);
    },
    onMouseLeave: () => {
      console.log('Mouse leave - hiding tooltip');
      setOpen(false);
    },
    onFocus: () => {
      console.log('Focus - showing tooltip');
      setOpen(true);
    },
    onBlur: () => {
      console.log('Blur - hiding tooltip');
      setOpen(false);
    },
    onClick: () => {
      console.log('Click - toggling tooltip');
      setOpen(!open);
    },
    ...props
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, triggerProps);
  }

  return <div {...triggerProps}>{children}</div>;
}

export function TooltipContent({
  children,
  side = "left",
  sideOffset = 8,
  className = "",
  ...props
}: {
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  className?: string;
  [key: string]: any;
}) {
  const context = useContext(TooltipContext);
  if (!context) throw new Error('TooltipContent must be used within Tooltip');

  const { open } = context;

  console.log('TooltipContent render - open:', open, 'children:', children);

  if (!open) return null;

  const positionClasses = {
    top: `bottom-full left-1/2 -translate-x-1/2 mb-${sideOffset / 4}`,
    bottom: `top-full left-1/2 -translate-x-1/2 mt-${sideOffset / 4}`,
    left: `right-full top-1/2 -translate-y-1/2 mr-${sideOffset / 4}`,
    right: `left-full top-1/2 -translate-y-1/2 ml-${sideOffset / 4}`
  };

  return (
    <div
      className={`absolute z-50 ${positionClasses[side]} pointer-events-none`}
      {...props}
    >
      <div className={`bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl leading-relaxed ${className}`}>
        {children}
      </div>
    </div>
  );
}