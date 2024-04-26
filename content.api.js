module.exports = async (waw) => {
	waw.crud("service", {
		get: [
			{
				name: "public",
				ensure: waw.next,
				query: () => {
					return {};
				},
			},
			{
				name: "scopes",
				ensure: waw.next,
				query: () => {
					return {
						isTemplate: true,
					};
				},
			},
			{
				name: "links",
				ensure: async (req, res, next) => {
					if (req.user) {
						req.scopes_ids = (
							await waw.Service.find({
								moderators: req.user._id,
								isTemplate: true,
							}).select("_id")
						).map((p) => p.id);

						next();
					} else {
						res.json([]);
					}
				},
				query: (req) => {
					return {
						template: {
							$in: req.scopes_ids,
						},
					};
				},
			},
		],
		update: {
			query: (req) => {
				if (req.user.is.admin) {
					return {
						_id: req.body._id,
					};
				} else {
					return {
						moderators: req.user._id,
						_id: req.body._id,
					};
				}
			},
		},
		delete: {
			query: (req) => {
				if (req.user.is.admin) {
					return {
						_id: req.body._id,
					};
				} else {
					return {
						moderators: req.user._id,
						_id: req.body._id,
					};
				}
			},
		},
		create: {
			ensure: async (req, res, next) => {
				if (req.body.name) {
					req.body.url = req.body.name.toLowerCase().replace(/[^a-z0-9]/g, "");
				}
				if (req.body.url) {
					while (await waw.Service.count({ url: req.body.url })) {
						const url = req.body.url.split("_");
						req.body.url =
							url[0] + "_" + (url.length > 1 ? Number(url[1]) + 1 : 1);
					}
				}
				next();
			},
		},
	});

	waw.contents = async (query = {}, limit) => {
		if (limit) {
			return await waw.Content.find(query).limit(limit);
		} else {
			return await waw.Content.find(query);
		}
	};

	waw.content = async (query) => {
		return await waw.Content.findOne(query);
	};

	waw.storeContents = async (store, fillJson) => {
		fillJson.contents = await waw.contents({
			author: store.author
		});

		fillJson.footer.contents = fillJson.contents;

		for (const content of fillJson.contents) {
			fillJson._page[content.url] = {
				...content.toObject(),
				content
			}
		}
	}
};
