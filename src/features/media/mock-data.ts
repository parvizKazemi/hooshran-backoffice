import { Media } from "./types";

export const mockMedia: Media[] = [
  {
    id: "1",
    extension: "jpg",
    type: "IMAGE",
    size: 1024000,
    bucket: "user-uploads",
    key: "avatars/user1.jpg",
    url: "https://example.com/avatars/user1.jpg",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    extension: "png",
    type: "IMAGE",
    size: 512000,
    bucket: "service-images",
    key: "services/service1.png",
    url: "https://example.com/services/service1.png",
    createdAt: "2024-01-16T11:00:00Z",
  },
  {
    id: "3",
    extension: "mp4",
    type: "VIDEO",
    size: 15728640,
    bucket: "videos",
    key: "videos/video1.mp4",
    url: "https://example.com/videos/video1.mp4",
    createdAt: "2024-01-17T09:00:00Z",
  },
  {
    id: "4",
    extension: "jpg",
    type: "IMAGE",
    size: 2048000,
    bucket: "user-uploads",
    key: "avatars/user2.jpg",
    url: "https://example.com/avatars/user2.jpg",
    createdAt: "2024-01-18T12:00:00Z",
  },
];
