"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let _ 				= require("lodash");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("contracts");
let autoIncrement 	= require("mongoose-auto-increment");

let schemaOptions = {
	timestamps: true,
	toObject: {
		virtuals: true
	},
	toJSON: {
		virtuals: true
	}
};

let ContractSchema = new Schema({
	name: {
		type: String,
		trim: true
	},
	description: {
		type: String,
		trim: true
	},
	customer: {
		type: String,
		trim: true
	},
	customer_email: {
		type: String,
		trim: true
	},
	customer_terms: {
		type: String,
		trim: true
	},
	renewal_period: {
		type: Number,
		default: 0
	},
	cancellation_terms: {
		type: Number,
		default: 0
	},
	billing_type: {
		type: Number,
		default: 0
	},
	contract_start: {
		type: Date
	},
	contract_end: {
		type: Date
	},
	resources: {
		type: String,
		trim: true
	},
	views: {
		type: Number,
		default: 0
	},
	createdAt: {
		type: Date
	},
	editedAt: {
		type: Date
	},
	metadata: {}

}, schemaOptions);

ContractSchema.virtual("code").get(function() {
	return this.encodeID();
});

ContractSchema.plugin(autoIncrement.plugin, {
	model: "Contract",
	startAt: 1
});

ContractSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
};

ContractSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

/*
ContractSchema.static("getByID", function(id) {
	let query;
	if (_.isArray(id)) {
		query = this.collection.find({ _id: { $in: id} });
	} else
		query = this.collection.findById(id);

	return query
		.populate({
			path: "author",
			select: ""
		})
});*/

let Contract = mongoose.model("Contract", ContractSchema);

module.exports = Contract;
