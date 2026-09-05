import React, { useState, useEffect, useCallback } from "react";
import { Switch, TextField } from "@mui/material";
import { HiOutlineChevronDown, HiOutlineChevronUp, HiDownload, HiOutlineX, HiPencilAlt, HiPlusSm } from "react-icons/hi";
import { AddOutlined } from "@mui/icons-material";
import { useFormik } from "formik";
import { useStateValue } from "../../../store";
import { QuestionFindAll, CategoryFindAll, AddQuestionOption, UpdateQuestion, LibraryFindAll } from "../../../utils/questionlibrary";
import AddUpdateQuestion from "./AddUpdateQuestion";
import { getPurchaseOrg } from "../../../utils/workflow";
import { getMenuMaster } from "../../../utils/common/utility";
import { downloadFilesOnAzure } from "../../../utils/common";
import { toast } from "react-toastify";
import CommonBottomDrawer from "../../../components/CommonBottomDrawer";
import PEModal from "../../../components/PEModal";
import GridSkeleton from "../../../components/Skeleton/gridSkeleton";
import { PETableToolbar } from "../../../components/RFQ/PETableToolbar";
import { PETable } from "../../../components/RFQ/PETable";
import CommonTooltip from "../../../components/commonTooltip";
import '../../../assets/css/manage-rfq-v2.css';
import '../../../assets/css/design-system.css';
import '../../../assets/css/rfq-detail-v2.css';

