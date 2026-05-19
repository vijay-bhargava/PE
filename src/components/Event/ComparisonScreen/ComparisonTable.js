import { Box } from "@mui/material";
import { KeyboardArrowRight, KeyboardArrowDown } from "@mui/icons-material";
import {
  Heading6,
  Text,
  TextDiv,
  TextSmall,
} from "../../../global/components/Text";
import styles from "./ComparisonTable.module.css";
import { useComparisonTableData } from "./useComparisonTableData";
import { FormattedValue } from "./FormattedValue";
import {data} from "./sampleData"

function ComparisonItems({
  items,
  footerItems,
  isItemExpanded,
  toggleExpanded,
}) {
  if (!items || (Array.isArray(items) && items.length === 0)) {
    return <div>No Data</div>;
  }

  return (
    <Box
      sx={{
        backgroundColor: "#2282d9",
        borderRadius: 2,
        overflow: "hidden",
      }}
      minWidth="170px"
    >
      <Box sx={{ height: "30px" }} />
      {items.map((item) => {
        return (
          <Box key={item.id}>
            <Box
              sx={{ height: "40px", backgroundColor: "#185bac" }}
              px={1.5}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <button
                className={styles.cxComparisonExpandButton}
                onClick={() => toggleExpanded(item.id)}
              >
                {isItemExpanded.has(item.id) ? (
                  <KeyboardArrowDown />
                ) : (
                  <KeyboardArrowRight />
                )}
                <TextDiv color="white" textTransform="uppercase">
                  {item.name}
                </TextDiv>
              </button>
            </Box>

            {isItemExpanded.has(item.id) ? (
              <Box>
                {item.properties &&
                  item.properties.map((property, index) => {
                    return (
                      <Box
                        display="flex"
                        alignItems="center"
                        sx={{
                          height: "40px",
                          borderBottom:
                            index < item.properties.length - 1
                              ? "1px solid #c2c2c2"
                              : undefined,
                        }}
                        key={property.id || property.name}
                        px={1.5}
                        justifyContent="flex-end"
                      >
                        <Text color="white">{property.name}</Text>
                      </Box>
                    );
                  })}
              </Box>
            ) : null}
          </Box>
        );
      })}
      {footerItems && Array.isArray(footerItems) ? (
        <Box>
          {footerItems.map((item) => {
            return (
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
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
}

function SupplierTable({ supplier, footerItem, isItemExpanded }) {
  return (
    <Box id={`supplier-${supplier.id}`}>
      <Box height="100px">
        <Box height="35px" p={1} pb={0}>
          <Heading6>{supplier.name}</Heading6>
        </Box>
           <Box p={1}>
      <TextSmall color="secondary">
        Currency: {supplier.defaultcurrency}
      </TextSmall>
    </Box>
        <Box p={1} pt={0}> 
          
           <TextSmall color="secondary">
      Submission Time: {supplier.submissionDate}
    </TextSmall>
         </Box> 
      
      </Box>

      <Box>
        {supplier.items.map((item, index) => {
          if (item.isEmptyRow) {
            return (
              <Box
                key={`${supplier.id}-empty-${index}`}
                display="flex"
                alignItems="center"
                sx={{ height: "40px", backgroundColor: "#e0e0e0" }}
                px={1.5}
              />
            );
          }

          if (!isItemExpanded.has(item.itemId)) {
            return null;
          }

          return (
            <Box
              key={item.id}
              display="flex"
              alignItems="center"
              justifyContent="center"
              sx={{
                height: "40px",
                borderBottom:
                  index < supplier.items.length - 1
                    ? "1px solid #e0e0e0"
                    : undefined,
              }}
              px={1.5}
            >
              <FormattedValue
                value={item.value}
                type={item.type}
                currency={item.currency}
              />
            </Box>
          );
        })}

        {footerItem && Array.isArray(footerItem) ? (
          <Box>
            {footerItem.map((item, index) => (
              <Box
                key={item.id}
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{
                  height: "40px",
                  borderBottom:
                    index < footerItem.length - 1
                      ? "1px solid #e0e0e0"
                      : undefined,
                }}
                px={1.5}
              >
                <FormattedValue
                  value={item.value}
                  type={item.type}
                  currency={item.currency}
                />
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

function ComparisonTable({ tableData = data, pagination }) {
  // Use single custom hook for data processing and state management
  const {
    comparisonItems,
    suppliers,
    isItemExpanded,
    toggleExpanded,
    footerItems,
  } = useComparisonTableData(data);

  return (
    <Box position="relative" gap={0.5}>
      <Box
        display="flex"
        flexWrap="nowrap"
        gap={0.5}
        sx={{
          overflowX: "auto",
        }}
        pb={2}
      >
        <Box>
          {comparisonItems.length > 0 ? <Box height="70px" /> : null}
          <ComparisonItems
            items={comparisonItems}
            footerItems={footerItems.comparisonItems}
            isItemExpanded={isItemExpanded}
            toggleExpanded={toggleExpanded}
          />
        </Box>
        {suppliers.map((supplier) => (
          <Box
            key={supplier.id}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
              overflow: "hidden",
              flex: "0 0 220px",
            }}
          >
            <SupplierTable
              supplier={supplier}
              isItemExpanded={isItemExpanded}
              footerItem={footerItems.suppliers[supplier.id]}
            />
          </Box>
        ))}
      </Box>
      <Box>
        {pagination}
      </Box>
    </Box>
  );
}

export default ComparisonTable;
