const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commandSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    created_by: { type: Schema.Types.ObjectId, ref: 'employee' },
    demand: { type: Schema.Types.ObjectId, ref: 'demand' },
    profile_status: { type: String, default: 'NotProcessed' },
}, { timestamps: true });

module.exports = mongoose.model('Command', commandSchema);