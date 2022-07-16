import classNames from "classnames";
import { getImageUrl } from "../../utils/cdn";

export const SquareImage = ({
  src,
  rounded = true,
  size,
}: {
  src: string | null | undefined;
  size: number;
  rounded?: boolean;
}) => {
  return (
    <div
      className={classNames("img-container bg-secondary", { rounded })}
      style={{
        backgroundImage: src
          ? `url(${getImageUrl({ url: src, width: size, height: size })})`
          : undefined,
      }}
    >
      <style jsx>{`
        .img-container {
          width: 100%;
          height: 0;
          padding-bottom: 100%;
          position: relative;
          background-size: cover;
          background-position: center;
        }
      `}</style>
    </div>
  );
};
