import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import * as AuthContext from "../context/AuthContext";

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const TestChild = () => <div data-testid="protected-content">Protected Content</div>;
const LoginPage = () => <div data-testid="login-page">Login Page</div>;
const AccessDenied = () => <div data-testid="access-denied">Access Denied</div>;

const renderWithRouter = (ui, { initialEntries = ["/protected"] } = {}) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe("ProtectedRoute", () => {
  it("shows loading state when auth is loading", () => {
    AuthContext.useAuth.mockReturnValue({ user: null, loading: true });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated", () => {
    AuthContext.useAuth.mockReturnValue({ user: null, loading: false });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("login-page")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when user is authenticated", () => {
    AuthContext.useAuth.mockReturnValue({
      user: { id: "1", name: "Test User", role: "candidate" },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute>
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("redirects to access-denied when user role does not match", () => {
    AuthContext.useAuth.mockReturnValue({
      user: { id: "1", name: "Test User", role: "candidate" },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute role="admin">
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("access-denied")).toBeInTheDocument();
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders children when user role matches required role", () => {
    AuthContext.useAuth.mockReturnValue({
      user: { id: "1", name: "Admin User", role: "admin" },
      loading: false,
    });

    renderWithRouter(
      <ProtectedRoute role="admin">
        <TestChild />
      </ProtectedRoute>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });
});
