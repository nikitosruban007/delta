/// <reference types="vitest/globals" />
import "@testing-library/dom";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  usePathname: () => "/",
  notFound: vi.fn(),
}));

// Mock next/image — return null to avoid JSX in .ts file
vi.mock("next/image", () => ({
  default: () => null,
}));
