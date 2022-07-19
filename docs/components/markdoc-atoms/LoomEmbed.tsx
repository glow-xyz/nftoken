import React from "react";

export const LoomEmbed = ({ url }: { url: string }) => {
  return (
    <div
      style={{
        position: "relative",
        paddingBottom: "64.98194945848375%",
        height: 0,
      }}
    >
      <iframe
        src={url}
        frameBorder="0"
        allowFullScreen
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};
