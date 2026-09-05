import React, { useMemo } from "react";
import { findStringByValueFromArray } from "../../../utils/common";

const stripHtml = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || "";
};

const NFAGeneralPreview = ({
  formik, purchaseAllList,
  purchaseGroupAllList, customClassName
}) => {
  const plainDescription = useMemo(
    () => stripHtml(formik.values?.nfaDescription),
    [formik.values?.nfaDescription]
  );

  const plainRemarks = useMemo(
    () => stripHtml(formik.values?.remarks),
    [formik.values?.remarks]
  );

  const projectName =
    formik.values?.categoryId?.id === 1
      ? formik.values?.projectId?.project
      : formik.values?.categoryId?.id === 2
        ? formik.values?.projectName
        : null;

  const rows = [
    ["NFA Subject:", formik.values?.nfaSubject || "-"],
    ["Event Type:", formik.values?.nfaEventType?.eventType || "-"],
    ["Event Details:", formik.values?.nfaEventId?.subject || "-"],
    ["Amount:", formik.values?.nfaAmount ?? "-"],
    ["Budget:", formik.values?.nfaBudget ?? "-"],
    ["Savings:", formik.values?.nfaSaving ?? "-"],
    [
      "Purchase Org:",
      findStringByValueFromArray(purchaseAllList, formik.values?.purchOrgId?.id, "id", "orgName") || "-",
    ],
    [
      "Purchase Group:",
      findStringByValueFromArray(purchaseGroupAllList, formik.values?.purchGrpId?.id, "id", "groupName") || "-",
    ],
    ["Type of Spend:", formik.values?.spendId?.spend || "-"],
    ["Category:", formik.values?.categoryId?.categoryName || "-"],
    ...(projectName != null ? [["Project Name:", projectName || "-"]] : []),
    ["Exception:", formik.values?.exceptionId?.exception || "-"],
  ];

  return (
    <div style={{ padding: "16px" }}>
      <div className={`rfq-dv2-overview${customClassName ? ` ${customClassName}` : ""}`}>
        {rows.map(([label, value]) => (
          <div className="rfq-dv2-detail-row" key={label}>
            <div className="rfq-dv2-detail-label">{label}</div>
            <div className="rfq-dv2-detail-value">{value}</div>
          </div>
        ))}

        <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
          <div className="rfq-dv2-detail-label">NFA Description:</div>
          <div className="rfq-dv2-text-panel">{plainDescription || "-"}</div>
        </div>

        <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
          <div className="rfq-dv2-detail-label">Remarks:</div>
          <div className="rfq-dv2-text-panel">{plainRemarks || "-"}</div>
        </div>
      </div>
    </div>
  );
};

export default NFAGeneralPreview;
