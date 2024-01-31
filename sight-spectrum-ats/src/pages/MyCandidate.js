import React from "react";
import styles from "./ManageEmployee.module.css"
import { PrimaryButton,  initializeIcons, FontIcon, mergeStyles, mergeStyleSets } from '@fluentui/react';
import AddCandidateModal from "./AddCandidateModal";
import { useState, useEffect } from "react";
import { DefaultButton, Callout} from '@fluentui/react';
import { Shimmer } from '@fluentui/react';
import { useNavigate } from "react-router-dom";
import InfiniteScroll from 'react-infinite-scroll-component';
import { axiosPrivateCall } from "../constants";
import { DeletePopup } from "../components/DeletePopup";
import Nomatchimg from "../assets/no.png"
import { Spinner, SpinnerSize } from "@fluentui/react";
import { useLocation } from 'react-router-dom';
import {  DirectionalHint } from '@fluentui/react';
import SearchPopup from "../components/SeachComponent/SearchPopup";
import AssignSubmissionPopup from "../components/AssignSubmissionPopup";

import { useSearchResults } from '../components/SeachComponent/SearchResultsContext';
import CandidateHistory from "./CandidateHistory";

const addIcon = { iconName: 'Add' };
const task = { iconName: 'TaskSolid' };


const styledCallout= mergeStyleSets({

  callout: {
    width: 240,
    padding: '10px ',
  },
  message: {
    width: 180,
    background:'red',
    padding: '10px ',
  },
});

const iconClass = mergeStyles({
  fontSize: 20,
  height: 20,
  width: 20,
  margin: '0 10px',
  color: '#999DA0',
  cursor: 'pointer',
  userSelect: 'none',
});

const iconClass3 = mergeStyles({
  fontSize: 16,
  height: 18,
  width: 18,
  margin: '2px 0',
  color:  '#DEDEDE',
  cursor: 'pointer'
});

const iconClass1 = mergeStyles({
  fontSize: 12,
  height: 12,
  width: 12,
  margin: '0 ',
  color: '#999DA0',
  cursor: 'pointer'
});

const iconClassToast = mergeStyles({
  fontSize: 24,
  height: 24,
  width: 24,
  color: '#107C10',
});



const calloutBtnStyles = {
  root: {
    border: 'none',
    padding: '0px 10px',
    textAlign: 'left',
    height: '20px'
  }
}

const CalloutNameStyles = {
  calloutMain: {
    background: '#EDF2F6',
    padding: '2',
  },
}

