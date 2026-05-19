import React, { useState } from 'react'
import {
  formatDateViaLocale,
  formatDateViaLocale2,
  formatDateViaLocalet,
  formatDateViaTime,
  formatDateViaTimeZone,
  formattimeoption,
  renderHtmlAsText
} from '../../../utils/common/utility';

import { useNavigate } from 'react-router-dom';
import { api, ApiClient } from '../../../Apiclient';
import { useStateValue } from '../../../store';

import IconButton from "@mui/material/IconButton";
import {
  Close,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";

import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Input,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  createFilterOptions,
  Card,
  CardHeader,
  CardContent
} from "@mui/material";

import { findStringByValueFromArray } from '../../../utils/common';


const NFAGeneralPreview = ({ formik, purchaseAllList, purchaseGroupAllList, customClassName }) => {

  const navigate = useNavigate();
  const [{ atoken, rtoken, customerid, customersuffix, roleClaims, userDetail }, dispatch] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [showTable, setShowTable] = useState(true);

  return (
    <>

      <Card className={`mb-3 ${customClassName ? customClassName : ''}`} sx={{ boxShadow: 2, borderRadius: "8px" }}>
        <CardHeader
          title=""
          sx={{ py: 1.5 }}
          titleTypographyProps={{
            fontSize: "14px",
            fontWeight: 400,
            color: "inherit"
          }}
        />

        <CardContent sx={{ p: 3 }}>
          <div className="row mt-2">

            {/* NFA Subject */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>NFA Subject:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaSubject}</Typography>
            </div>

            {/* Event Type */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>Event Type:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaEventType?.eventType}</Typography>
            </div>

            {/* Event Details */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>Event Details:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaEventId?.subject}</Typography>
            </div>

            {/* Amount */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>Amount:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaAmount}</Typography>
            </div>

            {/* Budget */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>Budget:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaBudget}</Typography>
            </div>

            {/* Savings */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary">
                <strong>Savings:</strong>
              </Typography>
              <Typography variant="body1">{formik.values?.nfaSaving}</Typography>
            </div>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Purchase Org */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Purchase Org:</strong></Typography>
              <Typography variant="body1">
                {findStringByValueFromArray(
                  purchaseAllList,
                  formik.values?.purchOrgId?.id,
                  "id",
                  "orgName"
                )}
              </Typography>
            </div>

            {/* Purchase Group */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Purchase Group:</strong></Typography>
              <Typography variant="body1">
                {findStringByValueFromArray(
                  purchaseGroupAllList,
                  formik.values?.purchGrpId?.id,
                  "id",
                  "groupName"
                )}
              </Typography>
            </div>

            {/* Spend Type */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Type of Spend:</strong></Typography>
              <Typography variant="body1">{formik.values?.spendId?.spend}</Typography>
            </div>

            {/* Category */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Category:</strong></Typography>
              <Typography variant="body1">{formik.values?.categoryId?.categoryName}</Typography>
            </div>

            {/* Project Name (Conditional) */}
            {formik.values?.categoryId?.id == 1 && (
              <div className="col-12 col-md-4 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Project Name:</strong></Typography>
                <Typography variant="body1">{formik.values?.projectId?.project}</Typography>
              </div>
            )}

            {formik.values?.categoryId?.id == 2 && (
              <div className="col-12 col-md-4 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Project Name:</strong></Typography>
                <Typography variant="body1">{formik.values?.projectName}</Typography>
              </div>
            )}

            {/* Exception */}
            <div className="col-12 col-md-4 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Exception:</strong></Typography>
              <Typography variant="body1">{formik.values?.exceptionId?.exception}</Typography>
            </div>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* NFA Description */}
            <div className="col-12 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>NFA Description:</strong></Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {formik.values?.nfaDescription?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
              </Typography>
            </div>

            <Divider sx={{ width: "100%", my: 2 }} />

            {/* Remarks */}
            <div className="col-12">
              <Typography variant="body2" color="textSecondary"><strong>Remarks:</strong></Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
                {formik.values?.remarks?.replace(/<\/?[^>]+(>|$)/g, "") || ""}
              </Typography>
            </div>

          </div>
        </CardContent>
      </Card>

    </>
  )
}

export default NFAGeneralPreview;
