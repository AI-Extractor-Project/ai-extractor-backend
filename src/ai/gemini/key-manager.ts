import { geminiConfig } from "../../config/gemini.config";

class GeminiKeyManager {
    private keys = geminiConfig.keys;
    private index = 0;

    getKey(): string {
        return this.keys[this.index];
    }

    getCurrentIndex(): number {
        return this.index;
    }

    rotateKey(): void {
        this.index = (this.index + 1) % this.keys.length;
        console.log(`🔄 Switched Gemini Key → #${this.index + 1}`);
    }

    get keyCount(): number {
        return this.keys.length;
    }
}

export const keyManager = new GeminiKeyManager();