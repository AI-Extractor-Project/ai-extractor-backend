import { geminiConfig } from "../../config/gemini.config";

class GeminiKeyManager {
    private keys = geminiConfig.keys;
    private index = 0;

    getKey() {
        return this.keys[this.index];
    }

    rotateKey() {
        this.index = (this.index + 1) % this.keys.length;

        console.log(
            `🔄 Switched Gemini Key → #${this.index + 1}`
        );
    }
}

export const keyManager = new GeminiKeyManager();