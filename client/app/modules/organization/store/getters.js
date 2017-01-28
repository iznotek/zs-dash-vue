export function organizations(state) {
	console.log('Num of orgs (getters.js): ' + state.rows.length);
	return state.rows;
}

export function hasMore(state) {
	return state.hasMore;
}

export function fetching(state) {
	return state.fetching;
}

export function sort(state) {
	return state.sort;
}

export function viewMode(state) {
	return state.viewMode;
}
