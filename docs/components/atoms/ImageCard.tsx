import { LuxLink } from "./LuxLink";
import { SquareImage } from "./SquareImage";
import { ReactNode } from "react";

export function ImageCard({
  image,
  title,
  subtitle,
  size = 400,
  linkInfo,
}: {
  image: string | undefined;
  title: string | null;
  size?: number;
  subtitle?: ReactNode;
  linkInfo?: { href: string; query?: any };
}) {
  const inner = (
    <>
      <div className="card animated">
        <div className="image">
          <SquareImage src={image} size={size} />
        </div>
        <div className="title">{title}</div>
        <div>{subtitle}</div>
      </div>
      <style jsx>{`
        .card:hover {
          opacity: 0.95;
        }

        .image {
          border-radius: var(--border-radius);
          overflow: hidden;
          box-shadow: var(--shadow);
        }

        .title {
          color: var(--primary-color);
          margin-top: 0.5rem;
          font-size: var(--large-font-size);
          font-weight: var(--medium-font-weight);
        }
      `}</style>
    </>
  );

  if (linkInfo) {
    return <LuxLink {...linkInfo}>{inner}</LuxLink>;
  }

  return <>{inner}</>;
}
