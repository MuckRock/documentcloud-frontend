import { extractErrorData } from "./errorData";

test("extract basic data", () => {
  expect(
    extractErrorData({
      email: ["needed"],
    })
  ).toEqual([{ key: "email", values: ["needed"] }]);

  expect(
    extractErrorData({
      email: ["needed"],
      id: ["missing", "required"],
    })
  ).toEqual([
    { key: "email", values: ["needed"] },
    { key: "id", values: ["missing", "required"] },
  ]);
});

test("extract array data", () => {
  expect(extractErrorData(["missing"])).toEqual([
    { key: null, values: ["missing"] },
  ]);
});

test("extract detail data", () => {
  expect(extractErrorData({ detail: "test" })).toEqual([
    { key: "detail", values: ["test"] },
  ]);
});

test("extract advanced data", () => {
  expect(
    extractErrorData([
      {
        access: [
          "You may not update `access` while the document is processing",
        ],
      },
    ])
  ).toEqual([
    {
      key: "access",
      values: ["You may not update `access` while the document is processing"],
    },
  ]);
});
