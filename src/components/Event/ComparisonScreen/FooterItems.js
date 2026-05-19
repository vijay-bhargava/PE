import { Box } from "@mui/material";
import { Text } from "../../../global/components/Text";
import { FormattedValue } from "./FormattedValue";

export function FooterSupplierItems({ items }) {
  if (!items.length) {
    return null;
  }

  return items.map((item, index) => (
    <Box
      sx={{
        backgroundColor: "#e0e0e0",
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
      }}
      key={index}
    >
      {item.map((subItem, index) => (
        <Box
          key={subItem.id}
          display="flex"
          alignItems="center"
          justifyContent="center"
          sx={{
            height: "40px",

            borderBottom:
              index < item.length - 1 ? "1px solid #eeeeee" : undefined,
          }}
          px={1.5}
          width="220px"
        >
          <FormattedValue
            value={subItem.value}
            type={subItem.type}
            currency={subItem.currency}
          />
        </Box>
      ))}
    </Box>
  ));
}

export function FooterItems({ items }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box
      sx={{
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
      }}
      minWidth="170px"
    >
      {items.map((item) => (
        <Box key={item.id}>
          <Box
            sx={{ height: "40px", backgroundColor: "#185bac" }}
            px={1.5}
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
          >
            <Text color="white" textTransform="uppercase">
              {item.name}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
