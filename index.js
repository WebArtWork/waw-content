module.exports = async waw => {
	waw.contents = async (query = {}, limit) => {
		if (limit) {
			return await waw.Content.find(query).limit(limit);
		} else {
			return await waw.Content.find(query);
		}
	}

	waw.content = async (query) => {
		return await waw.Content.findOne(query);
	}
};
