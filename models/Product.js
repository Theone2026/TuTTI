const productSchema = new mongoose.Schema({
  // ... otros campos ...
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  // ... otros campos ...
});