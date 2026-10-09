export type EmailRenderResponse = {
  subject: `Plancake - ${string}`;
  html: string;
  text: string;
};

export class EmailContextError extends Error {}
