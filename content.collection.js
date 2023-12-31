module.exports = function(waw) {
	const Schema = waw.mongoose.Schema({
		url: String,
		thumb: String,
		name: String,
		description: String,
		content: String,
		data: {},
		author: {
			type: waw.mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		moderators: [
			{
				type: waw.mongoose.Schema.Types.ObjectId,
				sparse: true,
				ref: 'User'
			}
		]
	});

	Schema.methods.create = function (obj, user, waw) {
		this.author = user._id;
		this.moderators = [user._id];
		this.url = obj.url;
		this.thumb = obj.thumb;
		this.content = obj.content;
		this.name = obj.name;
		this.description = obj.description;
		this.data = obj.data;
	}

	return waw.Content = waw.mongoose.model('Content', Schema);
}
