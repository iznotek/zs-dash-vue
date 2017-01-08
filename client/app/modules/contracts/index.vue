<template lang="pug">
	.container
		h2.title {{ _('Contracts') }}

		.header.flex.row.justify-space-between
			button.button.primary(@click="newPost")
				span.icon
					i.fa.fa-plus
				span {{ _("NewPost") }}

		.postForm(v-if="showForm")
			vue-form-generator(:schema='schema', :model='model', :options='{}', :multiple="false", ref="form", :is-new-model="isNewPost")

			.group.buttons
				button.button.primary(@click="savePost") {{ _("Save") }}
				button.button(@click="cancelPost") {{ _("Cancel") }}


		transition-group.posts(name="post", tag="ul")
			li(v-for="post of contracts", :key="post.code")
				article.media
					.media-left

					.media-content
						h3 {{ post.customer }}

						p.content {{ post.description }}
						hr.full
						.row
							.functions.left
								a(:title="_('EditPost')", @click="editPost(post)")
									i.fa.fa-pencil
								a(:title="_('DeletePost')", @click="deletePost(post)")
									i.fa.fa-trash
							.right.text-right
								template(v-if="post.editedAt")
									small.text-muted {{ editedAgo(post) }}
									br
								small.text-muted {{ createdAgo(post) }}

		.loadMore.text-center(v-if="hasMore")
			button.button.outline(@click="loadMoreRows", :class="{ 'loading': fetching }") {{ _("LoadMore") }}
		.noMore.text-center(v-if="!hasMore")
			span.text-muted You reached the end of the list.
		hr
</template>

