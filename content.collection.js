module.exports = function(waw) {
	const Schema = waw.mongoose.Schema({
		top: {
			type: Boolean,
			default: false
		},
		enabled: {
			type: Boolean,
			default: false
		},
		url: String,
		thumb: String,
		name: String,
		description: String,
		content: String,
		data: {},
		stores: [{
			type: waw.mongoose.Schema.Types.ObjectId,
			ref: 'Store'
		}],
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
		this.stores = obj.stores;
		this.thumb = obj.thumb;
		this.content = obj.content;
		this.name = obj.name;
		this.description = obj.description;
		this.data = obj.data;
	}

	return waw.Content = waw.mongoose.model('Content', Schema);
}