const capitalizeFirstLetter = (str) => {
  if (str === undefined || str === null) {
    return ''; // or handle it in a way that makes sense for your use case
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};
let items = Array(4).fill(null);


function MyCandidate(props) {


  const location = useLocation();
  const [match, setMatch] = useState(location.state);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false)
  const [updateId, setUpdateId] = useState('')
  const [deleteId, setDeleteID] = useState('')
  const [isSubmitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitDel, setSubmitDel] = useState(false);
  const [primaryLs, setPrimaryLs] = useState('');
  const [candidateList, setCandidateList] = useState([]);
  const { showAddCandidate } = props;
  const [assignCandidatedId, setAssignCandidateId] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [rowId, setRowId] = useState('');
  const [hoverCallout, setHoverCallout] = useState('');
  const [updateCallout, setUpdateCallout] = useState(false);
  const [isStatusOpen,setStatusOpen]=useState(false);
  const [fetchOptions, setFetchOptions] = useState({ skip: 0, limit: 15, sort_field: 'updatedAt', sort_type: -1 });
  const [hasMore, setHasMore] = useState(true);
  const [sortIcon, setSortIcon] = useState(0);

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [isSearchVal, setIsSearchVal] = useState([]);
  const [booleanCheck, setBooleanCheck] = useState(false);
  const [gaintValue, setGaintValue] = useState([])


  const [selectedIds, setSelectedSubmissionIds] = useState([]);
  const [newcandidatelist, setNewCandidateList] = useState([]);

  console.log(selectedIds,"selectedIds")

  const [isPopoutVisible, setPopoutVisible] = useState({});

  const [starIconClicked, setStarIconClicked] = useState(false);

  const favoriteStarLabel = (
    <div
      onClick={() => { 
          toggleStarredDisplay();
          toggleAllFavorites();
              setStarIconClicked(!starIconClicked); 
}}
      className={`${styles.favoriteIcon} ${iconClass3}`}
    >
    <FontIcon
      iconName={starIconClicked ? 'FavoriteStarFill' : 'FavoriteStar'} 
      style={{ color: starIconClicked ? '#FFCE31' : '#DEDEDE' }}
      className={iconClass3}
    />
    </div>
  );
  const navigateTo = useNavigate();

  initializeIcons();


  const columns = [
    {
      columnKey: ' ',
      label: ' '
    },{
      columnKey: 'FavoriteStar',
      label: favoriteStarLabel,
    },
    {
      columnKey:'Statusi',
      label:' '
    },
    {
      columnKey: 'CandidateID',
      label: 'Candidate ID'
    }, 
    {
      columnKey: 'CandidateName',
      label: 'Candidate Name'
    }, 
    {
      columnKey: 'DateofSourcing',
      label: 'Date of Sourcing',
      icon: `${sortIcon ? fetchOptions.sort_type === 1 ? 'SortUp' : 'SortDown' : 'Sort'}`
    },
    {
      columnKey: 'Mobile',
      label: 'Mobile'
    }, {
      columnKey: 'email',
      label: 'Email ID'
    }, {
      columnKey: 'Recruiter',
      label: 'Recruiter',
    }, {
      columnKey: 'Primary Skill',
      label: 'Primary Skill '
    },
    {
      columnKey: 'SecondarySkill',
      label: 'Secondary Skill '
    },
    {
      columnKey: 'TotalExperience',
      label: 'Total Experience',
    },
    // {
    //   columnKey: 'NoticePeriod',
    //   label: 'Notice Period',
    // },{
    //   columnKey: 'CurrentCompany',
    //   label: 'Current Company',
    // },{
    //   columnKey: 'CurrentLocation',
    //   label: 'Current Location',
    // },{
    //   columnKey: 'CurrentCtc',
    //   label: 'Current CTC',
    // },{
    //   columnKey: 'ExpectedCtc',
    //   label: 'Expected CTC',
    // },{
    //   columnKey: 'PreferedLocation',
    //   label: 'Preferred Location',
    // },
    {
      columnKey: 'Resume',
      label: 'Resume',
    },
    {
      columnKey: 'Status',
      label: 'Status',
    },
    {
      columnKey: 'More Options',
      label: ' '
    },
  ];


  const handleCheckboxChange = (SubmissionId) => {
    setSelectedSubmissionIds((prevIds) => {
      if (prevIds.includes(SubmissionId)) {
        // If SubmissionId is already in the array, remove it
        return prevIds.filter((id) => id !== SubmissionId);
      } else {
        // If SubmissionId is not in the array, add it
        return [...prevIds, SubmissionId];
      }
    });
  };
  
  const isRowChecked = (SubmissionId) => {
    return selectedIds.includes(SubmissionId);
  };



  useEffect(() => {
    setHasMore(true);
    setTimeout(() => {
      getCandidateData();
      setIsSearchVal([])
    }, 1000)
    setFetchOptions({ ...fetchOptions, skip: 0, limit: 15 });
  }, [isModalOpen, fetchOptions.sort_field, fetchOptions.sort_type]);


    const updateCandidateData = (data, vals, starValues, searchContent) => {
    setTimeout(() => {
      setCandidateList(data);
      setBooleanCheck(vals.booleansearch)
      setGaintValue(vals.starvalues)
    }, 2000);
  };

  const getCandidateData = () => {
    setIsDataLoaded(false);
 
      axiosPrivateCall.get(`/api/v1/candidate/myCandidate?skip=0&limit=15&sort_field=${fetchOptions.sort_field}&sort_type=${fetchOptions.sort_type}`).then(res => {
        console.log(res.data,"dinkar");
        setCandidateList(res.data);
        setPrimaryLs(res.data);
        setIsDataLoaded(true)
        setTimeout(() => {
          setSubmitSuccess(false)
        }, 2000);
      }).catch(e => {
        console.log(e)
      });
    };
  

  // const getfilteredCandidate = () => {
  
  //   const encodedIds = selectedIds.map(id => encodeURIComponent(id)).join(',');
  //   const url = `/api/v1/candidate/getSelectedCandidates?candidate_id=${encodedIds}`;
  
  //   axiosPrivateCall
  //     .get(url)
  //     .then((response) => {
  //       console.log(response.data, "hihh");
  //       setNewCandidateList(response.data); // Assuming `res.data` is the correct property
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //     });
  // };
  
  
  
  const [isModels, setIsModels] = useState(false)
  const handleModel = () => {
    setIsModels(true)
    // getfilteredCandidate()
  }
  const handleModelClose = () => {
    setIsModels(false)
  }


  const fetchMoreData = () => {

        axiosPrivateCall.get(`/api/v1/candidate/myCandidate?skip=${fetchOptions.skip + fetchOptions.limit}&limit=${fetchOptions.limit}&sort_field=${fetchOptions.sort_field}&sort_type=${fetchOptions.sort_type}`)
          .then(res => {
            const moreCandidates = res.data;
            console.log(moreCandidates.length);
            setCandidateList([...candidateList, ...moreCandidates]);
            setPrimaryLs([...candidateList, ...moreCandidates]);
            if (moreCandidates.length < 15 || moreCandidates.length === 0) {
              setHasMore(false)
            }

            setFetchOptions((prevState) => {

              return {
                ...prevState,
                skip: fetchOptions.skip + fetchOptions.limit,
              };

            })
          }).catch(e => {
            console.log(e)
          });
      }
  
  
  const clickSortHandler = (key) => {

    if (!isDataLoaded) return;

    if (key === 'DateofSourcing') {
      setSortIcon(fetchOptions.sort_type);
      setFetchOptions(
        {
          ...fetchOptions,
          sort_type: fetchOptions.sort_type === -1 ? 1 : -1,
        }
      );
    };

  };



  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'selected':
        return 'green';
      case 'rejected': // Change 'reject' to 'rejected'
        return 'red';
      case 'waiting':
        return 'blue';
      default:
        return 'black'; 
    }
  };
  

  const ISOdateToCustomDate = (value) => {
    const dateFormat = new Date(value);
    let year = dateFormat.getFullYear();
    let month = dateFormat.getMonth() + 1;
    let date = dateFormat.getDate();

    if (date < 10) {
      date = '0' + date;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return date + '/' + month + '/' + year;
  };


  const addEllipsisToName = (name) => {
    if (name.length > 14) {
      let new_name = name.substring(0, 12).padEnd(15, '.')

      return new_name
    }
    else return name;
  };
  const deleteCandidate = (id) => {
    setUpdateCallout(!updateCallout)
    setShowPopup(!showPopup);
    const deleteObj = { _id: id.CandidateId }
    setDeleteID(deleteObj)
    setUpdateId({ _id: id._id })
  }



  function calcTotalExp(Arr) {
    let total = { years: 0, months: 0, }

    Arr.map((detail, index) => {

      let startYear = new Date(detail.start_date).getFullYear();
      let endYear = new Date(detail.end_date).getFullYear();
      let startMonth = new Date(detail.start_date).getMonth() + 1;
      let endMonth = new Date(detail.end_date).getMonth() + 1;
      total.years = total.years + (endYear - startYear);
      total.months = total.months + (endMonth - startMonth);
    })

    return total;
  };




const handlePropupOpen=(id)=>{
  setUpdateCallout(false)
  setIsCandidateModalOpen(!isCandidateModalOpen)
  setAssignCandidateId(id)
}


  const download = () => {
    setLoading(true);
    axiosPrivateCall
      .get(`/api/v1/candidate/downloadmyCandidate?&sort_field=${fetchOptions.sort_field}&sort_type=${fetchOptions.sort_type}`, {
        responseType: 'blob',
      })
      .then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${Date.now()}.xlsx`);
        document.body.appendChild(link);
        link.click();
        setLoading(false);
        setCompleted(true);
        setTimeout(() => {
          setCompleted(false);
        }, 4000);
      })
      .catch(e => {
        console.log(e);
        setLoading(false);
      });
  };

  const handleUpdate = (showpop) => {
    const deleteObj = updateId
    if (!showpop) {
      setShowPopup(!showPopup)
      axiosPrivateCall.post('/api/v1/candidate/deleteCandidate', deleteObj).then(res => {
        setSubmitDel(!isSubmitDel)
        const candidateArrList = candidateList;
        setCandidateList(candidateArrList.filter(candidate => candidate._id !== deleteObj._id))
        setPrimaryLs(candidateArrList.filter(candidate => candidate._id !== deleteObj._id))
      }).catch(e => {
        console.log(e);
        setUpdateCallout(false);
      });

      setTimeout(() => {
        setSubmitDel(false);
      }, 2000);

      setSubmitDel(true);

    }
  }

  function openResume(resumeString) {
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

    var newTab = window.open();
    newTab.document.open();
    newTab.document.write(promptLines.join("\n"));
    newTab.document.close();
  }

  const rowsToRender = candidateList;
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [updatedRowsToRender, setUpdatedRowsToRender] = useState([]);

  const [showStarredOnly, setShowStarredOnly] = useState(false);

  const toggleStarredDisplay = () => {
    setShowStarredOnly(!showStarredOnly);
  };

  const toggleFavorite = async (candidateId) => {
    try {
      if (selectedCandidates.includes(candidateId)) {
        setSelectedCandidates(selectedCandidates.filter((id) => id !== candidateId));
        await updateStarredStatus(candidateId, false);
      } else {
        setSelectedCandidates([...selectedCandidates, candidateId]);
        await updateStarredStatus(candidateId, true);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };
  
  const isFavorite = (candidateId) => selectedCandidates.includes(candidateId);
  
  const toggleAllFavorites = async () => {
    try {
      const starredCandidateIds = rowsToRender.filter(candidate => candidate.starred_all).map(candidate => candidate._id);
  
      const updatedSelectedCandidates = selectedCandidates.length === starredCandidateIds.length
        ? []
        : starredCandidateIds;
  
      setSelectedCandidates(updatedSelectedCandidates);
  
      const updatedRows = rowsToRender.filter(candidate => updatedSelectedCandidates.includes(candidate._id));
      setUpdatedRowsToRender(updatedRows);
  
      for (const candidateId of updatedSelectedCandidates) {
        await updateStarredStatus(candidateId, true);
      }
  
      const starredDetails = await getCandidateStarredDetails(updatedSelectedCandidates);
      console.log("Starred Details:", starredDetails);
    } catch (error) {
      console.error("Error toggling all favorites:", error);
    }
  };  
  
  const getCandidateStarredDetails = async (candidateIds) => {
    try {
      const response = await axiosPrivateCall.get("/api/v1/candidate/getCandidateStarredDetails", {
        params: {
          candidateIds: candidateIds.join(","),
        },
      });
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting candidate starred details:", error);
      throw error;
    }
  };

  const updateStarredStatus = async (candidateId, starredStatus) => {
    try {
      const payload = {
        _id: candidateId,
        starred_all: starredStatus,
      };
  
      const response = await axiosPrivateCall.post("/api/v1/candidate/updateCandidate", payload);
  
      console.log(response.data);
    } catch (error) {
      console.error("Error updating starred status:", error);
    }
  };  
  
  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <DeletePopup showPopup={showPopup}
          setShowPopup={setShowPopup}
          handleUpdate={handleUpdate}
          deleteId={deleteId}
          updateCallout={updateCallout}
          setUpdateCallout={setUpdateCallout}
        />
         {isCandidateModalOpen && <CandidateHistory 
         isCandidateModalOpen={isCandidateModalOpen}
          candidateId={assignCandidatedId}
          setIsCandidateModalOpen={setIsCandidateModalOpen}
          isSubmitSuccess={isSubmitSuccess}
          setSubmitSuccess={setSubmitSuccess} />
        } 
         {isModalOpen && <AddCandidateModal isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          isSubmitSuccess={isSubmitSuccess}
          setSubmitSuccess={setSubmitSuccess} />
        }
        <div className={styles.nav_container}>
          <div className={styles.title}>My Candidate</div>

          {isSubmitSuccess && (<div className={styles.toast}>
            <div className={styles.toast_title}>
              <FontIcon iconName="StatusCircleCheckmark" className={iconClassToast} />
              <div>Candidate Added Successfully!</div>
            </div>

            <FontIcon iconName="StatusCircleErrorX" className={iconClass} onClick={() => setSubmitSuccess(false)} />
          </div>)
          }

          {isSubmitDel && (<div className={styles.toast}>
            <div className={styles.toast_title}>
              <FontIcon iconName="StatusCircleCheckmark" className={iconClassToast} />
              <div>Candidate Deleted!</div>
            </div>

            <FontIcon iconName="StatusCircleErrorX" className={iconClass} onClick={() => setSubmitDel(false)} />
          </div>)
          }
       
          <div className={styles.nav_items}>
            <PrimaryButton text="Assign Submission" iconProps={task} onClick={handleModel} />
            {isModels?<AssignSubmissionPopup selectedIds={selectedIds} isOpen={isModels} onRequestClose={() => setIsModels(false)} />: ""}
            <FontIcon iconName="Breadcrumb" className={iconClass} />
            <PrimaryButton text="Add Candidate" iconProps={addIcon}
               onClick={() => { setIsModalOpen(!isModalOpen); setSubmitSuccess(false); setMatch(false) }} />
            {loading ? (<Spinner size={SpinnerSize.medium} className={iconClass} />) :
              completed ? (<FontIcon iconName="CheckMark" className={iconClass} />) :
                (<FontIcon iconName="Download" onClick={download} className={iconClass} />)}
          </div>
        </div>

        <div id="scrollableDiv" className={styles.table_container}>
          <InfiniteScroll style={{ overflow: 'visible', height: '100%' }} dataLength={candidateList.length} loader={isDataLoaded && candidateList.length >= 15 && rowsToRender.length >= 15 && (
    showStarredOnly ? null : <h4>Loading...</h4> )}
            hasMore={hasMore} next={fetchMoreData} scrollableTarget="scrollableDiv">
            <table>
              <thead className={styles.table_header}>
                <tr className={styles.table_row}>
                  {columns.map((column) =>
                    <th onClick={() => clickSortHandler(column.columnKey)}
                      className={styles.table_headerContents}
                      key={column.columnKey}>
                      <div className={styles.table_heading}>
                        <div>{column.label}</div>
                        {column?.icon ? <FontIcon iconName={column.icon} className={iconClass1} /> : null}
                      </div>
                    </th>)
                  }
                </tr>
              </thead>
              <tbody>
                  <>
                    {isDataLoaded && (candidateList.length === 0 ) ? (
                      <tr>
                        <td className={styles.table_dataContents1} colSpan="13" style={{ textAlign: "center" }}>
                          <img src={Nomatchimg} alt="image" width={"190px"} height={"200px"} />
                        </td>
                      </tr>
                    ) : (
                      <>   
                   { isDataLoaded&&showStarredOnly ? (
              rowsToRender
      .filter(candidate => isFavorite(candidate._id))
      .map((candidate, candidate_index) => (
        <tr className={styles.table_row} >
          <td className={styles.table_dataContents}>
                              <input type="checkbox"
                               checked={isRowChecked(candidate._id)}
                                onChange={() => handleCheckboxChange(candidate._id)}
                              />
                          
                            </td>
        <td onClick={() => toggleFavorite(candidate._id)} className={`${styles.table_dataContents} ${iconClass3}`}>
      <FontIcon iconName={isFavorite(candidate._id) ? 'FavoriteStarFill' : 'FavoriteStar'} style={{ color: isFavorite(candidate._id) ? '#FFCE31' : '#DEDEDE' }} className={iconClass3} />
      </td>
         <td className={`${styles.table_dataContents} ${styles.iconContainer}`}>
          < FontIcon iconName='Info' className={styles.statusIcon}  id={`buttonId-${candidate._id}`}
                              onClick={() => {
                                if (isPopoutVisible === candidate._id) {
                                  setPopoutVisible(null);
                                } else {
                                  setPopoutVisible(candidate._id); 
                                }
                                setStatusOpen(true);
                              }}
                           />
                 {isPopoutVisible === candidate._id && (
          candidate.command.some((statuItem) => statuItem.profile_status !== 'NotProcessed') ? (
    <Callout className={styledCallout.callout} role="alert" target={`#buttonId-${candidate._id}`}
    onDismiss={() => setPopoutVisible(null)} 
    >
      <table className={styles.table}>
        <thead className={styles.tableHead}>
          <tr className={styles.tableRows}>
            <th className={styles.tableHeader}>DemandId</th>
            <th className={styles.tableHeader}>Client</th>
            <th className={styles.tableHeader}>Status</th>
          </tr>
        </thead>
        <tbody>
          {candidate.command.map((statuItem, statIndex) => {
            if (statuItem.profile_status !== 'NotProcessed') {
              return (
                            <tr key={statIndex} className={styles.tableRow}>
                              <td className={styles.tableCell}>{statuItem.demand?.DemandId}</td>
                              <td className={styles.tableCell}>{statuItem.demand?.client}</td>
                              <td className={styles.tableCell} style={{ color: getStatusColor(statuItem.profile_status) }}>
                                {statuItem.profile_status}
                              </td>
                            </tr>
                                      );
                                    }
                                    return null;
                                  })}
                                </tbody>
                              </table>
                            </Callout>
                                  ) : (
                                    <Callout className={styledCallout.message} role="alert" target={`#buttonId-${candidate._id}`}
                                    onDismiss={() => setPopoutVisible(null)} 
                                    >
                                      <div className={styles.message}>
                                        Profile not yet processed
                                      </div>
                                    </Callout>
                                  )
                                )}
         </td>         
         <td onClick={() => navigateTo(`/candidatelibrary/viewcandidate?candidate_id=${candidate._id}`)} className={styles.table_dataContents}><span className={styles.custom_link}>{candidate.CandidateId}</span></td>
                           <td className={styles.table_dataContents}
                              onMouseEnter={() => setHoverCallout(candidate.first_name)}
                              onMouseLeave={() => setHoverCallout('')}
                              id={`${candidate.first_name}${candidate._id}`.replaceAll(" ", "")}>
                             {addEllipsisToName(`${capitalizeFirstLetter(candidate.first_name)} ${capitalizeFirstLetter(candidate.last_name)}`)}
                             {(candidate.first_name + candidate.last_name).length >= 14 && hoverCallout === candidate.first_name && (
                           <Callout alignTargetEdge={true}
                             isBeakVisible={false}
                             styles={CalloutNameStyles}
                             directionalHint={DirectionalHint.bottomLeftEdge}
                             target={`#${candidate.first_name}${candidate._id}`.replaceAll(" ", "")}
                           >
                             {`${capitalizeFirstLetter(candidate.first_name)} ${capitalizeFirstLetter(candidate.last_name)}`}
                            </Callout>
                            )}
                          </td>
        <td className={styles.table_dataContents} style={{ textAlign: 'center' }}>{ISOdateToCustomDate(candidate.createdAt)}</td>
        <td className={styles.table_dataContents}>{candidate.mobile_number}</td>
        <td className={styles.table_dataContents}>{candidate.email}</td>
        <td className={styles.table_dataContents}
          onMouseEnter={() => setHoverCallout(candidate.created_by)}
          onMouseLeave={() => setHoverCallout('')}
          id={`${candidate.created_by?.first_name}${candidate._id}`.replaceAll(" ", "")}>

          {addEllipsisToName(`${candidate.created_by?.first_name} ${candidate.created_by?.last_name}`)}

          {(candidate.created_by?.first_name + candidate.created_by?.last_name).length >= 14 && hoverCallout === candidate.created_by && <Callout alignTargetEdge={true}
            isBeakVisible={false} styles={CalloutNameStyles}
            directionalHint={DirectionalHint.bottomLeftEdge} target={`#${candidate.created_by?.first_name}${candidate._id}`.replaceAll(" ", "")}>
            {`${candidate.created_by.first_name} ${candidate.created_by.last_name}`}
          </Callout>
          }
        </td>
        <td className={styles.table_dataContents}
          onMouseEnter={() => setHoverCallout(candidate._id)}
          onMouseLeave={() => setHoverCallout("")}
          id={`primary_skill_${candidate._id}`}>

          {addEllipsisToName(`${candidate.skillset[0]?.skill ? candidate.skillset[0]?.skill : "-"}`)}

          {candidate.skillset[0]?.skill?.length >= 14 && hoverCallout === candidate._id && <Callout alignTargetEdge={true}
            isBeakVisible={false} styles={CalloutNameStyles}
            directionalHint={DirectionalHint.bottomLeftEdge} target={`#primary_skill_${candidate._id}`}>
            {candidate.skillset[0]?.skill}
          </Callout>
          }
        </td>
        <td className={styles.table_dataContentst }  
                                onMouseEnter={() => setHoverCallout(candidate._id)}
                                onMouseLeave={() => setHoverCallout("")}>
                                  {addEllipsisToName(`${candidate.skillset?.skill?candidate.skillset[1]?.skill : "Nill"}`)}
                                {candidate.skillset[1]?.skill?.length >= 14 && hoverCallout === candidate._id && <Callout alignTargetEdge={true}
                                  isBeakVisible={false} styles={CalloutNameStyles}
                                  directionalHint={DirectionalHint.bottomLeftEdge} target={`#primary_skill_${candidate._id}`}>
                                  {candidate.skillset[1]?.skill}
                                </Callout>
                                }


                              </td>
        <td className={styles.table_dataContents}>{(candidate.total_experience) ? candidate.total_experience : `${calcTotalExp(candidate.employment_details).years} Years ${calcTotalExp(candidate.employment_details).months} Months`}</td>
        <td className={styles.table_dataContents}>{(candidate.resume_cv) ? <div onClick={() => openResume(candidate.resume_cv)}>link</div> : <a href={candidate.resume_url} target="_blank">Link</a>}</td>
        <td className={styles.table_dataContents}>{candidate.status}</td>
        <td className={styles.table_dataContents}><a href={candidate.resume_url} target="_blank">Link</a></td>
        <td className={styles.table_dataContents}>
          <div className={styles.moreOptions}
            id={`FO_${candidate.mobile_number}`}
            onClick={() => {
              setRowId(candidate._id);
              setUpdateCallout(true)
            }}>
            <FontIcon iconName='MoreVertical' className={iconClass1} />
                  {rowId === candidate._id &&
                    updateCallout && <Callout gapSpace={0} target={`#FO_${candidate.mobile_number}`} onDismiss={() => setRowId('')}
                isBeakVisible={false} directionalHint={DirectionalHint.bottomCenter}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <DefaultButton text="View / Edit" onClick={() => navigateTo(`/candidatelibrary/editcandidate?candidate_id=${candidate._id}`)} styles={calloutBtnStyles} />
                  <DefaultButton onClick={() => deleteCandidate(candidate)} text="Delete" styles={calloutBtnStyles} />

                </div>
              </Callout>
            }
                        </div>
                      </td>
                    </tr>
                    ))
                    ) : (isDataLoaded && rowsToRender.map((candidate, candidate_index) => (
                            <tr className={styles.table_row} >
                              <td className={styles.table_dataContents}>
                              <input type="checkbox"
                               checked={isRowChecked(candidate._id)}
                                onChange={() => handleCheckboxChange(candidate._id)}
                              />
                          
                            </td>
                             
                              <td onClick={() => toggleFavorite(candidate._id)} className={`${styles.table_dataContents} ${iconClass3}`}>
                            <FontIcon iconName={isFavorite(candidate._id) ? 'FavoriteStarFill' : 'FavoriteStar'} style={{ color: isFavorite(candidate._id) ? '#FFCE31' : '#DEDEDE' }} className={iconClass3} />
                            </td>
                           <td className={styles.table_dataContents}>
                              <td className={styles.table_dataContents}>< FontIcon iconName='Info' className={styles.statusIcon}  id={`buttonId-${candidate._id}`}
                                 onClick={() => {
                                if (isPopoutVisible === candidate._id) {
                                  setPopoutVisible(null);
                                } else {
                                  setPopoutVisible(candidate._id); 
                                }
                                setStatusOpen(true);
                              }}
                           />
                        {isPopoutVisible === candidate._id && (
                        candidate.command.some((statuItem) => statuItem.profile_status !== 'NotProcessed') ? (
                  <Callout className={styledCallout.callout} role="alert" target={`#buttonId-${candidate._id}`}
                  onDismiss={() => setPopoutVisible(null)} 
                  >
                    <table className={styles.table}>
                      <thead className={styles.tableHead}>
                        <tr className={styles.tableRows}>
                          <th className={styles.tableHeader}>DemandId</th>
                          <th className={styles.tableHeader}>Client</th>
                          <th className={styles.tableHeader}>Status</th>
                        </tr>
                  </thead>
                  <tbody>
          {candidate.command.map((statuItem, statIndex) => {
            if (statuItem.profile_status !== 'NotProcessed') {
              return (
                            <tr key={statIndex} className={styles.tableRow}>
                              <td className={styles.tableCell}>{statuItem.demand?.DemandId}</td>
                              <td className={styles.tableCell}>{statuItem.demand?.client}</td>
                              <td className={styles.tableCell} style={{ color: getStatusColor(statuItem.profile_status) }}>
                              {statuItem.profile_status==='Reject'?'Rejected':statuItem.profile_status}

                              </td>
                            </tr>
                                      );
                                    }
                                    return null;
                                  })}
                                </tbody>
                              </table>
                            </Callout>
                                  ) : (
                                    <Callout className={styledCallout.message} role="alert" target={`#buttonId-${candidate._id}`}
                                    onDismiss={() => setPopoutVisible(null)} 
                                    >
                                      <div className={styles.message}>
                                        Profile not yet processed
                                      </div>
                                    </Callout>
                                  )
                                )}
                                 </td>
                                 </td>
                             <td onClick={() => navigateTo(`/candidatelibrary/viewcandidate?candidate_id=${candidate._id}`)} className={styles.table_dataContents}><span className={styles.custom_link}>{candidate.CandidateId}</span></td>
                             <td className={styles.table_dataContents}
                              onMouseEnter={() => setHoverCallout(candidate.first_name)}
                              onMouseLeave={() => setHoverCallout('')}
                              id={`${candidate.first_name}${candidate._id}`.replaceAll(" ", "")}>
                              {addEllipsisToName(`${capitalizeFirstLetter(candidate.first_name)} ${capitalizeFirstLetter(candidate.last_name)}`)}
                              {(candidate.first_name + candidate.last_name).length >= 14 && hoverCallout === candidate.first_name && (
                            <Callout alignTargetEdge={true}
                              isBeakVisible={false}
                              styles={CalloutNameStyles}
                              directionalHint={DirectionalHint.bottomLeftEdge}
                              target={`#${candidate.first_name}${candidate._id}`.replaceAll(" ", "")}
                            >
                              {`${capitalizeFirstLetter(candidate.first_name)} ${capitalizeFirstLetter(candidate.last_name)}`}
                            </Callout>
                            )}
                            </td>
                              <td className={styles.table_dataContents} style={{ textAlign: 'center' }}>{ISOdateToCustomDate(candidate.createdAt)}</td>
                              <td className={styles.table_dataContents}>{candidate.mobile_number}</td>
                              <td className={styles.table_dataContents}>{candidate.email}</td>
                              <td className={styles.table_dataContents}
                                onMouseEnter={() => setHoverCallout(candidate.created_by)}
                                onMouseLeave={() => setHoverCallout('')}
                                id={`${candidate.created_by?.first_name}${candidate._id}`.replaceAll(" ", "")}>

                                {addEllipsisToName(`${candidate.created_by?.first_name} ${candidate.created_by?.last_name}`)}

                                {(candidate.created_by?.first_name + candidate.created_by?.last_name).length >= 14 && hoverCallout === candidate.created_by && <Callout alignTargetEdge={true}
                                  isBeakVisible={false} styles={CalloutNameStyles}
                                  directionalHint={DirectionalHint.bottomLeftEdge} target={`#${candidate.created_by?.first_name}${candidate._id}`.replaceAll(" ", "")}>
                                  {`${candidate.created_by.first_name} ${candidate.created_by.last_name}`}
                                </Callout>
                                }
                              </td>
                              <td className={styles.table_dataContents}
                                onMouseEnter={() => setHoverCallout(candidate._id)}
                                onMouseLeave={() => setHoverCallout("")}
                                id={`primary_skill_${candidate._id}`}>

                                {addEllipsisToName(`${candidate.skillset[0]?.skill ? candidate.skillset[0]?.skill : "-"}`)}

                                {candidate.skillset[0]?.skill?.length >= 14 && hoverCallout === candidate._id && <Callout alignTargetEdge={true}
                                  isBeakVisible={false} styles={CalloutNameStyles}
                                  directionalHint={DirectionalHint.bottomLeftEdge} target={`#primary_skill_${candidate._id}`}>
                                  {candidate.skillset[0]?.skill}
                                </Callout>
                                }
                              </td> 
                              <td className={styles.table_dataContentst }  
                                onMouseEnter={() => setHoverCallout(candidate._id)}
                                onMouseLeave={() => setHoverCallout("")}>
                                  {addEllipsisToName(`${candidate.skillset?.skill?candidate.skillset[1]?.skill : "Nill"}`)}
                                {candidate.skillset[1]?.skill?.length >= 14 && hoverCallout === candidate._id && <Callout alignTargetEdge={true}
                                  isBeakVisible={false} styles={CalloutNameStyles}
                                  directionalHint={DirectionalHint.bottomLeftEdge} target={`#primary_skill_${candidate._id}`}>
                                  {candidate.skillset[1]?.skill}
                                </Callout>
                                }


                              </td>
                              <td className={styles.table_dataContents}>{(candidate.total_experience) ? candidate.total_experience : `${calcTotalExp(candidate.employment_details).years} Years ${calcTotalExp(candidate.employment_details).months} Months`}</td>
                              <td className={styles.table_dataContents}>{(candidate.resume_cv) ? <div onClick={() => openResume(candidate.resume_cv)}>link</div> : <a href={candidate.resume_url} target="_blank">Link</a>}</td>
                              <td className={styles.table_dataContents}>{candidate.status}</td>
                              <td className={styles.table_dataContents}>
                                <div className={styles.moreOptions}
                                  id={`FO_${candidate.mobile_number}`}
                                  onClick={() => {
                                    setRowId(candidate._id);
                                    setUpdateCallout(true)
                                  }}>
                                  <FontIcon iconName='MoreVertical' className={iconClass1} />
                                  {rowId === candidate._id &&
                                    updateCallout && <Callout gapSpace={0} target={`#FO_${candidate.mobile_number}`} onDismiss={() => setRowId('')}
                                      isBeakVisible={false} directionalHint={DirectionalHint.bottomCenter}>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <DefaultButton text="Edit" onClick={() => navigateTo(`/candidatelibrary/editcandidate?candidate_id=${candidate._id}`)} styles={calloutBtnStyles} />
                                        <DefaultButton onClick={() => deleteCandidate(candidate)} text="Delete" styles={calloutBtnStyles} />
                                        <DefaultButton text="Candidate History"  onClick={() =>handlePropupOpen(candidate._id)}styles={calloutBtnStyles} />
                                      </div>
                                    </Callout>
                                  }
                                </div>
                              </td>
                            </tr>
                            ))
                            )
                           }
                  </>
                    )}
                    {!isDataLoaded && items.map(candidate => (
                      <tr className={styles.table_row} >
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}><Shimmer /></td>
                        <td className={styles.table_dataContents}>
                          <div className={styles.moreOptions} >
                            <FontIcon iconName='MoreVertical' className={iconClass1} />
                          </div>
                        </td>
                      </tr>))}
                 
                  </>
              </tbody>
            </table>
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );

};

export default MyCandidate;