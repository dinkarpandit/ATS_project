import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@fluentui/react";
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
import { Popup } from "../components/Popup";
import { Spinner, SpinnerSize } from "@fluentui/react/lib/Spinner";
import { FontIcon } from "@fluentui/react/lib/Icon";
import { Label } from "@fluentui/react/lib/Label";

// regex
const emailRegex =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+(in|com|org)))$/;
const mobileRegex = /^[6-9]\d{9}$/;

// styles
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

const customDropdownStyles = {
  dropdown: {
    borderColor: '#0078D4', // Border color when the dropdown is not focused
    selectors: {
      '.ms-Dropdown-caretDownWrapper': {
        color: '#0078D4', // Color of the caret icon
      },
      ':hover': {
        borderColor: '#0078D4', // Border color on hover
      },
    },
  },
};

const dropDownStyles1 = mergeStyleSets({
  dropdown: {
    minWidth: "80px",
    maxWidth: "120px",
    width: "120px",
    minHeight: "20px",
    border: "0.2px solid black",
  },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid transparent",
    // backgroundColor: "#EDF2F6",
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
    border: "0.5px solid black",
  },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid black",
    // backgroundColor: "#EDF2F6",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  caretDown: { color: "grey" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
});

const dropDownErrorStyles = mergeStyleSets({
  dropdown: { minWidth: "80px", maxWidth: "120px", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #a80000",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
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
    // backgroundColor: "#EDF2F6",
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
    // backgroundColor: "#EDF2F6",
    fontSize: "12px",
  },
  field: { fontSize: "12px" },
});

const dropDownStatus = [
  { key: "self", text: "self" },
  { key: "Internal", text: "Internal" },
  { key: "External", text: "External" },
];

const position = [
  { key: "fullTime", text: "Full Time" },
  { key: "contract", text: "Contract" },
  { key: "commission", text: "Commission" },
];

