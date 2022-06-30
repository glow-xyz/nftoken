import { getImageUrl } from "../utils/cdn";

export const SquareImage = ({
  src,
  size,
  alt,
}: {
  src: string;
  size: number;
  alt?: string;
}) => {
  return (
    <>
      <img
        src={getImageUrl({ url: src, width: size, height: size })}
        alt={alt}
      />

      <style jsx>{`
        img {
          display: block;
          width: 100%;
        }
      `}</style>
    </>
  );
};
