// Ponte simples entre api.ts e AuthContext sem criar import circular
type UnauthorizedHandler = () => void;

let onUnauthorized: UnauthorizedHandler | null = null;

export const authEvents = {
  setUnauthorizedHandler: (handler: UnauthorizedHandler) => {
    onUnauthorized = handler;
  },
  clearUnauthorizedHandler: () => {
    onUnauthorized = null;
  },
  triggerUnauthorized: () => {
    if (onUnauthorized) onUnauthorized();
  },
};