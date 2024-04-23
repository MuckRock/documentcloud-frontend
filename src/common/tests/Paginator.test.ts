import { jest } from "@jest/globals";
import { render, screen, fireEvent } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

import Paginator from "../Paginator.svelte";

describe("Paginator", () => {
  it("has next and previous buttons", () => {
    render(Paginator, { props: { has_previous: true, has_next: true } });
    const previous = screen.getByTitle(/Previous/);
    const next = screen.getByTitle(/Next/);
    expect(previous).toBeInTheDocument();
    expect(next).toBeInTheDocument();
  });

  it("disables next or previous if has_* is false", () => {
    render(Paginator, { props: { has_previous: false, has_next: true } });
    const previous = screen.getByTitle(/Previous/);
    const next = screen.getByTitle(/Next/);
    expect(previous).toBeDisabled();
    expect(next).not.toBeDisabled();
  });

  it("calls on:previous handler when previous is clicked", async () => {
    const user = userEvent.setup();
    const results = render(Paginator, {
      props: { has_previous: true, has_next: true },
    });
    const mockPrevious = jest.fn();
    results.component.$on("previous", mockPrevious);
    const previous = screen.getByTitle(/Previous/);
    await user.click(previous);
    expect(mockPrevious).toBeCalledWith(expect.any(Object));
  });

  it("calls on:next handler when next is clicked", async () => {
    const user = userEvent.setup();
    const results = render(Paginator, {
      props: { has_previous: true, has_next: true },
    });
    const mockNext = jest.fn();
    results.component.$on("next", mockNext);
    const next = screen.getByTitle(/Next/);
    await user.click(next);
    expect(mockNext).toBeCalledWith(expect.any(Object));
  });

  it("displays the page number when provided", async () => {
    render(Paginator, {
      props: { page: 1, has_previous: true, has_next: true },
    });
    const page = screen.getByText(/Page/);
    const number = screen.getByText(/1/);
    expect(page).toBeInTheDocument();
    expect(number).toBeInTheDocument();
  });

  it("displays the total pages when provided", async () => {
    render(Paginator, {
      props: { page: 1, totalPages: 12, has_previous: true, has_next: true },
    });
    const total = screen.getByText(/of 12/);
    expect(total).toBeInTheDocument();
  });

  it("renders first page and last page buttons when goToNav is true", async () => {
    render(Paginator, {
      props: {
        page: 1,
        totalPages: 12,
        goToNav: true,
        has_previous: true,
        has_next: true,
      },
    });
    const first = screen.getByTitle(/First/);
    const last = screen.getByTitle(/Last/);
    expect(first).toBeInTheDocument();
    expect(last).toBeInTheDocument();
  });

  it("calls a goTo handler when first or last is clicked", async () => {
    const user = userEvent.setup();
    const results = render(Paginator, {
      props: {
        page: 5,
        totalPages: 12,
        goToNav: true,
        has_previous: true,
        has_next: true,
      },
    });
    const mockGoTo = jest.fn();
    results.component.$on("goTo", mockGoTo);
    const first = screen.getByTitle(/First/);
    await user.click(first);
    expect(mockGoTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: 1 }),
    );
    const last = screen.getByTitle(/Last/);
    await user.click(last);
    expect(mockGoTo).toHaveBeenLastCalledWith(
      expect.objectContaining({ detail: 12 }),
    );
  });

  it("calls a goTo handler when the page number is changed", async () => {
    const user = userEvent.setup();
    const results = render(Paginator, {
      props: {
        page: 1,
        totalPages: 12,
        goToNav: true,
        has_previous: true,
        has_next: true,
      },
    });
    const mockGoTo = jest.fn();
    results.component.$on("goTo", mockGoTo);
    const pageNumber = screen.getByRole("spinbutton");
    expect(pageNumber).toHaveValue(1);
    await user.click(pageNumber);
    expect(pageNumber).toHaveFocus();
    await user.type(pageNumber, "2[Enter]");
    expect(mockGoTo).toBeCalled();
  });
});
