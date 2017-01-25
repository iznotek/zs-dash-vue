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

		modelPropFilter: "code author name description customer customer_email customer_terms renewal_period cancellation_terms billing_type contract_start contract_end resources views editedAt",
		
		modelPopulates: {
			"goals": "goals"
		}
	},

	actions: {
		find: {
			cache: true,
			handler(ctx) {
				let filter = {};

				filter.author = ctx.user.id
				logger.debug('Current User: ' + JSON.stringify(ctx.user));
				let query = Contract.find(filter);

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
				ctx.assertModelIsExist(ctx.t("app:ContractNotFound"));

				return Contract.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
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

				let contract = new Contract({
					name: ctx.params.name,
					description: ctx.params.description,
					customer: ctx.params.customer,
					customer_email: ctx.params.customer_email,
					customer_terms: ctx.params.customer_terms,
					renewal_period: ctx.params.renewal_period,
					cancellation_terms: ctx.params.cancellation_terms,
					billing_type: ctx.params.billing_type,
					contract_start: ctx.params.contract_start,
					contract_end: ctx.params.contract_end,
					createdAt: now,
					author: ctx.user.id,
					resources: ctx.params.resources,
				});

				return contract.save()
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
				ctx.assertModelIsExist(ctx.t("app:ContractNotFound"));
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
				ctx.assertModelIsExist(ctx.t("app:ContractNotFound"));

				return Contract.remove({ _id: ctx.modelID })
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

			// TODO: Add validate checks for Contract

			// if (strictMode || ctx.hasParam("title"))
			// 	ctx.validateParam("title").trim().notEmpty(ctx.t("app:ContractTitleCannotBeEmpty")).end();

			// if (strictMode || ctx.hasParam("content"))
			// 	ctx.validateParam("content").trim().notEmpty(ctx.t("app:ContractContentCannotBeEmpty")).end();
			
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
			ctx.assertModelIsExist(ctx.t("app:ContractNotFound"));
			// ctx.model.author.code == ctx.user.code || 
			if (ctx.isAdmin()) 
				resolve();
			else
				reject();
		});
	},

	init(ctx) {
		// Fired when start the service
		this.contractService = ctx.services("contracts");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	},

	graphql: {

		query: `
			contracts(limit: Int, offset: Int, sort: String): [Contract]
			contract(code: String): Contract
		`,

		types: `
			type Contract {
				code: String!
				name: String
				description: String
				customer: String
				customer_email: String
				customer_terms: String
				renewal_period: Int
				cancellation_terms: Int
				billing_type: Int
				contract_start: Timestamp
				contract_end: Timestamp
				resources: String
				views: Int
				createdAt: Timestamp
				editedAt: Timestamp
			}
		`,

		mutation: `
			contractCreate(name: String!): Contract
			contractUpdate(code: String!): Contract
			contractRemove(code: String!): Contract
		`,

		resolvers: {
			Query: {
				contracts: "find",
				contract: "get"
			},

			Mutation: {
				contractCreate: "create",
				contractUpdate: "update",
				contractRemove: "remove"
			}
		}
	}

};
