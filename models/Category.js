import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent Mongoose from creating _id field
categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.models.Category ||
  mongoose.model("Category", categorySchema);
