import { LuxButton } from "../LuxButton";
import { LuxModalContainer } from "../LuxModal";
import { useState } from "react";

export const ModalTest = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <LuxButton
        label="Open Modal"
        color="brand"
        onClick={() => setShow(true)}
      />
      <LuxModalContainer title="Modal!" onHide={() => setShow(false)}>
        {show && <div className="p-4">Hey</div>}
      </LuxModalContainer>
    </>
  );
};
