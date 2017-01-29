import Vue from "vue";
import Vuex from "vuex";

import session from "../modules/session/store";
import contracts from "../modules/contracts/store";
import organizations from "../modules/organization/store";
import profile from "../modules/profile/store";
import relationship from "../modules/relationship/store";

Vue.use(Vuex);

export default new Vuex.Store({
	modules: {
		session,
		contracts,
		profile,
		organizations,
		relationship
	}
});