const AddLeadModal = (props) => {
  //initialize
  const { showMessageBar, setShowMessageBar } = props;
  let defaultbasicInfo = {
    companyName: "",
    SPOC: "",
    designationSPOC: "",
    position: "",
    noOfDemands: "",
    nameSPOC: "",
    reportsTo: "",
    designation: "",
    industryType: "",
    primaryEmailAddress: "",
    alternateEmailAddress: "",
    mobileNo: "",
    alternateMobileNo: "",
    source: "",
    nameSource: "",
    designationSource: "",
    mailIDSource: "",
    mobile: "",
    companyNameSource: "",
    resume_url: "",
    additional_information: [
      {
        company_address: "",
        company_size: "",
        founded: "",
        linkedin_url: "",
        company_website: "",
        location: "",
      },
    ],
  };

  const sanitizeObject = {
    companyName: "company_name",
    SPOC: "spoc",
    designationSPOC: "designation_spoc",
    status: "status",
    position: "position",
    // noOfDemands: "no_of_demands",
    // dueDate: "due_date",
    nameSPOC: "name_spoc",
    reportsTo: "reports_to",
    designation: "designation",
    industryType: "industry_type",
    primaryEmailAddress: "primary_email",
    alternateEmailAddress: "alternative_email",
    mobileNo: "mobile_number",
    alternateMobileNo: "alternative_mobile",
    source: "source",
    nameSource: "source_name",
    designationSource: "source_designation",
    mailIDSource: "source_mail",
    mobile: "source_mobile",
    companyNameSource: "source_company_name",
    resume_url: "attach_file",
    additional_information: "additional_information",
  };

  const mapKeys = (obj, mapping) => {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        result[mapping[key] || key] = value.map((item) =>
          mapKeys(item, mapping)
        );
      } else if (typeof value === "object" && value !== null) {
        result[mapping[key] || key] = mapKeys(value, mapping);
      } else {
        result[mapping[key] || key] = value;
      }
    }
    console.log(result, "pp");
    return result;
  };

  let source = {
    status: "",
    noOfDemands: "",
    dueDate: null,
  };

  let defaultEmployDetail = {
    companyAddress: "",
    companySize: "",
    founded: "",
    linkedInURL: "",
    companyWebsite: "",
    location: "",
  };

  //state
  let isModalOpen = props.isModalOpen;
  const setIsModalOpen = props.setIsModalOpen;
  let isSubmitSuccess = props.isSubmitSuccess;
  const setSubmitSuccess = props.setSubmitSuccess;
  const [isModalShrunk, setIsModalShrunk] = useState(false);
  const [currentHover, setCurrentHover] = useState("");
  const [toggle, setToggle] = useState(false);
  const [fileTitle, setFileTitle] = useState("");
  const [btnIcon, setBtnIcon] = useState("Add");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [basicInfo, setBasicInfo] = useState({ ...defaultbasicInfo });
  const [validationErrors, setValidationErrors] = useState({});
  const [basicInfo1, setBasicInfo1] = useState({ ...source });
  const [basicInfoerrors, setBasicInfoErrors] = useState({});
  const [employmentDetails, setEmploymentDetails] = useState([
    { ...defaultEmployDetail },
  ]);
  const [employmentDetailserrors, setEmploymentDetailErrors] = useState([
    { ...defaultEmployDetail },
  ]);
  const [showPopup, setShowPopup] = useState(false);
  const [self, setSelf] = useState("");

  const hoverHandler = (name) => {
    setCurrentHover(name);
  };

  const modalSizeHandler = () => {
    setIsModalShrunk(!isModalShrunk);
  };

  const dropDownHandler = (e, item, name, setData, setErrors) => {
    setData((prevData) => {
      return {
        ...prevData,
        [name]: item.key,
      };
    });
    setErrors((prevData) => {
      return { ...prevData, [name]: "" };
    });
  };

  const inputChangeHandler = (e, name) => {
    const { value } = e.target;
    let inputValue = value;

    let isNameValid = false;
    if (name === "companyName") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "SPOC") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "designationSPOC") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "nameSPOC") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "reportsTo") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "designation") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "industryType") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }

    if (name === "primaryEmailAddress") {
      if (inputValue.length > 320) inputValue = inputValue.slice(0, 320);
      isNameValid = true;
    }
    if (name === "alternateEmailAddress") {
      if (inputValue.length > 320) inputValue = inputValue.slice(0, 320);
      isNameValid = true;
    }

    if (name === "mobileNo" && (inputValue === "" || !isNaN(inputValue))) {
      if (inputValue.length > 10) inputValue = inputValue.slice(0, 10);
      isNameValid = true;
    }

    if (
      name === "alternateMobileNo" &&
      (inputValue === "" || !isNaN(inputValue))
    ) {
      if (inputValue.length > 10) inputValue = inputValue.slice(0, 10);
      isNameValid = true;
    }
    if (name === "source") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "nameSource") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }
    if (name === "designationSource") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }

    if (name === "mailIDSource") {
      if (inputValue.length > 320) inputValue = inputValue.slice(0, 320);
      isNameValid = true;
    }
    if (name === "mobile" && (inputValue === "" || !isNaN(inputValue))) {
      if (inputValue.length > 10) inputValue = inputValue.slice(0, 10);
      isNameValid = true;
    }
    if (name === "companyNameSource") {
      if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
      isNameValid = true;
    }

    console.log(isNameValid, "isname");

    if (isNameValid) {
      setBasicInfo({
        ...basicInfo,
        [name]: inputValue,
      });

      setValidationErrors({
        ...validationErrors,
        [name]: null,
      });
    }
  };

  const inputChangeHandler1 = (
    e,
    fieldName,
    stateFieldName,
    setDetails,
    setErrors,
    index
  ) => {
    const updatedDetails = [...employmentDetails];
    const currentItem = updatedDetails[index];
    currentItem[stateFieldName] = e.target.value;
    setDetails(updatedDetails);
    const updatedErrors = { ...validationErrors };
    updatedErrors[fieldName] = "";

    setValidationErrors(updatedErrors);
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

  useEffect(() => {
    console.log("Effect is running!");
    axiosPrivateCall(
      `api/v1/employee/getEmployeeDetails?employee_id=${decodedValue.user_id}`
    )
      .then((res) => {
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

    employmentDetails.forEach((detail, index) => {
      if (!detail.companyAddress) {
        errors[`companyAddress_${index}`] = " ";
      }
      if (!detail.linkedInURL) {
        errors[`linkedInURL_${index}`] = " ";
      }
      if (!detail.companyWebsite) {
        errors[`companyWebsite_${index}`] = " ";
      }
      // Add validations for other additional information fields
    });

    if (!basicInfo.primaryEmailAddress) {
      errors.primaryEmailAddress = " ";
    } else if (!emailRegex.test(basicInfo.primaryEmailAddress)) {
      errors.primaryEmailAddress = "Invalid email";
    }

    if (!basicInfo.mobileNo) {
      errors.mobileNo = " ";
    } else if (!mobileRegex.test(basicInfo.mobileNo)) {
      errors.mobileNo = "Invalid";
    }

    if (!basicInfo.mailIDSource) {
      errors.mailIDSource = " ";
    } else if (!emailRegex.test(basicInfo.mailIDSource)) {
      errors.mailIDSource = "Invalid email";
    }

    if (!basicInfo.companyNameSource) {
      errors.companyNameSource = " ";
    }

    console.log(errors, "eo");
    setValidationErrors(errors);
    return Object.keys(errors).length === 0; // Fix the return statement
  };

  const mapToFrontendSchema = () => {
    const additionalInformation = employmentDetails.map((detail) => ({
      company_address: detail.companyAddress || "",
      company_size: detail.companySize || "",
      founded: detail.founded || "",
      linkedin_url: detail.linkedInURL || "",
      company_website: detail.companyWebsite || "",
      location: detail.location || "",
    }));

    return {
      ...basicInfo,
      additional_information: additionalInformation,
    };
  };

  useEffect(() => {
    if (basicInfo.source === "self") {
      setBasicInfo({
        ...basicInfo,
        nameSource: self.first_name,
        designationSource: self.role,
        mailIDSource: self.email,
        mobile: self.mobile_number,
        companyNameSource: "sightspectrum technology",
      });
    }
  }, [basicInfo.source, self.first_name, self.role, self.email, self.mobile]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const additionalInformation = mapKeys(
        mapToFrontendSchema(),
        sanitizeObject
      );

      const keysToReplace = Object.keys(basicInfo1);

      const mergedAdditionalInformation = { ...additionalInformation };
      keysToReplace.forEach((key) => {
        if (key === "noOfDemands" || key === "dueDate") {
          mergedAdditionalInformation[key] = basicInfo1[key];
        } else if (basicInfo1.hasOwnProperty(key)) {
          mergedAdditionalInformation[key] = basicInfo1[key];
        }
      });

      // Merge basicInfo1 and mergedAdditionalInformation
      const finalPayload = {
        ...basicInfo1,
        ...mergedAdditionalInformation,
      };

      console.log(finalPayload);

      const validate = validateFields(finalPayload);

      if (validate) {
        const response = await axiosPrivateCall.post(
          "http://localhost:4001/api/v1/leads/addlead",
          finalPayload // Assuming sanitizer is a function that sanitizes the data
        );

        console.log("Response:", response.data);
        submitForm();
        setShowMessageBar(!showMessageBar);
        setIsModalOpen(!isModalOpen);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  function submitForm() {
    setSubmitSuccess(true);
    setIsModalOpen(false);
  }

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
  }, [JSON.stringify(basicInfo)]);

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

  function handleToggle() {
    if (!toggle) {
      setBasicInfo((prevState) => {
        return { ...prevState, prefered_location: "Na" };
      });
    }

    setBasicInfo((prevState) => {
      return {
        ...prevState,
        willing_to_relocate: !toggle,
        prefered_location: "",
      };
    });

    setToggle((prevState) => !prevState);
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
          .post("/api/v1/leads/uploadReports", formdata)
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

  const today = new Date();

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
    hidePopup();
  };

  return (
    <div>
      {
        <Popup
          showPopup={showPopup}
          setShowPopup={setShowPopup}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
      }
      <Modal
        scrollableContentClassName={
          styles.addcandidate_modal_scrollable_content
        }
        containerClassName={`${
          isModalShrunk
            ? styles.addcandidate_modal_container_shrunk
            : styles.addcandidate_modal_container
        }`}
        isOpen={isModalOpen}
      >
        <div className={styles.addcandidate_modal_header_container}>
          <div className={styles.header_tag_expand_close_icon_container}>
            <div className={styles.header_expand_close_icon_container}>
              <div
                onClick={modalSizeHandler}
                className={styles.header_expand_icon_container}
              >
                {isModalShrunk ? (
                  <Icon iconName="FullScreen" className={contractIconClass} />
                ) : (
                  <Icon iconName="BackToWindow" className={contractIconClass} />
                )}
              </div>
              <div
                onClick={() => close()}
                className={styles.header_close_icon_container}
              >
                <Icon iconName="ChromeClose" className={closeIconClass} />
              </div>
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
                    basicInfo.companyName || validationErrors.companyName
                      ? styles.showfield
                      : styles.hidefield
                  }
                >
                  <TextField
                    type="text"
                    name="companyName"
                    onChange={(e) => {
                      inputChangeHandler(
                        e,
                        "companyName",
                        "companyName",
                        setBasicInfo,
                        setBasicInfoErrors
                      );
                    }}
                    value={basicInfo.companyName}
                    placeholder={"Enter the Name"}
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
                    onChange={(e) => {
                      inputChangeHandler(
                        e,
                        "SPOC",
                        "SPOC",
                        setBasicInfo,
                        setBasicInfoErrors
                      );
                    }}
                    value={basicInfo.SPOC}
                    placeholder={"Enter the Name"}
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
                    basicInfo.designationSPOC ||
                    validationErrors.designationSPOC
                      ? styles.showfield
                      : styles.hidefield
                  }
                >
                  <TextField
                    type="text"
                    name="designationSPOC"
                    onChange={(e) => {
                      inputChangeHandler(
                        e,
                        "designationSPOC",
                        "designationSPOC",
                        setBasicInfo,
                        setBasicInfoErrors
                      );
                    }}
                    value={basicInfo.designationSPOC}
                    placeholder={"Enter the Name"}
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
                    selectedKey={basicInfo1.status}
                    onChange={handleStatusChange}
                    options={[
                      { key: "active", text: "Active" },
                      { key: "passive", text: "Passive" },
                    ]}
                    // styles={basicInfoerrors.status ? FieldError : Field1}
                    styles={
                      validationErrors.position
                        ? dropDownErrorStyles1
                        : currentHover === "position"
                        ? dropDownActive1
                        : { ...dropDownStyles1, ...customDropdownStyles }
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
                          name="noOfDemands"
                          className={styles.popupField}
                          placeholder="No of demands"
                          onChange={handleNoOfDemandsChange}
                          value={basicInfo1.noOfDemands}
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
                        : { ...dropDownStyles1, ...customDropdownStyles }
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
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "nameSPOC",
                            "nameSPOC",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfo.reportsTo || basicInfoerrors.reportsTo
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="reportsTo"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "reportsTo",
                            "reportsTo",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfo.designation || basicInfoerrors.designation
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="designation"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "designation",
                            "designation",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "industryType",
                            "industryType",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfoerrors.primaryEmailAddress
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="primaryEmailAddress"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "primaryEmailAddress",
                            "primaryEmailAddress",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfoerrors.alternateEmailAddress
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="alternateEmailAddress"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "alternateEmailAddress",
                            "alternateEmailAddress",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfo.mobileNo || basicInfoerrors.mobileNo
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="mobileNo"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "mobileNo",
                            "mobileNo",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                        basicInfoerrors.alternateMobileNo
                          ? styles.showfield
                          : styles.hidefield
                      }
                    >
                      <TextField
                        type="text"
                        name="alternateMobileNo"
                        onChange={(e) => {
                          inputChangeHandler(
                            e,
                            "alternateMobileNo",
                            "alternateMobileNo",
                            setBasicInfo,
                            setBasicInfoErrors
                          );
                        }}
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
                              id={`companyAddress_${index}`}
                              className={
                                detail.companyAddress ||
                                validationErrors[`companyAddress_${index}`]
                                  ? styles.showfield
                                  : styles.hidefield
                              }
                            >
                              <TextField
                                type="text"
                                name={`companyAddress_${index}`}
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    `companyAddress_${index}`,
                                    "companyAddress",
                                    setEmploymentDetails,
                                    setValidationErrors,
                                    index
                                  );
                                }}
                                value={detail.companyAddress}
                                placeholder="Enter the Name"
                                errorMessage={
                                  validationErrors[`companyAddress_${index}`]
                                }
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
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    "companySize",
                                    "companySize",
                                    setEmploymentDetails,
                                    setBasicInfoErrors,
                                    index
                                  );
                                }}
                                value={employmentDetails.companySize}
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
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    "founded",
                                    "founded",
                                    setEmploymentDetails,
                                    setBasicInfoErrors,
                                    index
                                  );
                                }}
                                value={employmentDetails.founded}
                                placeholder={"Enter the Name"}
                                errorMessage={validationErrors.founded}
                                styles={Field}
                              />
                            </div>
                          </td>
                          <td className={styles.table_dataContents}>
                            <div
                              id={`linkedInURL_${index}`}
                              className={
                                detail.companyAddress ||
                                validationErrors[`linkedInURL_${index}`]
                                  ? styles.showfield
                                  : styles.hidefield
                              }
                            >
                              <TextField
                                type="text"
                                name={`linkedInURL_${index}`}
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    `linkedInURL_${index}`,
                                    "linkedInURL",
                                    setEmploymentDetails,
                                    setValidationErrors,
                                    index
                                  );
                                }}
                                value={detail.linkedInURL}
                                placeholder="Enter the Name"
                                errorMessage={
                                  validationErrors[`linkedInURL_${index}`]
                                }
                                styles={Field}
                              />
                            </div>
                          </td>

                          <td className={styles.table_dataContents}>
                            <div
                              id={`companyWebsite_${index}`}
                              className={
                                detail.companyAddress ||
                                validationErrors[`companyWebsite_${index}`]
                                  ? styles.showfield
                                  : styles.hidefield
                              }
                            >
                              <TextField
                                type="text"
                                name={`companyWebsite_${index}`}
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    `companyWebsite_${index}`,
                                    "companyWebsite",
                                    setEmploymentDetails,
                                    setValidationErrors,
                                    index
                                  );
                                }}
                                value={detail.companyWebsite}
                                placeholder="Enter the Name"
                                errorMessage={
                                  validationErrors[`companyWebsite_${index}`]
                                }
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
                                onChange={(e) => {
                                  inputChangeHandler1(
                                    e,
                                    "location",
                                    "location",
                                    setEmploymentDetails,
                                    setBasicInfoErrors,
                                    index
                                  );
                                }}
                                value={employmentDetails.location}
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
                <Label className={styles.main_basic_information_title}>
                  SOURCE
                  <div className={styles.sourceDropdown}>
                    <Dropdown
                      placeholder="Select"
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
                          : { ...dropDownStyles1, ...customDropdownStyles }
                      }                
                    />
                  </div>
                </Label>

                <div
                  className={styles.main_basic_information_content_container}
                >
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
                          onChange={(e) => {
                            inputChangeHandler(
                              e,
                              "nameSource",
                              "nameSource",

                              setBasicInfo,
                              setBasicInfoErrors
                            );
                          }}
                          value={basicInfo.nameSource}
                          placeholder={"Enter the Industry"}
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
                          onChange={(e) => {
                            inputChangeHandler(
                              e,
                              "designationSource",
                              "designationSource",
                              setBasicInfo,
                              setBasicInfoErrors
                            );
                          }}
                          placeholder="Enter the Designation"
                          value={basicInfo.designationSource}
                          // value={ basicInfo.designationSource}
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
                          onChange={(e) => {
                            inputChangeHandler(
                              e,
                              "mailIDSource",
                              "mailIDSource",
                              setBasicInfo,
                              setBasicInfoErrors
                            );
                          }}
                          placeholder="Email ID"
                          value={basicInfo.mailIDSource}
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
                          onChange={(e) => {
                            inputChangeHandler(
                              e,
                              "mobile",
                              "mobile",
                              setBasicInfo,
                              setBasicInfoErrors
                            );
                          }}
                          placeholder="Mobile Number"
                          value={basicInfo.mobile}
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
                          onChange={(e) => {
                            inputChangeHandler(
                              e,
                              "companyNameSource",
                              "companyNameSource",
                              setBasicInfo,
                              setBasicInfoErrors
                            );
                          }}
                          placeholder="company name"
                          value={basicInfo.companyNameSource}
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
      </Modal>
    </div>
  );
};

export default AddLeadModal;
