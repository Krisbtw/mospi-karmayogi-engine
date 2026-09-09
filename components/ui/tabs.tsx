"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  activeTab?: string;
  layoutId?: string;
}

const TabsContext = React.createContext<TabsContextValue>({});

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  layoutId?: string;
}

const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  layoutId,
  children,
  ...props
}: TabsProps) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const activeTab = value !== undefined ? value : internalValue;
  const uniqueId = React.useId();
  const effectiveLayoutId = layoutId || `active-tab-pill-${uniqueId}`;

  const handleValueChange = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <TabsPrimitive.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={handleValueChange}
      {...props}
    >
      <TabsContext.Provider value={{ activeTab, layoutId: effectiveLayoutId }}>
        {children}
      </TabsContext.Provider>
    </TabsPrimitive.Root>
  );
};
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-9 items-center justify-center rounded-lg border border-slate-800/90 bg-slate-950/90 p-1 text-slate-400 shadow-inner backdrop-blur-md",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, value, ...props }, ref) => {
  const { activeTab, layoutId } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      value={value}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3.5 py-1 text-xs font-medium transition-colors duration-150 z-10 select-none",
        "text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
        isActive && "text-white font-semibold",
        className
      )}
      {...props}
    >
      {isActive && layoutId && (
        <motion.div
          layoutId={layoutId}
          className="absolute inset-0 z-[-1] rounded-md border border-slate-700/70 bg-gradient-to-b from-slate-800/90 to-slate-800 shadow-sm"
          transition={{
            type: "spring",
            stiffness: 450,
            damping: 34,
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </TabsPrimitive.Trigger>
  );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
