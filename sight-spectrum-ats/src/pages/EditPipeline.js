import React, { useState, useEffect, useRef } from 'react'
import styles from './AddPipelineModal.module.css'
import { TextField, PrimaryButton, DatePicker, Label, DefaultButton, Icon, FontIcon } from '@fluentui/react';
import { Dropdown } from '@fluentui/react/lib/Dropdown';
import { mergeStyles } from '@fluentui/react';
import { Editor } from 'react-draft-wysiwyg';
import { ContentState, EditorState, convertToRaw } from "draft-js";
import boldicon from "../../src/assets/boldicon.svg";
import undoicon from "../../src/assets/undoicon.svg";
import redoicon from "../../src/assets/redoicon.svg";
import { useLocation, useNavigate } from 'react-router-dom';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { axiosPrivateCall } from "../constants";
import { isEmpty, isNumOnly } from '../utils/validation';
import { UploadPopup } from '../components/UploadModal';

// regex
const vendorRegex = /^[a-zA-Z0-9 @,.()-]*$/;
const nameInputRegex = /^[a-zA-Z\u00c0-\u024f\u1e00-\u1eff ]*$/;

const dropDownStylesActive = (props, currentHover, error, value) => {
    return {
        dropdown: {
            width: "135px",
            minWidth: "120px",
            minHeight: "20px",
            selectors: {
                ":focus": {
                    borderColor: "rgb(96, 94, 92)",
                },
            },
        },
        title: {
            height: "22px",
            lineHeight: "18px",
            fontSize: "12px",
            //     borderColor: error
            //         ? "#a80000"
            //         : currentHover === value
            //             ? "rgb(96, 94, 92)"
            //             : "transparent",
        },

        caretDownWrapper: { height: "22px", lineHeight: "20px !important" },
        dropdownItem: { minHeight: "20px", fontSize: 12 },
        dropdownItemSelected: { minHeight: "22px", fontSize: 12 },
    };
};

const tableCloseIconClass = mergeStyles({
    fontSize: 10,
    height: "12px",
    width: "12px",
    cursor: "pointer",
    color: "red",
});
const calendarClass = (props, currentHover, error, value) => {
    return {
        root: {

            "*": {
                width: "135px",
                fontSize: "12px !important",
                height: "22px !important",
                lineHeight: "20px !important",
                borderColor: 'rgb(50, 49, 48)',

                // borderColor: error
                //     ? "rgb(168,0,0)"
                //     : currentHover === value
                //         ? "rgb(50, 49, 48) !important "
                //         : "transparent !important",
                // selectors: {
                //     ":focus": {
                //         borderColor: "rgb(50, 49, 48)",
                //     },
                // },
            },
        },

        icon: { height: 10, width: 10, left: "85%", padding: "0px 0px" },
    };
};

const textFieldColored = (props, currentHover, error, value) => {
    return {
        fieldGroup: {
            display: 'flex',
            width: "135px",
            height: "22px",
            backgroundColor: "#FFFFFF",
            color: 'rgba(102, 102, 102, 1) ',
            selectors: {
                ":focus": {
                    borderColor: "rgb(96, 94, 92)",
                },
            },
        },
        field: {
            fontSize: 12,
        },
        root: {
            marginLeft: '10px', 
          },
    };
};

const dealNameOptions = [
    { key: "Staffing", text: "Staffing" },
    { key: "Projects", text: "Projects" },
    { key: "Others", text: "Others" },    
    { key: "Consulting & Delivery", text: "Consulting & Delivery" },
    { key: "Training Deployment", text: "Training Deployment" },

]
const shortStatusOptions = [
    { key: "Prospect", text: "Prospect" },
    { key: "Lead", text: "Lead" },
    { key: "Presales", text: "Presales" },
    { key: "Sales", text: "Sales" },
    { key: "Closure", text: "Closure" },
    { key: "Negotiate", text: "Negotiate" },
    { key: "Won", text: "Won" },
    { key: "Lost", text: "Lost" },
    { key: "Hold", text: "Hold" },
    { key: "In Progress", text: "In Progress" },
    { key: "Drop", text: "Drop" },
    { key: "N/A", text: "N/A" }

]

