const docTitleLimit = process.env.DOCUMENT_TITLE_CHAR_LIMIT;
/*TODO(tdk) pick a better limit for fields coming in this way */


export const addonDialogs = [
  {
    menuTitle: "metaFields.nameFieldTitle",
    charLimit: docTitleLimit,
    fieldAccessor: (x) => x.name,
    fieldName: "metaFields.titleFieldName",
    fieldNameUppercase: "metaFields.titleFieldNameUppercase",
    apiField: "name",
    headerText: "metaFields.titleFieldHeader",
    explainerText: "metaFields.titleFieldDescription",
    buttonText: "metaFields.titleFieldButton",
    fieldValid: (value, initial) => value != initial && value.trim().length > 0,
    fieldInvalidText: (value, initial) =>
      value == initial
        ? "metaFields.titleFieldInvalidSameName"
        : value.trim().length == 0
        ? "metaFields.titleFieldInvalidEmptyName"
        : "",
  }
]