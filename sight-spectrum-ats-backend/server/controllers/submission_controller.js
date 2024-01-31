const submission_services = require("../services/submission_services");
const submission_tracker_services = require("../services/submission_tracker_services");
const Excel = require("exceljs");
const crypto = require("crypto");
const fs = require("fs");
const { ISOdateToCustomDate } = require("../utils/ISO_date_helper");
const fast_connection = require("../connections/fastconnection");
const candidate_services = require("../services/candidate_services");
const { ObjectId } = require("mongodb"); // Assuming you are using the official MongoDB driver

const generateSubmissionId = async () => {
  const submissions = await submission_services.getAllSubmissions();
  const lastSubmissionId = submissions.SubmissionId;
  submissionCounter = parseInt(lastSubmissionId.substr(3)) + 1;
  const paddedCounter = submissionCounter.toString().padStart(4, "0");
  return `SSS${paddedCounter}`;
};

const createSubmission = {
  controller: async (req, res) => {
    let new_obj = { ...req.body };
    new_obj["submitted_by"] = req.auth.user_id;
    new_obj["SubmissionId"] = await generateSubmissionId();
    let new_submission = await submission_services.create(new_obj);
    let submission_tracker_obj = {
      submission_id: new_submission._id,
      demand_id: req.body.demand,
      candidate_id: req.body.candidate,
      SubmissionId: new_submission.SubmissionId,
      submitted_by: req.auth.user_id,
    };
    await submission_tracker_services.create(submission_tracker_obj);
    
    const candidateData = {
      _id: req.body.candidate,
      command: {
          content: ' ',
          created_by: req.auth.user_id,
          demand: req.body.demand,
          profile_status: 'Waiting'
      }
  };

  let updated = await candidate_services.updateCommandCandidate(candidateData);
    res.respond(new_submission, 200, "Submission created successfully.");
  },
};

const createbulkSubmission = {
  controller: async (req, res) => {
    try {
      const { selectedIds, DemandId } = req.body;

      const submissionDetails = [];

      for (const candidateId of selectedIds) {
        try {
          const existingSubmission =
            await fast_connection.models.submission.find({
              candidate: candidateId,
              demand: DemandId,
            });

          console.log(existingSubmission, "dsas");

          if (existingSubmission.length > 0) {
            try {
              const candidateData =
                await candidate_services.getbulksubmissionCandidate({
                  _id: candidateId,
                });
              // const ss = candidateData.map(i => i.command);
              const lastCommandData =
                await candidate_services.getCandidateDetails(candidateId);
              const lastProfileStatus = lastCommandData.command.map(
                (i) => i.profile_status
              );
              console.log(lastProfileStatus[0], "lastProfileStatus");

              submissionDetails.push({
                id: candidateData.map((i) => i.CandidateId).join(", "),
                submissionId: candidateData.map((i) => i._id).join(", "),
                name: candidateData.map((i) => i.first_name).join(", "),
                status: "failed(duplicate)",
                error: `Duplicate submission for candidate ${candidateId}`,
                demand_id: DemandId,
                createdAt: candidateData.map((i) =>
                  ISOdateToCustomDate(i.createdAt)
                ),
                colorCode: lastProfileStatus[0],
              });
            } catch (error) {
              console.error(error);
              submissionDetails.push({
                id: null,
                name: null,
                status: "failed",
                error: `Error getting candidate data for candidate ${candidateId}`,
              });
            }
          } else {
            const newSubmission = await submission_services.create({
              candidate: candidateId,
              demand: DemandId,
              submitted_by: req.auth.user_id,
              SubmissionId: await generateSubmissionId(),
            });

            const submission_tracker_obj = {
              submission_id: newSubmission._id,
              demand_id: DemandId,
              candidate_id: candidateId,
              SubmissionId: newSubmission.SubmissionId,
              submitted_by: req.auth.user_id,
            };

            await submission_tracker_services.create(submission_tracker_obj);

            const id = newSubmission.candidate.toString();

            // Use the correct type when querying by _id
            const candidateData =
              await candidate_services.getbulkCandidateDetails({
                _id: new ObjectId(id),
              });

            const lastCommandData =
              await candidate_services.getCandidateDetails(id);
            const lastProfileStatus = lastCommandData.command.map(
              (i) => i.profile_status
            );
            console.log(lastProfileStatus[0], "lastProfileStatus");

            submissionDetails.push({
              id: candidateData.CandidateId,
              name: candidateData.first_name,
              status: "Submitted",
              error: null,
              createdAt: candidateData.createdAt,
              colorCode: lastProfileStatus[0],
              submissionId: newSubmission._id,
            });
          }
        } catch (error) {
          console.error(error);
          submissionDetails.push({
            id: null,
            name: null,
            status: "failed",
            error: `Error creating submission for candidate ${candidateId}`,
          });
        }
      }

      res.respond({ submissionDetails }, 200, "Submission details.");
    } catch (error) {
      console.error(error);
      res.respond(null, 500, "Internal Server Error");
    }
  },
};

