import mongoose, { Schema, Document } from "mongoose";

export interface IJob extends Document {
  title: string;
  company: string;
  description: string;
  location: string;
  salary: string;
  postedDate: Date;
  deadline: Date;
  requirements: string[];
  benefits: string[];
  tags: string[];
  type: string;
  status: string;
  img?: string;
  isRemote?: boolean;
}

const JobSchema: Schema = new Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: String, required: true },
  postedDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  requirements: [{ type: String }],
  benefits: [{ type: String }],
  tags: [{ type: String }],
  type: { type: String, required: true },
  status: { type: String, required: true },
  img: { type: String },
  isRemote: { type: Boolean }
});

export default mongoose.model<IJob>("Job", JobSchema);