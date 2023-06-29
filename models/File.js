import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
    path: {
        type: String,
        required: true
    },
    originalName: {
        type: String,
        required: true
    },
    password: String,
    downloadCounnt: {
        type: Number,
        required: true,
        default: 0
    }
})

export const File = mongoose.model("File", FileSchema);