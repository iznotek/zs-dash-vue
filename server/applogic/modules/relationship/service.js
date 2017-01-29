"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Relationship    = require("./models/relationship");

module.exports = {
	settings: {
		name: "relationships",
		version: 1,
		namespace: "relationships",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Relationship,

		modelPropFilter: "code author name desc customer editedAt",
		
		modelPopulates: {
		}
	},

	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				// filter.author = ctx.user.id
				let query = Relationship.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					return this.toJSON(docs);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		// return a model by ID
		get: {
			cache: true, // if true, we don't increment the views!
			permission: C.PERM_PUBLIC,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:RelationshipNotFound"));

				return Relationship.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				});
			}
		},

		create: {
			handler(ctx) {
				this.validateParams(ctx, true);

				var now = Date.now();

				let relationship = new Relationship({
					name: ctx.params.name,
					desc: ctx.params.desc,
					createdAt: now,
					editedAt: now,
					author: ctx.user.id,
				});

				return relationship.save()
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "created", json);
					return json;
				});								
			}
		},

		update: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:RelationshipNotFound"));
				this.validateParams(ctx);

				return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					// TODO: Check ctx.params for null
					
					doc.editedAt = Date.now();
					doc.customer = ctx.params.customer;
					doc.description = ctx.params.description;
					doc.customer_email = ctx.params.customer_email;
					doc.customer_terms = ctx.params.customer_terms;
					doc.renewal_period = ctx.params.renewal_period;
					doc.cancellation_terms = ctx.params.cancellation_terms;
					doc.billing_type = ctx.params.billing_type;
					doc.resources = ctx.params.resources;
					return doc.save();
				})
				.then((doc) => {
					return this.toJSON(doc);
				})
				.then((json) => {
					return this.populateModels(json);
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "updated", json);
					return json;
				});								
			}
		},

		remove: {
			permission: C.PERM_OWNER,
			handler(ctx) {
				ctx.assertModelIsExist(ctx.t("app:RelationshipNotFound"));

				return Relationship.remove({ _id: ctx.modelID })
				.then(() => {
					return ctx.model;
				})
				.then((json) => {
					this.notifyModelChanges(ctx, "removed", json);
					return json;
				});		
			}
		},
	},

	methods: {
		/**
		 * Validate params of context.
		 * We will call it in `create` and `update` actions
		 * 
		 * @param {Context} ctx 			context of request
		 * @param {boolean} strictMode 		strictMode. If true, need to exists the required parameters
		 */
		validateParams(ctx, strictMode) {

			// TODO: Add validate checks for Relationship

			// if (strictMode || ctx.hasParam("title"))
			// 	ctx.validateParam("title").trim().notEmpty(ctx.t("app:RelationshipTitleCannotBeEmpty")).end();

			// if (strictMode || ctx.hasParam("content"))
			// 	ctx.validateParam("content").trim().notEmpty(ctx.t("app:RelationshipContentCannotBeEmpty")).end();
			
			if (ctx.hasValidationErrors())
				throw ctx.errorBadRequest(C.ERR_VALIDATION_ERROR, ctx.validationErrors);			
		}

	},

	/**
	 * Check the owner of model
	 * 
	 * @param {any} ctx	Context of request
	 * @returns	{Promise}
	 */
	ownerChecker(ctx) {
		return new Promise((resolve, reject) => {
			ctx.assertModelIsExist(ctx.t("app:RelationshipNotFound"));
			// ctx.model.author.code == ctx.user.code || 
			if (ctx.isAdmin()) 
				resolve();
			else
				reject();
		});
	},

	init(ctx) {
		// Fired when start the service
		this.relationshipService = ctx.services("relationships");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	},

	graphql: {

		query: `
			relationships(limit: Int, offset: Int, sort: String): [Relationship]
			relationship(code: String): Relationship
		`,

		types: `
			type Relationship {
				code: String!
				name: String
				desc: String
				createdAt: Timestamp
				editedAt: Timestamp
			}
		`,

		mutation: `
			relationshipCreate(name: String!): Relationship
			relationshipUpdate(code: String!): Relationship
			relationshipRemove(code: String!): Relationship
		`,

		resolvers: {
			Query: {
				relationships: "find",
				relationship: "get"
			},

			Mutation: {
				relationshipCreate: "create",
				relationshipUpdate: "update",
				relationshipRemove: "remove"
			}
		}
	}

};
