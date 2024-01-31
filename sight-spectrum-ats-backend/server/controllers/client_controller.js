const client_services = require("../services/client_services")
const XLSX = require('xlsx');
const axios = require('axios');
const Excel = require('exceljs')
const crypto = require('crypto')
const fs = require('fs')
const stringSimilarity = require('string-similarity');
const submission_services = require("../services/submission_services");

const generateClientId = async () => {
  const client = await client_services.getAllClient();
  const lastClientId = client.ClientId;
  clientCounter = parseInt(lastClientId.substr(1)) + 1;
  const paddedCounter = clientCounter.toString().padStart(6, '0');
  return `C${paddedCounter}`;
};

const createClient = {
  controller: async (req, res) => {
    let new_obj = { ...req.body }
    new_obj["ClientId"] = await generateClientId()
    new_obj["created_by"] = req.auth.user_id
    let new_client = await client_services.create(new_obj)
    res.respond(new_client, 200, 'Client created successfully.');
  }
}

const updateClient = {
  controller: async (req, res) => {
    let update_obj = req.body
    await client_services.updateClient(update_obj)
    res.respond("Client updated successfully", 200, 'Client updated successfully.');
  }
}

const deleteClient = {
  controller: async (req, res) => {
    await client_services.deleteClient(req.body._id)
    res.respond("Client deleted successfully", 200, 'Client deleted successfully.');
  }
}

const listClients = {
  controller: async (req, res) => {
    let clients = await client_services.listClients(req.query)
    res.respond(clients, 200, 'Clients fetched sucessfully');
  }
}

const getClientDetails = {
  controller: async (req, res) => {
    let client = await client_services.getClientDetails(req.query.client_id)
    res.respond(client, 200, 'client fetched sucessfully');
  }
}

const searchClients = {
  controller: async (req, res) => {
    let clients = await client_services.searchClient(req.query.field_name, req.query.field_value)
    res.respond(clients, 200, 'clients fetched sucessfully');
  }
}

const addClientDocuments = {
  controller: async (req, res) => {
    let documents_arr = []
    req.files.map(i => {
      let document_obj = {}
      document_obj["document_name"] = i.originalname
      document_obj["document"] = i.location
      documents_arr.push(document_obj)
    })
    res.respond({ documents: documents_arr }, 200, 'Documents uploaded sucessfully');
  }
}

const addClientTemplate = {
  controller: async (req, res) => {
    try {
      const fileUrl = req.files[0].location;
      const workbook = await downloadFile(fileUrl);
      const sheetNames = workbook.SheetNames;
      let headerValues = [];

      for (let i = 0; i < sheetNames.length; i++) {
        const sheetName = sheetNames[i];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        const headerRow = jsonData[0];
        const sheetHeaderValues = Object.values(headerRow);
        headerValues = headerValues.concat(sheetHeaderValues);
      }
      const template = headerValues.map(value => [value]);

      res.respond({ template, fileUrl }, 200, 'Sheet header values extracted successfully');
    } catch (error) {
      console.error(error);
      res.respond({}, 500, 'Error extracting sheet header values');
    }
  }
};



const downloadFile = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const data = response.data;
    const workbook = XLSX.read(data, { type: 'buffer' });
    return workbook;
  } catch (error) {
    throw new Error('Error downloading the file');
  }
};

const getClientName = {
  controller: async (req, res) => {
    try {
      const companyNames = await client_services.getClientName();
      res.respond({ companyNames: companyNames }, 200, 'Company names retrieved successfully');
    } catch (error) {
      console.error(error);
      res.respond({}, 500, 'Error retrieving company names');
    }
  }
};


