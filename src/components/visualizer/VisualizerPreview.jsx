import React from "react";
import DeviceFrame from "@/components/gallery/DeviceFrame.jsx";
import { renderGeneratorType, renderRegistryRecord } from "@/lib/visualizer/visualizerRenderer.js";

export default function VisualizerPreview({ type, record, entityName, displayW = 232, config }) {
  const { frame, designW, designH, html } = record
    ? renderRegistryRecord(record, entityName, config)
    : renderGeneratorType(type, config);
  return (
    <DeviceFrame type={frame} designW={designW} designH={designH} displayW={displayW}>
      <div style={{ width: designW, height: designH }} dangerouslySetInnerHTML={{ __html: html }} />
    </DeviceFrame>
  );
}