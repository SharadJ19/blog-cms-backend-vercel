const mongoose = require("mongoose");

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

// Prevent Mongoose from creating _id field
postSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.models.Post || mongoose.model("Post", postSchema);
