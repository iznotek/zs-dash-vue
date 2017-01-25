<template lang="pug">
	aside.nav(:class="{ mini: minimized }")
		.menu
			.title {{ "General" | i18n }}
			ul
				router-link(tag="li", to="/")
					a(:title="_('Home')")
						span.icon
							i.fa.fa-home
						span.label {{ "Home" | i18n }}

				router-link(tag="li", to="/organizations")
					a(:title="_('Organizations')")
						span.icon
							i.fa.fa-sitemap 
						span.label {{ "Organizations" | i18n }}

				router-link(tag="li", to="/relationships")
					a(:title="_('Relationships')")
						span.icon
							i.fa.fa-heart 
						span.label {{ "Relationships" | i18n }}

				router-link(tag="li", to="/goals")
					a(:title="_('Goals')")
						span.icon
							i.fa.fa-calendar-check-o
						span.label {{ "Goals" | i18n }}

				router-link(tag="li", to="/contracts")
					a(:title="_('Retainers')")
						span.icon
							i.fa.fa-handshake-o
						span.label {{ "Retainers" | i18n }}

			.title {{ "Profile" | i18n }}
			ul
				li
					a(href="/logout", :title="_('Logout')")
						span.icon
							i.fa.fa-sign-out
						span.label {{ "Logout" | i18n }}

		.footer
			.social
				a(href="https://twitter.com/affinidash", target="_blank")
					i.fa.fa-twitter
				a(href="https://github.com/zingsight/zs-dash-vue", target="_blank")
					i.fa.fa-github
			.copyright &copy; Copyright, 2016
</template>

<script>

	export default {
		props: [
			"minimized"
		]
	};
	
</script>

<style lang="sass">
</style>