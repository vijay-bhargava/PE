import { useState, useCallback, useMemo } from "react";
// import { data } from "./sampleData";

// Custom hook for processing comparison table data and managing expansion state
export function useComparisonTableData(tableData) {
  const [isItemExpanded, setItemExpanded] = useState(() => new Set());

  const toggleExpanded = useCallback((id) => {
    setItemExpanded((prev) => {
      const cloned = new Set(prev);
      if (prev.has(id)) {
        cloned.delete(id);
      } else {
        cloned.add(id);
      }
      return cloned;
    });
  }, []);

  const processedData = useMemo(() => {
    if (!tableData.items || !tableData.suppliers) {
      return { comparisonItems: [], suppliers: [] };
    }

    // Process comparison items (extract unique properties by name)
    const comparisonItems = tableData.items.map((item) => {
      const uniqueProperties = item.properties
        ? item.properties.reduce((acc, property) => {
            const existingProperty = acc.find((p) => p.name === property.name);
            if (!existingProperty) {
              acc.push({
                name: property.name,
                type: property.type,
                currency: property.currency,
              });
            }
            return acc;
          }, [])
        : [];

      return {
        ...item,
        properties: uniqueProperties,
      };
    });

    // Process suppliers (map with their properties)
    const mappedSuppliers = [];
    tableData.suppliers.forEach((supplier) => {
      const supplierItems = [];

      // For each item, find properties that belong to this supplier
      tableData.items.forEach((item) => {
        // ;
        if (item.properties) {
          // Find properties that match this supplier's ID
          const supplierProperties = item.properties.filter(
            (prop) =>
              prop.supplier_Id === supplier.id ||
              prop.supplier_id === supplier.id
          );

          if (!supplierProperties.length) {
            return;
          }

          // Add empty row for item name column
          supplierItems.push({ isEmptyRow: true });

          // Group properties by name to avoid duplicates
          const uniqueProperties = supplierProperties.reduce((acc, prop) => {
            const existing = acc.find((p) => p.name === prop.name);
            if (!existing) {
              acc.push({
                name: prop.name,
                value: prop.value,
                type: prop.type,
                currency: prop.currency,
                supplier_id: prop.supplier_Id || prop.supplier_id,
              });
            }
            return acc;
          }, []);

          // Add each unique property as a separate item
          uniqueProperties.forEach((prop) => {
            supplierItems.push({
              id: `${supplier.id}-${item.id}-${prop.name}`,
              itemId: item.id,
              supplierId: supplier.id,
              name: prop.name,
              value: prop.value,
              type: prop.type,
              currency: prop.currency,
              isEmptyRow: false,
            });
          });
        }
      });

      if (supplierItems.length > 0) {
        const mappedSupplier = {
          ...supplier,
          items: supplierItems,
        };

        mappedSuppliers.push(mappedSupplier);
      }
    });

    return {
      comparisonItems,
      suppliers: mappedSuppliers,
    };
  }, [tableData]);

  // lets process the footer items with useMemo
  const processedFooterItems = useMemo(() => {
    const footerItems = tableData.footer?.items ?? [];

    if (!footerItems) {
      return { comparisonItems: [], suppliers: [] };
    }

    const comparisonItems = footerItems.map((item) => {
      return {
        id: item.id,
        name: item.name,
      };
    });

    const supplierMap = {};

    footerItems.forEach((item) => {
      item.properties.forEach((property) => {
        supplierMap[property.supplier_id] =
          supplierMap[property.supplier_id] ?? [];

        const supplier = supplierMap[property.supplier_id];
        supplier.push(property);
      });
    });

    return {
      comparisonItems,
      suppliers: supplierMap,
    };
  }, [tableData]);

  return {
    ...processedData,
    footerItems: processedFooterItems,
    isItemExpanded,
    toggleExpanded,
  };
}
