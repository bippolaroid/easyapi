export type Primitive = string | number | boolean | null;

export type ValueObject = {
  currentValue: string;
  newValue: string;
  history: string[];
};

export type NestMap = Map<string, ValueObject | NestMap>;
