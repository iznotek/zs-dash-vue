<template lang="pug">
	.container
		h2.title {{ _('Organizations') }}

		.header.flex.row.justify-space-between
			button.button.primary(@click="newPost")
				span.icon
					i.fa.fa-plus
				span {{ _("NewOrganization") }}

		.postForm(v-if="showForm")
			vue-form-generator(:schema='schema', :model='model', :options='{}', :multiple="false", ref="form", :is-new-model="isNewPost")

			.group.buttons
				button.button.primary(@click="savePost") {{ _("Save") }}
				button.button(@click="cancelPost") {{ _("Cancel") }}


		transition-group.posts(name="post", tag="ul")
			li(v-for="post of organizations", :key="post.code")
				article.media
					.media-left

					.media-content
						h3 {{ post.name }}

						p.content {{ post.desc }}
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
			...mapGetters("organizations", [
				"organizations",
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
							label: this._("Name of Organization"),
							model: "name",
							featured: true,
							required: true,
							placeholder: this._("TitleOfOrganization"),
							validator: validators.string
						},
						{
							type: "textArea",
							label: this._("Description"),
							model: "desc",
							featured: true,
							required: true,
							placeholder: this._("DescriptionOfOrganization"),
							validator: validators.string
						},
						// {
						// 	type: "email",
						// 	label: this._("CustomerEmail"),
						// 	model: "customer_email",
						// 	featured: true,
						// 	required: true,
						// 	placeholder: this._("CustomerEmail"),
						// 	validator: validators.email
						// },
						{							
							type: "input",
							inputType: "text",
							label: this._("Logo"),
							model: "logo",
							featured: true,
							required: true,
							placeholder: this._("Url to logo"),
							validator: validators.string
						},
						{
							type: "input",
							inputType: "text",
							label: this._("Website"),
							model: "website",
							featured: true,
							required: true,
							placeholder: this._("Website"),
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

			prefix: "/organizations/",

			events: {

				/**
				 * Organization updated
				 * @param  {Object} res Organization object
				 */
				updated(res) {
					this.updated(res.data);
					toast.success(this._("OrganizationNameUpdated", res), this._("OrganizationUpdated"));
				},

				/**
				 * Organization removed
				 * @param  {Object} res Organization object
				 */
				removed(res) {
					this.removed(res.data);	
					toast.success(this._("OrganizationNameDeleted", res), this._("OrganizationDeleted"));
				}
			}
		},	

		methods: {
			...mapActions("organizations", [
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
				return this._("CreatedAgoByName", { ago: Vue.filter("ago")(post.createdAt), name: "TODO: Add current user" } );
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
			console.log('Num of orgs (index.vue org): ' + this.organizations.length);
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