// const createbulkSubmission = {
//   controller: async (req, res) => {
//     try {
//       const { selectedIds, DemandId } = req.body;

//       const submissionDetails = [];

//       for (const candidateId of selectedIds) {
//         try {
//           const existingSubmission = await fast_connection.models.submission.find({
//             candidate: candidateId,
//             demand: DemandId
//           });

//           console.log(existingSubmission,"easy")

//           if (existingSubmission.length > 0) {
//             for (const candidateId of selectedIds) {
//               try {
//                 const candidateData = await candidate_services.getbulksubmissionCandidate({ _id: candidateId });

//                 submissionDetails.push({
//                   id: candidateData.map(i=>i.CandidateId).join(', '),
//                   name: candidateData.map(i => i.first_name).join(', '),
//                   status: 'failed(duplicate)',
//                   error: `Duplicate submission for candidate ${candidateId}`,
//                   demand_id : DemandId,
//                 });
//               } catch (error) {
//                 console.error(error);
//                 submissionDetails.push({
//                   id: null,
//                   name: null,
//                   status: 'failed',
//                   error: `Error getting candidate data for candidate ${candidateId}`
//                 });
//               }
//             }
//           }
//            else {
//             const newSubmission = await submission_services.create({
//               candidate: candidateId,
//               demand: DemandId,
//               submitted_by: req.auth.user_id,
//               SubmissionId: await generateSubmissionId()
//             });

//             const submission_tracker_obj = {
//               submission_id: newSubmission._id,
//               demand_id: DemandId,
//               candidate_id: candidateId,
//               SubmissionId: newSubmission.SubmissionId,
//               submitted_by: req.auth.user_id
//           };

//             await submission_tracker_services.create(submission_tracker_obj);

//             const id = newSubmission.candidate.toString();
//             console.log(id,newSubmission,"ss");

//             // Use the correct type when querying by _id
//             const candidateData = await candidate_services.getbulkCandidateDetails({
//               _id: new ObjectId(id),
//             });

//             console.log(candidateData, id, "new");

//             submissionDetails.push({
//               id: candidateData.CandidateId,
//               name: candidateData.first_name,
//               status: 'submitted',
//               error: null
//             });
//           }
//         } catch (error) {
//           console.error(error);
//           submissionDetails.push({
//             id: null,
//             name: null,
//             status: 'failed',
//             error: `Error creating submission for candidate ${candidateId}`
//           });
//         }
//       }

//       res.respond({ submissionDetails }, 200, 'Submission details.');
//     } catch (error) {
//       console.error(error);
//       res.respond(null, 500, 'Internal Server Error');
//     }
//   }
// };

const updateSubmission = {
  controller: async (req, res) => {
    await submission_services.updateSubmission(req.body);
    res.respond(
      "Submission updated successfully",
      200,
      "Submission updated successfully."
    );
  },
};

