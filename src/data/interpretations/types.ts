export interface CardInterpretation {
  reversed: PositionPassages;
  upright: PositionPassages;
}

export interface CardPassage {
  passage: string;
}

export type InterpretationFile = Record<
  string,
  Partial<CardInterpretation> | undefined
>;

export type InterpretationMap = Map<string, Partial<CardInterpretation>>;

export type Orientation = "reversed" | "upright";

export type Position =
  | "above"
  | "below"
  | "environment"
  | "future"
  | "obstacle"
  | "outcome"
  | "past"
  | "present"
  | "self";

export type PositionPassages = Partial<Record<Position, CardPassage>>;