const businessUnitOptions = [
    { key: "India Staffing", text: "India Staffing" },
    { key: "US Staffing", text: "US Staffing" },
    { key: "UAE Staffing", text: "UAE Staffing" },
    { key: "Training", text: "Training" },
    { key: "Consulting & Products", text: "Consulting & Products" },
]
const currencyOptions = [
    { key: "INR", text: "INR" },
    { key: "USD", text: "USD" },
    { key: "Diram", text: "Diram" },
    { key: "Riyal", text: "Riyal" },
    { key: "Ringitt", text: "Ringitt" },
    { key: "EURO", text: "EURO" },
    { key: "Pound", text: "Pound" },
    { key: "Rand", text: "Rand" },
    { key: "CAD", text: "CAD" },
    { key: "Swiss Franc", text: "Swiss Franc" },
    { key: "Riel", text: "Riel" },


]

const requestOption =[
    {key:"Client Request",text:"Client Request"},
    {key:"Contract",text:"Contract"},
    {key:"Presentation",text:"Presentation"},
    {key:"RFP",text:"RFP"}
]

const confidenceOptions = [
    { key: "10", text: "10" },
    { key: "20", text: "20" },
    { key: "30", text: "30" },
    { key: "40", text: "40" },
    { key: "50", text: "50" },
    { key: "60", text: "60" },
    { key: "70", text: "70" },
    { key: "80", text: "80" },
    { key: "90", text: "90" },
    { key: "100", text: "100" },

]

