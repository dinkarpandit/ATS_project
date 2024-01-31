const fast_connection = require("../connections/fastconnection");
const mongoose = require('mongoose'); 

const { ObjectId } = require('mongoose').Types;
class candidate_services {

  static async create(data) {
    try {
      const new_candidate = new fast_connection.models.candidate(data);
      return await new_candidate.save();
    } catch (error) {
      throw error;
    }
  }



  static async getAllCandidate() {
    try {
      return await fast_connection.models.candidate.findOne().sort({ _id: -1 }).limit(1);
    } catch (error) {
      throw error;
    }
  }


  static async getbulksubmissionCandidate({_id}) {
    try {
      const uniqueIds = new Set();
      const uniqueCandidates = [];
  
      const candidateData = await fast_connection.models.candidate.findOne({_id,is_deleted:false}).sort({ _id: -1 }).limit(1);
      
      if (candidateData) {
        const candidateId = candidateData.CandidateId;
  
        if (!uniqueIds.has(candidateId)) {
          uniqueCandidates.push(candidateData);
          uniqueIds.add(candidateId);
        }
      }
    
      return uniqueCandidates;
    }catch(error){
      console.log(error)
    }
  }
  
  static async getAllStarredMyCandidates() {
    try {
      return await fast_connection.models.candidate.find({ starred_all: true });
    } catch (error) {
      throw error;
    }
  }

  static async getCandidateById(candidateId) {
    try {
      console.log(candidateId, "id")
      const aa = await fast_connection.models.candidate.findOne({ CandidateId: candidateId })
      console.log(aa,"aa")
      return await fast_connection.models.candidate.findOne({ CandidateId: candidateId });
    } catch (error) {
      throw error;
    }
  }
  
  


  static async getLastCandidate() {
    try {
      return await fast_connection.models.candidate.findOne({ is_deleted: false }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }


  static async updateCandidate(body) {
    try {
      return await fast_connection.models.candidate.findOneAndUpdate({ _id: body._id }, body);
    } catch (error) {
      throw error;
    } 
  }

  static async updateCommandCandidate({ _id, command }) {
    try {
        const commandArray = Array.isArray(command) ? command : [command];

        if (commandArray[0].profile_status === 'Selected' || commandArray[0].profile_status === 'Rejected') {
            const data = await fast_connection.models.candidate.findOneAndUpdate(
                {
                    _id,
                    'command.demand': commandArray[0].demand,
                },{
                    $set: {
                        'command.$.profile_status': commandArray[0].profile_status,
                        'command.$.content': commandArray[0].content
                    }
                },{
                    new: true
                }
            );

            return data;
        } else {
            // Update the 'command' field without touching 'profile_status'
            const updatedData = await fast_connection.models.candidate.findOneAndUpdate(
                { _id },
                {
                    $push: {
                        command: { $each: commandArray },
                    },
                },
                { new: true }
            );

            return updatedData;
        }
    } catch (error) {
        throw error;
    }
}

  static async deleteCandidate(_id) {
    try {
      return await fast_connection.models.candidate.findOneAndUpdate({ _id: _id }, { is_deleted: true });
    } catch (error) {
      throw error;
    }
  }

  static async listCandidates({ skip, limit, sort_type, sort_field }) {
    try {
      return await fast_connection.models.candidate.find({ is_deleted: false }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 }).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }

  static async getSelectedCandidates(ids) {
    try {
      const idArray = ids.split(',');
  
      const objectIdArray = idArray.map(id => mongoose.Types.ObjectId(id));
  
      return await fast_connection.models.candidate.find({
        is_deleted: false,
        _id: { $in: objectIdArray } 
      });
    } catch (error) {
      throw error;
    }
  }
  

  static async ascCandidate({ skip, limit, search }) {
    try {
      const searchQuery = search.join('');
      const skipValue = parseInt(skip);
      const limitValue = parseInt(limit);
      function isEmail() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(searchQuery);
      }
      if (!searchQuery) {
        return "query parameter is missing"
      }
      if (isEmail()) {
        try {
          const result = await fast_connection.models.candidate
            .aggregate([
              {
                $search: {
                  index: "default",
                  text: {
                    query: searchQuery,
                    path: "email",
                    fuzzy: {
                      maxEdits: 2
                    },
                  },
                  highlight: {
                    path: "email"
                  },
                },
              }, {
                $match: {
                  email: searchQuery
                }
              },
              { "$skip": skipValue },
              { "$limit": limitValue },
            ])
          return result
        } catch (err) {
          console.error("Error executing search:", err);
          throw err
        }
      } else {
        try {
          const result = await fast_connection.models.candidate
            .aggregate([
              {
                $search: {
                  index: "default",
                  text: {
                    query: searchQuery,
                    path: { wildcard: "*" },
                    fuzzy: {
                      maxEdits: 2
                    },
                  },
                  highlight: {
                    path: { wildcard: "*" }
                  },
                },
              },
              { "$skip": skipValue },
              { "$limit": limitValue },
            ])
          return result
        } catch (err) {
          console.error("Error executing search:", err);
          throw err
        }
      }
    } catch (error) {
      throw error;
    }
  }

  static async getCandidateDetails(_id) {
    try {
      const candidate = await fast_connection.models.candidate.findOne({ is_deleted: false, _id: _id }).populate([
        { path: "created_by", select: { _id: 1, first_name: 1, last_name: 1 } },
        { path: 'command.demand', select: 'DemandId client', model: 'demand' },
        { path: 'command.created_by', select: 'first_name last_name', model: 'employee' },
      ]);
  
      // Sort the commands array by updatedAt in descending order
      if (candidate && candidate.command) {
        candidate.command.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      }
  
      return candidate;
    } catch (error) {
      throw error;
    }
  }
  

  static async getbulkCandidateDetails(candidateId) {
    try {
        const candidateDetails = await fast_connection.models.candidate
        .findOne({ is_deleted: false, _id: candidateId })
        .populate("created_by", { _id: 1, first_name: 1, last_name: 1 });
  
      return candidateDetails;
    } catch (error) {
      throw error;
    }
  }
  
  static async getCandidateViewDetails(_id) {
    try {
      return await fast_connection.models.candidate.findOne({ is_deleted: false, CandidateId: _id }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 })
      ;
    } catch (error) {
      throw error;
    }
  }

