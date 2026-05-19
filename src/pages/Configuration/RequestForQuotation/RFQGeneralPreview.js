import React, { useState, useMemo } from 'react'
import { formatDateViaLocale, formatDateViaLocale2, formatDateViaLocalet, formatDateViaTime, formatDateViaTimeZone, formattimeoption, renderHtmlAsText } from '../../../utils/common/utility'
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
	CardContent,
	Box
} from "@mui/material";
import { findStringByValueFromArray } from '../../../utils/common';
import { HiPencilAlt } from 'react-icons/hi';

const RFQGeneralPreview = ({formik,inputList,purchaseAllList,purchaseGroupAllList,customClassName, stagearray, currentStage, handletabEdit}) => {
    const navigate = useNavigate();
	const [{ atoken, rtoken, customerid,customersuffix,roleClaims, userDetail }, dispatch] =
		useStateValue();
	const apiClient = new ApiClient(customersuffix);
	
    const [showTable, setShowTable] = useState(true);

    function getPlainTextFromHtml(html) {
      if (!html) return '';
      const temp = document.createElement('div');
      temp.innerHTML = html;
      return temp.textContent || '';
    }

    const plainDescription = useMemo(() => {
      return getPlainTextFromHtml(formik.values.description);
    }, [formik.values.description]);

  return (
    <Box sx={{ p: 3, overflow: 'hidden', ...(customClassName && customClassName !== 'none' ? { className: customClassName } : {}) }}>
      
      {/* RFQ General Details Card */}
      <Card sx={{ mb: 3, boxShadow: 2 }}>
        <CardHeader
          title=""
          sx={{ backgroundColor: '#ffffff', py: 1.5 }}
          titleTypographyProps={{ fontSize: '14px', fontWeight: 400 }}
          action={
            (stagearray?.includes(currentStage) || currentStage === 'Under Approval') && (
              <IconButton size="small" onClick={() => handletabEdit(1)}>
                <HiPencilAlt className="f17 text-primary" />
              </IconButton>
            )
          }
        />
        <CardContent>
          <div className="row">
            
            {/* RFQ Subject */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>RFQ Subject:</strong></Typography>
              <Typography variant="body1">{formik.values.subject || 'Not specified'}</Typography>
            </div>

            {/* Start Date */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Start Date/Time:</strong></Typography>
              <Typography variant="body1">{formatDateViaLocale2(formik?.values?.startDate, userDetail) || '—'}</Typography>
            </div>

            {/* End Date */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>End Date/Time:</strong></Typography>
              <Typography variant="body1">{formatDateViaLocale2(formik?.values?.endDate, userDetail) || '—'}</Typography>
            </div>

            {/* Requisitioner */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Requisitioner:</strong></Typography>
              <Typography variant="body1">{formik.values?.requisitioner || '—'}</Typography>
            </div>

            {/* Sealed Bid */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Sealed Bid:</strong></Typography>
              <Typography variant="body1">{formik.values?.RFQType === "closed" ? "Yes" : "No"}</Typography>
            </div>
            
            {/* Bid Open Date */}
            {formik.values?.RFQType === "closed" && (
              <div className="col-md-6 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Bid Open Date:</strong></Typography>
                <Typography variant="body1">{formatDateViaLocale2(formik?.values?.bidOpeningDate, userDetail) || '—'}</Typography>
              </div>
            )}

            {/* BOQ */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>BOQ:</strong></Typography>
              <Typography variant="body1">{formik.values.boqReq ? "Yes" : "No"}</Typography>
            </div>

            {/* Base Currency */}
            {formik.values?.baseCurrency && (
              <div className="col-md-6 mb-3">
                <Typography variant="body2" color="textSecondary"><strong>Base Currency:</strong></Typography>
                <Typography variant="body1">{formik.values.baseCurrency || userDetail?.defaultCurrency}</Typography>
              </div>
            )}

            {/* Purchase Org */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Purchase Org:</strong></Typography>
              <Typography variant="body1">
                {findStringByValueFromArray(purchaseAllList, formik.values?.purchOrgId?.id, "id", "orgName") || '—'}
              </Typography>
            </div>

            {/* Purchase Group */}
            <div className="col-md-6 mb-3">
              <Typography variant="body2" color="textSecondary"><strong>Purchase Group:</strong></Typography>
              <Typography variant="body1">
                {findStringByValueFromArray(purchaseGroupAllList, formik.values?.purchGrpId?.id, "id", "groupName") || '—'}
              </Typography>
            </div>

            {/* RFQ Description */}
            <div className="col-12">
              <Typography variant="body2" color="textSecondary"><strong>RFQ Description:</strong></Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #e0e0e0', borderRadius: '4px', p: 1 }}>
                {formik.values.description?.replace(/<\/?[^>]+(>|$)/g, "") || '—'}
              </Typography>
            </div>

            {/* Terms & Conditions */}
            <div className="col-12 mt-2">
              <Typography variant="body2" color="textSecondary"><strong>Terms & Conditions:</strong></Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', border: '1px solid #e0e0e0', borderRadius: '4px', p: 1 }}>
                {formik.values.termandcondition?.replace(/<\/?[^>]+(>|$)/g, "") || '—'}
              </Typography>
            </div>

          </div>
        </CardContent>
      </Card>
    </Box>
  )
}

export default RFQGeneralPreview;
