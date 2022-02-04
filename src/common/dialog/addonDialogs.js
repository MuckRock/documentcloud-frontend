const docTitleLimit = process.env.DOCUMENT_TITLE_CHAR_LIMIT;
// const docSourceLimit = process.env.DOCUMENT_SOURCE_CHAR_LIMIT;
// const docDescriptionLimit = process.env.DOCUMENT_DESCRIPTION_CHAR_LIMIT;
// const relatedArticleLimit = process.env.RELATED_ARTICLE_URL_CHAR_LIMIT;
// const publishedUrlLimit = process.env.PUBLISHED_URL_CHAR_LIMIT;

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
    // disabled: (numSelected) => numSelected != 1,
  },
  // {
  //   menuTitle: "metaFields.sourceFieldTitle",
  //   charLimit: docSourceLimit,
  //   fieldAccessor: (x) => x.source,
  //   fieldName: "metaFields.sourceFieldName",
  //   fieldNameUppercase: "metaFields.sourceFieldNameUppercase",
  //   apiField: "source",
  //   headerText: "metaFields.sourceFieldHeader",
  //   explainerText: "metaFields.sourceFieldDescription",
  //   buttonText: "metaFields.sourceFieldButton",
  // },
  // {
  //   menuTitle: "metaFields.descriptionFieldTitle",
  //   charLimit: docDescriptionLimit,
  //   fieldAccessor: (x) => x.description,
  //   fieldName: "metaFields.descriptionFieldName",
  //   fieldNameUppercase: "metaFields.descriptionFieldNameUppercase",
  //   apiField: "description",
  //   headerText: "metaFields.descriptionFieldHeader",
  //   explainerText: "metaFields.descriptionFieldDescription",
  //   isTextArea: true,
  //   buttonText: "metaFields.descriptionFieldButton",
  // },
  // {
  //   menuTitle: "metaFields.relatedArticleFieldTitle",
  //   charLimit: relatedArticleLimit,
  //   fieldAccessor: (x) => x.relatedArticleUrl,
  //   fieldName: "rmetaFields.relatedArticleFieldName",
  //   fieldNameUppercase: "metaFields.relatedArticleFieldNameUppercase",
  //   apiField: "related_article",
  //   headerText: "metaFields.relatedArticleFieldHeader",
  //   explainerText: "metaFields.relatedArticleFieldDescription",
  //   buttonText: "metaFields.relatedArticleFieldButton",
  // },
  // {
  //   menuTitle: "metaFields.publishedUrlFieldTitle",
  //   charLimit: publishedUrlLimit,
  //   fieldAccessor: (x) => x.publishedUrl,
  //   fieldName: "metaFields.publishedUrlFieldName",
  //   fieldNameUppercase: "metaFields.publishedUrlFieldNameUppercase",
  //   apiField: "published_url",
  //   headerText: "metaFields.publishedUrlFieldHeader",
  //   explainerText: "metaFields.publishedUrlFieldDescription",
  //   buttonText: "metaFields.publishedUrlFieldButton",
  // },
];
