import { Header } from "./all-pages/Header";
import { Footer } from "./all-pages/Footer";
import { Toaster } from "react-hot-toast";

export const PageLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="page">
        <Header />
        <div className="content">{children}</div>
        <Footer />
      </div>
      <Toaster />
      <style jsx>{`
        .page {
          min-height: 100vh;
          display: grid;
          grid-template-rows: max-content 1fr max-content;
        }

        .content {
          width: 100%;
          max-width: 60rem;
          margin: 0 auto;
          padding: 1.5rem;
          padding-bottom: 3rem;
        }
      `}</style>
    </>
  );
};
