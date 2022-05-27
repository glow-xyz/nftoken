import { useState } from "react";
import classNames from "classnames";

export const CreateNftSection = () => {
  const [imageinDropzone, setImageInDropzone] = useState(false);

  return (
    <div>
      <form onSubmit={() => console.log("submit")}>
        <div>
          <label htmlFor="name" className="luma-input-label medium">
            Name
          </label>
          <input type="text" name="name" id="name" className="luma-input" />
        </div>

        <div>
          <label htmlFor="image" className="luma-input-label medium">
            NFT Image
          </label>
          <div
            className={classNames("dropzone", { active: imageinDropzone })}
            onDragEnter={() => setImageInDropzone(true)}
            onDragOver={() => setImageInDropzone(true)}
            onDragLeave={() => setImageInDropzone(false)}
            onDrop={() => setImageInDropzone(false)}
          >
            <input type="file" name="image" id="image" />
            <div>Drag and drop an image or click to browse.</div>
          </div>
        </div>

        <button className="luma-button round brand solid flex-center mt-4">
          Create NFT
        </button>
      </form>

      <style jsx>{`
        form {
          max-width: 24rem;
        }

        form > div {
          margin-bottom: 1rem;
        }

        .dropzone {
          position: relative;
          border: 1px dashed var(--primary-border-color);
          width: max-content;
          color: var(--secondary-color);
          background-color: var(--secondary-bg-color);
          padding: 1rem;
          border-radius: var(--border-radius);
          transition: var(--transition);
          width: 24rem;
          max-width: 100%;
          text-align: center;
        }

        .dropzone.active {
          color: var(--success-color);
          border-color: var(--success-color);
          background-color: var(--success-pale-bg-color);
        }

        .dropzone:hover {
          background-color: var(--tertiary-bg-color);
        }

        input[type="file"] {
          opacity: 0;
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};
