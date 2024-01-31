import React, { useEffect, useState, useRef } from "react";

import { Modal } from "@fluentui/react";
import { Toggle } from "@fluentui/react/lib/Toggle";
import {
  getNumberFromString,
  isAlphaNumeric,
  isAlphaNumericSpecial,
  isEmpty,
  isNumOnly,
} from "../utils/validation";

import { mergeStyles, mergeStyleSets } from "@fluentui/react";
import styles from "./ViewDemand.module.css";
import { Icon } from "@fluentui/react/lib/Icon";
import {Label} from "@fluentui/react";
import { Dropdown } from "@fluentui/react/lib/Dropdown";
import { TextField } from "@fluentui/react/lib/TextField";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "../../node_modules/react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "./DraftEditorResetFix.css";
import boldicon from "../../src/assets/boldicon.svg";
import undoicon from "../../src/assets/undoicon.svg";
import redoicon from "../../src/assets/redoicon.svg";
import { Popup } from "../components/Popup";

// API
import { axiosPrivateCall, axiosJsonCall } from "../constants";
import ComboBox from "../components/ComboBox/ComboBox";

//regex
const vendorRegex = /^[a-zA-Z0-9 @,.()-]*$/;
const jobRRRegex = /^[A-Z0-9]*$/;

const contractIconClass = mergeStyles({
  fontSize: 20,
  height: 20,
  width: 20,
  cursor: "pointer",
});

const closeIconClass = mergeStyles({
  fontSize: 16,
  height: 20,
  width: 20,
  cursor: "pointer",
});

const downIconClass = mergeStyles({
  fontSize: 14,
  height: 20,
  width: 20,
  cursor: "pointer",
});

const textFieldColored = (props, currentHover, error, value) => {
  return {
    fieldGroup: {
      width: "160px",
      height: "22px",
      backgroundColor: "rgb(255,255,255)",
      // borderColor: error ? "#a80000" : "transparent",

      selectors: {
        ":focus": {
          borderColor: "rgb(96, 94, 92)",
        },
      },
    },
    field: {
      fontSize: 12,
      backgroundColor:"#EDF2F6"

    },
  };
};

