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
      <div className="nft">
        {image && (
          <div className="image">
            <SquareImage src={image} size={400} alt={title} />
          </div>
        )}
        <div className="name">{title}</div>
        {subtitle}
      </div>
      <style jsx>
        {`
          .nft {
            display: block;
            transition: var(--transition);
          }

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