  static async getCandidateMobileNumber(candidate) {
    let mobile_number = candidate.mobile_number
    try {
      return await fast_connection.models.candidate.findOne({ is_deleted: false, mobile_number: mobile_number })
    } catch (error) {
      throw error;
    }
  }
  static async getCandidateEmail(candidate) {
    let email = candidate.email
    try {
      return await fast_connection.models.candidate.findOne({ is_deleted: false, email: email })
    } catch (error) {
      throw error;
    }
  }

  static async searchCandidates(field_name, field_value) {
    try {
      let query_obj = { is_deleted: false };
      const regex = new RegExp(field_value, 'i');
      query_obj[field_name] = regex;
      if (field_name === 'skillset') {
        const candidates = await fast_connection.models.candidate.find({ is_deleted: false });
        const filteredCandidates = candidates.filter(candidate => {
          return candidate.skillset.some(skill => skill.skill.match(regex));
        });
        return filteredCandidates;
      } else {
        return await fast_connection.models.candidate.find(query_obj)
          .populate('created_by', { _id: 1, first_name: 1, last_name: 1 });
      }
    } catch (error) {
      throw error;
    }
  }

  static async MatchProfileCandidate() {
    try {
      const latestCandidate = await fast_connection.models.candidate.find().sort({ _id: -1 }).limit(1).select('skillset.skill');
      if (latestCandidate.length === 0) {
        return;
      } else {
        const latestSkill = latestCandidate[0].skillset.map(skillObj => skillObj.skill);
        const regexSkills = latestSkill.map(skill => new RegExp(skill, "i"))
        const matchingDemands = await fast_connection.models.demand
          .find({ skillset: { $elemMatch: { skill: { $in: regexSkills } } } }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 });
        return matchingDemands
      }
    } catch (error) {
      throw error;
    }
  }
  static async getMatchCandidates({ skip, limit, sort_type, sort_field }) {
    try {
      const latestCandidate = await fast_connection.models.candidate.find().sort({ _id: -1 }).limit(1).select('skillset.skill');
      if (latestCandidate.length === 0) {
        return;
      } else {
        const latestSkill = latestCandidate[0].skillset.map(skillObj => skillObj.skill);
        const regexSkills = latestSkill.map(skill => new RegExp(skill, "i"))
        const matchingDemands = await fast_connection.models.demand
          .find({ skillset: { $elemMatch: { skill: { $in: regexSkills } } } }).populate("created_by", { _id: 1, first_name: 1, last_name: 1 }).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
        return matchingDemands
      }
    } catch (error) {
      throw error;
    }
  }
  static async searchAutoComplete(search) {

    const searchQuery = search;
    if (!searchQuery) {
      return "Query Parameter is missing";
    }
    try {
      const result = await fast_connection.models.candidate
        .aggregate([
          {
            $search: {
              index: "ats_autos",
              autocomplete: {
                query: searchQuery,
                path: "skillset.skill",
                fuzzy: {
                  maxEdits: 1,
                },
                tokenOrder: "sequential",
              },
            },
          }, {
            $project: {
              _id: 0,
              skillset: {
                skill: 1
              },
            }
          }, { "$limit": 10 },
        ])
      if (result.length === 0) {
        return ("There is no related Skills")
      }
      return result;
    } catch (err) {
      console.error("Error executing search:", err);
      throw err;
    }
  }

  static async getAllCompanyNames() {
    try {
      const result = await fast_connection.models.candidate.aggregate([
        {
          $group: {
            _id: null,
            companyNames: { $addToSet: '$employment_details.company_name' },
            currentLocations: { $addToSet: '$current_location' }, 
          },
        },
        {
          $project: {
            _id: 0,
            companyNames: 1,
            currentLocations: 1, 
          },
        },
      ]);

      if (result.length > 0) {
        const companyNamesSet = new Set(result[0].companyNames.flat());
        const currentLocationsSet = new Set(result[0].currentLocations.flat()); 
        const companyNamesArray = [...companyNamesSet];
        const currentLocationsArray = [...currentLocationsSet]; 
        return {
          companyNames: companyNamesArray,
          currentLocations: currentLocationsArray,
        };
      } else {
        return {
          companyNames: [],
          currentLocations: [],
        };
      }
    } catch (error) {
      console.error('Error retrieving company names:', error);
      throw error;
    }
  }

  static async getUserCreatedCandidate(user_id,{skip, limit, sort_type, sort_field}) {
    try {
      let query = { is_deleted: false, created_by: user_id } 
      return await fast_connection.models.candidate.find(query) .populate([
        { path: 'created_by', select: '_id first_name last_name' },
        { path: 'command.demand', select: 'DemandId client',model: 'demand'  }, // Assuming 'demand' is a reference field
        { path: 'command.created_by', select: 'first_name last_name' , model: 'employee'}, // Assuming 'created_by' is a reference field
      ]).skip(skip).limit(limit).sort([[sort_field, sort_type]]);
    } catch (error) {
      throw error;
    }
  }


}




module.exports = candidate_services;