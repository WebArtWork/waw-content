module.exports = async (waw) => {
	waw.crud("content", {
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
							await waw.Content.find({
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
					while (await waw.Content.count({ url: req.body.url })) {
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


	const reloads = {};
	waw.addJson(
		"storePrepareContents",
		async (store, fillJson, req) => {
			reloads[store._id] = reloads[store._id] || [];
			const fillAllContents = async () => {
				if (!fillJson.tagsIds) {
					return setTimeout(fillAllContents, 500);
				}

				fillJson.allContents = await waw.Content.find({
					stores: store.id,
					enabled: true,
				}).lean();
				for (const content of fillJson.allContents) {
					content.id = content._id.toString();
					content._id = content._id.toString();
					content.tags = (content.tags || []).map((t) => t.toString());
				}
				fillJson.top_contents = fillJson.allContents.filter((p) => {
					return p.top;
				});
			};
			fillAllContents();
			reloads[store._id].push(fillAllContents);
		},
		"Prepare updatable documents of products"
	);

	const contents = await waw.Content.find().populate({
		path: "stores",
		select: "domain",
	});

	setTimeout(() => {
		for (const content of contents) {
			if (content.stores && content.url) {
				for (const store of content.stores) {

					waw.configurePage[store.domain]({
						pageJson: { content },
						page: 'content',
						url: content.url
					});
				}
			}
		}
	}, 1000);
}