const downloadClientTracker = {
  controller: async (req, res) => {
    try {
      const companyName = req.query.company_name;
      const submission_id = req.query.submission_id;

      const client = await client_services.getCompanyTemplate(companyName);
      

      if (!client) {
        res.respond({}, 404, 'Company not found');
        return;
      }

      const template = client;
      const submissionData = await submission_services.getSubmissionCollection(submission_id);

      const excelData = {
        client: template,
        value: [[]]
      };

      const headerMap = new Map();



      template.forEach((header, index) => {
        // S.NO
        const S_No_keywords = ["s.no", "sl.no", "req.", "req"];
        const potentialSNoColumns = [];
        S_No_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialSNoColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });
      
        potentialSNoColumns.sort((a, b) => b.similarity - a.similarity);
      
        if (potentialSNoColumns.length > 0) {
          const snoColumn = potentialSNoColumns[0].column;
          headerMap.set('s.no', snoColumn);
          headerMap.set('req', snoColumn);
        }


        //  company_name
        const company_keywords = ["company name", "current organization", "Currently Working with", "Current Company", "current company", "company", "employer", "current Employer", "current employer", "curr.company name", "present employer"];
        const potentialCompanyColumns = [];
        company_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialCompanyColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialCompanyColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialCompanyColumns.length > 0) {
          const nameColumn = potentialCompanyColumns[0].column;
          headerMap.set('company', nameColumn);
          headerMap.set('current company', nameColumn);
        }

        // Name
        const nameKeywords = ["name", "employee name", "Candidate name", "candidate", "first name", "last name"];
        const potentialNameColumns = [];

        nameKeywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Adjust the similarity threshold as needed
            potentialNameColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialNameColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialNameColumns.length > 0) {
          const nameColumn = potentialNameColumns[0].column;
          headerMap.set('name', nameColumn);
        }
    
        // Mobile Number

        const mobile_keywords = ["mobile", "contact", "phone", "phone no", "number", "mobile number", "cell number", "Contact Number", "phone number"];
        const potentialMobileColumns = [];
        mobile_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialMobileColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialMobileColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialMobileColumns.length > 0) {
          const mobileColumn = potentialMobileColumns[0].column;
          headerMap.set('mobile', mobileColumn);
        }


        // Email


        const email_keywords = ["email", "gmail", "mail", "email id", "E -Mail ID", "Uploaded EMail ID", "Uploaded Email ID"];
        const potentialMailColumns = [];
        email_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialMailColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialMailColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialMailColumns.length > 0) {
          const mailColumn = potentialMailColumns[0].column;
          headerMap.set('email', mailColumn);
        }

        // FTE/C2H
        const FTE_C2H_keywords = ["FT/C2H", "FTE/CTH", "FTE/CTH", "mode of hire"];
        const potentialftec2hColumns = [];
        FTE_C2H_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialftec2hColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialftec2hColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialftec2hColumns.length > 0) {
          const mailColumn = potentialftec2hColumns[0].column;
          headerMap.set('FT/C2H', mailColumn);
          headerMap.set('FTE/C2H', mailColumn);
          headerMap.set('FTE/CTH', mailColumn);
        }


        // Date
        const date_keywords = ["date", "submission Date", "Date"];
        const potentialdateColumns = [];
        date_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialdateColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });
        potentialdateColumns.sort((a, b) => b.similarity - a.similarity);
        if (potentialdateColumns.length > 0) {
          const dateColumn = potentialdateColumns[0].column;
          headerMap.set('date', dateColumn);
        }


        // skillset

        const skill_keywords = ["skill", "skillset", "key skills"];
        const potentialskillColumns = [];
        skill_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) {
            potentialskillColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });
        potentialskillColumns.sort((a, b) => b.similarity - a.similarity);
        if (potentialskillColumns.length > 0) {
          const skillColumn = potentialskillColumns[0].column;
          headerMap.set('skill', skillColumn);
        }

        // 7. Experience

        const experience_keywords = ["T.E", "total exp", "overall experience", "experience", "Overall Exp", "Yrs. of Exp", "overall", "total", "Total Years of Exp"];
        const potentialexperienceColumns = [];

        experience_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());

          if (similarity > 0.6) {
            potentialexperienceColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialexperienceColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialexperienceColumns.length > 0) {
          const experienceColumn = potentialexperienceColumns[0].column;
          headerMap.set('exp', experienceColumn);
          headerMap.set('experience', experienceColumn);
        }

        // relevant Experience

        const relevant_keywords = ["R.E", "relevant exp", " relevant experience", "rev", "Relevant Yrs of Exp", "relevant"];
        const potentialrelevantColumns = [];

        relevant_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());

          if (similarity > 0.6) {
            potentialrelevantColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialrelevantColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialrelevantColumns.length > 0) {
          const experienceColumn = potentialrelevantColumns[0].column;
          headerMap.set('relevant exp', experienceColumn);
          headerMap.set('rev', experienceColumn);
        }


        // Current CTC
        const ctc_keywords = ["current_ctc", "CTC", "CCTC", "Current CTC", "current salary", "Annual salary"]
        const potentialCtcColumns = [];
        ctc_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialCtcColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialCtcColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialCtcColumns.length > 0) {
          const nameColumn = potentialCtcColumns[0].column;
          headerMap.set('current ctc', nameColumn);
          headerMap.set('ctc', nameColumn);
        }



        //  Expected CTC
        const expected_keywords = ["expected_ctc", "ECTC", "expected salary", "exp.CTC"]
        const potentialeExpectedCtcColumns = [];
        expected_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialeExpectedCtcColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialeExpectedCtcColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialeExpectedCtcColumns.length > 0) {
          const nameColumn = potentialeExpectedCtcColumns[0].column;
          headerMap.set('expected ctc', nameColumn);
        }

        // Notice period

        const NP_keywords = ["notice_period", "NP", "notice period"];
        const potentialeNoticeperiodColumns = [];

        NP_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.5) {
            potentialeNoticeperiodColumns.push({
              column: index + 1,
              similarity: similarity,
            });
          }
        });

        potentialeNoticeperiodColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialeNoticeperiodColumns.length > 0) {
          const nameColumn = potentialeNoticeperiodColumns[0].column;
          headerMap.set('notice period', nameColumn);
          headerMap.set('NP', nameColumn);
        }



        // current location

        const current_location_keywords = ["current location"]
        const potentialelocationColumns = [];
        current_location_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialelocationColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialelocationColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialelocationColumns.length > 0) {
          const nameColumn = potentialelocationColumns[0].column;
          headerMap.set('current location', nameColumn);
          headerMap.set('location', nameColumn);
        }


        // Preferred location

        const preferred_location_keywords = ["Preferred Location", "joining location", "Work Location"]
        const potentialepreferredlocationColumns = [];
        preferred_location_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialepreferredlocationColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialepreferredlocationColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialepreferredlocationColumns.length > 0) {
          const nameColumn = potentialepreferredlocationColumns[0].column;
          headerMap.set('preferred location', nameColumn);
        }


        // recruiter name

        const recruiter_keywords = ["Recruiter", "Recruiter Name","vendor name","vendor"]
        const potentialrecruiterColumns = [];
        recruiter_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialrecruiterColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialrecruiterColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialrecruiterColumns.length > 0) {
          const nameColumn = potentialrecruiterColumns[0].column;
          headerMap.set('recruiter', nameColumn);
          headerMap.set('recruiter name', nameColumn);
        }

        //requirement skill

        const requirement_keywords = ["requirement", "requirement skill", "current job title"]
        const potentialrequirementColumns = [];
        requirement_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialrequirementColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialrequirementColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialrequirementColumns.length > 0) {
          const nameColumn = potentialrequirementColumns[0].column;
          headerMap.set('requirement', nameColumn);
          headerMap.set('requirement skill', nameColumn);
        }



        // vendor name

        const vendor_keywords = ["vendor", "vendor name"]
        const potentialvendorColumns = [];
        vendor_keywords.forEach((keyword) => {
          const similarity = stringSimilarity.compareTwoStrings(String(header).toLowerCase(), keyword.toLowerCase());
          if (similarity > 0.8) { // Set a threshold for similarity
            potentialvendorColumns.push({
              column: index + 1,
              similarity: similarity
            });
          }
        });

        potentialvendorColumns.sort((a, b) => b.similarity - a.similarity);

        if (potentialvendorColumns.length > 0) {
          const nameColumn = potentialvendorColumns[0].column;
          headerMap.set('vendor', nameColumn);
          headerMap.set('vendor name', nameColumn);
        }
      });

      
    
      // Part 2 of the code
      submissionData.forEach((submission, index) => {
        const row = [];
      
       
      
        if (headerMap.has('s.no')) {
          const companyColumn = headerMap.get('s.no');
          excelData.value[index][companyColumn] = index + 1;
        }
      
        if (headerMap.has('company')) {
          const companyColumn = headerMap.get('company');
          excelData.value[index][companyColumn] = submission?.candidate?.employment_details[0]?.company_name;
        }

        if (headerMap.has('name')) {
          const nameColumn = headerMap.get('name');
          if (submissionData[index]?.candidate) {
            const aa = excelData.value[index][nameColumn] = submissionData[index].candidate.first_name + " " + submissionData[index].candidate.last_name;
            excelData.value[index][nameColumn] = submissionData[index].candidate.first_name + " " + submissionData[index].candidate.last_name;
          } else {
            excelData.value[index][nameColumn] = ''; 
        }
        } else if (headerMap.has('first name') && headerMap.has('last name')) {
          const firstNameColumn = headerMap.get('first name');
          const lastNameColumn = headerMap.get('last name');
          if (submissionData[index]?.candidate) {
            excelData.value[index][firstNameColumn] = submissionData[index].candidate.first_name;
            excelData.value[index][lastNameColumn] = submissionData[index].candidate.last_name;
          } else {
            excelData.value[index][firstNameColumn] = ''; 
            excelData.value[index][lastNameColumn] = ''; 
          }
        }
        
        if (headerMap.has('email')) {
          const emailColumn = headerMap.get('email');
          excelData.value[index][emailColumn] = submissionData[index]?.candidate?.email;
        }
        
        if (headerMap.has('mobile')) {
          const mobileColumn = headerMap.get('mobile');
          excelData.value[index][mobileColumn] = submissionData[index]?.candidate?.mobile_number;
        }
        if (headerMap.has('date')) {
          const dateColumn = headerMap.get('date');
          const createdAtDate = new Date(submissionData[index]?.createdAt);
          excelData.value[index][dateColumn] = createdAtDate.toLocaleDateString();
        }
        if (headerMap.has('skill')) {
          const skillColumn = headerMap.get('skill');
          const skillsetValues = submissionData[index]?.candidate?.skillset?.map(i => i.skill).join(', ');
          excelData.value[index][skillColumn] = skillsetValues;
        }
        if (headerMap.has('FTE/C2H')) {
          const modeofhireColumn = headerMap.get('FTE/C2H');
          const ModeofhireValues = submissionData[index]?.candidate?.prefered_mode_of_hire;
          excelData.value[index][modeofhireColumn] = ModeofhireValues;
        }
        if (headerMap.has('experience')) {
          const ExpColumn = headerMap.get('experience');
          const experienceValues = submissionData[index]?.candidate?.skillset?.map(i => i.exp);
          const totalExperience = experienceValues.reduce((sum, exp) => sum + exp, 0);
  
          const total = {
            years: 0,
            months: 0
          };
  
          submissionData?.candidate?.employment_details?.forEach(detail => {
            const startDate = new Date(detail?.start_date);
            const endDate = new Date(detail?.end_date);
  
  
            const diffYear = endDate.getFullYear() - startDate.getFullYear();
            const diffMonth = endDate.getMonth() - startDate.getMonth();
  
            total.years += diffYear;
            total.months += diffMonth;
  
            if (total.months >= 12) {
              total.years += Math.floor(total.months / 12);
              total.months = total.months % 12;
            }
          });
  
          const totalExperienceInMonths = total.years * 12 + total.months;
          const averageExperience = totalExperienceInMonths / 12;
  
          excelData.value[index][ExpColumn] = `${total.years} years ${total.months} months`;
        }
        if (headerMap.has('relevant exp')) {
        const ctcColumn = headerMap.get('relevant exp');
        const rev_skill_year = submissionData[index]?.candidate.skillset.map(i => i.skill).join(', ');
        excelData.value[0][ctcColumn] = rev_skill_year;
        }
  
        if (headerMap.has('ctc')) {
          const ctcColumn = headerMap.get('ctc');
          const ctcValue = submissionData[index]?.candidate?.employment_details[0]?.ctc || '';
          excelData.value[index][ctcColumn] = ctcValue;
        }
  
        if (headerMap.has('expected ctc')) {
          const expectedCtcColumn =  headerMap.get('expected ctc');
          const expectedCtcValue = submissionData[index]?.candidate?.expected_ctc || '';
          excelData.value[index][expectedCtcColumn] = expectedCtcValue;
        }
  
        if (headerMap.has('notice period')) {
          const NPColumn = headerMap.get('notice period');
          excelData.value[index][NPColumn] = submissionData[index]?.candidate?.notice_period;
        }
  
        if (headerMap.has('current location')) {
          const current_location = headerMap.get('current location');
          excelData.value[index][current_location] = submissionData[index]?.candidate?.current_location;
        }
  
        if (headerMap.has('Preferred Location')) {
          const preferred_location = headerMap.get('Preferred Location');
          excelData.value[index][preferred_location] = submissionData[index]?.candidate?.prefered_location;
        }
        if (headerMap.has('recruiter')) {
          const recruiterColumn = headerMap.get('recruiter');
          const names = submissionData.map(i => i.submitted_by.first_name + " " + i.submitted_by.last_name);
        
          if (submissionData[index]?.submitted_by) {
            excelData.value[index][recruiterColumn] = names[index];
          } else {
            excelData.value[index][recruiterColumn] = ''; 
          }
        }
        
        if (headerMap.has('vendor')) {
          const vendorColumn = headerMap.get('vendor');
          excelData.value[index][vendorColumn] = submissionData[index]?.demand?.vendor_name;
        }
        if (headerMap.has('requirement')) {
          const vendorColumn = headerMap.get('requirement');
          excelData.value[index][vendorColumn] = submissionData[index]?.demand?.job_title;
        }
  
  

        excelData.value.push(row);
      });
      
     
   const randomPrefix = crypto.randomBytes(20).toString('hex');
   const workbook = new Excel.Workbook();
   const worksheet = workbook.addWorksheet('Submission Data');

   const columnHeaders = excelData.client;
   const columnWidths = columnHeaders.map((header, index) => ({
     header: header,
     key: String(index + 1),
     width: 18,
   }));

   worksheet.columns = columnWidths;

   const headerRow = worksheet.getRow(1);
   headerRow.eachCell({ includeEmpty: true }, (cell) => {
     cell.fill = {
       type: 'pattern',
       pattern: 'solid',
       fgColor: { argb: 'DCE6F1' }
     };
     cell.alignment = { horizontal: 'center' };
     cell.border = {
       top: { style: 'thin', color: { argb: 'B2BEB5' } },
       left: { style: 'thin', color: { argb: 'B2BEB5' } },
       bottom: { style: 'thin', color: { argb: 'B2BEB5' } },
       right: { style: 'thin', color: { argb: 'B2BEB5' } },
     };
   });

   const dataRowStartIndex = 2;
   const columnWidthPadding = 5;

   excelData.value.forEach((row, rowIndex) => {
     row.forEach((value, columnIndex) => {
       const cell = worksheet.getCell(rowIndex + dataRowStartIndex, columnIndex);
       cell.value = value;
       cell.alignment = { horizontal: 'center' };
       const valueLength = String(value).length;
       const currentWidth = worksheet.getColumn(columnIndex).width;
       const newWidth = Math.max(valueLength + columnWidthPadding, currentWidth);
       worksheet.getColumn(columnIndex).width = newWidth;
     });
   });

   const filePath = `./${randomPrefix}_submission_data.xlsx`;
   await workbook.xlsx.writeFile(filePath);

   res.download(filePath, 'submission_data.xlsx', (err) => {
     if (err) {
       console.log(err);
     } else {
       fs.unlink(filePath, () => {
         console.log(`${filePath} file downloaded`);
       });
     }
   });

 } catch (error) {
   console.error(error);
   res.respond({}, 500, 'Error retrieving submission data');
 }
},
};











module.exports = {
  createClient,
  updateClient,
  deleteClient,
  listClients,
  getClientDetails,
  searchClients,
  addClientDocuments,
  addClientTemplate,
  getClientName,
  downloadClientTracker,
}