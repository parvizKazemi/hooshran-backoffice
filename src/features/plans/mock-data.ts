import { Plan } from "./types";

export const mockPlans: Plan[] = [
  {
    id: "1",
    name: "پلن ماهانه",
    price: 50000,
    duration_days: 30,
    max_usage: 1000,
    discount: 10,
    is_active: true,
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "2",
    name: "پلن سه‌ماهه",
    price: 120000,
    duration_days: 90,
    max_usage: 3000,
    discount: 20,
    is_active: true,
    createdAt: "2024-01-16T11:00:00Z",
  },
  {
    id: "3",
    name: "پلن سالانه",
    price: 400000,
    duration_days: 365,
    max_usage: 12000,
    discount: 30,
    is_active: false,
    createdAt: "2024-01-17T09:00:00Z",
  },
];
