import { vi, describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import { userEvent } from "@testing-library/user-event";

import KeyValue from "../KeyValue.svelte";

describe("KeyValue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders with default values", () => {
    render(KeyValue);

    // Check that the value input is rendered
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toBeInTheDocument();
    expect(valueInput).toHaveValue("");
  });

  it("renders with provided key and value", () => {
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
      },
    });

    // Check that the value input has the correct value
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toHaveValue("testValue");
  });

  it("allows changing the value", async () => {
    const user = userEvent.setup();
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "",
      },
    });

    const valueInput = screen.getByPlaceholderText("Value") as HTMLInputElement;

    // Simulate user typing in the value input
    await user.clear(valueInput);
    await user.type(valueInput, "newValue");

    expect(valueInput).toHaveValue("newValue");
  });

  it("dispatches add event with correct key and value when add button is clicked", async () => {
    const user = userEvent.setup();
    const handleAdd = vi.fn(async () => ({}));
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
        add: true,
        onadd: handleAdd,
      },
    });

    // Find the add button (in add mode) by title attribute
    const addButton = screen.getByRole("button", { name: "Update" });
    await user.click(addButton);

    expect(handleAdd).toHaveBeenCalledTimes(1);
    expect(handleAdd).toHaveBeenCalledWith({
      key: "testKey",
      value: "testValue",
    });
  });

  it("dispatches delete event with correct key and value when delete button is clicked", async () => {
    const user = userEvent.setup();
    const handleDelete = vi.fn(async () => ({}));
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
        add: false,
        ondelete: handleDelete,
      },
    });

    // Find the delete button (not in add mode) by title attribute
    const deleteButton = screen.getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(handleDelete).toHaveBeenCalledTimes(1);
    expect(handleDelete).toHaveBeenCalledWith({
      key: "testKey",
      value: "testValue",
    });
  });

  it("disables add button when key or value is empty", () => {
    render(KeyValue, {
      props: {
        keys: ["test"],
        key: "test",
        value: "",
        add: true,
      },
    });

    const addButton = screen.getByRole("button", { name: "Update" });
    expect(addButton).toBeDisabled();
  });

  it("enables add button when both key and value are provided", () => {
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
        add: true,
        onadd: async ({ key, value }) => ({}),
      },
    });

    const addButton = screen.getByRole("button", { name: "Update" });
    expect(addButton).toBeEnabled();
  });

  it("updates to empty key and value when props are changed to empty strings", async () => {
    const { rerender } = render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
      },
    });

    // Update props to empty values (simulates what clear() does internally)
    await rerender({ key: "", value: "" });

    // Check that the value input is cleared
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toHaveValue("");
  });

  it("disables inputs and buttons when disabled prop is true", () => {
    render(KeyValue, {
      props: {
        keys: ["testKey"],
        key: "testKey",
        value: "testValue",
        add: true,
        disabled: true,
      },
    });

    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toBeDisabled();

    const addButton = screen.getByRole("button", { name: "Update" });
    expect(addButton).toBeDisabled();
  });

  it("works with custom keys", () => {
    render(KeyValue, {
      props: {
        keys: ["customKey1", "customKey2", "_tag"],
        key: "customKey1",
        value: "testValue",
      },
    });

    // Verify the component renders correctly with custom keys
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toHaveValue("testValue");
  });

  it("allows setting a new key that is not in the predefined keys array", async () => {
    const { rerender } = render(KeyValue, {
      props: {
        keys: ["existingKey1", "existingKey2", "_tag"],
        key: "",
        value: "",
      },
    });

    // When a user types a new key in svelecte and selects it,
    // the key prop gets updated. This simulates that behavior.
    // We verify the component accepts the new key without errors
    await rerender({ key: "newCustomKey" });

    // Component should render without errors
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toBeInTheDocument();
  });

  it("updates key when a new option is selected", async () => {
    const { rerender } = render(KeyValue, {
      props: {
        keys: ["key1", "key2", "_tag"],
        key: "",
        value: "",
      },
    });

    // Simulate selecting a new key by directly setting the component prop
    // This mimics what happens when the user selects an option in svelecte
    await rerender({ key: "key1" });

    // Component should render without errors
    const valueInput = screen.getByPlaceholderText("Value");
    expect(valueInput).toBeInTheDocument();
  });
});