const deleteSubmission = {
  controller: async (req, res) => {
    console.log(req.body, "sdsd");
    await submission_services.deleteSubmission(req.body._id);
    res.respond(
      "Submission deleted successfully",
      200,
      "Submission deleted successfully."
    );
  },
};

const deleteSubmissionUndone = {
  controller: async (req, res) => {
    try {
      const updateData = req.body.data; 

      if (updateData.length === 0) {
        return res.respond({
          success: false,
          error: "No update data provided.",
        }, 400); 
      }

      const result = await submission_services.bulkUpdateSubmissions(updateData);

      if (result.modifiedCount > 0) {
        res.respond({
          success: true,
          message: `${result.modifiedCount} submissions marked as deleted successfully.`,
        });
      } else {
        res.respond({
          success: false,
          error: "No submissions were found or updated.",
        }, 404);
      }
    } catch (error) {
      console.error("Error deleting submission:", error);
      res.respond({
        success: false,
        error: "Internal Server Error",
      }, 500);
    }
  },
};





const listSubmissions = {
  controller: async (req, res) => {
    let submissions = await submission_services.listSubmissions(req.query);
    res.respond(submissions, 200, "Submissionss fetched sucessfully");
  },
};

const listUserCreatedSubmissions = {
  controller: async (req, res) => {
    let submissions = await submission_services.listUserCreatedSubmissions(
      req.auth.user_id,
      req.query
    );
    res.respond(submissions, 200, "Submissionss fetched sucessfully");
  },
};

const downloadSubmissions = {
  controller: async (req, res) => {
    let random_prefix = crypto.randomBytes(20).toString("hex");
    let submissions = await submission_services.listSubmissions(req.query);
    let excel_submissions = submissions.map((s) => {
      let transformed = {
        demand_id: s?.demand?._id,
        recruiter:
          s?.submitted_by?.first_name + " " + s?.submitted_by?.last_name,
        submission_id: s?._id,
        submission_date: ISOdateToCustomDate(s?.createdAt),
        candidate_id: s?.candidate?._id,
        mobile: s?.candidate?.mobile_number,
        email: s?.candidate?.email,
        status: s?.status,
      };
      return transformed;
    });
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet("submission_list");

    worksheet.columns = [
      { header: "demand_id", key: "demand_id" },
      { header: "recruiter", key: "recruiter" },
      { header: "submission_id", key: "submission_id" },
      { header: "submission_date", key: "submission_date" },
      { header: "candidate_id", key: "candidate_id" },
      { header: "mobile", key: "mobile" },
      { header: "email", key: "email" },
      { header: "status", key: "status" },
    ];
    worksheet.addRows(excel_submissions);
    await workbook.xlsx
      .writeFile(`./${random_prefix}_list.xlsx`)
      .then(function () {
        res.download(
          `./${random_prefix}_list.xlsx`,
          "list.xlsx",
          function (err) {
            if (err) {
              console.log(err);
            } else {
              fs.unlink(`./${random_prefix}_list.xlsx`, function () {
                console.log(`${random_prefix}_list.xlsx file deleted`);
              });
            }
          }
        );
      });
  },
};
const downloadApprovalSubmissions = {
  controller: async (req, res) => {
    let random_prefix = crypto.randomBytes(20).toString("hex");
    let submissions = await submission_services.getRecruiterSubmission(
      req.query
    );
    let excel_submissions = submissions.map((s) => {
      let transformed = {
        demand_id: s?.demand?.DemandId,
        recruiter:
          s?.submitted_by?.first_name + " " + s?.submitted_by?.last_name,
        submission_id: s?.SubmissionId,
        submission_date: ISOdateToCustomDate(s?.createdAt),
        candidate_id: s?.candidate?.CandidateId,
        mobile: s?.candidate?.mobile_number,
        email: s?.candidate?.email,
        status: s?.status,
      };
      return transformed;
    });
    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet("submission_list");

    worksheet.columns = [
      { header: "demand_id", key: "demand_id" },
      { header: "recruiter", key: "recruiter" },
      { header: "submission_id", key: "submission_id" },
      { header: "submission_date", key: "submission_date" },
      { header: "candidate_id", key: "candidate_id" },
      { header: "mobile", key: "mobile" },
      { header: "email", key: "email" },
      { header: "status", key: "status" },
    ];
    worksheet.addRows(excel_submissions);
    await workbook.xlsx
      .writeFile(`./${random_prefix}_list.xlsx`)
      .then(function () {
        res.download(
          `./${random_prefix}_list.xlsx`,
          "list.xlsx",
          function (err) {
            if (err) {
              console.log(err);
            } else {
              fs.unlink(`./${random_prefix}_list.xlsx`, function () {
                console.log(`${random_prefix}_list.xlsx file deleted`);
              });
            }
          }
        );
      });
  },
};

