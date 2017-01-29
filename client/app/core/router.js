"use strict";

import Vue from "vue";
import VueRouter from "vue-router";

import Home from "../modules/home";
import Profile from "../modules/profile";
import Contracts from "../modules/contracts";
import Organizations from "../modules/organization";
import Relationships from "../modules/relationship";

Vue.use(VueRouter);

export default new VueRouter({
	mode: "hash",
	routes: [
		{ path: "/", component: Home },
		{ path: "/profile", component: Profile },	
		{ path: "/contracts", component: Contracts },
		{ path: "/organizations", component: Organizations },
		{ path: "/relationships", component: Relationships }
		// { path: "/users", component: User, meta: { needRole: "admin" } },
		//{ path: "*", component: NotFound }
	]
});