const express = require("express");
const router = express.Router();
const submission_controller = require("../controllers/submission_controller")
const { mediaUploadS3 } = require("../utils/s3_helper")

router.post("/createSubmission", submission_controller.createSubmission.controller)
router.post("/createbulkSubmission", submission_controller.createbulkSubmission.controller)
router.post("/updateSubmission", submission_controller.updateSubmission.controller)
router.post("/deleteSubmission", submission_controller.deleteSubmission.controller)
router.post("/deleteSubmissionUndone", submission_controller.deleteSubmissionUndone.controller)

router.get("/listSubmissions", submission_controller.listSubmissions.controller)
router.get("/listUserCreatedSubmissions", submission_controller.listUserCreatedSubmissions.controller)
router.get("/downloadSubmissions", submission_controller.downloadSubmissions.controller)
router.get("/getSubmissionDetails", submission_controller.getSubmissionDetails.controller)
router.get("/getSubmissionCollection", submission_controller.getSubmissionCollection.controller)
router.get("/searchSubmission", submission_controller.searchSubmission.controller)
router.get("/searchMySubmission", submission_controller.searchMySubmission.controller)
router.get("/searchApprovalSubmission", submission_controller.searchApprovalSubmission.controller)
router.get("/getDemandSubmission", submission_controller.getDemandSubmission.controller)

router.post("/updateSubmissionTracker", submission_controller.updateSubmissionTracker.controller)
router.get("/getSubmissionTracker", submission_controller.getSubmissionTracker.controller)
router.get("/getDemandSubmission", submission_controller.getDemandSubmission.controller)

router.get("/getSubmissionApproval", submission_controller.getSubmissionApproval.controller)
router.post("/getSubmissionApprovalUpdate", submission_controller.getSubmissionApprovalUpdate.controller)
router.get("/downloadApprovalSubmissions",submission_controller.downloadApprovalSubmissions.controller)

router.get("/downloadTrackSubmissions",submission_controller.downloadTrackSubmissions.controller)
router.post("/uploadReports", mediaUploadS3("candidate_reports").single("file"), submission_controller.uploadReports.controller)

 

module.exports = router