const getSubmissionDetails = {
  controller: async (req, res) => {
    let submission = await submission_services.getSubmissionDetails(
      req.query.submission_id
    );
    res.respond(submission, 200, "Submission fetched sucessfully");
  },
};

const getSubmissionCollection = {
  controller: async (req, res) => {
    try {
      const submissionIds = req.query.submission_id.split(",");
      const submissions = await submission_services.getSubmissionCollection(
        submissionIds
      );
      res.respond(submissions, 200, "Submissions fetched successfully");
    } catch (error) {
      res.respond(error.message, 500, "Error fetching submissions");
    }
  },
};

const getDemandSubmission = {
  controller: async (req, res) => {
    try {
      const demandId = req.query.demandId;
      const submissions = await submission_services.getDemandSubmission(
        demandId
      );
      res.respond(submissions, 200, "Submissions fetched successfully");
    } catch (error) {
      res.respond(error.message, 500, "Error fetching submissions");
    }
  },
};

const updateSubmissionTracker = {
  controller: async (req, res) => {
    await submission_tracker_services.updateSubmissionTracker(req.body);
    res.respond(
      "Submission tracker updated successfully",
      200,
      "Submission tracker updated successfully."
    );
  },
};

const getSubmissionByDemand = {
  controller: async (req, res) => {
    let submission = await submission_services.getSubmissionByDemand(
      req.query.demand_id
    );
    res.respond(submission, 200, "Submissions fetched sucessfully");
  },
};

const getSubmissionTracker = {
  controller: async (req, res) => {
    let submission =
      await submission_tracker_services.getSubmissionTrackerDetails(
        req.query.submission_id
      );
    res.respond(submission, 200, "Submission tracker fetched sucessfully");
  },
};

const searchSubmission = {
  controller: async (req, res) => {
    let submissions = await submission_services.searchSubmission(
      req.query.field_name,
      req.query.field_value
    );
    res.respond(submissions, 200, "Submission fetched sucessfully");
  },
};
const searchMySubmission = {
  controller: async (req, res) => {
    let submissions = await submission_services.searchMySubmission(
      req.auth.user_id,
      req.query.field_name,
      req.query.field_value
    );
    res.respond(submissions, 200, "Submission fetched sucessfully");
  },
};
const searchApprovalSubmission = {
  controller: async (req, res) => {
    let submissions = await submission_services.searchApprovalSubmission(
      req.auth.user_id,
      req.query.field_name,
      req.query.field_value
    );
    res.respond(submissions, 200, "Submission fetched sucessfully");
  },
};

const uploadReports = {
  controller: async (req, res) => {
    res.respond(
      { document: req.file.location },
      200,
      "Document uploaded sucessfully"
    );
  },
};

