type PublicId = { public_id: string };

type IsYou = { is_you: boolean };

type ParticipantData = PublicId & {
  display_name: string;
  joined_at: string;
  updated_at: string;
  time_zone: string;
  availability: string[];
};

export type LiveUpdateAddUpdateEvent = {
  action: "add" | "update";
} & ParticipantData &
  IsYou;

export type LiveUpdateRemoveEvent = { action: "remove" } & PublicId & IsYou;

export type LiveUpdateEventEditEvent = { action: "event_edit" } & IsYou;

export type LiveUpdateEvent =
  | LiveUpdateAddUpdateEvent
  | LiveUpdateRemoveEvent
  | LiveUpdateEventEditEvent;
