export type MarkdocContent = {
  $$mdtype: string;
  attributes: object;
  children: (
    | {
        $$mdtype: string;
        children: string[];
        name: "Heading";
        attributes: {
          level: number;
          id: string;
        };
      }
    | {
        $$mdtype: string;
        children: string[];
        name: "p";
        attributes: Record<string, never>;
      }
  )[];
  name: string;
};
