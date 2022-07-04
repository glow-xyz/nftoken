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
      <div className="nft animated">
        {image && (
          <div className="image">
            <SquareImage src={image} size={400} alt={title} />
          </div>
        )}
        <div className="name">{title}</div>
        <div>{subtitle}</div>
      </div>
      <style jsx>
        {`
          .nft:hover {
            opacity: 0.95;
          }

          .nft .image {
            border-radius: var(--border-radius);
            overflow: hidden;
            box-shadow: var(--shadow);
          }

          .nft .name {
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
