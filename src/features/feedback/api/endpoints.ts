export const FEEDBACK_ENDPOINTS = {
  rules: "/admin/feedback-rules",
  feedbacks: "/admin/feedbacks",
  feedbackByUuid: (uuid: string) =>
    `/admin/feedbacks/${encodeURIComponent(uuid)}`,
  feedbackStatus: (uuid: string) =>
    `/admin/feedbacks/${encodeURIComponent(uuid)}/status`,
  feedbackNotes: (uuid: string) =>
    `/admin/feedbacks/${encodeURIComponent(uuid)}/notes`,
  feedbackNoteDelete: (uuid: string, noteUuid: string) =>
    `/admin/feedbacks/${encodeURIComponent(uuid)}/notes/${encodeURIComponent(noteUuid)}`,
  config: "/admin/feedbacks/config",
  analytics: "/admin/feedbacks/analytics",
} as const;
