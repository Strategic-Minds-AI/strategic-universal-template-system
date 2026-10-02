import React from "react";

export default function BrandLogo({ size = 32, withWordmark = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {withWordmark && (
        <div className="leading-none">
          <div className="font-heading font-black tracking-tight text-[15px] text-foreground">
            Strategic Minds <span className="text-[#0d2f96]">AI</span>
          </div>
          <div className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
            Strategy First · Intelligence Applied
          </div>
        </div>
      )}
    </div>
  );
}