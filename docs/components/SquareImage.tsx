import classNames from "classnames";
import { getImageUrl } from "../utils/cdn";

export const SquareImage = ({
  src,
  rounded = true,
  size,
  alt,
}: {
  src: string | null | undefined;
  size: number;
  rounded?: boolean;
  alt?: string;
}) => {
  return (
    <>
      {src ? (
        <img
          className={classNames({ rounded })}
          src={getImageUrl({ url: src, width: size, height: size })}
          alt={alt}
        />
      ) : (
        <div
          className={classNames("bg-secondary", { rounded })}
          style={{ width: size, height: size }}
        />
      )}

      <style jsx>{`
        img {
          display: block;
          width: 100%;
        }
      `}</style>
    </>
  );
};
