export type Primitive = string | number | boolean | null;
export type CurrentValue = Primitive | Primitive[] | Record<string, any>;

export type ValueObject = {
  currentValue: CurrentValue;
  newValue: string;
  history: string[];
};

export type NestMap = Map<string, ValueObject | NestMap>;
