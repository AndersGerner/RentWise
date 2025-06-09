import { AppState, Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import * as aesjs from "aes-js";
import * as SecureStore from "expo-secure-store";
import "react-native-get-random-values";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Utility functions for web cookie management
function setSessionCookie(name: string, value: string) {
	document.cookie = `${name}=${value}; path=/; samesite=strict`;
}
function getSessionCookie(name: string): string | null {
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	return match ? match[2] : null;
}

// WebSecureStore for web platform
class WebSecureStore {
	private keyName = "supabase_enc_key";

	private getOrCreateKey(): Uint8Array {
		let keyHex = getSessionCookie(this.keyName);
		if (!keyHex) {
			// Generate a new key and store in session cookie
			const key = crypto.getRandomValues(new Uint8Array(256 / 8));
			keyHex = aesjs.utils.hex.fromBytes(key);
			setSessionCookie(this.keyName, keyHex);
			return key;
		}
		return aesjs.utils.hex.toBytes(keyHex);
	}

	private encrypt(value: string): string {
		const key = this.getOrCreateKey();
		const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}

	private decrypt(value: string): string {
		const key = this.getOrCreateKey();
		const cipher = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(1));
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}

	async getItem(key: string) {
		const encrypted = localStorage.getItem(key);
		if (!encrypted) return encrypted;
		try {
			return this.decrypt(encrypted);
		} catch {
			return null;
		}
	}
	async setItem(key: string, value: string) {
		const encrypted = this.encrypt(value);
		localStorage.setItem(key, encrypted);
	}
	async removeItem(key: string) {
		localStorage.removeItem(key);
		// Optionally clear the session cookie if no more items
		// document.cookie = `${this.keyName}=; Max-Age=0; path=/;`;
	}
}

class LargeSecureStore {
	private async _encrypt(key: string, value: string) {
		const encryptionKey = crypto.getRandomValues(new Uint8Array(256 / 8));
		const cipher = new aesjs.ModeOfOperation.ctr(
			encryptionKey,
			new aesjs.Counter(1),
		);
		const encryptedBytes = cipher.encrypt(aesjs.utils.utf8.toBytes(value));
		await SecureStore.setItemAsync(
			key,
			aesjs.utils.hex.fromBytes(encryptionKey),
		);
		return aesjs.utils.hex.fromBytes(encryptedBytes);
	}
	private async _decrypt(key: string, value: string) {
		const encryptionKeyHex = await SecureStore.getItemAsync(key);
		if (!encryptionKeyHex) {
			return encryptionKeyHex;
		}
		const cipher = new aesjs.ModeOfOperation.ctr(
			aesjs.utils.hex.toBytes(encryptionKeyHex),
			new aesjs.Counter(1),
		);
		const decryptedBytes = cipher.decrypt(aesjs.utils.hex.toBytes(value));
		return aesjs.utils.utf8.fromBytes(decryptedBytes);
	}
	async getItem(key: string) {
		const encrypted = await AsyncStorage.getItem(key);
		if (!encrypted) {
			return encrypted;
		}
		return await this._decrypt(key, encrypted);
	}
	async removeItem(key: string) {
		await AsyncStorage.removeItem(key);
		await SecureStore.deleteItemAsync(key);
	}
	async setItem(key: string, value: string) {
		const encrypted = await this._encrypt(key, value);
		await AsyncStorage.setItem(key, encrypted);
	}
}

// Factory to select the correct storage implementation
function getSupabaseStorage() {
	if (Platform.OS === "web") {
		return new WebSecureStore();
	}
	return new LargeSecureStore();
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
	auth: {
		storage: getSupabaseStorage(),
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: false,
	},
});

AppState.addEventListener("change", (state) => {
	if (state === "active") {
		supabase.auth.startAutoRefresh();
	} else {
		supabase.auth.stopAutoRefresh();
	}
});
