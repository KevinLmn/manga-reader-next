import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export class AuthService {
  private static AUTH_URL =
    "https://auth.mangadex.org/realms/mangadex/protocol/openid-connect/token";
  private static credentials = {
    client_id: process.env.MANGADEX_CLIENT_ID,
    client_secret: process.env.MANGADEX_CLIENT_SECRET,
    username: process.env.MANGADEX_USERNAME,
    password: process.env.MANGADEX_PASSWORD,
  };

  private static currentTokens: AuthTokens | null = null;

  static async getAccessToken(): Promise<string> {
    if (!this.currentTokens) {
      this.currentTokens = await this.login();
    }
    return this.currentTokens.access_token;
  }

  static async getTokens(): Promise<AuthTokens> {
    if (!this.currentTokens) {
      this.currentTokens = await this.login();
    }
    return this.currentTokens;
  }

  private static async login(): Promise<AuthTokens> {
    try {
      const response = await axios.post(
        this.AUTH_URL,
        new URLSearchParams({
          grant_type: "password",
          username: this.credentials.username!,
          password: this.credentials.password!,
          client_id: this.credentials.client_id!,
          client_secret: this.credentials.client_secret!,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(
          "Failed to authenticate with MangaDex:",
          error.response?.data?.error
        );
      }
      throw new Error("Authentication failed");
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response = await axios.post(
        this.AUTH_URL,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: this.credentials.client_id!,
          client_secret: this.credentials.client_secret!,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.currentTokens = response.data;
      return response.data;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      // If refresh fails, try logging in again
      return this.login();
    }
  }
}
