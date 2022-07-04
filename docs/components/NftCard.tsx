import { SquareImage } from "./SquareImage";
import { ReactNode } from "react";

export function NftCard({
  image,
  title,
  subtitle,
}: {
  image: string | undefined;
  title: string;
  subtitle?: ReactNode;
}) {
  return (
    <>
      <div className="card animated">
        <div className="image">
          {image ? (
            <SquareImage src={image} size={400} alt={title} />
          ) : (
            <div className="placeholder" />
          )}
        </div>
        <div className="title">{title}</div>
        <div>{subtitle}</div>
      </div>
      <style jsx>
        {`
          .card:hover {
            opacity: 0.95;
          }

          .image {
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
          }

          .placeholder {
            width: 100%;
            aspect-ratio: 1;
            background-color: var(--gray-30);
          }

          .title {
            color: var(--primary-color);
            margin-top: 0.5rem;
            font-size: var(--large-font-size);
            font-weight: var(--medium-font-weight);
          }
        `}
      </style>
    </>
  );
}
