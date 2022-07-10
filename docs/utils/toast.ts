import toast from "react-hot-toast";

export const LOADING_TOAST_STYLE = {
  style: {
    minWidth: "200px",
    color: "white",
    backgroundColor: "var(--brand-color)",
  },
  iconTheme: {
    primary: "white",
    secondary: "var(--brand-color)",
  },
};

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

export const toastLoading = (message: JSX.Element | string, id?: string) => {
  toast.loading(message, {
    id,
    position: "bottom-center",
    ...LOADING_TOAST_STYLE,
  });
};

export const toastSuccess = (message: JSX.Element | string, id?: string) => {
  toast.success(message, {
    id,
    position: "bottom-center",
    ...SUCCESS_TOAST_STYLE,
  });
};

export const toastError = (message: JSX.Element | string, id?: string) => {
  toast.error(message, { id, position: "bottom-center", ...ERROR_TOAST_STYLE });
};
