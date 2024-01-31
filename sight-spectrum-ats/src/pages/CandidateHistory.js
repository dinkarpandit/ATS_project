import React from "react";
import styles from "./CandidateHistory.module.css";
import {
  PrimaryButton,
  initializeIcons,
  FontIcon,
  mergeStyles,
  Modal,
  TextField,
} from "@fluentui/react";
import { useState, useEffect } from "react";
import { Shimmer } from "@fluentui/react";
import { useNavigate } from "react-router-dom";
import { axiosPrivateCall } from "../constants";
import { Popup } from "../components/Popup";
import { Icon } from "@fluentui/react/lib/Icon";

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

const iconClass1 = mergeStyles({
  fontSize: 12,
  height: 12,
  width: 12,
  margin: "0 ",
  color: "#999DA0",
  cursor: "pointer",
});



let items = Array(1).fill(null);

function CandidateHistory(props) {

  let isModalOpen = props.isCandidateModalOpen;
  const setIsModalOpen = props.setIsCandidateModalOpen;
  const CandidateID = props.candidateId;
  const [showPopup, setShowPopup] = useState(false);
  const [candidate, setCandidateList] = useState([]);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [hoverCallout, setHoverCallout] = useState("");
  const [isModalShrunk, setIsModalShrunk] = useState(false);
  const [comments, setCommants] = useState("");
  const [error, setError] = useState("");

  const navigateTo = useNavigate();
  const token = localStorage.getItem("token");
  let base64Url = token.split(".")[1];
  let decodedValue = JSON.parse(window.atob(base64Url));
  let user_Id = decodedValue.user_id;
  initializeIcons();

  const columns = [
    {
      columnKey: "CandidateID",
      label: "Candidate ID",
    },
    {
      columnKey: "CandidateName",
      label: "Candidate Name",
    },
    {
      columnKey: "DateofSourcing",
      label: "Date of Sourcing",
    },
    {
      columnKey: "Mobile",
      label: "Mobile",
    },
    {
      columnKey: "email",
      label: "Email ID",
    },
    {
      columnKey: "Recruiter",
      label: "Recruiter",
    },
    {
      columnKey: "Primary Skill",
      label: "Primary Skill ",
    },
    {
      columnKey: "SecondarySkill",
      label: "Secondary Skill ",
    },
    {
      columnKey: "TotalExperience",
      label: "Total Experience",
    },
    {
      columnKey: "Resume",
      label: "Resume",
    },
    {
      columnKey: "Status",
      label: "Status",
    },
  ];

  const textFieldStyles = {
    fieldGroup: {
      border: "1px solid #D9D9D9",
      margin: "10px 15px 10px 15px",
      transition: "background-color 0.3s",
      ...(error && {
        borderColor: "red",
        "&:hover": { borderColor: "red" },
        "&:focus": { borderColor: "red" },
      }),
    },
  };

  useEffect(() => {
    getCandidateData();
  }, []);

  const getCandidateData = () => {
    setIsDataLoaded(false);
    axiosPrivateCall
      .get(`/api/v1/candidate/getCandidateDetails?candidate_id=${CandidateID}`)
      .then((res) => {
        setCandidateList(res.data);
        setIsDataLoaded(true);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const modalSizeHandler = () => {
    setIsModalShrunk(!isModalShrunk);
  };
  const ISOdateToCustomDate = (value) => {
    const dateFormat = new Date(value);
    let year = dateFormat.getFullYear();
    let month = dateFormat.getMonth() + 1;
    let date = dateFormat.getDate();

    if (date < 10) {
      date = "0" + date;
    }
    if (month < 10) {
      month = "0" + month;
    }

    return date + "/" + month + "/" + year;
  };

  const addEllipsisToName = (name) => {
     if (name.length > 14) {
      let new_name = name.substring(0, 12).padEnd(15, ".");
      return new_name;
    } else return name;
  };

  function calcTotalExp(Arr) {
    let total = { years: 0, months: 0 };

    Arr.map((detail, index) => {
      let startYear = new Date(detail.start_date).getFullYear();
      let endYear = new Date(detail.end_date).getFullYear();
      let startMonth = new Date(detail.start_date).getMonth() + 1;
      let endMonth = new Date(detail.end_date).getMonth() + 1;
      total.years = total.years + (endYear - startYear);
      total.months = total.months + (endMonth - startMonth);
    });
    return total;
  }

  function getCurrentCompany(Arr) {
    let currCompany = { name: "", ctc: "" };

    Arr.map((data) => {
      if (data.is_current === "yes" || data.is_current === true) {
        currCompany.name = data.company_name;
        currCompany.ctc = data.ctc;
      }
    });

    return currCompany;
  }

  const closeHandler = () => {
    setShowPopup(true);
  };

  function openResume(resumeString) {
    // Split the resume string into an array of lines

    const lines = resumeString.split(/\r?\n/);
    const promptLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (line.startsWith("?")) {
        promptLines.push(`\n${line.replace("?", "")}`);
      } else if (line.includes(":")) {
        const [key, value] = line.split(":");
        promptLines.push(`\n- ${key.trim()}: ${value.trim()}`);
      } else if (line.length > 0) {
        promptLines.push(line);
      }
    }

    // Open the HTML content in a new tab
    var newTab = window.open();
    newTab.document.open();
    newTab.document.write(promptLines.join("\n"));
    newTab.document.close();
  }
  function formatTimeAgo(Createdattime) {
    const timestamp = new Date(Createdattime);
    const now = new Date();
    const timeDiff = now - timestamp;
    
    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 5) {
      return "just now";
    } else if (seconds < 60) {
      return `${seconds} second${seconds === 1 ? "" : "s"} ago`;
    } else if (minutes < 60) {
      return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    } else {
      const day = timestamp.getDate();
      const month = timestamp.toLocaleString('en', { month: 'short' });
      const year = timestamp.getFullYear();
  
      return `${day} ${month} ${year}`;
    }
  }

  const handlePost = async (updatedId) => {
    if (comments!=='') {
      const candidateData = {
        _id: updatedId,
        profile_status: "Reject",
        command: { content: comments, created_by: user_Id },
      };
      try {
        const candidateResponse = await axiosPrivateCall.post(
          "/api/v1/candidate/updateCandidateCommand",
          candidateData
        );
        setCommants("");
        getCandidateData();

      } catch (candidateError) {
        console.log("Candidate Error:", candidateError);
      }
    } else {
      setError("Required");
    }
  };

  const handleInputChange = (e) => {
    const validInput = e.target.value.replace(/[^-,.'&()a-zA-Z0-9\s]/g, "");
    const invalidCharacters = e.target.value.replace(
      /[-.'&()a-zA-Z0-9\s]/g,
      ""
    );
    if (invalidCharacters.length > 0) {
      setError("Invalid character");
    } else {
      setError("");
    }
    // Apply maxLength validation
    const limitedInput = validInput.slice(0, 1500);
    setCommants(limitedInput);
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
            <div className={styles.header_tag_container}>Candidate History</div>

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
                onClick={() => closeHandler()}
                className={styles.header_close_icon_container}
              >
                <Icon iconName="ChromeClose" className={closeIconClass} />
              </div>
            </div>
          </div>

          <div className={styles.header_content_container}>
            <div className={styles.header_content_title_container}>
              <div className={styles.header_content_title_container}>
                Candidate ID : {candidate.CandidateId}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.page}>
          <div className={styles.container}>
            <div className={styles.table_container}>
              <table>
                <thead className={styles.table_header}>
                  <tr className={styles.table_row}>
                    {columns.map((column) => (
                      <th
                        className={styles.table_headerContents}
                        key={column.columnKey}
                      >
                        <div className={styles.table_heading}>
                          <div>{column.label}</div>
                          {column?.icon ? (
                            <FontIcon
                              iconName={column.icon}
                              className={iconClass1}
                            />
                          ) : null}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isDataLoaded ? (
                    <tr className={styles.table_row}>
                      <td
                        onClick={() =>
                          navigateTo(
                            `/candidatelibrary/editcandidate?candidate_id=${candidate._id}`
                          )
                        }
                        className={styles.table_dataContents}
                      >
                        {candidate.CandidateId}
                      </td>
                      <td
                        className={styles.table_dataContents}
                        onMouseEnter={() =>
                          setHoverCallout(candidate.first_name)
                        }
                        onMouseLeave={() => setHoverCallout("")}
                        id={`${candidate.first_name}${candidate._id}`.replaceAll(
                          " ",
                          ""
                        )}
                      >
                        {addEllipsisToName(
                          `${candidate.first_name} ${candidate.last_name}`
                        )}
                      </td>
                      <td className={styles.table_dataContents}>
                        {ISOdateToCustomDate(candidate.createdAt)}
                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.mobile_number}
                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.email}
                      </td>
                      <td
                        className={styles.table_dataContents}
                        onMouseEnter={() =>
                          setHoverCallout(candidate.created_by)
                        }
                        onMouseLeave={() => setHoverCallout("")}
                        id={`${candidate.created_by?.first_name}${candidate._id}`.replaceAll(
                          " ",
                          ""
                        )}
                      >
                        {addEllipsisToName(
                          `${candidate.created_by?.first_name} ${candidate.created_by?.last_name}`
                        )}
                      </td>
                      <td
                        className={styles.table_dataContents}
                        onMouseEnter={() => setHoverCallout(candidate._id)}
                        onMouseLeave={() => setHoverCallout("")}
                        id={`primary_skill_${candidate._id}`}
                      >
                        {addEllipsisToName(
                          `${
                            candidate.skillset[0]?.skill
                              ? candidate.skillset[0]?.skill
                              : "-"
                          }`
                        )}

                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.skillset[1]?.skill
                          ? candidate.skillset[1]?.skill
                          : "Nil"}
                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.total_experience
                          ? candidate.total_experience
                          : `${
                              calcTotalExp(candidate.employment_details).years
                            } Years ${
                              calcTotalExp(candidate.employment_details).months
                            } Months`}
                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.resume_cv ? (
                          <div onClick={() => openResume(candidate.resume_cv)}>
                            link
                          </div>
                        ) : (
                          <a href={candidate.resume_url} target="_blank">
                            Link
                          </a>
                        )}
                      </td>
                      <td className={styles.table_dataContents}>
                        {candidate.status}
                      </td>
                    </tr>
                  ) : (
                    isDataLoaded &&
                    items.map((candidate) => (
                      <tr className={styles.table_row}>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                        <td className={styles.table_dataContents}>
                          <Shimmer />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* </InfiniteScroll> */}
            </div>
            <div className={styles.command_history_header_container}>
              <div className={styles.rightside_history_container}>
                <div className={styles.candidate_history_header}>
                  {" "}
                  Candidate History{" "}
                </div>
              </div>
              <div className={styles.leftside_history_container}>
                <div className={styles.candidate_history_header}> Comments</div>
                {/* <div className={styles.comments_box_header_container}> */}
                <TextField
                  multiline
                  rows={4}
                  styles={textFieldStyles}
                  value={comments}
                  placeholder="Add a Comment"
                  onChange={handleInputChange}
                  maxLength={1500}
                />
                {/* </div> */}
                {error && <div className={styles.errorfield}>{error}</div>}
                <div className={styles.postButton_container}>
                  <PrimaryButton onClick={() => handlePost(CandidateID)}>
                    Post
                  </PrimaryButton>
                </div>
                {candidate.command && candidate.command.length > 0 && (
                  <div className={styles.comments_box_container}>
                    {candidate.command.map((item, index) => (

       item.content[index] && (
        <div key={index} className={styles.comments_box_header_container}>
          <>
            <div className={styles.comments_box_name_container}>
              <p className={styles.comment_box_subHeader}>
                {item.created_by.first_name} {item.created_by.last_name}
              </p>
              <p className={styles.timestap}>{formatTimeAgo(item.updatedAt)}</p>
            </div>
            <div className={styles.comments_box_description_container}>
              {item.content}
            </div>
          </>
        </div>
      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default CandidateHistory;
