import React, { useEffect, useState } from "react";
import {
  Modal,
  DirectionalHint,
  Callout,
  Spinner,
  SpinnerSize,
  PrimaryButton,
} from "@fluentui/react";
import styles from "./AssignSubmissionPopup.module.css";
import { Icon } from "@fluentui/react/lib/Icon";
import { mergeStyles } from "@fluentui/react/lib/Styling";
import { axiosPrivateCall } from "../constants";

const customStyles = {
  "*": {
    backgroundColor: "red",
  },
};

const customButtonStyle = mergeStyles({
  height: "27px",
  width: "80px",
  fontSize: "13px",
  fontWeight: "600",
  marginTop: "7px",
  marginLeft: "84px",
});

function AssignSubmissionPopup({ selectedIds, isOpen, onRequestClose }) {
  const [newcandidatelist, setNewCandidateList] = useState([]);
  const token = localStorage.getItem("token");
  let base64Url = token.split(".")[1];
  let decodedValue = JSON.parse(window.atob(base64Url));
  const userId = decodedValue.user_id;

  const [mydemand, setMyDemand] = useState([]);
  const [status, getStatus] = useState([]);
  const [calloutVisible, setCalloutVisible] = useState("");
  const [loadingViewReport, setLoadingViewReport] = useState(false);
  const [loadingSubmitMap, setLoadingSubmitMap] = useState({});
  const [isCalloutOpen, setIsCalloutOpen] = useState(false);
  const [isCalloutOpen1, setIsCalloutOpen1] = useState(false);
  const [submissonData, setSubmissionData] = useState([]);
  console.log(submissonData, "submision");
  const [hoverCallout, setHoverCallout] = useState("");
  const [hoverCallout1, setHoverCallout1] = useState("");
  const [selectedCart, setSelectedCart] = useState(null);
  const [hasFailedDuplicate, setHasFailedDuplicate] = useState(false);
  const [undoneIds, setUndoneIds] = useState([]);
  const [isCalloutOpenInfo, setIsCalloutOpenInfo] = useState(false);
  const [isCalloutOpenWarning, setIsCalloutOpenWarning] = useState(false);

  const formatDate = (dateString) => {
    const options = { day: "numeric", month: "numeric", year: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  const handleInfoIconClick = (demandId, _id) => {
    setCalloutVisible(_id);
    getDemandSubmission(demandId);
    setIsCalloutOpenInfo(true);
  };

  const handleViewReportClick = (cartId) => {
    setIsCalloutOpenWarning(true);
    setSelectedCart(cartId);
    setLoadingViewReport(true);
  };

  const getDemandSubmission = (demandId, _id) => {
    setCalloutVisible(demandId);
    axiosPrivateCall
      .get(`/api/v1/submission/getDemandSubmission?demandId=${demandId}`)
      .then((response) => {
        setSubmissionData(response.data);
        console.log(response, "response");
      })
      .catch((error) => {
        console.error(error.message || "Error fetching submissions");
      });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosPrivateCall.get(
          `/api/v1/demand/listUserCreatedDemands?user_id=${userId}`
        );
        setMyDemand(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [userId]);

  const addEllipsisToName = (name) => {
    const upper_convert = name.charAt(0).toUpperCase() + name.slice(1);
    if (name.length > 14) {
      let new_name = name.substring(0, 14).padEnd(16, ".");
      let convert_Upper = new_name.charAt(0).toUpperCase() + new_name.slice(1);
      return convert_Upper;
    } else return upper_convert;
  };

  useEffect(() => {
    const getfilteredCandidate = () => {
      const encodedIds = selectedIds
        ?.map((id) => encodeURIComponent(id))
        .join(",");
      const url = `/api/v1/candidate/getSelectedCandidates?candidate_id=${encodedIds}`;
      axiosPrivateCall
        .get(url)
        .then((response) => {
          setNewCandidateList(response.data);
        })
        .catch((e) => {
          console.log(e);
        });
    };
    getfilteredCandidate();
  }, [selectedIds]);

  function removeDuplicates(data, property) {
    if (!Array.isArray(data)) {
      console.error("Data is not an array");
      return data;
    }
    const uniqueIds = new Set();
    const uniqueArray = data.filter((item) => {
      if (!uniqueIds.has(item[property])) {
        uniqueIds.add(item[property]);
        return true;
      }
      return false;
    });
    return uniqueArray;
  }

  const [id, setID] = useState("");

  const submitHandler = (DemandId) => async (e) => {
    try {
      setID(DemandId);
      setLoadingSubmitMap((prevLoadingSubmitMap) => ({
        ...prevLoadingSubmitMap,
        [DemandId]: true,
      }));
      const res = await axiosPrivateCall.post(
        "/api/v1/submission/createbulkSubmission",
        { selectedIds, DemandId }
      );
      const uniqueData = removeDuplicates(res.data.submissionDetails, "id");
      getStatus(uniqueData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingSubmitMap((prevLoadingSubmitMap) => ({
        ...prevLoadingSubmitMap,
        [DemandId]: false,
      }));
    }
  };

  useEffect(() => {
    const hasDuplicates = status.some(
      (cart) => cart.status === "failed(duplicate)"
    );
    setHasFailedDuplicate(hasDuplicates);
  }, [status]);

  const handleCloseCallout = () => {
    setIsCalloutOpen(false);
    setIsCalloutOpen1(false);
    setSelectedCart(null);
  };

  const dismissCallout = () => {
    setIsCalloutOpen(false);
    setIsCalloutOpen1(false);
    if (undoneIds.length > 0) {
      handleDeleteUndoneItems();
    }
  };

  const handleUndoClick = (demandId) => {
    setUndoneIds((prevUndoneIds) => {
      if (prevUndoneIds.includes(demandId)) {
        axiosPrivateCall
          .post(`/api/v1/submission/deleteSubmissionUndone`, { _id: demandId })
          .then((res) => {
            console.log(`Data with DemandId ${demandId} deleted successfully.`);
          })
          .catch((error) => {
            console.error(
              `Error deleting data with DemandId ${demandId}:`,
              error
            );
          });
        return prevUndoneIds.filter((id) => id !== demandId);
      } else {
        return [...prevUndoneIds, demandId];
      }
    });
  };

  const handleDeleteUndoneItems = () => {
    if (isCalloutOpenInfo === true) {
      const updateData = undoneIds.map((id) => ({ _id: id, is_delete: true }));
      axiosPrivateCall
        .post(`/api/v1/submission/deleteSubmissionUndone`, { data: updateData })
        .then((res) => {
          console.log("Bulk update successful.", res.data);
          setUndoneIds([]);
        })
        .catch((error) => {
          console.error("Error during bulk update:", error);
        });
    }
  };

  const close = async () => {
    setIsCalloutOpenInfo(false);
    await handleDeleteUndoneItems(); // Wait for the asynchronous operation to complete
  };

  function getStatusColor(status) {
    switch (status.toLowerCase()) {
      case "failed(duplicate)":
        return "red";
      case "submitted":
        return "green";
      default:
        return ""; // Default color or empty string for no specific color
    }
  }

  return (
    <Modal
      className={styles.modalRadius}
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Assign Submission Modal"
      styles={customStyles}
    >
      <div className={styles.AssignSubmissionPopup}>
        <button className={styles.closeButton} onClick={onRequestClose}>
          <Icon iconName="ChromeClose" />
        </button>

        {mydemand?.map((i) => (
          <div className={styles.mainCard} key={i.DemandId}>
            <div className={styles.id_btn}>
              <div className={styles.idInfo}>
                <div className={styles.idStyle}>{i.DemandId}</div>
                <div className={styles.infoIcon}>
                  <Icon
                    className={styles.icon}
                    iconName="info"
                    id={`buttonId-${i.DemandId}`}
                    onClick={() => handleInfoIconClick(i._id, i.DemandId)}
                  />
                  <div className={styles.tooltip}>View Details</div>
                </div>

                {isCalloutOpenInfo && calloutVisible === i._id && (
                  <Callout
                    role="alert"
                    target={`#buttonId-${i.DemandId}`}
                    onDismiss={() => close()}
                    style={{ height: "250px", width: "500px" }}
                  >
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr className={styles.tableRows}>
                          <th className={styles.tableHeader}>
                            Submission Date
                          </th>
                          <th className={styles.tableHeader1}>ID</th>
                          <th className={styles.tableHeader}>Candidate Name</th>
                          <th className={styles.tableHeader}>Undo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissonData.map((statusItem, statusIndex) => (
                          <tr key={statusIndex} className={styles.tableRow}>
                            <td className={styles.tableCell2}>
                              {formatDate(statusItem.createdAt)}
                            </td>
                            <td
                              className={`${styles.tableCell} ${styles.iconId}`}
                            >
                              <Icon
                                iconName="LocationDot"
                                style={{
                                  fontSize: "16px",
                                  margin: "2px",
                                  marginRight: "2px",
                                  color:
                                  statusItem.lastProfileStatus === "Reject"
                                    ? "#DE1414"
                                    : statusItem.lastProfileStatus === "NotProcessed" || null
                                    ? "#0BA20B"
                                    : "#0078D4",
                                        
                                }}
                              />

                              {statusItem.CandidateId}
                            </td>

                            <td
                              className={styles.tableCell}
                              style={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "100px",
                              }}
                            >
                              {statusItem.candidateName}
                            </td>

                            <td className={styles.tableCell}>
                              {undoneIds.includes(statusItem._id) ? (
                                <p
                                  style={{
                                    color: "#0BA20B",
                                    cursor: "pointer",
                                    width: "33px",
                                  }}
                                  onClick={() =>
                                    handleUndoClick(statusItem._id)
                                  }
                                >
                                  Undone
                                </p>
                              ) : (
                                <Icon
                                  iconName="undo"
                                  styles={{
                                    root: {
                                      cursor: "pointer",
                                      color:
                                        statusItem.lastProfileStatus ===
                                        "NotProcessed"
                                          ? "#909090"
                                          : "#0078D4",
                                      width: "auto",
                                      pointerEvents:
                                        statusItem.lastProfileStatus ===
                                        "NotProcessed"
                                          ? "none"
                                          : "auto",
                                    },
                                  }}
                                  onClick={() =>
                                    handleUndoClick(statusItem._id)
                                  }
                                />
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Callout>
                )}

                <div className={styles.btnIcon}>
                  {status.some(
                    (cart) =>
                      cart.status === "failed(duplicate)" &&
                      cart.demand_id === i._id
                  ) && (
                    <div className={styles.tooltipContainer}>
                      <Icon
                        className={styles.warningIcon}
                        iconName="Warning"
                        onClick={() => handleViewReportClick(i._id)}
                        id={`viewReportButton_${i._id}`}
                      />
                      <div className={styles.tooltipText}>View Report</div>
                    </div>
                  )}

                  {isCalloutOpenWarning && selectedCart === i._id && (
                    <Callout
                      alignTargetEdge={true}
                      isBeakVisible={false}
                      onDismiss={() => setIsCalloutOpenWarning(false)}
                      directionalHint={DirectionalHint.bottomLeftEdge}
                      target={`#viewReportButton_${i._id}`}
                      styles={{
                        root: {
                          fontSize: "12px",
                          width: "300px",
                          marginTop: "5px",
                        },
                      }}
                    >
                      <table>
                        <thead>
                          <tr>
                            <th className={styles.colId}>ID</th>
                            <th className={styles.colName}>Candidate Name</th>
                            <th className={styles.colStatus}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {status
                            // .filter((item) => item.demand_id === i._id)
                            .map((item, index) => (
                              <tr key={index}>
                                <td className={styles.dataStyle}>{item.id}</td>
                                <td className={styles.dataStyle1}>
                                  {item.name}
                                </td>
                                <td
                                  className={styles.dataStyle2}
                                  style={{ color: getStatusColor(item.status) }}
                                >
                                  {item.status}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </Callout>
                  )}

                  <div className={styles.btnDiv}>
                    <PrimaryButton
                      className={styles.submitBtn}
                      text={
                        loadingSubmitMap[i._id]
                          ? "Processing"
                          : hasFailedDuplicate
                          ? "Submit"
                          : "Submit"
                      }
                      onRenderIcon={() => {
                        if (loadingSubmitMap[i._id]) {
                          console.log(id === i._id, "ttss");
                          return <Spinner size={SpinnerSize.xSmall} />;
                        } else if (id === i._id) {
                          return <Icon iconName="CheckMark" />;
                        } else {
                          return "";
                        }
                      }}
                      styles={{
                        root: {
                          height: "17px",
                          width: "53px",
                          marginTop: "7px",
                          fontSize: "12px",
                          right: "0",
                          marginLeft: "110px",
                          // marginRight: "20px"
                        },
                      }}
                      onClick={submitHandler(i._id)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.oneLine}>
              <div className={styles.leftOne}>
                <div className={styles.reqStyle}>Requirement</div>
                <div className={styles.colon}>:</div>

                <div
                  onMouseEnter={() => setHoverCallout(i._id)}
                  onMouseLeave={() => setHoverCallout("")}
                  id={`${i.DemandId}${i._id.replaceAll(" ", "")}`}
                  className={`${styles.titleStyle} `}
                >
                  {addEllipsisToName(i.job_title)}
                  {i.job_title.length >= 14 && hoverCallout === i._id && (
                    <Callout
                      alignTargetEdge={true}
                      bounds={(e) => {
                        console.log("log", e);
                      }}
                      isBeakVisible={false}
                      directionalHint={DirectionalHint.bottomLeftEdge}
                      target={`#${i.DemandId}${i._id.replaceAll(" ", "_")}`}
                    >
                      {i.job_title}
                      {console.log(
                        `ME_${i.DemandId}${i._id.replaceAll(" ", "_")}`,
                        "jobles"
                      )}
                    </Callout>
                  )}
                </div>
              </div>

              <div className={styles.rightOne}>
                <div className={styles.reqStyle1}>Client Name</div>
                <div className={styles.colon}>:</div>

                <div
                  onMouseEnter={() => setHoverCallout1(i.DemandId)}
                  onMouseLeave={() => setHoverCallout1("")}
                  id={`client_${i.DemandId.replaceAll(" ", "")}`}
                  className={`${styles.titleStyle}`}
                >
                  {addEllipsisToName(i.client)}
                  {i.client.length >= 14 && hoverCallout1 === i.DemandId && (
                    <Callout
                      alignTargetEdge={true}
                      bounds={(e) => {
                        console.log("log", e);
                      }}
                      isBeakVisible={false}
                      directionalHint={DirectionalHint.bottomLeftEdge}
                      target={`#client_${i.DemandId.replaceAll(" ", "")}`}
                    >
                      {i.client}
                    </Callout>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.oneLine}>
              <div className={styles.leftOne}>
                <div className={styles.reqStyle}>created Date</div>
                <div className={styles.colon}>:</div>
                <div>{formatDate(i.createdAt)}</div>
              </div>

              <div className={styles.rightOne}>
                <div className={styles.reqStyle2}>Created by</div>
                <div className={styles.colon}>:</div>
                <div>{i.created_by.first_name}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default AssignSubmissionPopup;
