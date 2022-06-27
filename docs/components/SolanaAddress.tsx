import classNames from "classnames";
import CopyToClipboard from "react-copy-to-clipboard";
import { toastSuccess } from "../utils/toast";

const ShowAddress = ({
  address,
  className,
}: {
  address: string;
  className?: string;
}) => {
  const display = `${address.slice(0, 5)}…${address.slice(-5)}`;

  return (
    <span
      className={classNames("address mono animated", className)}
      title={address}
    >
      {display}

      <style jsx>{`
        .address {
          white-space: nowrap;
        }
      `}</style>
    </span>
  );
};

export const SolanaAddress = ({
  address,
  className,
  clickToCopy = true,
}: {
  className?: string;
  address: string | null | undefined;
  clickToCopy?: boolean;
}) => {
  if (!address) {
    return <div>Missing Address</div>;
  }

  const component = (
    <ShowAddress
      address={address}
      className={classNames({ clickable: clickToCopy }, className)}
    />
  );

  if (!clickToCopy) {
    return component;
  }

  return (
    <CopyToClipboard
      text={address}
      onCopy={() => {
        toastSuccess("Copied to Clipboard");
      }}
    >
      <span title={address} className={classNames("wrapper", className)}>
        {component}
        <style jsx>{`
          .wrapper :global(.clickable) {
            cursor: pointer;
          }
        `}</style>
      </span>
    </CopyToClipboard>
  );
};

export const SolanaSignature = ({
  signature,
  clickToCopy = true,
}: {
  signature: string;
  clickToCopy?: boolean;
}) => {
  const component = <ShowAddress address={signature} />;
  if (!clickToCopy) {
    return component;
  }

  return (
    <CopyToClipboard
      text={signature}
      onCopy={() => {
        toastSuccess("Copied to Clipboard");
      }}
    >
      <span>{component}</span>
    </CopyToClipboard>
  );
};
