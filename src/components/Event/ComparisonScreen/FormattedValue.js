import { useMemo } from "react";
import { Text } from "../../../global/components/Text";

// FormattedValue component for displaying different types of values
export function FormattedValue({ value, type, currency }) {
  const transformedValue = useMemo(() => {
    switch (type) {
      case "amount":
        if (currency) {
          // Format amount with currency and proper number formatting
          const formattedValue = new Intl.NumberFormat(
            new Intl.NumberFormat().resolvedOptions().locale,
            {
              minimumFractionDigits: 0,
              style: "currency",
              currency,
            }
          ).format(value);
          return `${formattedValue} ${currency}`;
        }
        return value;
      case "number":
        // Format numbers with proper thousand separators
        return new Intl.NumberFormat(
          new Intl.NumberFormat().resolvedOptions().locale,
          {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
          }
        ).format(value);
      case "text":
      default:
        // Display text as is
        return value;
    }
  }, [value, type, currency]);

  return <Text textAlign="center">{transformedValue}</Text>;
}
