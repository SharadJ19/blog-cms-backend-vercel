import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
    categoryId: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    date: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Remove _id and __v from responses
postSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Post || mongoose.model("Post", postSchema);
