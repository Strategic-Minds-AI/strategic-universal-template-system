import React from "react";

export default function BrandLogo({ size = 32, withWordmark = true }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src="https://media.base44.com/images/public/workspaces/69b98b0a75d69ef410a89851/brands/9eb8ac0da_brand_upload_logo.png"
        alt="Strategic Minds AI logo"
        style={{ width: size, height: size, objectFit: "contain" }}
      />
      {withWordmark && (
        <div className="leading-none">
          <div className="font-heading font-black tracking-tight text-[15px] text-foreground">
            Strategic Minds <span className="text-[#CCBB00]">AI</span>
          </div>
          <div className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
            Strategy First · Intelligence Applied
          </div>
        </div>
      )}
    </div>
  );
}