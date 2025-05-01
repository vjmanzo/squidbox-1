import { createContext, useContext } from "react";

type Dimensions = {
  width: number;
  height: number;
};

export const DimensionsContext = createContext<Dimensions | undefined>(
  undefined,
);

export const useDimensions = () => {
  const context = useContext(DimensionsContext);
  if (!context) {
    throw new Error("useDimensions must be used within a DimensionsProvider");
  }
  return context;
};
