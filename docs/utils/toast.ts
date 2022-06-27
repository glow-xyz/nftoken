import toast from "react-hot-toast";

export const SUCCESS_TOAST_STYLE = {
  style: {
    minWidth: "200px",
    color: "white",
    backgroundColor: "var(--success-color)",
  },
  iconTheme: {
    primary: "white",
    secondary: "var(--success-color)",
  },
};

export const ERROR_TOAST_STYLE = {
  style: {
    minWidth: "200px",
    color: "white",
    backgroundColor: "var(--error-color)",
  },
  iconTheme: {
    primary: "white",
    secondary: "var(--error-color)",
  },
};

export const toastSuccess = (message: string, id?: string) => {
  toast.success(message, { id, ...SUCCESS_TOAST_STYLE });
};

export const toastError = (message: string, id?: string) => {
  toast.error(message, { id, ...ERROR_TOAST_STYLE });
};