// const downloadTrackSubmissions = {
//   controller: async (req, res) => {
//     try {
//       let random_prefix = crypto.randomBytes(20).toString('hex');
//       const { submission_id } = req.query;
//       console.log(submission_id, "Ss")
//       let Tracksubmissions = await submission_tracker_services.download(submission_id);
//       console.log(Tracksubmissions, "data");
//       let excel_demands = [Tracksubmissions].map((d) => {
//         let transformed = {
//           submission_id: d?.SubmissionId,
//           demand_id: d?.demand_id.DemandId,
//           candidate_id: d?.candidate_id.CandidateId,
//           status: d?.status,
//           initial_screening: d?.file_reports[0],
//           level_1: d?.file_reports[1],
//           level_2: d?.file_reports[2],
//           final_select: d?.file_reports[3],
//           offered: d?.file_reports[4],
//           onboard: d?.file_reports[5],
//           bg_verification: d?.file_reports[6],
//           join_date: d?.join_date,
//           offeredCtc: d?.offeredCtc,
//           billingRate: d?.billingRate,
//         };
//         return transformed;
//       });
//       let workbook = new Excel.Workbook();
//       let worksheet = workbook.addWorksheet("demand_list");

// const centerAlignedStyle = {
//     alignment: {
//       horizontal: 'center',
//       vertical: 'middle',
//     },
//   };

//       // ... existing cell style and header formatting ...

//       // const hyperlinkStyle = workbook.createStyle({
//       //   font: { color: "#0000FF", underline: true },
//       // });

//         worksheet.columns = [
//     { header: 'Submission ID', key: 'submission_id', width: 15 },
//     { header: 'Demand ID', key: 'demand_id', width: 15 },
//     { header: 'Candidate ID', key: 'candidate_id', width: 15 },
//     { header: 'Status', key: 'status', width: 25 },
//     { header: 'Intial Screening', key: 'initial_screening', width: 25 },
//     { header: 'Level 1 Report', key: 'level_1', width: 25 },
//     { header: 'Level 2 Report', key: 'level_2', width: 25 },
//     { header: 'Final Select', key: 'final_select', width: 25 },
//     { header: 'Offered', key: 'offered', width: 25 },
//     { header: 'Onboard', key: 'onboard', width: 25 },
//     { header: 'BG Verification', key: 'bg_verification', width: 25 },
//     { header: 'Date of onboard', key: 'join_date', width: 25 },
//     { header: 'Offered CTC', key: 'offeredCtc', width: 25 },
//     { header: 'Billing Rate', key: 'billingRate', width: 25 },
//   ];

//        // Center-align the header row
//     worksheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

//     // Apply center-aligned style to all rows and cells
//     worksheet.eachRow((row, rowNumber) => {
//       row.eachCell((cell) => {
//         cell.style = centerAlignedStyle;
//       });
//     });

//     excel_demands.forEach((d) => {
//       // Modify the hyperlink values to use Google Docs Viewer
//       const baseURL = 'https://docs.google.com/viewer?url=';

//       d.initial_screening = {
//         text: "Initial Screening report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.initial_screening)}`,
//       };
//       d.level_1 = {
//         text: "Level 1 report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.level_1)}`,
//       };
//       d.level_2 = {
//         text: "Level 2 report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.level_2)}`,
//       };
//       d.final_select = {
//         text: "Final Select report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.final_select)}`,
//       };
//       d.offered = {
//         text: "Offered report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.offered)}`,
//       };
//       d.onboard = {
//         text: "Onboard report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.onboard)}`,
//       };
//       d.bg_verification = {
//         text: "BG Verification report",
//         hyperlink: `${baseURL}${encodeURIComponent(d?.bg_verification)}`,
//       };
//     });
// //     excel_demands.forEach((d) => {
// //       // Modify the hyperlink values to use the openResume function
// //     d.initial_screening = { text: "Initial Screening report", hyperlink: (d?.initial_screening)};
// // d.level_1 = { text: "Level 1 report", hyperlink:(d?.level_1)};
// // d.level_2 = { text: "Level 2 report", hyperlink: (d?.level_2)};
// // d.final_select = { text: "Final Select report", hyperlink: (d?.final_select)};
// // d.offered = { text: "Offered report", hyperlink: (d?.offered) };
// // d.onboard = { text: "Onboard report", hyperlink: (d?.onboard) };
// // d.bg_verification = { text: "BG Verification report", hyperlink:(d?.bg_verification) };