const QuestionLibrary = () => {
  const [{ atoken, customerid }] = useStateValue();

  const [libraryList, setLibraryList] = useState([]);
  const [questionList, setQuestionList] = useState([]);
  const [catAllList, setCatAllList] = useState([]);
  const [purchaseOrgList, setPurchaseOrgList] = useState([]);
  const [MenuMasterList, setMenuMasterList] = useState([]);

  const [gridloading, setGridloading] = useState(true);
  const [rowLoading, setRowLoading] = useState({});
  const [expandedLibraryId, setExpandedLibraryId] = useState(null);

  const [editRecordData, setEditRecordData] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Options modal
  const [optionsModalOpen, setOptionsModalOpen] = useState(false);
  const [inputList, setInputList] = useState([]);
  const [rowCell, setRowCell] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Search
  const [searchText, setSearchText] = useState('');

  // ── Data fetching ────────────────────────────────────────────────────────────
  const pullLibraryList = useCallback(() => {
    LibraryFindAll({ CustomerId: customerid, LibraryType: 'QuestionLibrary' }, atoken)
      .then(res => { setLibraryList(res || []); setGridloading(false); });
  }, [customerid, atoken]);

  const pullQuestionList = useCallback((libraryId) => {
    QuestionFindAll({ CustomerId: customerid, SortingColumn: 'Id', LibraryId: libraryId }, atoken)
      .then(res => {
        setQuestionList(prev => {
          const filtered = prev.filter(q => q.libraryId !== libraryId);
          return [...filtered, ...(res || [])];
        });
        setRowLoading(prev => ({ ...prev, [libraryId]: false }));
      });
  }, [customerid, atoken]);

  const pullCategoryList = useCallback(() => {
    CategoryFindAll({ CustomerId: customerid, IsActive: 'true' }, atoken)
      .then(res => setCatAllList(res || []));
  }, [customerid, atoken]);

  const pullMenuMaster = useCallback(() => {
    getMenuMaster({ MenuType: 'Event' }, atoken).then(res => setMenuMasterList(res || []));
  }, [atoken]);

  const pullPurchaseOrg = useCallback(() => {
    getPurchaseOrg({ customerId: customerid, isActive: true }, atoken)
      .then(res => { if (Array.isArray(res)) setPurchaseOrgList(res); });
  }, [customerid, atoken]);

  useEffect(() => {
    pullLibraryList();
    pullCategoryList();
    pullPurchaseOrg();
    pullMenuMaster();
  }, []);

  const handleReflectedData = useCallback(() => {
    pullLibraryList();
    if (expandedLibraryId) pullQuestionList(expandedLibraryId);
  }, [pullLibraryList, pullQuestionList, expandedLibraryId]);

  // ── Accordion ────────────────────────────────────────────────────────────────
  const handleRowToggle = (libraryId) => {
    if (expandedLibraryId === libraryId) {
      setExpandedLibraryId(null);
    } else {
      setExpandedLibraryId(libraryId);
      setRowLoading(prev => ({ ...prev, [libraryId]: true }));
      pullQuestionList(libraryId);
    }
  };

  // ── Drawer ───────────────────────────────────────────────────────────────────
  const openDrawer = (record = null) => {
    setEditRecordData(record);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditRecordData(null);
  };

  // ── Status toggle ────────────────────────────────────────────────────────────
  const handleStatus = (row) => {
    const updated = { ...row, isActive: !row.isActive };
    UpdateQuestion(updated, row.id, atoken).then(() => {
      if (expandedLibraryId) pullQuestionList(expandedLibraryId);
    });
  };

  // ── Options modal ────────────────────────────────────────────────────────────
  const openOptionPopup = (row) => {
    setRowCell(row);
    setInputList(
      row?.questionOption?.length
        ? row.questionOption
        : [{ id: 0, customerId: customerid, questionId: row.id, questionOption: '', weightage: 0 }]
    );
    setOptionsModalOpen(true);
  };

  const formikOptions = useFormik({
    initialValues: { questionid: 0, options: [] },
    onSubmit: (values) => {
      setLoadingOptions(true);
      AddQuestionOption(values, atoken).then(() => {
        setLoadingOptions(false);
        setOptionsModalOpen(false);
        if (expandedLibraryId) pullQuestionList(expandedLibraryId);
        toast.success('Options saved');
      });
    },
  });

  const saveOptions = () => {
    formikOptions.setFieldValue('questionid', rowCell?.id);
    formikOptions.setFieldValue('options', inputList);
    formikOptions.handleSubmit();
  };

  // ── Search filter ────────────────────────────────────────────────────────────
  const filteredLibraryList = searchText.trim()
    ? libraryList.filter(item =>
      item.eventType?.toLowerCase().includes(searchText.toLowerCase()) ||
      item.libraryEntity?.toLowerCase().includes(searchText.toLowerCase())
    )
    : libraryList;

  // ── Inner table columns ──────────────────────────────────────────────────────
  const questionsForLibrary = (libraryId) =>
    questionList.filter(q => q.libraryId === libraryId);

  return (
    <>
      <div className="rfq-v2-page">

        {/* Page header */}
        <div className="rfq-v2-page-header">
          <div className="rfq-v2-breadcrumb">
            <span>Settings</span>
            <span className="rfq-v2-breadcrumb-sep">/</span>
            <span>Question Library</span>
          </div>
          <button type="button" className="rfq-v2-create-btn" onClick={() => openDrawer(null)}>
            <AddOutlined /> Add New
          </button>
        </div>

        {/* Main card */}
        <div className="rfq-v2-card">
          {/* Search toolbar */}
          <PETableToolbar
            searchText={searchText}
            onSearchChange={setSearchText}
            searchPlaceholder="Search by event or library…"
          />

          {/* Accordion table */}
          {gridloading ? (
            <div className="rfq-v2-table-wrapper"><GridSkeleton /></div>
          ) : filteredLibraryList.length === 0 ? (
            <div className="rfq-v2-empty-state">
              <p className="f14 mb-0" style={{ color: 'var(--pe-muted)' }}>
                {searchText ? 'No results match your search.' : 'No libraries found for this customer.'}
              </p>
            </div>
          ) : (
            <div className="rfq-v2-table-wrapper" style={{ overflowY: 'auto' }}>
              <table className="w-100" style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--pe-bg, #F9FAFB)', borderBottom: '1px solid var(--pe-border, #e5e7eb)' }}>
                    <th className="f12 fw500 px-3 py-2" style={{ color: 'var(--pe-muted)', textAlign: 'left', flex: 1 }}>Event</th>
                    <th className="f12 fw500 px-3 py-2" style={{ color: 'var(--pe-muted)', textAlign: 'left', flex: 1 }}>Library</th>
                    <th style={{ flex: 1 }} />
                  </tr>
                </thead>
                <tbody>
                  {filteredLibraryList.map((item, index) => {
                    const isExpanded = expandedLibraryId === item.id;
                    const questions = questionsForLibrary(item.id);
                    return (
                      <React.Fragment key={item.id}>
                        <tr
                          onClick={() => handleRowToggle(item.id)}
                          style={{
                            borderBottom: isExpanded ? 'none' : '1px solid var(--pe-border, #e5e7eb)',
                            background: isExpanded ? '#f8faff' : '#fff',
                            cursor: 'pointer',
                          }}
                        >
                          <td className="f13 px-3 py-2" style={{ color: 'var(--pe-muted)' }}>{item.eventType || '-'}</td>
                          <td className="f13 px-3 py-2 fw500" style={{ color: 'var(--pe-text)' }}>{item.libraryEntity || '-'}</td>
                          <td className="px-3 py-2" style={{ textAlign: 'center' }}>
                            <button type="button" className="pe-icon-btn" style={{ color: isExpanded ? 'var(--pe-primary)' : 'var(--pe-muted)' }}>
                              {isExpanded
                                ? <HiOutlineChevronUp style={{ fontSize: 16 }} />
                                : <HiOutlineChevronDown style={{ fontSize: 16 }} />
                              }
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr style={{ borderBottom: '1px solid var(--pe-border, #e5e7eb)', background: '#f8faff' }}>
                            <td colSpan={3} style={{ padding: '0 16px 16px 16px' }}>
                              {rowLoading[item.id] ? (
                                <div className="py-3"><GridSkeleton /></div>
                              ) : questions.length === 0 ? (
                                <p className="f13 py-3 mb-0" style={{ color: 'var(--pe-muted)' }}>
                                  No questions found for <strong>{item.libraryEntity}</strong>.
                                </p>
                              ) : (
                                <div style={{ marginTop: 10, }}>
                                  <PETable
                                    rows={questions}
                                    getRowId={(row) => row.id}
                                    columnHeaderHeight={36}
                                    rowHeight={44}
                                    hideFooter
                                    columns={[
                                      {
                                        field: 'questionCategory', headerName: 'Category', flex: 1, minWidth: 130,
                                        renderCell: (params) => (
                                          <CommonTooltip title={params.value || ''}>
                                            <span className="f13">{params.value || '-'}</span>
                                          </CommonTooltip>
                                        ),
                                      },
                                      {
                                        field: 'questionDescription', headerName: 'Question', flex: 1, minWidth: 180,
                                        renderCell: (params) => (
                                          <CommonTooltip title={params.value || ''}>
                                            <span className="f13" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                              {params.value || '-'}
                                            </span>
                                          </CommonTooltip>
                                        ),
                                      },
                                      {
                                        field: 'optionType', headerName: 'Option', width: 150, sortable: false,
                                        renderCell: (params) => params.value ? (
                                          <button
                                            type="button"
                                            onClick={() => openOptionPopup(params.row)}
                                            style={{
                                              fontSize: 12, fontWeight: 500, cursor: 'pointer',
                                              padding: '3px 10px', height: 26, borderRadius: 6,
                                              border: '1px solid var(--pe-primary, #1976d2)',
                                              color: 'var(--pe-primary, #1976d2)',
                                              background: '#eff6ff',
                                              display: 'inline-flex', alignItems: 'center', gap: 4,
                                            }}
                                          >
                                            View Options
                                          </button>
                                        ) : <span style={{ color: '#9ca3af' }}>-</span>,
                                      },
                                      {
                                        field: 'attachedFileName', headerName: 'Attachment', width: 130, sortable: false,
                                        renderCell: (params) => params.value && params.value !== 'undefined' ? (
                                          <button
                                            type="button"
                                            className="pe-icon-btn pe-icon-btn--download"
                                            aria-label="Download"
                                            onClick={() => downloadFilesOnAzure(params.value, params.value)}
                                          >
                                            <HiDownload />
                                          </button>
                                        ) : <span style={{ color: '#9ca3af' }}>-</span>,
                                      },
                                      {
                                        field: 'mandatory', headerName: 'Mandatory', width: 120,
                                        renderCell: (params) => <span className="f13">{params.value ? 'Yes' : 'No'}</span>,
                                      },
                                      {
                                        field: 'isActive', headerName: 'Status', width: 120, sortable: false,
                                        renderCell: (params) => (
                                          <CommonTooltip title={params.value ? 'Click to deactivate' : 'Click to activate'}>
                                            <Switch size="small" checked={!!params.value} onChange={() => handleStatus(params.row)} />
                                          </CommonTooltip>
                                        ),
                                      },
                                      {
                                        field: 'action', headerName: 'Actions', width: 86, sortable: false,
                                        renderCell: (params) => (
                                          <button type="button" className="pe-icon-btn pe-icon-btn--edit" onClick={() => openDrawer(params.row)}>
                                            <HiPencilAlt />
                                          </button>
                                        ),
                                      },
                                    ]}
                                  />
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Question Drawer */}
      <CommonBottomDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        title={editRecordData ? 'Edit Question' : 'Add Question'}
        sectionStyle={{ display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ overflowY: 'auto', flex: 1 }}
        actions={
          <>
            <button type="button" className="rfq-v2-event-btn rfq-v2-event-btn-ghost" onClick={closeDrawer}>Cancel</button>
            <button type="reset" form="add-question-form" className="pe-btn pe-btn--secondary">Reset</button>
            <button type="submit" form="add-question-form" className="pe-btn pe-btn--primary">
              {editRecordData ? 'Update' : 'Submit'}
            </button>
          </>
        }
      >
        <AddUpdateQuestion
          callbackstep={() => {
            setDrawerOpen(false);
            setEditRecordData(null);
            handleReflectedData();
          }}
          PullCategoryFindAll={pullCategoryList}
          purchaseOrgList={purchaseOrgList}
          catList={catAllList}
          editRecordData={editRecordData}
          pullQuestionList={() => { if (expandedLibraryId) pullQuestionList(expandedLibraryId); }}
          setquestionunsavedChanges={() => { }}
          handleReflectedData={handleReflectedData}
        />
      </CommonBottomDrawer>

      {/* Options Modal */}
      <PEModal
        open={optionsModalOpen}
        onClose={() => setOptionsModalOpen(false)}
        size="sm"
        title="Question Options"
        footer={
          <>
            <button type="button" className="pe-btn pe-btn--secondary" onClick={() => setOptionsModalOpen(false)}>Cancel</button>
            <button type="button" className="pe-btn pe-btn--primary" onClick={saveOptions} disabled={loadingOptions}>
              {loadingOptions ? 'Saving…' : 'Save'}
            </button>
          </>
        }
      >
        <div className="d-flex flex-column gap-2">
          {inputList.map((x, i) => (
            <div key={i} className="d-flex align-items-center gap-2 mb-2">
              <span className="f12" style={{ color: 'var(--pe-muted)', minWidth: 20 }}>{i + 1}.</span>
              <TextField
                size="small" variant="outlined" fullWidth
                placeholder="Option value" required
                value={x.questionOption}
                name="questionOption"
                onChange={e => {
                  const list = [...inputList];
                  list[i].questionOption = e.target.value;
                  setInputList(list);
                }}
              />
              <TextField
                size="small" variant="outlined" style={{ width: 100 }}
                placeholder="Score" type="number"
                value={x.weightage}
                name="weightage"
                onChange={e => {
                  const list = [...inputList];
                  list[i].weightage = e.target.value;
                  setInputList(list);
                }}
              />
              <button
                type="button"
                className="pe-icon-btn pe-icon-btn--delete"
                onClick={() => setInputList(inputList.filter((_, idx) => idx !== i))}
              >
                <HiOutlineX />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="pe-btn pe-btn--link"
            style={{ alignSelf: 'flex-start' }}
            onClick={() =>
              setInputList(
                [...inputList,
                {
                  id: 0, customerId: customerid, questionId:
                    rowCell?.id, questionOption: '', weightage: 0
                }])}
          >
            <HiPlusSm /> Add Option
          </button>
        </div>
      </PEModal>
    </>
  );
};

export default QuestionLibrary;
