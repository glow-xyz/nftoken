import React from "react";

export const Picture = ({ light, dark }: { light: string; dark: string }) => {
  return (
    <picture>
      <source srcSet={dark} media="(prefers-color-scheme: dark)" />
      <img src={light} />
    </picture>
  );
};
