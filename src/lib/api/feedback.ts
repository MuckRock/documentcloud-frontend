// Feedback is submitted to a Baserow table via the API

const BASEROW_API_TOKEN = process.env.BASEROW_API_TOKEN;
const BASEROW_FEEDBACK_TABLE_ID = process.env.BASEROW_FEEDBACK_TABLE;

export interface Feedback {
  Type: string;
  Message: string;
  User: string;
}

export interface CreateFeedbackResponse {
  id: number;
  order: number;
  ID: string;
  Message: string;
  Type: {
    id: number;
    value: string;
    color: string;
  };
  User: string;
}

export async function createFeedback(
  feedback: Feedback,
  fetch = globalThis.fetch,
): Promise<CreateFeedbackResponse | null> {
  const res = await fetch(
    `https://api.baserow.io/api/database/rows/table/${BASEROW_FEEDBACK_TABLE_ID}/?user_field_names=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${BASEROW_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(feedback),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(`${data.detail}`);
  return data;
}
