"use strict";

let logger 		= require("../../../core/logger");
let config 		= require("../../../config");
let C 	 		= require("../../../core/constants");

let _			= require("lodash");

let Organization	= require("./models/organization");

module.exports = {
	settings: {
		name: "organizations",
		version: 1,
		namespace: "organizations",
		rest: true,
		ws: true,
		graphql: true,
		permission: C.PERM_LOGGEDIN,
		role: "user",
		collection: Organization,

		modelPropFilter: "code name desc logo website createdAt editedAt",
		
		modelPopulates: {
		}
	},

	actions: {
		find: {
			cache: false,
			handler(ctx) {
				let filter = {};

				//TODO: Implement this filter, with "My Teams" or something instead of "All"?
				// if (ctx.params.filter == "my") 
				// 	filter.author = ctx.user.id;
				// else if (ctx.params.author != null) { 
				// 	filter.author = this.personService.decodeID(ctx.params.author);
				// }

				// filter.author = ctx.user.id
				let query = Organization.find(filter);

				return ctx.queryPageSort(query).exec().then( (docs) => {
					logger.info("Org result: (service.js)" + docs.length);
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
				ctx.assertModelIsExist(ctx.t("app:OrganizationNotFound"));

				return Organization.findByIdAndUpdate(ctx.modelID, { $inc: { views: 1 } }).exec().then( (doc) => {
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

				let organization = new Organization({
					// name: ctx.params.name
					createdAt: now,	
					editedAt: now,
					name: ctx.params.name,
					desc: ctx.params.desc,
					logo: ctx.params.logo,
					website: ctx.params.website
				});

				return organization.save()
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
				logger.info('Trying to find and update Org, ID: ' + ctx.modelID);
				console.log('Trying to find and update Org, ID: ' + ctx.modelID);

				// ctx.assertModelIsExist(ctx.t("app:OrganizationNotFound"));
				this.validateParams(ctx);

				return this.collection.findById(ctx.modelID).exec()
				.then((doc) => {
					// TODO: Check ctx.params for null
					
					doc.editedAt = Date.now();
					doc.name = ctx.params.name;
					doc.desc = ctx.params.desc;
					doc.logo = ctx.params.logo;
					doc.website = ctx.params.website;
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
				ctx.assertModelIsExist(ctx.t("app:OrganizationNotFound"));

				return Organization.remove({ _id: ctx.modelID })
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
			ctx.assertModelIsExist(ctx.t("app:OrganizationNotFound"));
			// ctx.model.author.code == ctx.user.code || 
			if (ctx.isAdmin()) 
				resolve();
			else
				reject();
		});
	},

	init(ctx) {
		// Fired when start the service
		this.organizationService = ctx.services("organizations");
	},

	socket: {
		afterConnection(socket, io) {
			// Fired when a new client connected via websocket
		}
	},

	graphql: {

		query: `
			organizations(limit: Int, offset: Int, sort: String): [Organization]
			organization(code: String): Organization
		`,

		types: `
			type Organization {
				code: String!
				name: String
				desc: String
				logo: String
				website: String
				createdAt: Timestamp
				editedAt: Timestamp
			}
		`,

		mutation: `
			organizationCreate(name: String!): Organization
			organizationUpdate(code: String!): Organization
			organizationRemove(code: String!): Organization
		`,

		resolvers: {
			Query: {
				organizations: "find",
				organization: "get"
			},

			Mutation: {
				organizationCreate: "create",
				organizationUpdate: "update",
				organizationRemove: "remove"
			}
		}
	}

};
