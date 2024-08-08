import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import { ref } from 'firebase/storage'
import { storage } from "./firebase";

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI("AIzaSyD3UP1tm1nNtzVMhMkRGbwOmxeKQt0byl0");
const storage = ref(storage, 'images')
const imageapi = async() => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "What is this?";
  const image = {
    inlineData: {
      data: Buffer.from(fs.readFileSync("obama.png")).toString("base64"),
      mimeType: "image/png",
    },
  };

  const result = await model.generateContent([prompt, image]);
  console.log(result.response.text());
}

imageapi();