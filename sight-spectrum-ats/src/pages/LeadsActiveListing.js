import React, { useEffect, useState } from "react";
import styles from "./ManageEmployee.module.css";
import styles2 from "./LeadsAllListing.module.css";
import AddLeadModal from "./AddLeadModal";
import { DeletePopup } from "../components/DeletePopup";
import {
  PrimaryButton,
  SearchBox,
  Icon,
  initializeIcons,
  TextField,
  Label,
  DatePicker,
} from "@fluentui/react";
import InfiniteScroll from "react-infinite-scroll-component";
import linkedinicon from "../assets/linkedin2.png";
import phone from "../assets/phone.png";
import mail from "../assets/mail.png";
import location from "../assets/location.png";
import website from "../assets/website.png";
import {
  DefaultButton,
  FontIcon,
  Callout,
  DirectionalHint,
} from "@fluentui/react";
import { mergeStyles, mergeStyleSets } from "@fluentui/react";
import { axiosPrivateCall } from "../constants";
import { useNavigate } from "react-router-dom";
import { MessageBar, MessageBarType } from "@fluentui/react";

import viewicon from "../assets/icons/view.svg";
import editicon from "../assets/icons/edit.svg";
import markicon from "../assets/icons/mark.svg";
import deleteicon from "../assets/icons/delete.svg";

const searchIcon = { iconName: "Search" };
const addIcon = { iconName: "Add" };
const dropdownIcon = { iconName: "ChevronDown" };

const messageBarStyles = {
  content: {
    maxWidth: 520,
    minWidth: 450,
  },
};

const calendarClass = (props, currentHover, error, value) => {
  return {
    root: {
      "*": {
        width: "100%",
        fontSize: "12px !important",
        height: "22px !important",
        lineHeight: "20px !important",
        borderColor: error
          ? "rgb(168,0,0)"
          : currentHover === value
          ? "rgb(50, 49, 48) !important "
          : "transparent !important",
        selectors: {
          ":hover": {
            borderColor: "rgb(50, 49, 48) !important",
          },
        },
      },
    },

    icon: { height: 10, width: 10, left: "85%", padding: "0px 0px" },
    statusMessage: { marginBottom: "-25px" },
  };
};

const FieldError = mergeStyleSets({
  fieldGroup: {
    height: "22px",
    minWidth: "80px",
    maxWidth: "120px",
    border: "0.5px solid #a80000",
    // backgroundColor: "#EDF2F6",
    fontSize: "12px",
  },
  field: { fontSize: "12px" },
});

const Field1 = mergeStyleSets({
  fieldGroup: {
    height: "22px",
    minWidth: "80px",
    maxWidth: "120px",
    border: "0.5px solid transparent",
    // backgroundColor: "#EDF2F6",
    fontSize: "12px",
  },
  field: { fontSize: "12px" },
});

const calendarClassActive = mergeStyleSets({
  root: {
    "*": {
      minWidth: "160px",
      maxWidth: "120px",
      fontSize: 12,
      height: "26px !important",
      lineHeight: "20px !important",
      borderColor: "black !important",
    },
  },
  icon: {
    height: "8px !important",
    width: "8px !important",
    left: "80%",
    padding: "0px 0px",
    scale: "90%",
  },
  statusMessage: { marginBottom: "-25px" },
});

const calendarErrorClass = mergeStyleSets({
  root: {
    "*": {
      minWidth: "180px",
      maxWidth: "120px",
      fontSize: 12,
      height: "22px !important",
      lineHeight: "20px !important",
      borderColor: "#a80000",
    },
  },
  icon: {
    height: "8px !important",
    width: "8px !important",
    left: "80%",
    padding: "0px 0px",
    scale: "90%",
    color: "#a80000",
  },
  statusMessage: { marginBottom: "-25px" },
});

