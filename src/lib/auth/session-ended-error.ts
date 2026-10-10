/** Not an ApiError, so feature hooks do not stack a toast on top of the session message. */
export class SessionEndedError extends Error {
  constructor() {
    super("Session ended");
    this.name = "SessionEndedError";
  }
}
