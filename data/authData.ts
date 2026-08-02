export type MockUser = {
  id: string;
  name: string;
  role: string;
  email: string;
  password: string;
  avatarUrl: string;
};

// Static demo credentials — no real backend. Swap this file for an API call later.
export const mockUsers: MockUser[] = [
  {
    id: "U-0001",
    name: "John Sterling",
    role: "System Admin",
    email: "admin@ziomoney.com",
    password: "admin123",
    avatarUrl:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&h=80&fit=crop&crop=faces",
  },
  {
    id: "U-0002",
    name: "John Doe",
    role: "Admin",
    email: "demo@ziomoney.com",
    password: "demo1234",
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=faces",
  },
];

export function findUserByCredentials(email: string, password: string): MockUser | null {
  const normalizedEmail = email.trim().toLowerCase();
  return (
    mockUsers.find(
      (user) => user.email.toLowerCase() === normalizedEmail && user.password === password
    ) ?? null
  );
}
