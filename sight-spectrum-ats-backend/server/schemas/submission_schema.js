const mongoose = require("mongoose");
const Schema = mongoose.Schema

const submission_schema = new Schema({
    SubmissionId:{type:String,unique:true},
    demand: {type: Schema.Types.ObjectId, ref: 'demand'},
    candidate:{type: Schema.Types.ObjectId, ref: 'candidate'},
    submitted_by:{type: Schema.Types.ObjectId, ref: 'employee'},
    status:{type:String, default:"NA"},
    approval:{type:Boolean,default:false},
    is_deleted: { type: Boolean, default: false },
    message: { type: String, default: 'old' },
    undone : {type:String, default:false}
},
{
    timestamps: true
});

module.exports = submission_schema;

