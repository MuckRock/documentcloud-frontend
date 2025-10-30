import { http } from "msw";
import {
  dataHandler,
  emptyHandler,
  loadingHandler,
  errorHandler,
} from "./utils";

const API_URL = "https://api.baserow.io/api/database/rows/table/*/*";

export const feedback = {
  data: http.post(API_URL, dataHandler({})),
  empty: http.post(API_URL, emptyHandler()),
  loading: http.post(API_URL, loadingHandler),
  error: http.post(API_URL, errorHandler),
};
