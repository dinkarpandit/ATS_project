const mongoose = require("mongoose");
const Schema = mongoose.Schema

const crm_schema = new Schema({
    client_id: { type: String, },
    client_objId: { type: String, },
    opportunity_id: { type: String, unique: true },
    Deal_name: { type: String, },
    customer_name: { type: String },
    owner: { type: String },
    opportunity_description: { type: String, },
    reports_to: { type: String, },
    industry: { type: String, },
    status: { type: String, },
    business_Unit: { type: String, },
    values: { type: String, },
    currency: { type: String, },
    closure_date: { type: String, },
    entry_date: { type: String, },
    confidence: { type: String, },

    delivery_poc: { type: String, },
    next_action_date: { type: String, },
    lead_Reference: { type: String },
    addtional_remarks: { type: String, },
    documents: [{ type: Object }],
    created_by: { type: Schema.Types.ObjectId, ref: 'employee' },
    is_deleted: { type: Boolean, default: false },
    updated_by: { type: Schema.Types.ObjectId, ref: 'employee' },

},
    {
        timestamps: true
    })



module.exports = crm_schema;