<script>
	import Vue from "vue";
	import marked from "marked";
	import toast from "../../core/toastr";
	import { cloneDeep } from "lodash";
	import { validators, schema as schemaUtils } from "vue-form-generator";

	import { mapGetters, mapActions } from "vuex";

	export default {

		computed: {
			...mapGetters("contracts", [
				"contracts",
				"hasMore",
				"fetching",
				"sort",
				"viewMode"
			]),
			...mapGetters("session", [
				"me"
			])
		},

		/**
		 * Set page schema as data property
		 */
		data() {
			return {
				showForm: false,
				isNewPost: false,
				model: null,
				schema: {
					fields: [
						{
							type: "input",
							inputType: "text",
							label: this._("Customer"),
							model: "customer",
							featured: true,
							required: true,
							placeholder: this._("TitleOfPost"),
							validator: validators.string
						},
						{
							type: "textArea",
							label: this._("Description"),
							model: "description",
							featured: true,
							required: true,
							placeholder: this._("DescriptionOfContract"),
							validator: validators.string
						},
						{
							type: "email",
							label: this._("CustomerEmail"),
							model: "customer_email",
							featured: true,
							required: true,
							placeholder: this._("CustomerEmail"),
							validator: validators.email
						},
						{							
							type: "input",
							inputType: "text",
							label: this._("CustomerTerms"),
							model: "customer_terms",
							featured: true,
							required: true,
							placeholder: this._("CustomerTerms"),
							validator: validators.string
						},
						{
							type: "input",
							inputType: "number",
							label: this._("RenewalPeriod"),
							model: "renewal_period",
							featured: true,
							required: true,
							placeholder: this._("RenewalPeriod"),
							validator: validators.string
						},
						{
							type: "input",
							inputType: "number",
							label: this._("CancellationTerms"),
							model: "cancellation_terms",
							featured: true,
							required: true,
							placeholder: this._("CancellationTerms"),
							validator: validators.string
						},
						{
							type: "input",
							inputType: "number",
							label: this._("BillingType"),
							model: "billing_type",
							featured: true,
							required: true,
							placeholder: this._("BillingType"),
							validator: validators.string
						},
						// {
						// 	type: "dateTime",
						// 	label: "Contract Start",
						// 	model: "contract_start",
						// 	required: true,
						// 	placeholder: "Start of contract",
						// 	min: moment("1900-01-01").toDate(),
						// 	max: moment("9999-12-31").toDate(),
						// 	validator: validators.date,

						// 	dateTimePickerOptions: {
						// 		format: "YYYY-MM-DD"
						// 	},

						// 	onChanged: function (model, newVal, oldVal, field) {
						// 		model.contract_start = moment().year() - moment(newVal).year();
						// 	}
						// },
						// {
						// 	type: "dateTime",
						// 	label: "Contract End",
						// 	model: "contract_end",
						// 	required: false,
						// 	placeholder: "End of contract",
						// 	min: moment("1900-01-01").toDate(),
						// 	max: moment("9999-12-31").toDate(),
						// 	validator: validators.date,

						// 	dateTimePickerOptions: {
						// 		format: "YYYY-MM-DD"
						// 	},

						// 	onChanged: function (model, newVal, oldVal, field) {
						// 		model.contract_start = moment().year() - moment(newVal).year();
						// 	}
						// },
						{
							type: "textArea",
							label: this._("Resources"),
							model: "resources",
							featured: true,
							required: true,
							rows: 10,
							placeholder: this._("Resources"),
							validator: validators.string
						}
					]
				}
			};
		},

		/**
		 * Socket handlers. Every property is an event handler
		 */
		socket: {

			prefix: "/contracts/",

			events: {
				/**
				 * New device added
				 * @param  {Object} res Device object
				 */
				/*
				We don't use it because we don't know we need to add it to the page (filter, sort..etc)
				created(res) {
					this.created(res.data);
					toast.success(this._("ContractNameAdded", res), this._("ContractAdded"));
				},*/

				/**
				 * Contract updated
				 * @param  {Object} res Contract object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("ContractNameUpdated", res), this._("ContractUpdated"));
				},

				/**
				 * Contract removed
				 * @param  {Object} res Contract object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("ContractNameDeleted", res), this._("ContractDeleted"));
				}
			}
		},	

		methods: {
			...mapActions("contracts", [
				"getRows",
				"loadMoreRows",
				"changeSort",
				"changeViewMode",
				"saveRow",
				"updateRow",
				"removeRow",
				"updated",
				"removed"
			]),

			markdown(content) {
				return marked(content);
			},

			createdAgo(post) {
				return this._("CreatedAgoByName", { ago: Vue.filter("ago")(post.createdAt), name: post.author.fullName } );
			},

			editedAgo(post) {
				if (post.editedAt)
					return this._("EditedAgo", { ago: Vue.filter("ago")(post.editedAt) } );
			},

			newPost() {
				this.model = schemaUtils.createDefaultObject(this.schema);
				this.showForm = true;
				this.isNewPost = true;

				this.focusFirstInput();
			},

			editPost(post) {
				this.model = cloneDeep(post);
				this.showForm = true;
				this.isNewPost = false;
				this.focusFirstInput();
			},

			focusFirstInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-control:nth-child(1):not([readonly]):not(:disabled)");
					if (el)
						el.focus();
				});
			},

			focusFirstErrorInput() {
				this.$nextTick(() => {
					let el = document.querySelector(".postForm .form-group.error .form-control");
					if (el)
						el.focus();
				});
			},			

			savePost() {
				if (this.$refs.form.validate()) {
					if (this.isNewPost)
						this.saveRow(this.model);
					else
						this.updateRow(this.model);

					this.cancelPost();
				} else {
					this.focusFirstErrorInput();
				}
			},

			cancelPost() {
				this.showForm = false;
				this.model = null;
			},

			deletePost(post) {
				this.removeRow(post);
			}

		},

		/**
		 * Call if the component is created
		 */
		created() {
			this.getRows();
		}
	};
</script>

<style lang="sass" scoped>

	@import "../../../scss/themes/blurred/variables";
	@import "../../../scss/common/mixins";

	.container {
		padding-bottom: 1rem;
	}

	.header {
		margin: 1rem;
	}

	.postForm {

		@include bgTranslucentDark(0.2);

		margin: 1rem;

		.buttons {
			padding: 0.5em;
		}

	} // .postForm

	ul.posts {
		margin: 1rem 3rem;
		padding: 0;
		list-style: none;

		li {
			position: relative;
			margin: 1.0rem 0;
			padding: 0.5rem 0.5rem;
			font-size: 1.1rem;

			.media {
				background-color: rgba($color1, 0.5);
				transition: background-color .2s ease;
				&:hover {
					background-color: rgba($color1, 0.8);
				}
			}

			.media-content {				
				overflow-x: auto;
				
				h3 {
					margin: 0 0 0.5em 0;
				}

			}
		}
	}


	/* Transition styles */
/*
	.post-transition {
		transition: opacity .5s ease;
	}

	.post-enter {
		opacity: 0;
	}

	.post-leave {
		opacity: 0;
		position: absolute !important;
	}
*/
	.post-move {
		transition: transform .5s cubic-bezier(.55,0,.1,1);
	}



</style>