import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';

function TableDCell() {
  const [hideRows, setHideRows] = useState({});
  const [disableRows, setDisableRows] = useState({});
  const [hideColumns, setHideColumns] = useState({});
  const [disableColumns, setDisableColumns] = useState({});

  const toggleHideRow = (rowKey) => {
    setHideRows((prevHideRows) => ({
      ...prevHideRows,
      [rowKey]: !prevHideRows[rowKey],
    }));
  };

  const toggleDisableRow = (rowKey) => {
    setDisableRows((prevDisableRows) => ({
      ...prevDisableRows,
      [rowKey]: !prevDisableRows[rowKey],
    }));
  };

  const toggleHideColumn = (columnKey) => {
    setHideColumns((prevHideColumns) => ({
      ...prevHideColumns,
      [columnKey]: !prevHideColumns[columnKey],
    }));
  };

  const toggleDisableColumn = (columnKey) => {
    setDisableColumns((prevDisableColumns) => ({
      ...prevDisableColumns,
      [columnKey]: !prevDisableColumns[columnKey],
    }));
  };

  const isRowHidden = (rowKey) => !!hideRows[rowKey];
  const isRowDisabled = (rowKey) => !!disableRows[rowKey];
  const isColumnHidden = (columnKey) => !!hideColumns[columnKey];
  const isColumnDisabled = (columnKey) => !!disableColumns[columnKey];

  return (
    <div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>
                <strong>Column 1</strong>
                <Switch
                  checked={isColumnHidden('column1')}
                  onChange={() => toggleHideColumn('column1')}
                />
                <Switch
                  checked={isColumnDisabled('column1')}
                  onChange={() => toggleDisableColumn('column1')}
                />
              </TableCell>
              <TableCell>
                <strong>Column 2</strong>
                <Switch
                  checked={isColumnHidden('column2')}
                  onChange={() => toggleHideColumn('column2')}
                />
                <Switch
                  checked={isColumnDisabled('column2')}
                  onChange={() => toggleDisableColumn('column2')}
                />
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>
                <strong>Row 1</strong>
                <Switch
                  checked={isRowHidden('row1')}
                  onChange={() => toggleHideRow('row1')}
                />
                <Switch
                  checked={isRowDisabled('row1')}
                  onChange={() => toggleDisableRow('row1')}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  disabled={isRowDisabled('row1') || isColumnDisabled('column1')}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  disabled={isRowDisabled('row1') || isColumnDisabled('column2')}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <strong>Row 2</strong>
                <Switch
                  checked={isRowHidden('row2')}
                  onChange={() => toggleHideRow('row2')}
                />
                <Switch
                  checked={isRowDisabled('row2')}
                  onChange={() => toggleDisableRow('row2')}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  disabled={isRowDisabled('row2') || isColumnDisabled('column1')}
                />
              </TableCell>
              <TableCell>
                <input
                  type="text"
                  disabled={isRowDisabled('row2') || isColumnDisabled('column2')}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

export default TableDCell;
