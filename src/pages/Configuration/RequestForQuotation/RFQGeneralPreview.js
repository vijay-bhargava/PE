import React, { useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import { HiPencilAlt } from "react-icons/hi";
import { useStateValue } from "../../../store";
import {
  findStringByValueFromArray,
} from "../../../utils/common";
import { formatDateViaLocale2 } from "../../../utils/common/utility";

const stripHtml = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || "";
};

const RFQGeneralPreview = ({
  formik,
  purchaseAllList,
  purchaseGroupAllList,
  stagearray,
  currentStage,
  handletabEdit,
}) => {
  const [{ userDetail }] = useStateValue();

  const plainDescription = useMemo(
    () => stripHtml(formik.values.description),
    [formik.values.description]
  );

  const plainTerms = useMemo(
    () => stripHtml(formik.values.termandcondition),
    [formik.values.termandcondition]
  );

  const canEditOverview =
    (stagearray?.includes(currentStage) || currentStage === "Under Approval") &&
    typeof handletabEdit === "function";

  const rows = [
    ["RFQ Subject:", formik.values.subject || "-"],
    ["Start Date/Time:", formatDateViaLocale2(formik?.values?.startDate, userDetail) || "-"],
    ["End Date/Time:", formatDateViaLocale2(formik?.values?.endDate, userDetail) || "-"],
    ["Requisitioner:", formik.values?.requisitioner || "-"],
    ["Sealed Bid:", formik.values?.RFQType === "closed" ? "YES" : "NO"],
    ["BOQ:", formik.values.boqReq ? "YES" : "NO"],
    ["Base Currency:", formik.values.baseCurrency || userDetail?.defaultCurrency || "-"],
    [
      "Purchase Group:",
      findStringByValueFromArray(
        purchaseGroupAllList,
        formik.values?.purchGrpId?.id,
        "id",
        "groupName"
      ) || "-",
    ],
    [
      "Purchase Org:",
      findStringByValueFromArray(
        purchaseAllList,
        formik.values?.purchOrgId?.id,
        "id",
        "orgName"
      ) || "-",
    ],
  ];

  return (
    <div className="rfq-dv2-overview">
      {canEditOverview && (
        <IconButton
          className="rfq-dv2-overview-edit"
          size="small"
          onClick={() => handletabEdit(1)}
        >
          <HiPencilAlt className="f17 text-primary" />
        </IconButton>
      )}

      {rows.map(([label, detail]) => (
        <div className="rfq-dv2-detail-row" key={label}>
          <div className="rfq-dv2-detail-label">{label}</div>
          <div className="rfq-dv2-detail-value">{detail}</div>
        </div>
      ))}

      <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
        <div className="rfq-dv2-detail-label">RFQ Description:</div>
        <div className="rfq-dv2-text-panel">{plainDescription || "-"}</div>
      </div>

      <div className="rfq-dv2-detail-row rfq-dv2-detail-row-text">
        <div className="rfq-dv2-detail-label">Terms & Conditions:</div>
        <div className="rfq-dv2-text-panel">{plainTerms || "-"}</div>
      </div>
    </div>
  );
};

export default RFQGeneralPreview;