// //     });

//     worksheet.addRows(excel_demands);

//     // Apply hyperlink styles to cells with hyperlinks
//     worksheet.eachRow((row) => {
//       row.eachCell((cell) => {
//         if (cell.value && cell.value.hyperlink) {
//           cell.font = {
//             color: { argb: "0000FF" },
//             underline: true,
//           };
//         }
//       });
//     });

//     const headerCellReferences = ['A1', 'B1', 'C1', 'D1'];
//     const headerColor = 'DCE6F1';

//     for (const cellRef of headerCellReferences) {
//       const cell = worksheet.getCell(cellRef);
//       cell.fill = {
//         type: 'pattern',
//         pattern: 'solid',
//         fgColor: { argb: headerColor }
//       };
//     }

//     await workbook.xlsx.writeFile(`./${random_prefix}_list.xlsx`);

//     res.download(`./${random_prefix}_list.xlsx`, 'list.xlsx', function (err) {
//       if (err) {
//         console.log(err);
//       } else {
//         fs.unlink(`./${random_prefix}_list.xlsx`, function () {
//           console.log(`${random_prefix}_list.xlsx file deleted`);
//         });
//       }
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).send('Error occurred during download');
//   }
// },
// };
const downloadTrackSubmissions = {
  controller: async (req, res) => {
    try {
      let random_prefix = crypto.randomBytes(20).toString("hex");
      const { submission_id } = req.query;

      let Tracksubmissions = await submission_tracker_services.download(
        submission_id.split(",")
      ); // Split the string into an array of submission IDs
      // Split the string into an array of submission IDs
      let excel_demands = Tracksubmissions.map((d) => {
        let transformed = {
          submission_id: d?.SubmissionId,
          demand_id: d?.demand_id.DemandId,
          candidate_id: d?.candidate_id.CandidateId,
          status: d?.status,
          initial_screening: d?.file_reports[0],
          level_1: d?.file_reports[1],
          level_2: d?.file_reports[2],
          final_select: d?.file_reports[3],
          offered: d?.file_reports[4],
          onboard: d?.file_reports[5],
          bg_verification: d?.file_reports[6],
          join_date: d?.join_date,
          offeredCtc: d?.offeredCtc,
          billingRate: d?.billingRate,
        };
        return transformed;
      });
      let workbook = new Excel.Workbook();
      let worksheet = workbook.addWorksheet("demand_list");

      const centerAlignedStyle = {
        alignment: {
          horizontal: "center",
          vertical: "middle",
        },
      };

      // ... existing cell style and header formatting ...

      // const hyperlinkStyle = workbook.createStyle({
      //   font: { color: "#0000FF", underline: true },
      // });

      worksheet.columns = [
        { header: "Submission ID", key: "submission_id", width: 15 },
        { header: "Demand ID", key: "demand_id", width: 15 },
        { header: "Candidate ID", key: "candidate_id", width: 15 },
        { header: "Status", key: "status", width: 25 },
        { header: "Intial Screening", key: "initial_screening", width: 25 },
        { header: "Level 1 Report", key: "level_1", width: 25 },
        { header: "Level 2 Report", key: "level_2", width: 25 },
        { header: "Final Select", key: "final_select", width: 25 },
        { header: "Offered", key: "offered", width: 25 },
        { header: "Onboard", key: "onboard", width: 25 },
        { header: "BG Verification", key: "bg_verification", width: 25 },
        { header: "Date of onboard", key: "join_date", width: 25 },
        { header: "Offered CTC", key: "offeredCtc", width: 25 },
        { header: "Billing Rate", key: "billingRate", width: 25 },
      ];

      // Center-align the header row
      worksheet.getRow(1).alignment = {
        horizontal: "center",
        vertical: "middle",
      };

      // Apply center-aligned style to all rows and cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.style = centerAlignedStyle;
        });
      });

      excel_demands.forEach((d) => {
        // Modify the hyperlink values to use Google Docs Viewer
        const baseURL = "https://docs.google.com/viewer?url=";

        d.initial_screening = {
          text: "Initial Screening report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.initial_screening)}`,
        };
        d.level_1 = {
          text: "Level 1 report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.level_1)}`,
        };
        d.level_2 = {
          text: "Level 2 report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.level_2)}`,
        };
        d.final_select = {
          text: "Final Select report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.final_select)}`,
        };
        d.offered = {
          text: "Offered report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.offered)}`,
        };
        d.onboard = {
          text: "Onboard report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.onboard)}`,
        };
        d.bg_verification = {
          text: "BG Verification report",
          hyperlink: `${baseURL}${encodeURIComponent(d?.bg_verification)}`,
        };
      });
      //     excel_demands.forEach((d) => {
      //       // Modify the hyperlink values to use the openResume function
      //     d.initial_screening = { text: "Initial Screening report", hyperlink: (d?.initial_screening)};
      // d.level_1 = { text: "Level 1 report", hyperlink:(d?.level_1)};
      // d.level_2 = { text: "Level 2 report", hyperlink: (d?.level_2)};
      // d.final_select = { text: "Final Select report", hyperlink: (d?.final_select)};
      // d.offered = { text: "Offered report", hyperlink: (d?.offered) };
      // d.onboard = { text: "Onboard report", hyperlink: (d?.onboard) };
      // d.bg_verification = { text: "BG Verification report", hyperlink:(d?.bg_verification) };

      //     });

      worksheet.addRows(excel_demands);

      // Apply hyperlink styles to cells with hyperlinks
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (cell.value && cell.value.hyperlink) {
            cell.font = {
              color: { argb: "0000FF" },
              underline: true,
            };
          }
        });
      });

      const headerCellReferences = ["A1", "B1", "C1", "D1"];
      const headerColor = "DCE6F1";

      for (const cellRef of headerCellReferences) {
        const cell = worksheet.getCell(cellRef);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: headerColor },
        };
      }

      await workbook.xlsx.writeFile(`./${random_prefix}_list.xlsx`);

      res.download(`./${random_prefix}_list.xlsx`, "list.xlsx", function (err) {
        if (err) {
          console.log(err);
        } else {
          fs.unlink(`./${random_prefix}_list.xlsx`, function () {
            console.log(`${random_prefix}_list.xlsx file deleted`);
          });
        }
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Error occurred during download");
    }
  },
};
const getSubmissionApproval = {
  controller: async (req, res) => {
    let submissions = await submission_services.getRecruiterSubmission(
      req.query
    );
    res.respond(submissions, 200, "Submissionss fetched sucessfully");
  },
};
const getSubmissionApprovalUpdate = {
  controller: async (req, res) => {
    let submissions = await submission_services.getLastSubmissionUpdate(
      req.body
    );
    res.respond(submissions, 200, "Submissionss fetched sucessfully");
  },
};

module.exports = {
  createSubmission,
  updateSubmission,
  deleteSubmission,
  downloadTrackSubmissions,
  getSubmissionDetails,
  listSubmissions,
  updateSubmissionTracker,
  getSubmissionByDemand,
  getSubmissionTracker,
  searchSubmission,
  searchMySubmission,
  downloadSubmissions,
  listUserCreatedSubmissions,
  uploadReports,
  getSubmissionApproval,
  getSubmissionApprovalUpdate,
  searchApprovalSubmission,
  downloadApprovalSubmissions,
  getSubmissionCollection,
  createbulkSubmission,
  getDemandSubmission,
  deleteSubmissionUndone
};
