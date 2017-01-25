"use strict";

// let ROOT 			= "../../../../";
let config    		= require("../../../../config");
let logger    		= require("../../../../core/logger");

let _ 				= require("lodash");

let db	    		= require("../../../../core/mongo");
let mongoose 		= require("mongoose");
let Schema 			= mongoose.Schema;
let hashids 		= require("../../../../libs/hashids")("relationship");
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

let RelationshipSchema = new Schema({
	name: {
		type: String,
		trim: true
	},
	description: {
		type: String,
		trim: true
	},
	createdAt: {
		type: Date
	},
	editedAt: {
		type: Date
	},
	author: {
		type: Number,
		required: "Please fill in an author ID",
		ref: "User"
	},
	goals: [{
		type: Number,
		required: "Please fill in a goal ID",
		ref: "Goal"
	}],
	metadata: {}

}, schemaOptions);

RelationshipSchema.virtual("code").get(function() {
	return this.encodeID();
});

RelationshipSchema.plugin(autoIncrement.plugin, {
	model: "Relationship",
	startAt: 1
});

RelationshipSchema.methods.encodeID = function() {
	return hashids.encodeHex(this._id);
};

RelationshipSchema.methods.decodeID = function(code) {
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

let Relationship = mongoose.model("Relationship", RelationshipSchema);

module.exports = Relationship;
