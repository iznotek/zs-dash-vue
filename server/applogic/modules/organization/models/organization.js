"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let _ 				= require("lodash");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("organizations");
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

let OrganizationSchema = new Schema({
	name: {
		type: String,
		trim: true
	},
	desc: {
		type: String
	},
	logo: {
		type: String
	},
	website: {
		type: String
	},
	createdAt: {
		type: Date
	},
	editedAt: {
		type: Date
	},
	metadata: {}

}, schemaOptions);

OrganizationSchema.virtual("code").get(function() {
	return this.encodeID();
});

OrganizationSchema.plugin(autoIncrement.plugin, {
	model: "Organization",
	startAt: 1
});

OrganizationSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
};

OrganizationSchema.methods.decodeID = function(code) {
	return hashids.decodeHex(code);
};

/*
OrganizationSchema.static("getByID", function(id) {
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

let Organization = mongoose.model("Organization", OrganizationSchema);

module.exports = Organization;
