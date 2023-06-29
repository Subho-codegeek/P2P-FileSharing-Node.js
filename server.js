import express from "express";
import multer from "multer";
import mongoose from "mongoose";
import { config } from "dotenv";
import bcrypt from "bcrypt";
import { File } from "./models/File.js";

config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const upload = multer({ dest: "uploads" });

app.get("/", (req, res) => {
    res.render("index");
})

app.post("/upload", upload.single("file"), async (req, res) => {
    const fileData = {
        path: req.file.path,
        originalName: req.file.originalname
    }
    if (req.body.password != null && req.body.password != "") {
        fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    const file = await File.create(fileData);
    res.render("index", { fileLink: `${req.headers.origin}/file/${file.id}` })
})

const handleDownload = async (req, res) => {
    const file = await File.findById(req.params.id);
    if (file.password != null) {
        if (req.body.password == null) {
            res.render("password");
            return;
        }

        if (!(await bcrypt.compare(req.body.password, file.password))) {
            res.render("password", { error: true });
            return;
        }
    }
    file.downloadCount++;
    await file.save();
    console.log(file.downloadCount);

    res.download(file.path, file.originalName);
}

app.route("/file/:id").get(handleDownload).post(handleDownload)

mongoose.connect(process.env.MONGO_URI, {
    dbName: "FileSharing"
}).then(() => console.log("Database connected")).catch((e) => console.log(e));

app.listen(process.env.PORT, () => {
    console.log("Server Running");
});