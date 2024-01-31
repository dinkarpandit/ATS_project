import React, { useState, useEffect, useCallback } from "react";
import styles from "./AddLeadModal.module.css";
import { Icon } from "@fluentui/react/lib/Icon";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react/lib/Dialog";
import {
  TextField,
  PrimaryButton,
  DefaultButton,
  DatePicker,
  Dropdown,
} from "@fluentui/react";
import { mergeStyles, mergeStyleSets } from "@fluentui/react";
import { axiosPrivateCall, axiosJsonCall } from "../constants";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

const contractIconClass = mergeStyles({
  fontSize: 20,
  height: "20px",
  width: "20px",
  cursor: "pointer",
});
const closeIconClass = mergeStyles({
  fontSize: 16,
  height: "20px",
  width: "20px",
  cursor: "pointer",
});
const tableCloseIconClass = mergeStyles({
  fontSize: 10,
  height: "12px",
  width: "12px",
  cursor: "pointer",
  color: "red",
});
const dropDownStyles1 = mergeStyleSets({
  dropdown: {
    minWidth: "80px",
    maxWidth: "120px",
    width: "120px",
    minHeight: "20px",
  },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid transparent",
    backgroundColor: "#EDF2F6",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  caretDown: { color: "grey" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
});
const dropDownActive1 = mergeStyleSets({
  dropdown: {
    minWidth: "80px",
    maxWidth: "120px",
    width: "120px",
    minHeight: "20px",
  },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid black",
    backgroundColor: "#EDF2F6",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  caretDown: { color: "grey" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
});
const dropDownErrorStyles1 = mergeStyleSets({
  dropdown: {
    minWidth: "80px",
    maxWidth: "120px",
    width: "120px",
    minHeight: "20px",
  },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #a80000",
    backgroundColor: "#EDF2F6",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
});
const Field = mergeStyleSets({
  fieldGroup: {
    height: "22px",
    minWidth: "80px",
    maxWidth: "120px",
    border: "0.5px solid transparent",
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
    fontSize: "12px",
  },
  field: { fontSize: "12px" },
});
const FieldError = mergeStyleSets({
  fieldGroup: {
    height: "22px",
    minWidth: "80px",
    maxWidth: "120px",
    border: "0.5px solid #a80000",
    fontSize: "12px",
  },
  field: { fontSize: "12px" },
});
const dropDownStatus = [
  { key: "self", text: "Self" },
  { key: "Internal", text: "Internal" },
  { key: "External", text: "External" },
];
const position = [
  { key: "fullTime", text: "Full Time" },
  { key: "contract", text: "Contract" },
  { key: "commission", text: "Commission" },
];
const ViewLeadModel = (props) => {

  const initialValues = {
    companyName: "",
    SPOC: "",
    designationSPOC: "",
    status: "",
    position: "",
    nameSPOC: "",
    reportsTo: "",
    designation: "",
    industryType: "",
    primaryEmailAddress: "",
    alternateEmailAddress: "",
    mobileNo: "",
    alternateMobileNo: "",
    companyAddress: "",
    companySize: "",
    founded: "",
    linkedInURL: "",
    companyWebsite: "",
    location: "",
    source: "",
    nameSource: "",
    designationSource: "",
    mailIDSource: "",
    mobile: "",
    companyNameSource: "",
  };

  let source = {
    status: "",
    noOfDemands: "",
    dueDate: null,
  };

  let defaultbasicInfo = {
    companyName: "",
    SPOC: "",
    designationSPOC: "",
    status: "",
    position: "",
    noOfDemands: "",
    dueDate: null,
    nameSPOC: "",
    reportsTo: "",
    designation: "",
    industryType: "",
    primaryEmailAddress: "",
    alternateEmailAddress: "",
    mobileNo: "",
    alternateMobileNo: "",
    companyAddress: "",
    companySize: "",
    founded: "",
    linkedInURL: "",
    companyWebsite: "",
    location: "",
    source: "",
    nameSource: "",
    designationSource: "",
    mailIDSource: "",
    mobile: "",
    companyNameSource: "",
    resume_url: "",
  };

  const setIsModalOpen = props.setIsModalOpen;
  const setSubmitSuccess = props.setSubmitSuccess;
  const [isModalShrunk, setIsModalShrunk] = useState(false);
  const [currentHover, setCurrentHover] = useState("");
  const [toggle, setToggle] = useState(false);
  const [fileTitle, setFileTitle] = useState("");
  const [btnIcon, setBtnIcon] = useState("Add");
  const [messageBar, setMessageBar] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [validationErrors, setValidationErrors] = useState({});
  const [showPopup, setShowPopup] = useState();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [basicInfo, setBasicInfo] = useState({ ...defaultbasicInfo });
  const [basicInfo1, setBasicInfo1] = useState({ ...source });
  const [basicInfoerrors, setBasicInfoErrors] = useState({});

 
  const hoverHandler = (name) => {
    setCurrentHover(name);
  };
  


  const mapBackendToFrontend = (backendData) => {
    const employmentDetails = backendData.additional_information || [];
    const mappedDetails = employmentDetails.map((detail, index) => ({
      companyAddress: detail.company_address || "",
      companySize: detail.company_size || "",
      founded: detail.founded || "",
      linkedInURL: detail.linkedin_url || "",
      companyWebsite: detail.company_website || "",
      location: detail.location || "",
      // Add other fields from detail as needed
    }));
    return {
      companyName: backendData.company_name || "",
      SPOC: backendData.spoc || "",
      designationSPOC: backendData.designation_spoc || "",
      status: backendData.status || "",
      position: backendData.position || "",
      noOfDemands: backendData.noOfDemands || "",
      // dueDate: backendData.dueDate || null,
      dueDate: backendData.dueDate ? new Date(backendData.dueDate) : null,
      nameSPOC: backendData.name_spoc || "",
      reportsTo: backendData.reports_to || "",
      designation: backendData.designation || "",
      industryType: backendData.industry_type || "",
      primaryEmailAddress: backendData.primary_email || "",
      alternateEmailAddress: backendData.alternative_email || "",
      mobileNo: backendData.mobile_number || "",
      alternateMobileNo: backendData.alternative_mobile || "",
      additional_information: mappedDetails,
      source: backendData.source || "",
      nameSource: backendData.source_name || "",
      designationSource: backendData.source_designation || "",
      mailIDSource: backendData.source_mail || "",
      mobile: backendData.source_mobile || "",
      companyNameSource: backendData.source_company_name || "",
      resume_url: backendData.resume_url || "",
    };
  };
  const mapToFrontendSchema = () => {
    return {
      company_name: basicInfo.companyName,
      spoc: basicInfo.SPOC,
      designation_spoc: basicInfo.designationSPOC,
      status: basicInfo1.status,
      no_of_demands: basicInfo1.noOfDemands,
      due_date: basicInfo1.dueDate,
      position: basicInfo.position,
      name_spoc: basicInfo.nameSPOC,
      reports_to: basicInfo.reportsTo,
      designation: basicInfo.designation,
      industry_type: basicInfo.industryType,
      primary_email: basicInfo.primaryEmailAddress,
      alternative_email: basicInfo.alternateEmailAddress,
      mobile_number: basicInfo.mobileNo,
      alternative_mobile: basicInfo.alternateMobileNo,
      additional_information: employmentDetails,
      source: basicInfo.source,
      source_name: basicInfo.nameSource,
      source_designation: basicInfo.designationSource,
      source_mail: basicInfo.mailIDSource,
      source_mobile: basicInfo.mobile,
      source_company_name: basicInfo.companyNameSource,
      resume_url: basicInfo.resume_url,
    };
  };

  let defaultEmployDetail = {
    companyAddress: "",
    companySize: "",
    founded: "",
    linkedInURL: "",
    companyWebsite: "",
    location: "",
  };
  const [employmentDetails, setEmploymentDetails] = useState([
    { ...defaultEmployDetail },
  ]);
  const [employmentDetailserrors, setEmploymentDetailErrors] = useState([
    { ...defaultEmployDetail },
  ]);
  const modalSizeHandler = () => {
    setIsModalShrunk(!isModalShrunk);
  };
  const dropDownHandler = (e, item, name, setData, setErrors) => {
    setData((prevData) => {
      return {
        ...prevData,
        [name]: item.text,
      };
    });
    setErrors((prevData) => {
      return { ...prevData, [name]: "" };
    });
  };
  useEffect(() => {}, [
    employmentDetails,
    basicInfo,
    basicInfoerrors,
    employmentDetailserrors,
  ]);
  const token = localStorage.getItem("token");
  let base64Url = token.split(".")[1];
  let decodedValue = JSON.parse(window.atob(base64Url));
  const [self, setSelf] = useState("");
  useEffect(() => {
    axiosPrivateCall(
      `api/v1/employee/getEmployeeDetails?employee_id=${decodedValue.user_id}`
    )
      .then((res) => {
        console.log(res.data);
        setSelf(res.data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  const validateFields = () => {
    const errors = {};
    if (!basicInfo.companyName) {
      errors.companyName = " ";
    }
    if (!basicInfo.SPOC) {
      errors.SPOC = " ";
    }
    if (!basicInfo.designationSPOC) {
      errors.designationSPOC = " ";
    }
    if (!basicInfo1.status) {
      errors.status = " ";
    }
    if (!basicInfo.position) {
      errors.position = " ";
    }
    if (!basicInfo.nameSPOC) {
      errors.nameSPOC = " ";
    }
    if (!basicInfo.reportsTo) {
      errors.reportsTo = " ";
    }
    if (!basicInfo.designation) {
      errors.designation = " ";
    }
    if (!basicInfo.industryType) {
      errors.industryType = " ";
    }
    if (!basicInfo.primaryEmailAddress) {
      errors.primaryEmailAddress = " ";
    }
    if (!basicInfo.mobileNo) {
      errors.mobileNo = " ";
    }
    if (!basicInfo.nameSource) {
      errors.nameSource = " ";
    }
    if (!basicInfo.designationSource) {
      errors.designationSource = " ";
    }
    if (!basicInfo.mailIDSource) {
      errors.mailIDSource = " ";
    }
    if (!basicInfo.mobile) {
      errors.mobile = "";
    }
    if (!basicInfo.companyNameSource) {
      errors.companyNameSource = " ";
    }
    console.log(errors, "eo");
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const isValid = validateFields();
      const backendData = mapToFrontendSchema();

      if (Object.keys(validationErrors).length === 0) {
        const response = await axiosPrivateCall.post(
          "http://localhost:4001/api/v1/leads/addlead",
          backendData
        );
        console.log("Response:", response.data);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    axiosPrivateCall(
      `/api/v1/leads/EditLead?Lead_id=${searchParams.get("Lead_id")}`
    )
      .then((res) => {
        console.log(res.data);
        const frontendData = mapBackendToFrontend(res.data);
        setEmploymentDetails(frontendData.additional_information);
        setBasicInfo(frontendData);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);
  const closeHandler = () => {
    setShowPopup(true);
  };
  const close = useCallback(() => {
    let value_temp;
    setBasicInfo((prevState) => {
      value_temp = Object.values(prevState);
      if (value_temp.length === 15) {
        closeHandler();
      } else {
        closeHandler();
      }
      return prevState;
    });
  }, [basicInfo]);
  const escKeyHandler = (event) => {
    if (event.key === "Escape") {
      closeHandler();
    }
  };
  useEffect(() => {
    document.addEventListener("keydown", escKeyHandler, { capture: true });
    return () => {
      document.removeEventListener("keydown", escKeyHandler, { capture: true });
    };
  }, []);
  function handleRemoveItem(key, setData, setErrors) {
    setData((prevState) => {
      let update = [...prevState];
      let arr1 = update.slice(0, key);
      let arr2 = update.slice(key + 1);
      let newSet = arr1.concat(arr2);
      return newSet;
    });
    setErrors((prevState) => {
      let update = [...prevState];
      let arr1 = update.slice(0, key);
      let arr2 = update.slice(key + 1);
      let newSet = arr1.concat(arr2);
      return newSet;
    });
  }
  function addField(setData, setErrors, defaultData) {
    setData((prevState) => [...prevState, { ...defaultData }]);
    setErrors((prevState) => [...prevState, { ...defaultData }]);
  }
  function uploadHandler(e) {
    if (e.target.files && e.target.files[0]) {
      if (
        e.target.files[0].type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        e.target.files[0].type === "application/pdf" ||
        e.target.files[0].type === "application/docx" ||
        e.target.files[0].type === "application/msword" ||
        e.target.files[0].type === "image/jpeg" ||
        e.target.files[0].type === "image/png" ||
        e.target.files[0].type === "image/jpg"
      ) {
        setFileTitle("uploading");
        let files = e.target.files[0];
        let formdata = new FormData();
        formdata.append("file", files);
        axiosPrivateCall
          .post("/api/v1/candidate/uploadCandidateResume", formdata)
          .then((res) => {
            setBasicInfo((prevState) => {
              return { ...prevState, resume_url: res.data.document };
            });
            setBasicInfoErrors((prevState) => {
              return { ...prevState, resume_url: "" };
            });
            setFileTitle(" ");
            setBtnIcon("Accept");
          })
          .catch((e) => {});
      } else {
        setBasicInfoErrors((prevState) => {
          return { ...prevState, resume_url: "Invalid" };
        });
        setFileTitle("Invalid Format");
        setBtnIcon(
          e.target.files[0].type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            e.target.files[0].type === "application/vnd.ms-excel"
            ? "Invalid"
            : "Cancel"
        );
      }
    }
  }
  function handleResumeDel() {
    setBasicInfo((prevState) => {
      return { ...prevState, resume_url: "" };
    });
    setBasicInfoErrors((prevState) => {
      return { ...prevState, resume_url: "" };
    });
    setFileTitle(" ");
    setBtnIcon("Add");
    document.getElementById("resume-upload").value = null;
  }
  window.addEventListener("beforeunload", function (e) {
    e.returnValue = "Are you sure?";
  });
  window.addEventListener("unload", function (e) {
    axiosPrivateCall
      .post("/api/v1/employee/logoutEmployee", {})
      .then((res) => {
        console.log(res);
        localStorage.removeItem("token");
      })
      .catch((e) => console.log(e));
  });
  const handleStatusChange = (event, item) => {
    const selectedStatus = item ? item.key : "";
    setBasicInfo1((prevBasicInfo) => ({
      ...prevBasicInfo,
      status: selectedStatus,
    }));
    setIsPopupOpen(selectedStatus === "active");
  };
  const handleNoOfDemandsChange = (event) => {
    const { value } = event.target;
    setBasicInfo1((prevBasicInfo) => ({
      ...prevBasicInfo,
      noOfDemands: value,
    }));
  };
  const handleDueDateChange = (date) => {
    setBasicInfo1((prevBasicInfo) => ({
      ...prevBasicInfo,
      dueDate: date,
    }));
  };
  const hidePopup = () => {
    setIsPopupOpen(false);
  };
  const handleUpdateClick = () => {
    setBasicInfo({
      status: "",
      noOfDemands: "",
      dueDate: null,
    });
    hidePopup();
  };
  return (
    <div>
      <div className={styles.addcandidate_modal_header_container}>
        <div className={styles.header_tag_expand_close_icon_container}>
          <div className={styles.header_expand_close_icon_container}>
            <div
              onClick={modalSizeHandler}
              className={styles.header_expand_icon_container}
            ></div>
          </div>
        </div>
        <div className={styles.header_content_container}>
          <div className={styles.header_content_title_container}>
            <div className={styles.header_content_title_container}>
              <div className={styles.header_tag_container}>Add Leads</div>
            </div>
            <div className={styles.header_content_save_container}>
              <div className={styles.header_save_close_btns_container}>
                <div className={styles.resumeConsole}>
                  <div className={styles.resume_conatiner}>
                    <DefaultButton
                      className={`${styles.resumeEl} ${
                        basicInfoerrors.resume_url
                          ? styles.errorBtn
                          : styles.regularBtn
                      }`}
                    >
                      <div className={styles.resumebtn}>
                        <div className={styles.statusIcn}>
                          {fileTitle === "uploading" ? (
                            <Spinner
                              className={styles.Icn1}
                              size={SpinnerSize.medium}
                            />
                          ) : (
                            <FontIcon
                              className={styles.Icn}
                              iconName={
                                basicInfo.resume_url
                                  ? "Accept"
                                  : basicInfoerrors.resume_url === "Invalid"
                                  ? "Accept"
                                  : btnIcon
                              }
                            />
                          )}
                        </div>
                        <div className={styles.statustxt}>
                          {basicInfoerrors.resume_url
                            ? basicInfoerrors.resume_url === "Invalid"
                              ? `Invalid Format`
                              : `Attach File`
                            : `Attach File`}
                        </div>
                      </div>
                    </DefaultButton>
                    <input
                      className={`${styles.resumeEl} ${styles.resume}`}
                      style={{ opacity: "0" }}
                      type="file"
                      name="resume"
                      id="resume-upload"
                      onChange={(e) => uploadHandler(e)}
                    />
                  </div>
                  {basicInfo.resume_url ||
                  basicInfoerrors.resume_url === "Invalid" ? (
                    <Icon
                      iconName="ChromeClose"
                      className={tableCloseIconClass}
                      onClick={() => handleResumeDel()}
                    />
                  ) : null}
                </div>
                <PrimaryButton
                  text={`Save & Close`}
                  onClick={submitHandler}
                  iconProps={{ iconName: "Save" }}
                  disabled
                />
              </div>
            </div>
            <div className={styles.upload_warning_msg}>
              * Kindly upload below 1MB
            </div>
          </div>
        </div>
      </div>
      <div className={styles.addemployee_modal_main_container}>
        <div className={styles.main_filter_options_container}>
          <div className={styles.subcontainer}>
            <div className={styles.main_dropdown_container1}>
              <div className={styles.flex_model}>
                <Label className={styles.required_field} required>
                  Company Name
                </Label>
              </div>
              <div
                id="companyName"
                className={
                  basicInfoerrors.companyName || validationErrors.companyName
                    ? styles.showfield
                    : styles.hidefield
                }
              >
                <TextField
                  type="text"
                  name="companyName"
                  value={basicInfo.companyName}
                  errorMessage={validationErrors.companyName}
                  styles={Field}
                />
              </div>
            </div>
          </div>
          <div className={styles.subcontainer}>
            <div className={styles.main_dropdown_container2}>
              <div className={styles.flex_model}>
                <Label className={styles.required_field} required>
                  SPOC
                </Label>
              </div>
              <div
                id="SPOC"
                className={
                  basicInfo.SPOC || validationErrors.nameSPOC
                    ? styles.showfield
                    : styles.hidefield
                }
              >
                <TextField
                  type="text"
                  name="SPOC"
                  value={basicInfo.SPOC}
                  errorMessage={validationErrors.SPOC}
                  styles={Field}
                />
              </div>
            </div>
          </div>
          <div className={styles.subcontainer}>
            <div className={styles.main_dropdown_container3}>
              <div className={styles.flex_model}>
                <Label className={styles.required_field} required>
                  Designation of SPOC
                </Label>
              </div>
              <div
                id="designationSPOC"
                className={
                  basicInfo.designationSPOC || validationErrors.designationSPOC
                    ? styles.showfield
                    : styles.hidefield
                }
              >
                <TextField
                  type="text"
                  name="designationSPOC"
                  value={basicInfo.designationSPOC}
                  errorMessage={validationErrors.designationSPOC}
                  styles={Field}
                />
              </div>
            </div>
          </div>
          <div className={styles.subcontainer}>
            <div className={styles.main_dropdown_container4}>
              <div className={styles.flex_model}>
                <Label className={styles.required_field} required>
                  Status
                </Label>
              </div>
              <div
                id="status"
                className={
                  basicInfo1.status || validationErrors.status
                    ? styles.showfield
                    : styles.hidefield
                }
              >
                <Dropdown
                  placeholder="Select"
                  selectedKey={basicInfo.status}
                  onChange={handleStatusChange}
                  options={[
                    { key: "active", text: "Active" },
                    { key: "passive", text: "Passive" },
                  ]}
                  styles={
                    validationErrors.position
                      ? dropDownErrorStyles1
                      : currentHover === "position"
                      ? dropDownActive1
                      : dropDownStyles1
                  }
                />
              </div>
              <Dialog
                hidden={!isPopupOpen}
                onDismiss={hidePopup}
                dialogContentProps={{
                  type: DialogType.normal,
                }}
              >
                <Label className={styles.centeredLabel}>
                  Demand Projection
                </Label>
                <DialogFooter>
                  <div className={`${styles.popupTitle}`}>
                    <div className={styles.rowContainer}>
                      <Label className={styles.popupLabel}>
                        Number of Demands
                      </Label>
                      <TextField
                        className={styles.popupField}
                        placeholder="No of demands"
                        onChange={handleNoOfDemandsChange}
                        value={basicInfo.noOfDemands}
                        styles={
                          basicInfoerrors.noOfDemands ? FieldError : Field1
                        }
                      />
                    </div>
                  </div>
                  <br />
                  <div className={`${styles.popupTitle}`}>
                    <div className={styles.rowContainer}>
                      <Label className={styles.popupLabel}>Due Date</Label>
                      <DatePicker
                        className={styles.popupField}
                        placeholder="DD/MM/YYYY"
                        onSelectDate={handleDueDateChange}
                        value={basicInfo.dueDate}
                      />
                    </div>
                  </div>
                  <br />
                  <PrimaryButton
                    className={styles.updateButton}
                    text={`Update`}
                    onClick={handleUpdateClick}
                  />
                </DialogFooter>
              </Dialog>
            </div>
          </div>
          <div className={styles.subcontainer}>
            <div className={styles.main_dropdown_container5}>
              <div className={styles.flex_model}>
                <Label className={styles.required_field} required>
                  Position
                </Label>
              </div>
              <div
                id="position"
                className={
                  basicInfo.position || validationErrors.position
                    ? styles.showfield
                    : styles.hidefield
                }
              >
                <Dropdown
                  placeholder="Select"
                  selectedKey={basicInfo.position}
                  onClick={() => hoverHandler("position")}
                  options={position}
                  onChange={(e, item) => {
                    dropDownHandler(
                      e,
                      item,
                      "position",
                      setBasicInfo,
                      setBasicInfoErrors
                    );
                    setCurrentHover("");
                  }}
                  styles={
                    validationErrors.position
                      ? dropDownErrorStyles1
                      : currentHover === "position"
                      ? dropDownActive1
                      : dropDownStyles1
                  }
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.main_information_container}>
          <div className={styles.main_basic_information_container}>
            <div className={styles.main_basic_information_title}>
              BASIC INFORMATION
            </div>
            <div className={styles.main_basic_information_content_container}>
              <div className={styles.main_from_field}>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.flex_model}>
                    <Label className={styles.required_field}>
                      Name of SPOC
                    </Label>
                  </div>
                  <div
                    id="nameSPOC"
                    className={
                      basicInfo.nameSPOC || validationErrors.nameSPOC
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="nameSPOC"
                      value={basicInfo.nameSPOC}
                      placeholder={"Enter the Name"}
                      errorMessage={validationErrors.nameSPOC}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.flex_model}>
                    <Label className={styles.required_field} required>
                      Reports to
                    </Label>
                  </div>{" "}
                  <div
                    id="reportsTo"
                    className={
                      basicInfo.reportsTo || validationErrors.reportsTo
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="reportsTo"
                      value={basicInfo.reportsTo}
                      placeholder={"Enter the reportsTo"}
                      errorMessage={validationErrors.reportsTo}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.flex_model}>
                    <Label className={styles.required_field} required>
                      Designation
                    </Label>
                  </div>
                  <div
                    id="designation"
                    className={
                      basicInfo.designation || validationErrors.designation
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="designation"
                      value={basicInfo.designation}
                      placeholder={"Enter the Designation"}
                      errorMessage={validationErrors.designation}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.flex_model}>
                    <Label className={styles.required_field} required>
                      Industry Type
                    </Label>
                  </div>
                  <div
                    id="industryType"
                    className={
                      basicInfo.industryType || validationErrors.industryType
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="industryType"
                      value={basicInfo.industryType}
                      placeholder={"Enter the Industry"}
                      errorMessage={validationErrors.industryType}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.main_location_title}>
                    <Label className={styles.required_field} required>
                      Primary Email Address
                    </Label>
                  </div>
                  <div
                    id="primaryEmailAddress"
                    className={
                      basicInfo.primaryEmailAddress ||
                      validationErrors.primaryEmailAddress
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="primaryEmailAddress"
                      value={basicInfo.primaryEmailAddress}
                      placeholder={"Email ID"}
                      errorMessage={validationErrors.primaryEmailAddress}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.main_location_title}>
                    <Label className={styles.required_field}>
                      Alternate Email Address
                    </Label>
                  </div>
                  <div
                    id="alternateEmailAddress"
                    className={
                      basicInfo.alternateEmailAddress ||
                      validationErrors.alternateEmailAddress
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="alternateEmailAddress"
                      value={basicInfo.alternateEmailAddress}
                      placeholder={"Email ID"}
                      errorMessage={validationErrors.alternateEmailAddress}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.main_location_title}>
                    <Label className={styles.required_field} required>
                      Mobile No
                    </Label>
                  </div>
                  <div
                    id="mobileNo"
                    className={
                      basicInfo.mobileNo || validationErrors.mobileNo
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="mobileNo"
                      value={basicInfo.mobileNo}
                      placeholder={"Mobile Number"}
                      errorMessage={validationErrors.mobileNo}
                      styles={Field}
                    />
                  </div>
                </div>
                <div className={styles.main_sub_from_field}>
                  <div className={styles.main_location_title}>
                    <Label className={styles.required_field}>
                      Alternate Mobile Number
                    </Label>
                  </div>
                  <div
                    id="alternateMobileNo"
                    className={
                      basicInfo.alternateMobileNo ||
                      validationErrors.alternateMobileNo
                        ? styles.showfield
                        : styles.hidefield
                    }
                  >
                    <TextField
                      type="text"
                      name="alternateMobileNo"
                      value={basicInfo.alternateMobileNo}
                      placeholder={"Mobile Number"}
                      errorMessage={validationErrors.alternateMobileNo}
                      styles={Field}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.main_basic_information_container}>
            <div className={styles.main_basic_information_title2}>
              <div>ADDITIONAL INFORMATION </div>
              <div
                className={styles.add_btn}
                onClick={() =>
                  addField(
                    setEmploymentDetails,
                    setEmploymentDetailErrors,
                    defaultEmployDetail
                  )
                }
              >
                + Add
              </div>
            </div>
            <div className={styles.main_basic_information_content_container}>
              <div className={styles.table_container}>
                <table>
                  <thead className={styles.table_header}>
                    <tr className={styles.table_row1}>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label
                            className={styles.required_field_heding}
                            required
                          >
                            Company Address{" "}
                          </Label>
                        </div>
                      </th>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label className={styles.required_field_heding}>
                            Company Size
                          </Label>
                        </div>
                      </th>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label className={styles.required_field_heding}>
                            Founded
                          </Label>
                        </div>
                      </th>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label
                            className={styles.required_field_heding}
                            required
                          >
                            LinkedIn Url
                          </Label>
                        </div>
                      </th>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label
                            className={styles.required_field_heding}
                            required
                          >
                            Company Website
                          </Label>
                        </div>
                      </th>
                      <th className={styles.table_headerContents}>
                        <div className={styles.table_heading}>
                          <Label className={styles.required_field_heding}>
                            Location
                          </Label>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {employmentDetails?.map((detail, index) => (
                      <tr key={index} className={styles.table_row}>
                        <td className={styles.table_dataContents}>
                          <div
                            id="companyAddress"
                            className={
                              basicInfo.companyAddress ||
                              validationErrors.companyAddress
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="companyAddress"
                              value={detail.companyAddress}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.companyAddress}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            id="companySize"
                            className={
                              basicInfo.companySize ||
                              validationErrors.companySize
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="companySize"
                              value={detail.companySize}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.companySize}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            id="founded"
                            className={
                              basicInfo.founded || validationErrors.founded
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="founded"
                              value={detail.founded}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.founded}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            id="linkedInURL"
                            className={
                              basicInfo.linkedInURL ||
                              validationErrors.linkedInURL
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="linkedInURL"
                              value={detail.linkedInURL}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.linkedInURL}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            id="companyWebsite"
                            className={
                              basicInfo.companyWebsite ||
                              validationErrors.companyWebsite
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="companyWebsite"
                              value={detail.companyWebsite}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.companyWebsite}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            id="location"
                            className={
                              basicInfo.location || validationErrors.location
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            <TextField
                              type="text"
                              name="location"
                              value={detail.location}
                              placeholder={"Enter the Name"}
                              errorMessage={validationErrors.location}
                              styles={Field}
                            />
                          </div>
                        </td>
                        <td className={styles.table_dataContents}>
                          <div
                            className={
                              index === 0
                                ? styles.disableFirstIcon
                                : employmentDetails[index]?.id ||
                                  employmentDetailserrors[index]?.id
                                ? styles.showfield
                                : styles.hidefield
                            }
                          >
                            {employmentDetails.length > 1 && (
                              <Icon
                                key={index}
                                iconName="ChromeClose"
                                className={tableCloseIconClass}
                                onClick={() =>
                                  handleRemoveItem(
                                    index,
                                    setEmploymentDetails,
                                    setEmploymentDetailErrors
                                  )
                                }
                              />
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className={styles.main_basic_information_container}>
              <Label className={styles.main_basic_information_title} required>
                SOURCE
                <div className={styles.sourceDropdown}>
                  <Dropdown
                    placeholder="Select"
                    selectedKey={basicInfo.source}
                    onClick={() => hoverHandler("source")}
                    options={dropDownStatus}
                    onChange={(e, item) => {
                      dropDownHandler(
                        e,
                        item,
                        "source",
                        setBasicInfo,
                        setBasicInfoErrors
                      );
                      setCurrentHover("");
                    }}
                    styles={
                      validationErrors.position
                        ? dropDownErrorStyles1
                        : currentHover === "position"
                        ? dropDownActive1
                        : dropDownStyles1
                    }
                  />
                </div>
              </Label>
              <div className={styles.main_basic_information_content_container}>
                <div className={styles.main_from_field}>
                  <div className={styles.main_sub_from_field}>
                    <div className={styles.flex_model}>
                      <Label className={styles.required_field} required>
                        Name
                      </Label>
                    </div>
                    <div
                      id="nameSource"
                      className={
                        basicInfo.nameSource || validationErrors.nameSource
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="nameSource"
                        placeholder="Enter the name"
                        value={
                          basicInfo.source === "self"
                            ? self.first_name
                            : basicInfo.nameSource
                        }
                        errorMessage={validationErrors.nameSource}
                        styles={Field}
                      />
                    </div>
                  </div>
                  <div className={styles.main_sub_from_field}>
                    <div className={styles.flex_model}>
                      <Label className={styles.required_field} required>
                        Designation
                      </Label>
                    </div>{" "}
                    <div
                      id="designationSource"
                      className={
                        basicInfo.designationSource ||
                        basicInfoerrors.designationSource
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="designationSource"
                        placeholder="Enter the Designation"
                        value={basicInfo.designationSource}
                        errorMessage={validationErrors.designationSource}
                        styles={Field}
                      />
                    </div>
                  </div>
                  <div className={styles.main_sub_from_field}>
                    <div className={styles.flex_model}>
                      <Label className={styles.required_field} required>
                        Mail ID
                      </Label>
                    </div>
                    <div
                      id="mailIDSource"
                      className={
                        basicInfo.mailIDSource || basicInfoerrors.mailIDSource
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="mailIDSource"
                        placeholder="Email ID"
                        value={
                          basicInfo.source === "self"
                            ? self.email
                            : basicInfo.mailIDSource
                        }
                        errorMessage={validationErrors.mailIDSource}
                        styles={Field}
                      />
                    </div>
                  </div>
                  <div className={styles.main_sub_from_field}>
                    <div className={styles.flex_model}>
                      <Label className={styles.required_field} required>
                        Mobile
                      </Label>
                    </div>
                    <div
                      id="mobile"
                      className={
                        basicInfo.mobile || basicInfoerrors.mobile
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="mobile"
                        placeholder="Mobile Number"
                        value={
                          basicInfo.source === "self"
                            ? self.mobile_number
                            : basicInfo.mobile
                        }
                        errorMessage={validationErrors.mobile}
                        styles={Field}
                      />
                    </div>
                  </div>
                  <div className={styles.main_sub_from_field}>
                    <div className={styles.main_location_title}>
                      <Label className={styles.required_field} required>
                        Company Name
                      </Label>
                    </div>
                    <div
                      id="companyNameSource"
                      className={
                        basicInfo.companyNameSource ||
                        basicInfoerrors.companyNameSource
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="companyNameSource"
                        placeholder="company name"
                        value={
                          basicInfo.source === "self"
                            ? "sight spectrum"
                            : basicInfo.companyNameSource
                        }
                        errorMessage={validationErrors.companyNameSource}
                        styles={Field}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ViewLeadModel;
