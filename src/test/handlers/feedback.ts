import { rest } from "msw";
import {
  dataHandler,
  emptyHandler,
  loadingHandler,
  errorHandler,
} from "./utils";

const API_URL = "https://api.baserow.io/api/database/rows/table/*/*";

export const feedback = {
  data: rest.post(API_URL, dataHandler({})),
  empty: rest.post(API_URL, emptyHandler()),
  loading: rest.post(API_URL, loadingHandler),
  error: rest.post(API_URL, errorHandler),
};
