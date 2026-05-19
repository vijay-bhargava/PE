import React, { useEffect, useState } from 'react';
import { api, ApiClient } from '../../Apiclient';
import { useStateValue } from '../../store';
import { buildQueryParams } from '../../utils/common/utility';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

const SupplierTechnicalResponses = ({ EventId }) => {
  const [
    { atoken, customerid,customersuffix},
    dispatch,
    thousands_separators,
  ] = useStateValue();
  const apiClient = new ApiClient(customersuffix);
  const [responseList, setResponseList] = useState([]);

  useEffect(() => {
    getSupplierTechnicalResponses();
  }, []);

  const getSupplierTechnicalResponses = async () => {
    const data = {
      CustomerId: customerid,
      EventId: EventId,
      Stage: 'Technical Approval',
    };
    const queryParams = buildQueryParams(data);
    const res = await apiClient.getres(`/api/activitydetail/Find?${queryParams}`, atoken);
    if (res) {
      const result = res?.data?.result;
      
      setResponseList(result);
    }
  };

  return (
    <div>
     
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="supplier technical responses table">
          <TableHead>
            <TableRow>
              <TableCell>Approver Name</TableCell>
              <TableCell>Trade Name</TableCell>
              <TableCell>Action Type</TableCell>
              <TableCell>Remarks</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responseList && responseList?.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.userName}</TableCell>
                <TableCell>{row.tradeName}</TableCell>
                <TableCell>{row.actionType}</TableCell>
                <TableCell>{row.remarks}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default SupplierTechnicalResponses;