const EditPipeline = () => {
    const navigate = useNavigate()
    const client_location = useLocation()
    const getclientData = client_location.state;
    const [validationErrors, setValidationErrors] = useState({});
    const [showTextField, setShowTextField] = useState(false);
    const [otherValue1, setOtherValue1] = useState('');
    const [firstLoad, setFirstLoad] = useState(false);
    const [currentHover, setCurrentHover] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [clientData, setClientData] = useState({
        client_id: '',
        Deal_name: '',
        textField: '',
        Request_type: '',
        customer_name: '',
        status: '',
        closure_date: '',
        entry_date: '',
        owner: '',
        reports_to: '',
        industry: '',
        business_Unit: '',
        currency: '',
        values: '',
        confidence: '',
        delivery_poc: '',
        lead_Reference: '',
        next_action_date: '',
        lead_Reference: '',
        opportunity_description: '',
        addtional_remarks: '',
        documents: [],

    })
    const [editorState, setEditorState] = useState(() =>
        EditorState.createEmpty()
    );

    const [editorState2, setEditorState2] = useState(() =>
        EditorState.createEmpty()
    );

    const [basicInfoerrors, setBasicInfoErrors] = useState({

    });
    let minDate = new Date();
    let close_date = new Date(clientData.entry_date)

    const dateHandler = (date, name) => {
        setClientData((prevData) => {
            return {
                ...prevData,
                [name]: date,
            };
        });
        setCurrentHover("");
        setValidationErrors((prevErrors) => {
            return {
                ...prevErrors,
                [name]: '',
            };
        });
    };
    const dropDownHandler = (e, item, name, key) => {
        if (item.key === 'Others') {
            setShowTextField(true);
          } else {
            setShowTextField(false);
          }
        setClientData((prevState) => {
            let update = { ...prevState };
            update[name] = item.text;
        });
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

    };

    useEffect(() => {
        if (getclientData) {
            getData()
        }
    }, [getclientData]);

    const validateFields = () => {
        const errors = {};
        if (!clientData.client_id) {
            errors.client_id = 'required';
        }
        if (!clientData.Request_type) {
            errors.Request_type = 'required';
        }
        if (!clientData.Deal_name) {
            errors.Deal_name = 'required';
        }
        if (!clientData.textField) {
            errors.textField = 'required';
        }
        if (!clientData.entry_date) {
            errors.entry_date = 'required';
        }

        if (!clientData.customer_name) {
            errors.closure_date = 'required';
        }
        if (!clientData.status) {
            errors.status = 'required';
        }
        if (!clientData.customer_name) {
            errors.customer_name = 'required';
        }
        if (!clientData.owner) {
            errors.owner = 'required';
        }
        if (!clientData.reports_to) {
            errors.reports_to = 'required';
        }
        if (!clientData.industry) {
            errors.industry = 'required';
        }
        if (!clientData.business_Unit) {
            errors.business_Unit = 'required';
        }
        if (!clientData.values) {
            errors.values = 'required';
        }
        if (!clientData.currency) {
            errors.currency = 'required';
        }
        if (!clientData.confidence) {
            errors.confidence = 'required';
        }
        if (!clientData.delivery_poc) {
            errors.delivery_poc = 'required';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    useEffect(() => {
        setClientData((prevData) => {
            return {
                ...prevData,
                opportunity_description: draftToHtml(
                    convertToRaw(editorState.getCurrentContent())
                ),
                addtional_remarks: draftToHtml(
                    convertToRaw(editorState2.getCurrentContent())
                ),
            };
        });
    }, [editorState, editorState2]);

    useEffect(() => {
        if (firstLoad) {
            const jobHTML = clientData.opportunity_description;
            const additionalHTML = clientData.addtional_remarks;
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

    const submitHandler = async () => {
        const isValid = validateFields();
        if (isValid) {
            try {
                const response = await axiosPrivateCall.put(`/api/v1/crm/updateData/${getclientData._id}`, clientData);
                setErrorMsg('');
                setClientData(response.data,)
                navigate('/managedeals/managesalespipeline');
            } catch (error) {
                console.error("Error submitting data:", error);
                setErrorMsg("Error submitting data");
                if (error.response) {
                    const errors = {};
                    errors.client_id = error.response.data
                    setValidationErrors(errors);
                }
            }
        }
    }

    const getData = async () => {
        try {
            const response = await axiosPrivateCall.get(`/api/v1/crm/getclientbyid/${getclientData._id}`)
            setClientData(response.data)
            setFirstLoad(true);
        }
        catch (error) {
            console.log("data not found");
        }
    }

    const inputChangeHandler = (e, inputName) => {
        e.preventDefault();
        const { value } = e.target;
        let inputValue = value;
        let isInputValid = true;
        let isNameValid = false;

        if (inputName === "client_id") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName === "customer_name" && nameInputRegex.test(inputValue)) {
            if (inputValue.length > 40) inputValue = inputValue.slice(0, 40);
            isNameValid = true;
        }
        if (inputName == "owner") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName == "reports_to") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName == "industry") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName === "values") {
            if (!isNumOnly(value)) {
                isInputValid = false;
            }
            if (isEmpty(value)) {
                isInputValid = true;
            }
        }
        if (inputName === "delivery_poc") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName === "lead_Reference") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName === "opportunity_description") {
            isInputValid = vendorRegex.test(value);
        }
        if (inputName === "addtional_remarks") {
            isInputValid = vendorRegex.test(value);
        }
        if (isInputValid) {
            setClientData({
                ...clientData,
                [inputName]: inputValue,
            });
            setValidationErrors((prevErrors) => {
                return {
                    ...prevErrors,
                    [inputName]: '',
                };
            });
        }
    };

    function UploadHandler() {
        setShowUploadPopup(true);
    }
    function handleDel() {
        setClientData((prev) => {
            let buffer = { ...prev }
            buffer.documents = [];
            return buffer;
        })
    }

    const isValidInput = (value) => {
        const allowedCharactersRegex = /^[A-Za-z0-9áéíóúüñÁÉÍÓÚÜÑ\s\-\',.\(\)&]*$/;

        if (!allowedCharactersRegex.test(value)) {
          return false;
        }

        if (value.length > 40) {
          return false;
        }

        if (value.trim() !== value) {
          return false;
        }

        if (/\s{2,}/.test(value)) {
          return false;
        }

    const exists = dealNameOptions.some((option) => option.text.toLowerCase() === value.toLowerCase());
    if (exists) {
      setErrorMessage("Opportunity/Request Already Exists");
      return false;
    }

    setErrorMessage("");

        return true;
      };

    return (
        <div>
            <UploadPopup
                showPopup={showUploadPopup}
                setShowPopup={setShowUploadPopup}
                basicInfo={clientData || { documents: [] }}
                setBasicInfo={setClientData}
            />
            <div className={styles.addcandidate_modal_header_container}>
                <div className={styles.header_tag_expand_close_icon_container}>
                    <div className={styles.header_tag_container}>
                        Sales Pipeline Sheet
                    </div>
                </div>
                <div className={styles.header_content_container}>
                    <div className={styles.header_content_title_container}>
                        <div className={styles.header_content_title_container}>
                            <div className={styles.add_info_client}>
                                <Label className={styles.label_style_clientId} required> Client ID :</Label>
                                <TextField
                                    value={clientData.client_id}
                                    placeholder='Enter Client ID'
                                    onChange={(e) => {
                                        inputChangeHandler(e, "client_id");
                                        setCurrentHover("");
                                    }}
                                    styles={textFieldColored}
                                    errorMessage={validationErrors.client_id}
                                />
                                <Label className={styles.label_style_dealId} > Deal ID : {"   "}{clientData.opportunity_id}</Label>
                            </div>
                        </div>
                    </div>
                    <div className={styles.header_content_save_container}>
                        <div className={styles.header_save_close_btns_container}>
                            <div className={styles.resumeConsole}>
                                <div className={styles.resume_conatiner} >
                                    <DefaultButton
                                        onClick={() => UploadHandler()} className={`${styles.resumeEl} ${basicInfoerrors.resume_url ? styles.errorBtn : styles.regularBtn}`}
                                    >
                                        <div className={styles.resumebtn}>
                                            <div className={styles.statusIcn} >
                                                <FontIcon className={styles.Icn} iconName={(clientData.documents.length) ? 'Accept' : `Add`} />
                                            </div>
                                            <div className={styles.statustxt}>{`Attach File`}</div>
                                        </div>
                                    </DefaultButton>
                                    <div className={styles.upload_warning_msg}>
                                        * Kindly upload pdf, doc, jpeg, png files below 1 Mb
                                    </div>
                                </div>
                                {(clientData.documents.length) ? <Icon title='Delete all uploaded documents' iconName='ChromeClose' className={tableCloseIconClass} onClick={() => handleDel()} /> : null}
                            </div>
                        </div>
                    </div>
                    <div className={styles.header_content_save_container}>
                        <div className={styles.header_save_close_btns_container}>
                            <PrimaryButton text={`Save & Close`}
                                onClick={submitHandler}
                                iconProps={{ iconName: "Save" }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.add_modal_main_container}>
                <div className={styles.border}></div>
                <div className={styles.modal_main_container}>
                    <div className={styles.sub_container}>
                        <div className={styles.opportunity_type}>
                            <Label className={styles.label_style} required>Opportunity/Request</Label>
                            <Dropdown
                                onChange={(e, item) => {
                                    dropDownHandler(e, item, "Deal_name");
                                    setCurrentHover("");
                                    setClientData({ ...clientData, Deal_name: item.key });
                                }}
                                placeholder="Select"
                                options={dealNameOptions}
                                selectedKey={clientData.Deal_name}
                                notifyOnReselect
                                styles={dropDownStylesActive}
                                errorMessage={validationErrors.Deal_name}
                            />
                            {showTextField && (
       <TextField
  onChange={(e, newValue) => {
    setOtherValue1(newValue);
    if (!isValidInput(newValue)) {
      setErrorMessage("Invalid");
    } 
    else {
      setErrorMessage("");
    }
  }}
  styles={textFieldColored}
  placeholder="Enter the Name"
  value={otherValue1}
  errorMessage={errorMessage || validationErrors.textField} 
/>
      )}
                        </div>
                        <div className={styles.customer_name}>
                                <Label className={styles.label_style} required>Request Type</Label>
                                   <Dropdown
                                    onChange={(e, item) => {
                                        dropDownHandler(e, item, "Request_type");
                                        setCurrentHover("");
                                        setClientData({ ...clientData, Request_type : item.key });
                                    }}
                                    placeholder="Select"
                                    options={requestOption}
                                    selectedKey={clientData.Request_type}
                                    notifyOnReselect
                                    styles={dropDownStylesActive}
                                    errorMessage={validationErrors.Request_type}
                                />
                            </div>
                        <div className={styles.customer_name}>
                            <Label className={styles.label_style} required>Customer Name</Label>
                            <TextField
                                value={clientData.customer_name}
                                placeholder='Enter the Name'
                                onChange={(e) => {
                                    inputChangeHandler(e, "customer_name");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.customer_name} />
                        </div>
                        <div className={styles.short_status}>
                            <Label className={styles.label_style} required>Status</Label>
                            <Dropdown
                                onChange={(e, item) => {
                                    dropDownHandler(e, item, "status");
                                    setCurrentHover("");
                                    setClientData({ ...clientData, status: item.key });
                                }}
                                placeholder="Select"
                                options={shortStatusOptions}
                                selectedKey={clientData.status}
                                notifyOnReselect
                                styles={dropDownStylesActive}
                                errorMessage={validationErrors.status}
                            />
                        </div>
                    </div>
                    <div className={styles.dates}>
                    <div className={styles.dateContainer}>
                       <div className={styles.closure_date}>
                            <Label className={`${styles.label_style} ${styles.close_date_label}`} required> Close Date</Label>
                            <DatePicker
                                minDate={close_date}
                                // className={styles.myDatePicker}
                                styles={calendarClass}
                                placeholder="DD/MM/YYYY"
                                onSelectDate={(date) => dateHandler(date, 'closure_date')}
                                value={clientData.closure_date ? new Date(clientData.closure_date) : null}
                            // errorMessage={validationErrors.closure_date}
                            />
                        </div>
                         <div className={styles.entry_date}>
                            <Label className={styles.label_style} required>Start Date</Label>
                            <DatePicker
                                minDate={minDate}
                                // className={styles.myDatePicker}
                                styles={calendarClass}
                                placeholder="DD/MM/YYYY"
                                onSelectDate={(date) => dateHandler(date, 'entry_date')}
                                value={clientData.entry_date ? new Date(clientData.entry_date) : null}
                            />
                            {validationErrors.entry_date && (
                                <div className={styles.custom_error_message}>
                                    <span>{validationErrors.entry_date}</span>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>
                <div className={styles.main_filter_options_container}>
                </div>
                <br/>
                <div className={styles.border}></div>
                <div className={styles.additional_information_container}>
                    <div className={styles.addtional_information_title}>Additional Information</div>
                    <div className={styles.grid_container}>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label} required>Owner</Label>
                            <TextField
                                value={clientData.owner}
                                placeholder='Enter the Name'
                                onChange={(e) => {
                                    inputChangeHandler(e, "owner");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.owner} />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_1} required>Reports to</Label>
                            <TextField
                                value={clientData.reports_to}
                                placeholder='Enter the Name'
                                onChange={(e) => {
                                    inputChangeHandler(e, "reports_to");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.reports_to} />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_2} required>Industry</Label>
                            <TextField
                                value={clientData.industry}
                                placeholder='Enter the industry'
                                onChange={(e) => {
                                    inputChangeHandler(e, "industry");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.industry} />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_3} required>Business Unit</Label>
                            <Dropdown
                                onChange={(e, item) => {
                                    dropDownHandler(e, item, "business_Unit");
                                    setCurrentHover("");
                                    setClientData({ ...clientData, business_Unit: item.key });
                                }}
                                placeholder="Select"
                                options={businessUnitOptions}
                                selectedKey={clientData.business_Unit}
                                notifyOnReselect
                                styles={dropDownStylesActive}
                                errorMessage={validationErrors.business_Unit}
                            />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_5} required>Currency</Label>
                            <Dropdown
                                onChange={(e, item) => {
                                    dropDownHandler(e, item, "currency");
                                    setCurrentHover("");
                                    setClientData({ ...clientData, currency: item.key });
                                }}
                                placeholder="Select"
                                options={currencyOptions}
                                selectedKey={clientData.currency}
                                notifyOnReselect
                                styles={dropDownStylesActive}
                                errorMessage={validationErrors.currency}
                            />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_5} required >Values</Label>
                            <TextField
                                value={clientData.values}
                                placeholder='Enter the Values'
                                onChange={(e) => {
                                    inputChangeHandler(e, "values");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.values}
                            />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_6} required>Confidence</Label>
                            <Dropdown
                                onChange={(e, item) => {
                                    dropDownHandler(e, item, "confidence");
                                    setCurrentHover("");
                                    setClientData({ ...clientData, confidence: item.key });
                                }}
                                placeholder="Select"
                                options={confidenceOptions}
                                selectedKey={clientData.confidence}
                                notifyOnReselect
                                styles={dropDownStylesActive}
                                errorMessage={validationErrors.confidence}
                            />
                            <Label className={styles.add_info_label_confidence} >%</Label>
                        </div>

                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_8} required>Delivery Lead</Label>
                            <TextField
                                value={clientData.delivery_poc}
                                placeholder='Enter the Name'
                                onChange={(e) => {
                                    inputChangeHandler(e, "delivery_poc");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.delivery_poc} />
                        </div>

                        <div className={styles.add_info}>
                            <Label className={styles.add_info_label_10} >Lead Reference</Label>
                            <TextField
                                value={clientData.lead_Reference}
                                placeholder='Enter the Lead Reference'
                                onChange={(e) => {
                                    inputChangeHandler(e, "lead_Reference");
                                    setCurrentHover("");
                                }}
                                styles={textFieldColored}
                                errorMessage={validationErrors.lead_Reference} />
                        </div>
                        <div className={styles.add_info}>
                            <Label className={styles.next_action_label} >Next Action Date</Label>
                            <DatePicker
                                minDate={minDate}
                                // className={styles.next_action_date}
                                styles={calendarClass}
                                placeholder="DD/MM/YYYY"
                                onSelectDate={(date) => dateHandler(date, 'next_action_date')}
                                value={clientData.next_action_date ? new Date(clientData.next_action_date) : null}
                            // errorMessage={validationErrors.next_action_date}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.main_container}>
                    <div className={styles.opportunity_description_container}>
                        <div className={styles.opportunity_description_title}>Opportunity Description</div>
                        <div className={styles.oppurtunity_description}>
                            <Editor
                                wrapperClassName={
                                    styles.editor_wrapper}
                                toolbar={editorToolbarOptions}
                                toolbarOnFocus
                                toolbarClassName={styles.editor_toolbar}
                                editorClassName={
                                    styles.editor_editor}
                                placeholder="Click to opportunity description"
                                editorState={editorState}
                                onEditorStateChange={(editorState) =>
                                    setEditorState(editorState)
                                }
                            />
                        </div>
                    </div>
                    <div className={styles.additional_remarks_container}>
                        <div className={styles.additional_remarks_title}>Additional Remarks</div>
                        <div className={styles.additional_remarks}>
                            <Editor
                                wrapperClassName={styles.editor_wrapper}
                                toolbar={editorToolbarOptions}
                                toolbarOnFocus
                                toolbarClassName={styles.editor_toolbar}
                                editorClassName={styles.editor_editor}
                                placeholder="Click to add Remarks"
                                editorState={editorState2}
                                onEditorStateChange={(editorState2) =>
                                    setEditorState2(editorState2)
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default EditPipeline;