const textField = (props, currentHover, error, value) => {
  return {
    fieldGroup: {
      width: "160px",
      height: "22px",
      borderColor: error ? "#a80000" : "transparent",
      selectors: {
        ":focus": {
          borderColor: "rgb(96, 94, 92)",
        },
      },
    },
    field: {
      fontSize: 12,
      backgroundColor:'white'
    },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};

const dropDownStylesActive = (props, currentHover, error, value) => {
  return {
    dropdown: {
      width: "160px",
      minWidth: "160px",
      minHeight: "20px",

      selectors:{

      	':focus:':{
      		border: '1px solid #0078D4',
      		':after':{
      			border: currentHover===value ? '1px solid #0078D4 ':  'none',
      		}
      	},
        ':disabled':{
          backgroundColor:'red'
        }
      }
    },
    title: {
      height: "22px",
      lineHeight: "18px",
      fontSize: "12px",
      backgroundColor: "#EDF2F6",
      borderColor: error
        ? "#a80000"
        : currentHover === value
        ? "rgb(96, 94, 92)"
        : "transparent",
   
    },
    errorMessage: {
      display: "none",
    },
    caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
    dropdownItem: { minHeight: "22px", fontSize: 12 },
    dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  };
};

const dropDownStylesTransparent = mergeStyleSets({
  dropdown: { width: "160px", minWidth: "160px", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid transparent",
    backgroundColor: "#EDF2F6",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  caretDown: { color: "transparent" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const dropDownStyles = (props, currentHover, error, value) => {
  return {
    dropdown: { width: "160px", minWidth: "160px", minHeight: "20px", backgroundColor: props.disabled ? "white" : "white" },
    title: {
      height: "22px",
      lineHeight: "18px",
      fontSize: "12px",
      backgroundColor:'white',
      borderColor: error
        ? "#a80000"
        : currentHover === value
        ? "rgb(96, 94, 92)"
        : "transparent",
    },
    caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
    dropdownItem: { minHeight: "22px", fontSize: 12 },
    dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};

const dropDownErrorStyles = mergeStyleSets({
  dropdown: { width: "160px", minWidth: "160px", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #a80000",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const dropDownRegularStyles = (props, currentHover, error, value) => {
  return {
    dropdown: {
      width: "100%",
      minHeight: "20px",
    },
    title: {
      height: "22px",
      lineHeight: "18px",
      fontSize: "12px",
      backgroundColor:'white',
      borderColor: error
        ? "#a80000"
        : currentHover === value
        ? "rgb(96, 94, 92)"
        : "transparent",
      // border: error ? '1px solid #a80000': currentHover === value ? '1px solid #0078D4 ':  'none',
      // selectors:{

      // 	':hover':{
      // 		border: '1px solid #0078D4'
      // 	}
      // }
    },
    caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
    dropdownItem: { minHeight: "22px", fontSize: 12 },
    dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
    dropdownItems: {
      height: 100,
      width: 150,
      overflow: "auto",
    },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};

const dropDownRegularNoticeStyles = (props, currentHover, error, value) => {
  return {
    dropdown: { width: "100%", minHeight: "20px" ,backgroundColor:'white' },
    title: {
      height: "22px",
      lineHeight: "18px",
      fontSize: "12px",
      backgroundColor:'white',
      borderColor: error
        ? "#a80000"
        : currentHover === value
        ? "rgb(96, 94, 92)"
        : "transparent",
    },
    
    caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
    dropdownItem: { minHeight: "22px", fontSize: 12 },
    dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};

const dropDownRegularErrorStyles = mergeStyleSets({
  dropdown: { width: "100%", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #a80000",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const dropDownRegularErrorStyles1 = mergeStyleSets({
  dropdown: { width: "100%", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #a80000",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
  dropdownItems: {
    height: 100,
    width: 150,
    overflow: "auto",
  },
});

const dropDownRegularActiveStyles = mergeStyleSets({
  dropdown: { width: "100%", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #333333",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
  dropdownItems: {
    height: 100,
    width: 150,
    overflow: "auto",
  },
});

const dropDownRegularActiveStyles1 = mergeStyleSets({
  dropdown: { width: "100%", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid #333333",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const dropDownMediumStyles = mergeStyleSets({
  dropdown: { width: "270px", minHeight: "20px" },
  title: { height: "22px", lineHeight: "18px", fontSize: "12px" },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItem: { minHeight: "22px", fontSize: 12 },
  dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const dropDownSmallStyles = mergeStyleSets({
  root: { width: "100%" },
  dropdown: { width: "100%", minHeight: "20px" },
  title: {
    height: "22px",
    lineHeight: "18px",
    fontSize: "12px",
    border: "0.5px solid transparent",
  },
  caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
  dropdownItems: {
    height: 200,
    width: 150,
    overflow: "auto",
  },
  errorMessage: {
    paddingTop: 0,
    position: "absolute",
  },
});

const calendarClass = (props, currentHover, error, value) => {
  return {

    fieldGroup: {
      width: "160px",
      height: "22px",
      borderColor: error ? "#a80000" : "transparent",
      selectors: {
        ":focus": {
          borderColor: "rgb(96, 94, 92)",
        },
      },
    },
    field: {
      fontSize: 12,
      backgroundColor:'white'
    },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};


const calendarClassActive = mergeStyleSets({
  root: {
    "*": {
      width: "100%",
      fontSize: 12,
      height: "22px !important",
      lineHeight: "20px !important",
      borderColor: "grey !important",
    },
  },
  icon: { height: 10, width: 10, left: "85%", padding: "0px 0px" },
});

const calendarErrorClass = mergeStyleSets({
  root: {
    "*": {
      width: "100%",
      fontSize: 12,
      height: "22px !important",
      lineHeight: "20px !important",
      borderColor: "#a80000",
    },
  },
  icon: {
    height: 10,
    width: 10,
    left: "85%",
    padding: "0px 0px",
    color: "#a80000",
  },
  fieldGroup: { border: "0.5px solid #a80000 !important" },
});

const SkillFieldStyles = (props, currentHover, error, value) => {
  return {
    fieldGroup: {
      height: 22,
      width: "100%",
      borderColor: error ? "#a80000" : "transparent",

      selectors: {
        ":focus": {
          borderColor: "rgb(96, 94, 92)",
        },
      },
    },
    field: {
      fontSize: 12,
      backgroundColor:'white'
    },
    errorMessage: {
      paddingTop: 0,
      position: "absolute",
    },
  };
};

const jobDescriptionStyles = (props,  currentHover, error) => {
  return {
    fieldGroup: {
      height: 32,
      width: "100%",
      color:  "rgb(96, 94, 92)",
      backgroundColor: 'white',
      color:"white",
      borderColor:'#FFFFFF',
   
      selectors: {
        ":after": {
          borderColor: error
            ? " #a80000"
            : currentHover
            ? "#0078D4 "
            : "transparent",
        },
    
        ":focus": {
          borderColor: "#FFFFFF",
        },
        ":hover": {
          borderColor: "#FFFFFF",
        },
      },
    },
    field:{
       backgroundColor:'white'
      },
  };
};

const personaStyles = {
  primaryText: {
    height: 16,
  },
};

const personaDropDownStyles = {
  root: {
    margin: "0px 5px",
  },
};

const addButtonStyles = {
  icon: {
    color: "rgb(50, 49, 48)",
    fontSize: 14,
  },
};

const removeIconClass = mergeStyles({
  fontSize: 10,
  height: "12px",
  width: "12px",
  cursor: "pointer",
  color: "red",
});

const unassignedDropdownStyles = {
  dropdown: {
    width: 120,
  },
  title: {
    height: 30,
  },
};

const editorToolbarOptions = {
  options: ["inline", "list", "link", "history"],
  inline: {
    bold: { icon: boldicon, className: undefined },
    options: ["bold", "italic", "underline"],
  },
  list: {
    options: ["unordered", "ordered"],
  },
  link: {
    options: ["link"],
  },
  history: {
    options: ["undo", "redo"],
    undo: { icon: undoicon },
    redo: { icon: redoicon },
  },
  fontFamily: {
    options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
  },
};

const dropDownStatus = [
  { key: "Open", text: "Open" },
  { key: "Close", text: "Close" },
  { key: "On Hold", text: "On Hold" },
  { key: "In Progress", text: "In Progress" },
];

const dropDownPriority = [
  { key: "Low", text: "Low" },
  { key: "Medium", text: "Medium" },
  { key: "High", text: "High" },
];

const dropDownNoticePeriod = [
  { key: "Immediate", text: "Immediate" },
  { key: "< 15 Days", text: "< 15 Days" },
  { key: "< 30 Days", text: "< 30 Days" },
  { key: "< 60 Days", text: "< 60 Days" },
  { key: "> 60 Days", text: "> 60 Days" },
];

const dropDownMonth = [
  { key: "0 months", text: "0 months" },
  { key: "1 months", text: "1 months" },
  { key: "2 months", text: "2 months" },
  { key: "3 months", text: "3 months" },
  { key: "4 months", text: "4 Months" },
  { key: "5 months", text: "5 months" },
  { key: "6 months", text: "6 months" },
  { key: "7 months", text: "7 months" },
  { key: "8 months", text: "8 months" },
  { key: "9 months", text: "9 months" },
  { key: "10 months", text: "10 months" },
  { key: "11 months", text: "11 months" },
  { key: "12 months", text: "12 months" },
];

const dropDownYear = [
  { key: "0 year", text: "0 year" },
  { key: "1 year", text: "1 year" },
  { key: "2 years", text: "2 years" },
  { key: "3 years", text: "3 years" },
  { key: "4 years", text: "4 years" },
  { key: "5 years", text: "5 years" },
  { key: "6 years", text: "6 years" },
  { key: "7 years", text: "7 years" },
  { key: "8 years", text: "8 years" },
  { key: "9 years", text: "9 years" },
  { key: "10 years", text: "10 years" },
  { key: "11 years", text: "11 years" },
  { key: "12 years", text: "12 years" },
  { key: "13 years", text: "13 years" },
  { key: "14 years", text: "14 years" },
  { key: "15+ years", text: "15+ years" },
];

const modeOfHireDropdown = [
  { key: "C2H (contract to Hire)", text: "C2H (contract to Hire)" },
  {
    key: "C2H (contract to Hire) - Client side ",
    text: "C2H (contract to Hire) - Client side ",
  },
  { key: "Permanent", text: "Permanent" },
  {
    key: "Permanent  - Internal recruitment",
    text: "Permanent  - Internal recruitment",
  },
];
const initialState = {
  job_title: "",
  assigned_to: "",
  status: "",
  no_of_positions: "",
  priority: "",
  client: "",
  job_description: "",
  additional_details: "",
  due_date: "",
  notice_period: "",
  minimum_experience_months: "",
  minimum_experience_years: "",
  maximum_experience_months: "",
  maximum_experience_years: "",
  mode_of_hire: "",
  vendor_name: "",
  poc_vendor: "",
  lead: "",
  job_rr_id: "",
};

const sanitizeObject = {
  job_title: "",
  assigned_to: "",
  status: "",
  no_of_positions: "",
  priority: "",
  client: "",
  job_description: "",
  additional_details: "",
  due_date: "",
  notice_period: "",
  minimum_experience: "",
  maximum_experience: "",
  mode_of_hire: "",
  vendor_name: "",
  poc_vendor: "",
  job_rr_id: "",
  skillset: [],
};

const convertSantizedToInitial = (data) => {
  const state = {};

  Object.keys(data).forEach((key) => {
    if (key === "skillset") {
      state[key] = [];
      data["skillset"].map((skillObj, index) => {
        state[key].push({});
        state[key][index]["skill"] = skillObj["skill"];
        state[key][index]["years"] = Number(Math.floor(skillObj["exp"] / 12));
        state[key][index]["months"] = Number(Math.floor(skillObj["exp"] % 12));
      });
      return;
    }

    if (key === "assigned_to") {
      // state[key] = data[key]["_id"];

      state[key] = data[key];
      return;
    }

    if (key === "minimum_experience") {
      state["minimum_experience_months"] = `${Math.floor(
        data["minimum_experience"] % 12
      )} months`;
      state["minimum_experience_years"] = `${Math.floor(
        data["minimum_experience"] / 12
      )} years`;
      return;
    }

    if (key === "maximum_experience") {
      state["maximum_experience_months"] = `${Math.floor(
        data["maximum_experience"] % 12
      )} months`;
      state["maximum_experience_years"] = `${Math.floor(
        data["maximum_experience"] / 12
      )} years`;
      return;
    }

    state[key] = data[key];
  });

  return state;
};

const ViewDemand = (props) => {
  const propsDemandId=props.demandId

  let isModalOpen = props. isModalDemandOpen;
  const  setIsModalOpen = props.setIsModalDemandOpen;

    const [isModalShrunk,setIsModalShrunk] = useState(false)


    
    const modalSizeHandler = () => {
      setIsModalShrunk(!isModalShrunk);
    };

  const demand_location = useLocation();
  const mydemandValidate = demand_location.state;

  const [searchParams, setSearchParams] = useSearchParams();
  const [firstLoad, setFirstLoad] = useState(false);
  const [demandId, setDemandId] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const [currentHover, setCurrentHover] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [personaText, setPersonaText] = useState("");
  const [personaList, setPersonaList] = useState([]);

  const [showAssignedDemandmodal, setShowAssignedDemandModal] = useState(false);

  const [isPersonaListLoaded, setIsPersonaListLoaded] = useState(false);
  const [dropDownVendors, setDropDownVendors] = useState([]);
  const [dropDownClients, setDropDownClients] = useState([]);
  const [dropDownSkills, setDropDownSkills] = useState([]);

  const navigateTo = useNavigate();

  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const [editorState2, setEditorState2] = React.useState(() =>
    EditorState.createEmpty()
  );

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    axiosPrivateCall
      .get(`/api/v1/vendor/listVendors`)
      .then((res) => {
        let buffer = res.data;
        let dropdown_data = buffer.map((obj) => {
          return { key: obj.company_name, text: obj.company_name };
        });
        setDropDownVendors(dropdown_data);
      })
      .catch((e) => {
        console.log(e);
      });

    axiosPrivateCall
      .get(`/api/v1/client/listClients`)
      .then((res) => {
        let buffer = res.data;
        let dropdown_data = buffer.map((obj) => {
          return { key: obj.company_name, text: obj.company_name };
        });
        setDropDownClients(dropdown_data);
      })
      .catch((e) => {
        console.log(e);
      });

    axiosPrivateCall
      .get(`/api/v1/skill/listSkills`)
      .then((res) => {
        let buffer = res.data;
        let dropdown_data = buffer.map((obj) => {
          return { key: obj.skill_name, text: obj.skill_name };
        });
        setDropDownSkills(dropdown_data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    axiosPrivateCall
      .get("/api/v1/employee/getReportsToHierarchy")
      .then((res) => {
        const personaArr = res.data;

        if (personaArr.length) {
          setPersonaList(
            personaArr.map((persona) => {
              return {
                text: persona["first_name"] + " " + persona["last_name"],
                id: persona["_id"],
                imageInitials:
                  persona["first_name"].slice(0, 1).toUpperCase() +
                  persona["last_name"].slice(0, 1).toUpperCase(),
                secondaryText: persona["email"],
                showSecondaryText: true,
              };
            })
          );

          setIsPersonaListLoaded(true);
          setPersona(personaArr);
          console.log(personaList, "losss", personaArr);
        }
      })
      .catch((e) => {
        console.log(e);
      });
    axiosPrivateCall(
      `/api/v1/demand/getDemandDetails?demand_id=${propsDemandId}`
    )
      .then((res) => {
        setDemandData(convertSantizedToInitial(res.data));
        setFirstLoad(true);
        const errorObj = getErrorObj(convertSantizedToInitial(res.data));
        // setErrors(errorObj);
        // setPersona(res.data.assigned_to)
        setDemandId(res.data.DemandId);
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    const contentLength = editorState
      .getCurrentContent()
      .getPlainText()
      .trim().length;
    if (contentLength === 0 || contentLength >= 10) {
      setErrors((prevData) => {
        return {
          ...prevData,
          job_description: "",
        };
      });
      setDemandData((prevData) => {
        return {
          ...prevData,
          job_description: draftToHtml(
            convertToRaw(editorState.getCurrentContent())
          ),
          additional_details: draftToHtml(
            convertToRaw(editorState2.getCurrentContent())
          ),
        };
      });
    } else if (contentLength < 10) {
      setDemandData((prevData) => {
        return {
          ...prevData,
          job_description: draftToHtml(
            convertToRaw(editorState.getCurrentContent())
          ),
          additional_details: draftToHtml(
            convertToRaw(editorState2.getCurrentContent())
          ),
        };
      });
    }

    if (demandData.job_description.length > 18) {
      setErrors((prevData) => {
        return {
          ...prevData,
          job_description: "",
        };
      });
    }
  }, [editorState, editorState2]);

  const handleEditorStateChange = (newEditorState) => {
    const content = newEditorState.getCurrentContent().getPlainText().trim();
    if (content.length === 0) {
      setErrorMessage("");
    } else if (content.length < 10) {
      setErrorMessage("Minimum 10 characters Required");
    } else {
      setErrorMessage("");
    }
    setEditorState(newEditorState);
  };
  useEffect(() => {
    if (firstLoad) {
      const jobHTML = demandData.job_description;
      const additionalHTML = demandData.additional_details;

      const contentBlock = htmlToDraft(jobHTML);
      const contentBlock2 = htmlToDraft(additionalHTML);

      const contentState = ContentState.createFromBlockArray(
        contentBlock.contentBlocks
      );
      const editorState = EditorState.createWithContent(contentState);

      const contentState2 = ContentState.createFromBlockArray(
        contentBlock2.contentBlocks
      );
      const editorState2 = EditorState.createWithContent(contentState2);

      setEditorState(EditorState.createWithContent(contentState));
      setEditorState2(EditorState.createWithContent(contentState2));

      setFirstLoad(false);
    }
  }, [firstLoad]);

  const personaRef = useRef(null);

  useEffect(() => {}, []);

  const setPersona = (assigned_to) => {
    console.log(assigned_to, "kkk");

    setPersonaList([
      {
        text: assigned_to["first_name"] + " " + assigned_to["last_name"],
        id: assigned_to["_id"],
        imageInitials:
          assigned_to["first_name"].slice(0, 1).toUpperCase() +
          assigned_to["last_name"].slice(0, 1).toUpperCase(),
        secondaryText: assigned_to["email"],
        showSecondaryText: true,
      },
    ]);

    setPersonaText(assigned_to["email"]);

    setIsPersonaListLoaded(true);
  };

  const escKeyHandler = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
    }
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      escKeyHandler(event);
    };

    document.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  const [demandData, setDemandData] = useState({
    ...initialState,
    skillset: [
      {
        skill: "",
        years: "",
        months: "",
      },
    ],
  });

  const [errors, setErrors] = useState({
    ...initialState,
    skillset: [
      {
        skill: "",
        years: "",
        months: "",
      },
    ],
  });

  const dropDownHandler = (e, item, name) => {
    setDemandData((prevData) => {
      return {
        ...prevData,
        [name]: item.text,
      };
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const hoverHandler = (name) => {
    setCurrentHover(name);
  };

  const skillSetInputHandler = (e, name, index, arr) => {
    const skillsetArr = [...arr];

    let value = e.target.value;

    let isSkillInputValid = true;

    if (name === "years") {
      if (!isNumOnly(value)) {
        isSkillInputValid = false;
      }

      if (isEmpty(value)) {
        isSkillInputValid = true;
      }
    }

    if (name === "months") {
      if (!isNumOnly(value) || value > 12) {
        isSkillInputValid = false;
      }

      if (isEmpty(value)) {
        isSkillInputValid = true;
      }
    }

    if (isSkillInputValid) {
      if (!skillsetArr[index]) {
        skillsetArr[index] = {
          skill: "",
          years: "",
          months: "",
        };
      }

      skillsetArr[index][name] = value;

      setDemandData((prevData) => {
        return {
          ...prevData,
          skillset: skillsetArr,
        };
      });

      setErrors((prevData) => {
        const skillsetErrArr = [...prevData.skillset];
        skillsetErrArr[index] = {
          ...skillsetErrArr[index],
          [name]: "",
        };
        return {
          ...prevData,
          skillset: skillsetErrArr,
        };
      });
    }
  };

  const removeSkill = (skillData, index, arr) => {
    if (index === 0) return;

    const newskillsetArr = arr.filter((val) => val !== skillData);

    setDemandData((prevData) => {
      return {
        ...prevData,
        skillset: newskillsetArr,
      };
    });

    const newskillsetErrArr = errors.skillset.filter((val, i) => i !== index);

    setErrors((prevData) => {
      return {
        ...prevData,
        skillset: newskillsetErrArr,
      };
    });
  };

  const dateHandler = (date, name) => {
    setDemandData((prevData) => {
      return {
        ...prevData,
        [name]: date,
      };
    });
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const inputChangeHandler = (e, inputName) => {
    const { value } = e.target;
    let inputValue = value;

    let isInputValid = true;

    if (inputName === "no_of_positions") {
      if (!isNumOnly(value)) {
        isInputValid = false;
      }

      if (isEmpty(value)) {
        isInputValid = true;
      }
    }

    if (inputName === "vendor_name") {
      isInputValid = vendorRegex.test(value);
    }

    if (inputName === "job_rr_id") {
      isInputValid = jobRRRegex.test(value);
    }

    if (inputName === "no_of_positions") {
      inputValue = Number(inputValue);

      if (isEmpty(value)) {
        inputValue = "";
      }
    }

    if (isInputValid) {
      setDemandData({
        ...demandData,
        [inputName]: inputValue,
      });
      setErrors({
        ...errors,
        [inputName]: "",
      });
    }
  };

  const addSkillSet = () => {
    const skillsetArr = demandData.skillset;
    skillsetArr.push({
      skill: "",
      years: "",
      months: "",
    });

    setDemandData((prevData) => {
      return {
        ...prevData,
        skillset: skillsetArr,
      };
    });

    const skillsetErrArr = errors.skillset;

    skillsetErrArr.push({
      skill: "",
      years: "",
      months: "",
    });

    setErrors((prevData) => {
      return {
        ...prevData,
        skillset: skillsetErrArr,
      };
    });
  };

  const [isPersonaOpen, setIsPersonaOpen] = useState(false);

  const personaClickHandler = (persona) => {
    setDemandData((prevState) => {
      setPersonaText(persona.secondaryText);

      console.log(persona);
      return {
        ...prevState,
        assigned_to: persona.id,
      };
    });

    setErrors((prevData) => {
      return {
        ...prevData,
        assigned_to: "",
      };
    });
    setIsPersonaOpen(isPersonaOpen);
  };

  const getErrorObj = (obj) => {
    const errorObj = {};
    let min_month = parseInt(
      getNumberFromString(obj.minimum_experience_months)
    );
    let max_month = parseInt(
      getNumberFromString(obj.maximum_experience_months)
    );
    let min_year = parseInt(getNumberFromString(obj.minimum_experience_years));
    let max_year = parseInt(getNumberFromString(obj.maximum_experience_years));
    for (const [key, value] of Object.entries(obj)) {
      if (Array.isArray(value)) {
        errorObj[key] = [];
        value.map((data, index) => {
          let newErrObj = {};

          Object.keys(data).map((key) => {
            if (isEmpty(data[key])) {
              return (newErrObj[key] = "Required");
            } else {
              return (newErrObj[key] = "");
            }
          });
          return (errorObj[key][index] = newErrObj);
        });
      } else if (isEmpty(value)) {
        errorObj[key] = "Required";
      } else {
        errorObj[key] = "";
      }
      if (min_year > max_year) {
        errorObj["maximum_experience_years"] = " Min exp exceeds max exp.";
      } else if (key === "maximum_experience_months") {
        const min_experience_total = min_year * 12 + min_month;
        const max_experience_total = max_year * 12 + max_month;
        if (min_experience_total > max_experience_total) {
          errorObj[key] = "Min exp exceeds max exp.";
        }
      }
    }

    return errorObj;
  };
  const sanitizer = (data) => {
    const sanitizedData = {};

    console.log(data);

    Object.keys(data).forEach((key) => {
      if (key === "skillset") {
        sanitizedData[key] = [];

        data["skillset"].map((skillObj, index) => {
          console.log(skillObj, index);
          sanitizedData[key].push({});
          sanitizedData[key][index]["skill"] = skillObj["skill"];
          sanitizedData[key][index]["exp"] =
            Number(skillObj["years"] * 12) + Number(skillObj["months"]);
        });
        return;
      }

      if (key === "minimum_experience_years") {
        return (sanitizedData["minimum_experience"] = sanitizedData[
          "minimum_experience"
        ]
          ? parseInt(data[key]) * 12 + sanitizedData["minimum_experience"]
          : parseInt(getNumberFromString(data[key]) * 12));
      }

      if (key === "minimum_experience_months") {
        return (sanitizedData["minimum_experience"] = sanitizedData[
          "minimum_experience"
        ]
          ? parseInt(data[key]) + sanitizedData["minimum_experience"]
          : parseInt(getNumberFromString(data[key])));
      }
  
      if (key === "maximum_experience_years") {
        return (sanitizedData["maximum_experience"] = sanitizedData[
          "maximum_experience"
        ]
          ? parseInt(data[key]) * 12 + sanitizedData["maximum_experience"]
          : parseInt(getNumberFromString(data[key]) * 12));
      }

      if (key === "maximum_experience_months") {
        return (sanitizedData["maximum_experience"] = sanitizedData[
          "maximum_experience"
        ]
          ? parseInt(data[key]) + sanitizedData["maximum_experience"]
          : parseInt(getNumberFromString(data[key])));
      }

      sanitizedData[key] = data[key];
    });

    return sanitizedData;
  };

  const updateDemand = () => {
    axiosPrivateCall
      .post("/api/v1/demand/updateDemand", sanitizer(demandData))
      .then((res) => {
        console.log(res);
        setIsLoading(false);
        mydemandValidate.demand === "mydemand"
          ? navigateTo("/demand/mydemands")
          : navigateTo("/demand/managedemands");
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const submitHandler = () => {
    if (!isLoading) {
      setIsLoading(true);
    }

    const errorObj = getErrorObj(demandData);
    console.log(errorObj);
    setErrors(errorObj);

    const isSkillsetEmpty = demandData.skillset.some(
      (skill) => skill.skill === "" || skill.years === "" || skill.months === ""
    );

    if (isDemandDataValid(demandData) && !isSkillsetEmpty) {
      console.log("valid");
      updateDemand();
    } else {
      console.log("not valid");
    }
  };

  function formatDate(inputDate) {
  const dateObject = new Date(inputDate);
  const month = (dateObject.getMonth() + 1).toString().padStart(2, '0');
  const day = dateObject.getDate().toString().padStart(2, '0');
  const year = dateObject.getFullYear();

  return `${month}/${day}/${year}`;
}

  const isDemandDataValid = (obj) => {
    const excludedFields = ["vendor_name", "poc_vendor", "job_rr_id"];
    let min_month = parseInt(
      getNumberFromString(obj.minimum_experience_months)
    );
    let max_month = parseInt(
      getNumberFromString(obj.maximum_experience_months)
    );
    let min_year = parseInt(getNumberFromString(obj.minimum_experience_years));
    let max_year = parseInt(getNumberFromString(obj.maximum_experience_years));
    for (const [key, value] of Object.entries(obj)) {
      if (excludedFields.includes(key)) {
        continue; // skip validation for excluded fields
      }
      console.log(demandData.job_description.length === 8 ? true : false, "ss");
      if (
        demandData?.job_description &&
        demandData.job_description.length === 8
      ) {
        return true;
      } else if (
        demandData?.job_description &&
        demandData.job_description.length < 18
      ) {
        setErrorMessage("Minimum 10 characters Required");
        return false;
      }
      if (Array.isArray(value)) {
        return value.every((data, index) => {
          return Object.values(data).every((val) => !isEmpty(val));
        });
      }

      if (isEmpty(value)) {
        return false;
      }
      if (errors.maximum_experience_years === "Min exp exceeds max exp.") {
        return false;
      }
      const min_experience_total = min_year * 12 + min_month;
      const max_experience_total = max_year * 12 + max_month;
      if (min_experience_total > max_experience_total) {
        return false;
      }
    }
    return true;
  };

  const [min_experience, setMin_Experience] = useState([]);
  const [initial_experience, set_initial_experience] = useState([]);
  const [experience_update, set_experience_update] = useState(false);
  const list_format = [];

  const initial_max_experience_year = () => {
    dropDownYear.map((value, index) => {
      if (demandData.minimum_experience_years === value.text) {
        for (let i = index; i <= dropDownYear.length - 1; i++) {
          list_format.push(dropDownYear[i]);
        }
        return set_initial_experience(list_format);
      }
    });
  };

  const min_experience_list = [];
  const minimum_experience_filter = (max_experience) => {
    dropDownYear.map((value, index) => {
      if (max_experience === value.text) {
        for (let i = index; i > 0; i--) {
          min_experience_list.push(dropDownYear[i]);
        }
        return setMin_Experience(min_experience_list);
      }
    });
  };

  useEffect(() => {
    minimum_experience_filter();
    initial_max_experience_year();
  }, []);

  function isValidInput(input) {
    const regex = /^[a-zA-Z\s]*$/;
    return regex.test(input);
  }
  
  return (
    <div>
    
    {
      <Popup   showPopup={showPopup} setShowPopup={setShowPopup} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen }/>}
		  <Modal scrollableContentClassName={styles.ViewDemand_modal_scrollable_content} containerClassName={`${isModalShrunk ? styles.viewdemand_modal_container_shrunk : styles.viewdemand_modal_container}`} 
        isOpen={isModalOpen}>
      <form>
        <div className={styles.adddemand_modal_header_container}>
          <div className={styles.header_tag_expand_close_icon_container}>
            <div className={styles.header_tag_container}>Demand</div>
            <div className={styles.header_demand_id_container}>
              Demand ID : {demandId ? demandId : ""}
            </div>

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
                onClick={() =>setIsModalOpen(!setIsModalOpen)}
                className={styles.header_close_icon_container}
              >
                <Icon iconName="ChromeClose" className={closeIconClass} />
              </div>
            </div>
          </div>
          <div className={styles.header_content_container}>
            <div
              className={
                styles.header_content_job_description_unassigned_save_container
              }
            >
              <div
                className={
                  styles.header_content_job_description_unassigned_container
                }
              >
                <div
                  className={styles.header_content_job_description_container}
                >
                  <div 
                  
                  >
                    <TextField
                    disabled
                      value={demandData.job_title}
                      styles={(props,field) =>
                        jobDescriptionStyles(
                          props,
                          currentHover,
                          errors.job_title)
                       
                      }
                      placeholder={"job_title"}
                      resizable={false}
                    />
                  </div>
                </div>
                <div
                  ref={personaRef}
                  id="personaId"
                  className={styles.unassigned_container}
                >
                  <div className={styles.unassigned_title_icon_container}>
                    <div className={styles.unassigned_title_container}>
                      {`Assigned  ${demandData?.assigned_to?.length}`}
                     
                    </div>
                    <div className={styles.unassigned_icon_container}>
                      {
                        <Icon
                          iconName="ChevronDown"
                          className={downIconClass}
                        />
                      }
                    </div>
                  </div>
                 
                </div>
              </div>

            </div>
          </div>
        </div>
      </form>
      <div className={styles.main_filter_options_container}>
        <div className={styles.main_filter_options_sub_container}>
          <div className={styles.main_role_dropdown_container}>
            <div className={styles.main_role_title}>Status </div>
            <div 
            
            >
             <Dropdown
             disabled
 
  placeholder={demandData.status}
  notifyOnReselect
  styles={(props) =>
    dropDownStylesActive(props, currentHover, errors.status, "status")
  }

/>
            </div>
          </div>
          <div className={styles.main_role_dropdown_container}>
            <div className={styles.main_role_title}>No of Positions</div>
            <div>
              <TextField
              disabled
                value={demandData.no_of_positions}
  
                styles={(props) =>
                  textFieldColored(
                    props,
                    currentHover,
                    errors.no_of_positions,
                    "no_of_positions"
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className={styles.main_filter_options_sub_container}>
          <div className={styles.main_role_dropdown_container}>
            <div className={styles.main_role_title}>Priority </div>
            <div 
          
            >
              <Dropdown
              disabled
                placeholder={demandData.priority}
                notifyOnReselect
                styles={(props) =>
                  dropDownStylesActive(
                    props,
                    currentHover,
                    errors.priority,
                    "priority"
                  )
                }
                
              />
            </div>
          </div>
          <div className={styles.main_role_dropdown_container}>
            <div className={styles.main_role_title}>Client</div>
            <div
        
             >
              <TextField
              disabled
                value={demandData.client}
                placeholder="Enter Client Name"
                styles={(props) =>
                  textFieldColored(props, currentHover, errors.client, "client")
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main_information_container}>
        <div className={styles.main_information_sub_container_left}>
          <div className={styles.main_job_description_demand_vendor_container}>
            <div className={styles.main_basic_information_title}>
              JOB DESCRIPTION
            </div>

            <div
              className={`${styles.main_wysiwyg_container} ${
                errors.job_description
                  ? styles.main_wysiwyg_container_error
                  : ""
              } 
								${
                  demandData.job_description.length > 8
                    ? styles.main_wysiwyg_container_focus
                    : ""
                }`}
            >
              <Editor readOnly
                wrapperClassName={styles.editor_wrapper}
                toolbar={editorToolbarOptions}
                toolbarOnFocus
                toolbarClassName={styles.editor_toolbar}
                editorClassName={styles.editor_editor}
                placeholder="Click to add description (Mininum 10 characters)"
                editorState={editorState}
              />
            </div>
            <div className={styles.error}>
              {errorMessage && <p>{errorMessage}</p>}
            </div>
          </div>
          <div className={styles.main_job_description_demand_vendor_container}>
            <div className={styles.main_basic_information_title}>
              <Label style={{ fontSize: "12px" }}>ADDITIONAL INFORMATION</Label>
            </div>

            <div
              className={`${styles.main_wysiwyg_container} ${
                demandData.additional_details.length > 8
                  ? styles.main_wysiwyg_container_focus
                  : ""
              }`}
            >
              <Editor readOnly
                wrapperClassName={styles.editor_wrapper}
                placeholder="Click to add description"
                toolbarOnFocus
                toolbarClassName={styles.editor_toolbar}
                editorClassName={styles.editor_editor}
                toolbar={editorToolbarOptions}
                editorState={editorState2}
               
              />
            </div>
          </div>
        </div>
        <div className={styles.main_information_sub_container_right}>
          <div className={styles.main_right_demand_vendor_info_container}>
            <div className={styles.main_right_demand_info_container}>
              <div className={styles.main_basic_information_title}>
                <div style={{ fontSize: "12px" }} required>
                  DEMAND INFORMATION
                </div>
              </div>
              <div className={styles.main_right_demand_info_content_container}>
                <div
                  className={
                    styles.demand_info_duedate_min_experience_container
                  }
                >
                  <div className={styles.demand_info_due_date_title}>
                    Due Date
                  </div>
                  <div
                    className={styles.demand_info_due_date_dropdown_container}
                  >
                    <div 
                    >
                     <TextField
                      disabled
                        placeholder={"DD/MM/YYYY"}
                        styles={(props) =>
                          calendarClass(
                            props,
                            currentHover,
                            errors.due_date,
                            "due_date"
                          )
                        }
                        value={formatDate(new Date(demandData.due_date))}
                      
                        
                      />
                      
                    </div>
                  </div>
                  <div className={styles.demand_info_min_experience_title}>
                    Minimum Experience
                  </div>
                  <div
                    className={
                      styles.demand_info_min_experience_dropdown_container
                    }
                  >
                    <div
                      className={
                        styles.demand_info_min_experience_dropdown_container_half
                      }
                    >
                      <div
                       
                      >
                       <Dropdown
                          disabled
                          placeholder={ demandData.minimum_experience_years
                          
                          }
                          notifyOnReselect
                          styles={(props) =>
                            dropDownRegularStyles(
                              props,
                              currentHover,
                              errors.minimum_experience_years,
                              "minimum_experience_years"
                            )
                          }
                        
                        />
                      </div>
                    </div>
                    <div
                      className={
                        styles.demand_info_min_experience_dropdown_container_half
                      }
                    >
                      <div
                        onClick={() =>
                          setCurrentHover("minimum_experience_months")
                        }
                      >
                        <Dropdown
                        disabled
                          selectedKey={demandData.minimum_experience_months}
                          errorMessage={errors.minimum_experience_months}
                          placeholder="months"
                          notifyOnReselect
                          styles={(props) =>
                            dropDownRegularStyles(
                              props,
                              currentHover,
                              errors.minimum_experience_months,
                              "minimum_experience_months"
                            )
                          }
                          options={dropDownMonth}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={
                    styles.demand_info_notice_period_min_experience_container
                  }
                >
                  <div className={styles.demand_info_notice_period_title}>
                    Notice Period
                  </div>
                  <div
                    className={
                      styles.demand_info_notice_period_dropdown_container
                    }
                  >
                    <div 
                    >
                      <Dropdown
                        disabled
                        placeholder={"DD/MM/YYYY"}
                        notifyOnReselect
                        errorMessage={errors.notice_period}
                        selectedKey={demandData.notice_period}
                        styles={(props) =>
                          dropDownRegularNoticeStyles(
                            props,
                            currentHover,
                            errors.notice_period,
                            "notice_period"
                          )
                        }
                        options={dropDownNoticePeriod}
                      />
                    </div>
                  </div>
                  <div className={styles.demand_info_max_experience_title}>
                    Maximum Experience
                  </div>
                  <div
                    className={
                      styles.demand_info_max_experience_dropdown_container
                    }
                  >
                    <div
                      className={
                        styles.demand_info_min_experience_dropdown_container_half
                      }
                    >
                      <div
                        onClick={() =>
                          setCurrentHover("maximum_experience_years")
                        }
                      >
                        <Dropdown
                          disabled
                          selectedKey={
                            demandData.maximum_experience_years === "15 years"
                              ? "15+ years"
                              : demandData.maximum_experience_years
                          }
                          onChange={(e, item) => {
                            dropDownHandler(
                              e,
                              item,
                              "maximum_experience_years"
                            );
                            minimum_experience_filter(item.key);
                            setCurrentHover("");
                          }}
                          onClick={() => {
                            set_experience_update(true);
                            initial_max_experience_year();
                          }}
                          placeholder="years"
                          notifyOnReselect
                          errorMessage={errors.maximum_experience_years}
                          styles={(props) =>
                            dropDownRegularStyles(
                              props,
                              currentHover,
                              errors.maximum_experience_years,
                              "maximum_experience_years"
                            )
                          }
                          options={
                            experience_update
                              ? initial_experience
                              : dropDownYear
                          }
                        />
                      </div>
                    </div>
                    <div
                      className={
                        styles.demand_info_min_experience_dropdown_container_half
                      }
                    >
                      <div
                        onClick={() =>
                          setCurrentHover("maximum_experience_months")
                        }
                      >
                        <Dropdown
                          disabled
                          selectedKey={demandData.maximum_experience_months}
                          onChange={(e, item) => {
                            dropDownHandler(
                              e,
                              item,
                              "maximum_experience_months"
                            );
                            setCurrentHover("");
                          }}
                          placeholder="months"
                          notifyOnReselect
                          errorMessage={errors.maximum_experience_months}
                          styles={(props) =>
                            dropDownRegularStyles(
                              props,
                              currentHover,
                              errors.maximum_experience_months,
                              "maximum_experience_months"
                            )
                          }
                          options={dropDownMonth}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className={styles.vendor_info_mode_of_hire_title}>
                  Mode of Hire
                </div>
                <div
                  className={styles.vendor_info_mode_of_hire_dropdown_container}
                >
                  <div 
                  >
                    <Dropdown
                      disabled
                      selectedKey={demandData.mode_of_hire}
                      placeholder="Select"
                      notifyOnReselect
                      styles={(props) =>
                        dropDownStyles(
                          props,
                          currentHover,
                          errors.mode_of_hire,
                          "mode_of_hire"
                        )
                      }
                      options={modeOfHireDropdown}

                    />
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.main_right_vendor_info_container}>
              <div className={styles.main_basic_information_title}>
                VENDOR INFORMATION 
              </div>
              <div className={styles.main_right_vendor_info_content_container}>
                <div
                  className={
                    styles.vendor_info_mode_of_hire_point_of_contact_vendor_job_rr_id_container
                  }
                >
                  <div
                    className={styles.vendor_info_point_of_contact_vendor_title}
                  >
                    Vendor Name
                  </div>
                  <div
                    className={
                      styles.vendor_info_point_of_contact_vendor_dropdown_container
                    }
                  >
                    <div 
                    
                    >
                      <TextField
                        disabled
                        value={demandData.vendor_name}
                        styles={(props) =>
                          textField(
                            props,
                            currentHover
                          )
                        }
                      />

                    </div>
                  </div>

                  <div
                    className={styles.vendor_info_point_of_contact_vendor_title}
                  >
                    Point of contact Vendor{" "}
                  </div>
                  <div
                    className={
                      styles.vendor_info_point_of_contact_vendor_dropdown_container
                    }
                  >
                    <div onClick={() => setCurrentHover("poc_vendor")}>
                      <TextField
                      disabled
                        value={demandData.poc_vendor}
                        placeholder={"POC Vendor Name"}
                        styles={(props) =>
                          textField(
                            props,
                            currentHover
                            
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.vendor_info_job_rr_id_title}>
                    Job / RR ID
                  </div>
                  <div
                    className={styles.vendor_info_job_rr_id_dropdown_container}
                  >
                    <div>
                      <TextField
                        disabled
                        value={demandData.job_rr_id}
                        styles={(props) =>
                          textField(
                            props,
                            currentHover
                            
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.main_right_skillset_container}>
            <div
              className={styles.main_right_skill_set_title_add_icon_container}
            >
              <div className={styles.main_right_skill_set_title}>
                <Label style={{ fontSize: "12px" }} required>
                  SKILL SET
                </Label>
              </div>
            </div>
            <div className={styles.main_right_skill_set_experience_container}>
              <div
                className={styles.main_right_skill_set_title_dropdown_container}
              >
                <div className={styles.main_right_skill_set_title_sub_title}>
                  Skill Set
                </div>
                {demandData.skillset.map((skillData, index, arr) => {
                  return (
                    <div
                      className={styles.main_right_skill_set_dropdown_container}
                    >
                      <div>
                       
                        <TextField
                        disabled
                          type="text"
                          name={`skill`}
                          index={index}
                          skillArr={true}
                          arr={arr}
                          setInfo={setDemandData}
                          setInfoErrors={setErrors}
                          value={demandData.skillset[index]?.skill}
                          errorMessage={errors.skillset[index]?.skill}
                          dropdown={dropDownSkills}
                          placeholder={
                            index === 0
                              ? "Primary Skill Set"
                              : index === 1
                              ? "Secondary Skill Set"
                              : "Other Skills"
                          }
                          styles={(props) => textField(props, currentHover)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className={styles.main_right_skill_experience_container}>
                <div
                  className={styles.main_right_skill_experience_title_sub_title}
                >
                  Relevant Skill Experience
                </div>

                <div>
                  {demandData.skillset.map((skillData, index, arr) => {
                    return (
                      <div
                        className={
                          styles.main_right_skill_experience_dropdown_remove_icon_container
                        }
                      >
                        <div
                          className={
                            styles.main_right_skill_experience_dropdown_container
                          }
                        >
                          <div 
                         
                          >
                            <TextField
                              disabled
                              value={demandData.skillset[index]?.years}
                              placeholder="Years"
                              styles={(props) =>
                                SkillFieldStyles(
                                  props,
                                  currentHover,
                                  errors.skillset[index]?.years,
                                  `years${index}`
                                )
                              }
                            />
                          </div>
                          <div>
                            <TextField
                             disabled 
                              value={demandData.skillset[index]?.months}
                              placeholder="Months"
                              styles={(props) =>
                                SkillFieldStyles(
                                  props,
                                  currentHover,
                                  errors.skillset[index]?.months,
                                  `years${index}`
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
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

export default ViewDemand;
