class PostData {

	/* Default plugin options */
	static defaultOptions () {
		return {
			script: ''
		}
	}

	constructor (api, options) {
	    this.api = api
	    this.options = options	
	}

}

module.exports = PostData