const calloutBtnStyles = {
  root: {
    border: "none",
    padding: "0px",
    border: "none",
    padding: "0px",
    width: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};
const iconClass1 = mergeStyles({
  fontSize: 12,
  height: 12,
  width: 12,
  margin: "0 ",
  color: "#999DA0",
  cursor: "pointer",
});

function LeadsAllListing() {
  const [fetchOptions, setFetchOptions] = useState({
    skip: 0,
    limit: 15,
    sort_field: "updatedAt",
    sort_type: -1,
    search_field: "",
  });

  const [rowId, setRowId] = useState("");
  const [updateCallout, setUpdateCallout] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitSuccess, setSubmitSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [deleteId, setDeleteID] = useState("");
  const [isSubmitDel, setSubmitDel] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupVisible1, setPopupVisible1] = useState(false);
  const [LeadsData, getLeadsData] = useState([]);
  console.log(LeadsData.status, "pavi");
  const [updateId, setUpdateId] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [showDeleteMessageBar, setShowDeleteMessageBar] = useState(false);
  const [showMessageBar, setShowMessageBar] = useState(false);
  const [showUpdateMessageBar, setShowUpdateMessageBar] = useState(false);
  const [showStatusMessageBar, setShowstatusMessageBar] = useState(false);
  const [isCalloutVisible, setIsCalloutVisible] = useState(false);
  const [selectedEmployee1, setSelectedEmployee1] = useState(
    Array(LeadsData.length).fill({})
  );
  const [currentHover, setCurrentHover] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(
    Array(LeadsData?.length).fill({})
  );
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [basicInfo1, setBasicInfo1] = useState({
    status: "",
    noOfDemands: "",
    dueDate: null,
  });
  console.log(basicInfo1, "lol");
  const [validationErrors, setValidationErrors] = useState({});
  const [currentLeadId, setCurrentLeadId] = useState();
  const [condition, setCondition] = useState(false);
  console.log(condition, "koo");
  const openPopup = (employee, index) => {
    const newSelectedEmployees = [...selectedEmployee];
    newSelectedEmployees[index] = employee;
    setSelectedEmployee(newSelectedEmployees);
    setPopupVisible(true);
  };

  const openPopup1 = (employee, index) => {
    console.log(index, "emp1");
    const newSelectedEmployees = [...selectedEmployee1];
    newSelectedEmployees[index] = employee;
    setSelectedEmployee1(newSelectedEmployees);
    setPopupVisible(true);
  };

  const closePopup = (index) => {
    const updatedSelectedEmployees = [...selectedEmployee];
    updatedSelectedEmployees[index] = false;
    setSelectedEmployee(updatedSelectedEmployees);
  };

  const closePopup1 = (index) => {
    const updatedSelectedEmployees = [...selectedEmployee1];
    updatedSelectedEmployees[index] = false;
    setSelectedEmployee1(updatedSelectedEmployees);
  };

  const handleStatusChange = (_, option) => {
    setBasicInfo1((prevInfo) => {
      // Ensure that prevInfo.status === 'passive' before updating the state
      if (prevInfo.status === "passive" && option.key === "active") {
        setIsPopupOpen(true);
      }
      return { ...prevInfo, status: option.key };
    });
  };

  const showPopup1 = () => {
    setCondition(true);
  };

  const hidePopup1 = () => {
    setCondition(false);
  };

  const changeStatus = async (leadId, additionalParam) => {
    console.log(condition, "leadddd");
    try {
      let newStatus;
      let updateData = {
        _id: leadId,
        noOfDemands: basicInfo1.noOfDemands,
        dueDate: basicInfo1.dueDate,
      };

      const selectedLead = LeadsData.find((lead) => lead._id === leadId);

      if (!selectedLead) {
        console.error("Lead not found");
        return;
      }

      if (selectedLead.status === "active") {
        newStatus = "passive";
        updateData.noOfDemands = "";
        updateData.dueDate = null;
      } else {
        showPopup1();
        return;
      }

      const response = await axiosPrivateCall.post(
        `/api/v1/leads/updateLead?_id=${leadId}`,
        {
          ...updateData,
          status: newStatus,
        }
      );

      // setShowUpdateMessageBar(true);
      setShowstatusMessageBar(true);
      setCondition(false);
      handleStatusChange(null, { key: newStatus });
      setIsCalloutVisible(false);
    } catch (error) {
      console.error("Error updating lead status", error);
    }

    setBasicInfo1({
      status: "",
      noOfDemands: "",
      dueDate: null,
    });
    // getLeadsdata();
    setCurrentLeadId(null);
  };

  const handleUpdateClick = async () => {
    try {
      if (!basicInfo1.noOfDemands || !basicInfo1.dueDate || !currentLeadId) {
        setValidationErrors({
          noOfDemands: !basicInfo1.noOfDemands,
          dueDate: !basicInfo1.dueDate,
        });
        return;
      }

      try {
        const response = await axiosPrivateCall.post(
          `/api/v1/leads/updateLead?_id=${currentLeadId}`,
          {
            _id: currentLeadId,
            noOfDemands: basicInfo1.noOfDemands,
            dueDate: basicInfo1.dueDate,
            status: "active",
          }
        );

        setIsPopupOpen(false);
        setCondition(false);
        setValidationErrors({});
        hidePopup1();
        setShowUpdateMessageBar(true);
      } catch (error) {
        console.error("Error updating lead status", error);
      }
      getLeadsdata();
      setBasicInfo1({
        status: "",
        noOfDemands: "",
        dueDate: null,
      });
      setCurrentLeadId(null);
      setIsCalloutVisible(false);
    } catch (error) {
      console.error("Error updating lead status", error);
    }
  };

  console.log(LeadsData, "leadsdata");

  const getLeadsdata = () => {
    axiosPrivateCall
      .get(
        `/api/v1/leads/getlead?skip=0&limit=15&sort_field=${fetchOptions.sort_field}&sort_type=${fetchOptions.sort_type}`
      )
      .then((res) => {
        getLeadsData(res.data);
        //  setIsDataLoaded(true)
      })
      .catch((e) => {
        console.log(e);
      });
  };

  useEffect(() => {
    getLeadsdata();
  }, [searchValue, basicInfo1]);

  useEffect(() => {
    if (showMessageBar) {
      setTimeout(() => {
        setShowMessageBar(false);
        setShowDeleteMessageBar(false);
        setShowUpdateMessageBar(false);
        setShowstatusMessageBar(false);
      }, 2000);
    }
  }, [showMessageBar]);

  const deleteEmployee = (id) => {
    setUpdateCallout(!updateCallout);
    setShowPopup(!showPopup);
    console.log(id, "id");
    const deleteObj = { _id: id.employee_id };
    setDeleteID(deleteObj);
    setUpdateId({ _id: id._id });
  };

  const [searchData, setSearchData] = useState([]);
  const [visibleData, setVisibleData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const searchLead = (e) => {
    const searchValue = e;

    if (searchValue === "") {
      getLeadsdata();
      return;
    }

    setSearchData([]);
    setVisibleData([]);
    setHasMore(true);

    axiosPrivateCall
      .get(`api/v1/leads/searchLead?search_field=${searchValue}`)
      .then((res) => {
        const data = res.data.slice(0, 15);
        setSearchData(res.data);
        setVisibleData(data);
        getLeadsData(data);
        setHasMore(res.data.length > 15);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  // Function to fetch more data when scrolling
  const fetchMoreData = () => {
    const currentLength = visibleData.length;
    const remainingData = searchData.slice(currentLength, currentLength + 15);

    if (remainingData.length > 0) {
      setVisibleData([...visibleData, ...remainingData]);
    } else {
      setHasMore(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 20
      ) {
        fetchMoreData();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [visibleData]);

  const handleUpdate = (showpop) => {
    const deleteObj = updateId;
    if (!showpop) {
      setShowPopup(!showPopup);
      axiosPrivateCall
        .post("/api/v1/leads/deleteLead", deleteObj)
        .then((res) => {
          setSubmitDel(!isSubmitDel);
          const updatedLeadsData = LeadsData.filter(
            (lead) => lead._id !== deleteObj._id
          );
          getLeadsData(updatedLeadsData);
          setShowDeleteMessageBar(true);
        })
        .catch((e) => {
          console.log(e);
          setUpdateCallout(false);
        });
    }
  };

  useEffect(() => {
    getLeadsdata();
  }, []);

  const navigateTo = useNavigate();

  const handleOpenPopup = (leadId) => {
    console.log(leadId, "iiiccc");
    setCurrentLeadId(leadId);
    showPopup1();
    // handlePopupOpen(leadId); // This is where you set the currentLeadId
  };

  const LeadActive = LeadsData.filter((i) => i.status === "active");

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <DeletePopup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          handleUpdate={handleUpdate}
          deleteId={deleteId}
          updateCallout={updateCallout}
          setUpdateCallout={setUpdateCallout}
        />
        {isModalOpen && (
          <AddLeadModal
            isModalOpen={isModalOpen}
            setIsModalOpen={setIsModalOpen}
            isSubmitSuccess={isSubmitSuccess}
            setSubmitSuccess={setSubmitSuccess}
            setShowMessageBar={setShowMessageBar}
          />
        )}
        <div className={styles.nav_container}>
          <div className={styles.title}>Leads Listing</div>
          {showMessageBar && (
            <div className={styles2.messagebar}>
              <MessageBar
                onDismiss={() => setShowMessageBar(!showMessageBar)}
                styles={messageBarStyles}
                dismissButtonAriaLabel="Close"
                messageBarType={MessageBarType.success}
              >
                Lead added successfully
              </MessageBar>
            </div>
          )}
          {showDeleteMessageBar && (
            <div className={styles2.messagebar}>
              <MessageBar
                className={styles2.messagebar}
                onDismiss={() => setShowDeleteMessageBar(false)}
                styles={messageBarStyles}
                dismissButtonAriaLabel="Close"
              >
                Lead deleted successfully
              </MessageBar>
            </div>
          )}
          {showUpdateMessageBar && (
            <div className={styles2.messagebar}>
              <MessageBar
                className={styles2.messagebar}
                onDismiss={() => setShowUpdateMessageBar(false)}
                styles={messageBarStyles}
                dismissButtonAriaLabel="Close"
              >
                Lead updated successfully
              </MessageBar>
            </div>
          )}
          {showStatusMessageBar && (
            <div className={styles2.messagebar}>
              <MessageBar
                className={styles2.messagebar}
                onDismiss={() => setShowstatusMessageBar(false)}
                styles={messageBarStyles}
                dismissButtonAriaLabel="Close"
              >
                status changed successfully
              </MessageBar>
            </div>
          )}
          <div className={styles2.nav_itemsnew}>
            {/* <SearchBox
              placeholder=" "
              iconProps={searchIcon}
              className={styles.search}
              showIcon
            /> */}

            <SearchBox
              placeholder="Search"
              iconProps={searchIcon}
              className={styles.search}
              showIcon
              value={searchValue}
              onSearch={(e) => searchLead(e)}
              onChange={(e, newValue) => setSearchValue(newValue)}
            />

            <PrimaryButton
              text="Add Lead"
              iconProps={addIcon}
              onClick={() => {
                setIsModalOpen(!isModalOpen);
                setSubmitSuccess(false);
              }}
            />
          </div>
        </div>

        <div id="scrollableDiv" className={styles2.cardContainer}>
          <InfiniteScroll
            style={{ overflow: "visible", height: "100%" }}
            hasMore={hasMore}
            next={fetchMoreData}
            dataLength={LeadsData.length}
            scrollableTarget="scrollableDiv"
          >
            {LeadActive?.map((employee, index) => (
              <div key={employee.id} className={`${styles2.card}`}>
                <div
                  className={styles2.cardtitle}
                  id={`mainCallout_${employee._id}`}
                >
                  <p
                    onClick={() => {
                      openPopup(employee, index);
                      handleOpenPopup(employee._id);
                    }}
                  >
                    Status :{" "}
                    <span
  className={`${styles2.statusLabel} ${
    employee.status.toLowerCase() === 'active' ? styles2.activeStatus : styles2.passiveStatus
  }`}
>
  {employee.status.toLowerCase() === 'active' ? 'Active' : 'Passive'}
</span>
                  </p>

                  {selectedEmployee[index] && employee.status === "passive" && (
                    <Callout
                      gapSpace={0}
                      target={`#mainCallout_${employee._id}`}
                      onDismiss={() => {
                        closePopup(index);
                        setCurrentLeadId(null); // Reset currentLeadId when closing the popup
                      }}
                      isBeakVisible={false}
                      directionalHint={DirectionalHint.bottomLeftEdge}
                      styles={{
                        root: {
                          height: "200px",
                          width: "400px",
                          zIndex: 3,
                          paddingLeft: "15px",
                          paddingTop: "6px",
                          background: "white",
                          paddingRight: "15px",
                        },
                      }}
                    >
                      {/* Your Callout content */}
                      <div className={styles2.popupContainer}>
                        <Label className={styles2.centeredLabel}>
                          Demand Projection
                        </Label>
                        <br />
                        <br />
                      </div>
                      <div className={`${styles2.popupTitle}`}>
                        <div className={styles2.rowContainer}>
                          <Label className={styles2.popupLabel}>
                            Number of Demands
                          </Label>
                          <TextField
                            value={basicInfo1.noOfDemands}
                            onChange={(e, value) =>
                              setBasicInfo1((prev) => ({
                                ...prev,
                                noOfDemands: value,
                              }))
                            }
                            errorMessage={
                              validationErrors.noOfDemands &&
                              "Please enter the number of demands"
                            }
                          />
                        </div>
                      </div>
                      <br />
                      <div className={`${styles2.popupTitle}`}>
                        <div className={styles2.rowContainer}>
                          <Label className={styles2.popupLabel}>Due Date</Label>
                          <DatePicker
                            className={styles.popupField}
                            placeholder="DD/MM/YYYY"
                            styles={
                              basicInfo1.dueDate
                                ? calendarErrorClass
                                : currentHover === "dueDate"
                                ? calendarClassActive
                                : calendarClass
                            }
                            value={basicInfo1.dueDate}
                            onSelectDate={(date) =>
                              setBasicInfo1((prev) => ({
                                ...prev,
                                dueDate: date,
                              }))
                            }
                            errorMessage={
                              validationErrors.dueDate &&
                              "Please select a due date"
                            }
                          />
                        </div>
                      </div>
                      <br />
                      <PrimaryButton
                        className={styles2.updateButton}
                        text={`Update`}
                        onClick={handleUpdateClick}
                      />
                    </Callout>
                  )}

                  <div className={styles2.titlerightmenu}>
                    <div className={styles2.dimcolor}>
                      <div id={`employeeCallout_${index}`}>
                        <p
                          className={styles2.sourceStyle}
                          onClick={() => openPopup1(employee, index)}
                        >
                          {employee.source}
                        </p>
                      </div>
                      {selectedEmployee1[index] && (
                        <Callout
                          gapSpace={0}
                          target={`#employeeCallout_${index}`}
                          onDismiss={() => closePopup1(index)}
                          isBeakVisible={false}
                          directionalHint={DirectionalHint.bottomCenter}
                          className={styles.calloutStyle}
                          styles={{
                            root: {
                              height: "160px",
                              width: "340px",
                              zIndex: 3,
                              paddingLeft: "15px",
                              paddingTop: "6px",
                              background: "white",
                            },
                          }}
                        >
                          <div className={styles2.popup1Container}>
                            <div className={`${styles2.popup1Title}`}>
                              <div className={styles2.rowContainer}>
                                <Label className={styles2.popup1Label}>
                                  Name:
                                </Label>
                                <div className={styles2.popup1Field}>
                                  {employee.name_spoc}
                                </div>
                              </div>
                            </div>
                            <div className={`${styles2.popup1Title}`}>
                              <div className={styles2.rowContainer}>
                                <Label className={styles2.popup1Label}>
                                  Designation:
                                </Label>
                                <div className={styles2.popup1Field}>
                                  {employee.designation}
                                </div>
                              </div>
                            </div>
                            <div className={`${styles2.popup1Title}`}>
                              <div className={styles2.rowContainer}>
                                <Label className={styles2.popup1Label}>
                                  Mail ID:
                                </Label>
                                <div
                                  className={styles2.popup1Field}
                                  style={{ textDecoration: "underline" }}
                                >
                                  {employee.primary_email}
                                </div>
                              </div>
                            </div>
                            <div className={`${styles2.popup1Title}`}>
                              <div className={styles2.rowContainer}>
                                <Label className={styles2.popup1Label}>
                                  Mobile Number:
                                </Label>
                                <div className={styles2.popup1Field}>
                                  {employee.mobile_number}
                                </div>
                              </div>
                            </div>
                            <div className={`${styles2.popup1Title}`}>
                              <div className={styles2.rowContainer}>
                                <Label className={styles2.popup1Label}>
                                  Company Name:
                                </Label>
                                <div className={styles2.popup1Field}>
                                  {employee.company_name}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Callout>
                      )}
                    </div>

                    <div
                      id={`FO_${employee._id}`}
                      onClick={() => {
                        setRowId(employee._id);
                        setUpdateCallout(true);
                      }}
                      className={styles.moreOptions}
                    >
                      <FontIcon
                        iconName="MoreVertical"
                        className={iconClass1}
                      />
                      {rowId === employee._id && updateCallout && (
                        <Callout
                          gapSpace={0}
                          target={`#FO_${employee._id}`}
                          onDismiss={() => setRowId("")}
                          isBeakVisible={false}
                          directionalHint={DirectionalHint.bottomRightEdge}
                          styles={{
                            root: {
                              // borderRadius: '60%',
                              // boxShadow: '2px 2px 2px 4px rgba(0.2,0.2,0,0.2)',
                              // boxShadow: '20px  grey',
                              // Add shadow for depth
                            },
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                            }}
                          >
                            <DefaultButton
                              styles={calloutBtnStyles}
                              iconProps={{ imageProps: { src: viewicon } }}
                              onClick={() =>
                                navigateTo(
                                  `/leads/viewleadmodal?Lead_id=${employee._id}`
                                )
                              }
                            />
                            <span className={styles2.separator}></span>
                            <DefaultButton
                              styles={calloutBtnStyles}
                              iconProps={{ imageProps: { src: editicon } }}
                              // onClick={navigateToEditCandidate}
                              onClick={() =>
                                navigateTo(
                                  `/leads/editleadmodal?Lead_id=${employee._id}`
                                )
                              }
                            />

                            <span className={styles2.separator}></span>
                            {/* <DefaultButton
      styles={calloutBtnStyles}
      iconProps={{ imageProps: { src: markicon } }}
    /> */}
                            {/* ---------------------Active/Passive-------------------------- */}
                            {/* {LeadsData?.map((employee, index) => (
                              <div key={employee.id} className={`${styles2.card}`}> */}
                            <div>
                              <DefaultButton
                                id={`updateCallout_${employee.LeadId}`}
                                styles={calloutBtnStyles}
                                iconProps={{ imageProps: { src: markicon } }}
                                onClick={() => {
                                  handleOpenPopup(employee._id);
                                  changeStatus(employee._id, "kayal");
                                  // setCondition(false)
                                  // setIsCalloutVisible(!isCalloutVisible)
                                }}
                              />

                              {condition && employee.status === "passive" && (
                                <Callout
                                  gapSpace={0}
                                  target={`#updateCallout_${employee.LeadId}`}
                                  onDismiss={hidePopup1}
                                  isBeakVisible={false}
                                  directionalHint={
                                    DirectionalHint.bottomRightEdge
                                  }
                                  styles={{
                                    root: {
                                      height: "200px",
                                      width: "400px",
                                      zIndex: 3,
                                      paddingLeft: "15px",
                                      paddingTop: "6px",
                                      background: "white",
                                      paddingRight: "15px",
                                    },
                                  }}
                                >
                                  <div className={styles2.popupContainer}>
                                    <Label className={styles2.centeredLabel}>
                                      Demand Projection
                                    </Label>
                                    <br />
                                    <br />
                                  </div>
                                  <div className={`${styles2.popupTitle}`}>
                                    <div className={styles2.rowContainer}>
                                      <Label className={styles2.popupLabel}>
                                        Number of Demands
                                      </Label>
                                      <TextField
                                        value={basicInfo1.noOfDemands}
                                        onChange={(e, value) =>
                                          setBasicInfo1((prev) => ({
                                            ...prev,
                                            noOfDemands: value,
                                          }))
                                        }
                                        errorMessage={
                                          validationErrors.noOfDemands &&
                                          "Please enter the number of demands"
                                        }
                                      />
                                    </div>
                                  </div>
                                  <br />
                                  <div className={`${styles2.popupTitle}`}>
                                    <div className={styles2.rowContainer}>
                                      <Label className={styles2.popupLabel}>
                                        Due Date
                                      </Label>
                                      <DatePicker
                                        className={styles.popupField}
                                        placeholder="DD/MM/YYYY"
                                        styles={
                                          basicInfo1.dueDate
                                            ? calendarErrorClass
                                            : currentHover === "dueDate"
                                            ? calendarClassActive
                                            : calendarClass
                                        }
                                        value={basicInfo1.dueDate}
                                        onSelectDate={(date) =>
                                          setBasicInfo1((prev) => ({
                                            ...prev,
                                            dueDate: date,
                                          }))
                                        }
                                        errorMessage={
                                          validationErrors.dueDate &&
                                          "Please select a due date"
                                        }
                                      />
                                    </div>
                                  </div>
                                  <br />
                                  <PrimaryButton
                                    className={styles2.updateButton}
                                    text={`Update`}
                                    onClick={handleUpdateClick}
                                  />
                                </Callout>
                              )}
                            </div>
                            {/* </div>
                            ))} */}
                            {/* ------------------------------------------------------------ */}
                            <span className={styles2.separator}></span>
                            <DefaultButton
                              styles={calloutBtnStyles}
                              iconProps={{ imageProps: { src: deleteicon } }}
                              onClick={() => deleteEmployee(employee)}
                            />
                          </div>
                        </Callout>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles2.content}>
                  <div className={styles2.column}>
                    <h1 className={styles2.empname}>{employee.name_spoc}</h1>
                    <p className={styles2.dimcolorDesignation}>
                      ({employee.designation})
                    </p>
                    <h3 className={styles2.companynamemargin}>
                      {employee.company_name}
                    </h3>

                    <h2 className={styles2.empname}>{LeadsData.spoc}</h2>
                    <p className={styles2.dimcolor}>
                      {LeadsData.designation_spoc}
                    </p>
                    <h5 className={styles2.companynamemargin}>
                      {LeadsData.industry_type}
                    </h5>
                  </div>
                  <div className={styles2.column}>
                    <table className={styles.employeeTable}>
                      <tbody>
                        <tr>
                          <td className={styles2.label}>Report to</td>
                          <td className={styles2.colon}>:</td>
                          <td className={styles2.dimcolor}>
                            {employee.reports_to}
                          </td>
                        </tr>
                        <tr>
                          <td className={styles2.label}>Designation</td>
                          <td className={styles2.colon}>:</td>
                          <td className={styles2.dimcolor}>
                            {employee.designation}
                          </td>
                        </tr>
                        <tr>
                          <td className={styles2.label}>Industry</td>
                          <td className={styles2.colon}>:</td>
                          <td className={styles2.dimcolor}>
                            {employee.industry_type}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className={styles2.column}>
                    {employee.additional_information.map((info, index) => (
                      <table key={index} className={styles.employeeTable}>
                        <tbody>
                          <tr>
                            <td className={styles2.label}>Company</td>
                            <td className={styles2.colon}>:</td>
                            <td className={styles2.dimcolor}>
                              {info.company_size}
                            </td>
                          </tr>
                          <tr>
                            <td className={styles2.label}>Founded</td>
                            <td className={styles2.colon}>:</td>
                            <td className={styles2.dimcolor}>{info.founded}</td>
                          </tr>
                          <tr>
                            <td className={styles2.label}>Position </td>
                            <td className={styles2.colon}>:</td>
                            <td className={styles2.dimcolor}>
                              {employee.position}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    ))}
                    <tbody></tbody>
                  </div>

                  <div className={styles2.column}>
                    <h5 className={styles2.ptag}>Contact</h5>
                    <div className={styles2.iconContainer}>
                    <div className={`${styles2.iconWrapper} ${styles2.smallMargin}`} title={employee.additional_information[0]?.linkedin_url}>
                    <img src={linkedinicon} alt="LinkedIn Icon" className={`${styles2.icon} ${styles2.smallIcon}`} />
                    </div>
                    <div className={`${styles2.iconWrapper} ${styles2.smallMargin}`} title={employee.mobile_number}>
                    <img src={phone} alt="Phone Icon" className={`${styles2.icon} ${styles2.smallIcon}`} />
                    </div>
                    <div className={`${styles2.iconWrapper} ${styles2.smallMargin}`} title={employee.primary_email}>
                    <img src={mail} alt="Mail Icon" className={`${styles2.icon} ${styles2.smallIcon}`} />
                    </div>
                    <div className={`${styles2.iconWrapper} ${styles2.smallMargin}`} title={employee.additional_information[0]?.location}>
                    <img src={location} alt="Location Icon" className={`${styles2.icon} ${styles2.smallIcon}`} />
                    </div>
                    <div className={`${styles2.iconWrapper} ${styles2.smallMargin}`} title={employee.additional_information[0]?.company_website}>
                    <img src={website} alt="Website Icon" className={`${styles2.icon} ${styles2.smallIcon}`} />
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

export default LeadsAllListing;
